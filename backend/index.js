require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const mongoose = require("mongoose");
const path = require("path");
const express = require("express");

const app = express();

const imagePath = path.join(__dirname, "public", "img.png");
const maleImagePath = path.join(__dirname, "public", "male.png");
const femaleImagePath = path.join(__dirname, "public", "female.png");
const COURSE_MAP = {
  fss: "Fundamentals of Software Security",
};
const YEAR_MAP = {
  1: "Year 1",
  2: "Year 2",
  3: "Year 3",
  4: "Year 4",
  5: "Year 5",
};
const courseName = COURSE_MAP.fss;
const webAppUrl = process.env.WEB_APP_URL?.trim();
const YEAR_FIELDS = ["Year", "year"];
const COURSE_FIELDS = ["Course", "course"];

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });

const Student = require("./model/student.model");

function normalizeStudentId(value = "") {
  return value.trim().toUpperCase();
}

function normalizeOptionalText(value = "") {
  return String(value).trim();
}

function resolveMappedValue(value, valueMap) {
  const normalizedValue = normalizeOptionalText(value);

  return valueMap[normalizedValue] || normalizedValue;
}

function getCandidateValues(value, valueMap) {
  const normalizedValue = normalizeOptionalText(value);

  if (!normalizedValue) {
    return [];
  }

  const mappedValue = valueMap[normalizedValue];

  return mappedValue && mappedValue !== normalizedValue
    ? [normalizedValue, mappedValue]
    : [normalizedValue];
}

function getStudentField(student, fieldNames, fallback = "") {
  for (const fieldName of fieldNames) {
    const value = normalizeOptionalText(student[fieldName]);

    if (value) {
      return value;
    }
  }

  return fallback;
}

function buildFieldMatch(fieldNames, value) {
  const values = Array.isArray(value) ? value : [value];

  return {
    $or: fieldNames.flatMap((fieldName) =>
      values.map((candidateValue) => ({ [fieldName]: candidateValue })),
    ),
  };
}

async function findStudent(studentId, options = {}) {
  const yearCandidates = getCandidateValues(options.year, YEAR_MAP);
  const courseCandidates = getCandidateValues(options.course, COURSE_MAP);
  const query = { $and: [{ "Student ID": studentId }] };

  if (yearCandidates.length > 0) {
    query.$and.push(buildFieldMatch(YEAR_FIELDS, yearCandidates));
  }

  if (courseCandidates.length > 0) {
    query.$and.push(buildFieldMatch(COURSE_FIELDS, courseCandidates));
  }

  return Student.findOne(query).lean();
}

function formatStudentResult(student, options = {}) {
  const requestedYear = resolveMappedValue(options.year, YEAR_MAP);
  const requestedCourse = resolveMappedValue(options.course, COURSE_MAP);
  const storedYear = getStudentField(student, YEAR_FIELDS, requestedYear);
  const storedCourse = getStudentField(
    student,
    COURSE_FIELDS,
    requestedCourse || courseName,
  );
  const year = resolveMappedValue(storedYear, YEAR_MAP);
  const course = resolveMappedValue(storedCourse, COURSE_MAP);

  return {
    studentId: student["Student ID"],
    firstName: student["First Name"],
    fatherName: student["Father Name"],
    fullName: `${student["First Name"]} ${student["Father Name"]}`.trim(),
    sex: student["Sex"],
    course,
    year,
    grade: student["grade"],
    total: student["total"],
    breakdown: {
      midExam: student["mid exam"],
      quiz: student["quiz"],
      lab: student["lab"],
      project: student["project"],
      finalExam: student["final exam"],
    },
    avatar: student["Sex"] === "M" ? "male" : "female",
  };
}

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

app.get("/", (req, res) => {
  res.send("Telegram bot is running");
});

app.get("/api/results/:studentId", async (req, res) => {
  const studentId = normalizeStudentId(req.params.studentId);
  const year = normalizeOptionalText(req.query.year);
  const course = normalizeOptionalText(req.query.course);

  if (!studentId || studentId.length < 5) {
    return res.status(400).json({
      message: "Please provide a valid student ID.",
    });
  }

  if (!year) {
    return res.status(400).json({
      message: "Please provide a year.",
    });
  }

  if (!course) {
    return res.status(400).json({
      message: "Please provide a course.",
    });
  }

  try {
    const student = await findStudent(studentId, { year, course });

    if (!student) {
      return res.status(404).json({
        message: "Student result not found for the selected year and course.",
      });
    }

    return res.json(formatStudentResult(student, { year, course }));
  } catch (error) {
    console.error("Result API error:", error);
    return res.status(500).json({
      message: "Service unavailable. Please try again later.",
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}`);
});

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(async (ctx) => {
  try {
    await ctx.replyWithPhoto(
      { source: imagePath },
      {
        caption: `Welcome to the Exam Result Bot.\n\nSend your Student ID to open your result in the mini app.\n\nExample: MAU1602154`,
      }
    );
  } catch (err) {
    if (err.code === 403) {
      console.log(`User ${ctx.from.id} blocked the bot`);
    } else {
      console.error("Start command error:", err);
    }
  }
});

bot.on("text", async (ctx) => {
  try {
    const studentId = normalizeStudentId(ctx.message.text);

    if (!studentId || studentId.length < 5) {
      await ctx.reply("Invalid input. Please enter a valid Student ID.");
      return;
    }

    let student;
    try {
      student = await findStudent(studentId);
    } catch (dbErr) {
      console.error("DB query failed:", dbErr);
      await ctx.reply("Service unavailable. Please try again later.");
      return;
    }

    if (!student) {
      await ctx.reply("Student not found. Please check your Student ID.");
      return;
    }

    const studentResult = formatStudentResult(student);
    const imageToSend =
      studentResult.avatar === "male" ? maleImagePath : femaleImagePath;

    if (webAppUrl) {
      const resultUrl = `${webAppUrl}${webAppUrl.includes("?") ? "&" : "?"}studentId=${encodeURIComponent(studentId)}`;

      await ctx.replyWithPhoto(
        { source: imageToSend },
        {
          caption: `Result found for ${studentResult.fullName}.\nTap below to open your result slip in the mini app.`,
          ...Markup.inlineKeyboard([
            Markup.button.webApp("Open Result", resultUrl),
          ]),
        }
      );
      return;
    }

    await ctx.replyWithPhoto(
      { source: imageToSend },
      {
        caption: `Exam Result\n\nName: ${studentResult.fullName}\nID: ${studentResult.studentId}\nCourse: ${studentResult.course}\nTotal: ${studentResult.total}\nGrade: ${studentResult.grade}`,
      }
    );
  } catch (err) {
    if (err.code === 403) {
      console.log(`Blocked by user: ${ctx.from.id}`);
    } else {
      console.error("Text handler error:", err);
    }
  }
});

bot.catch((err, ctx) => {
  if (err.code === 403) {
    console.log(`Global catch: user blocked bot (${ctx?.from?.id})`);
    return;
  }

  console.error("Unhandled Telegraf error:", err);
});

bot.launch();
console.log("Telegram bot running...");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
