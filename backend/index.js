require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const mongoose = require("mongoose");
const path = require("path");
const express = require("express");

const app = express();

const imagePath = path.join(__dirname, "public", "img.png");
const maleImagePath = path.join(__dirname, "public", "male.png");
const femaleImagePath = path.join(__dirname, "public", "female.png");
const courseName = "Fundamentals of Software Security";
const webAppUrl = process.env.WEB_APP_URL?.trim();

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

async function findStudent(studentId) {
  return Student.findOne({ "Student ID": studentId }).lean();
}

function formatStudentResult(student) {
  return {
    studentId: student["Student ID"],
    firstName: student["First Name"],
    fatherName: student["Father Name"],
    fullName: `${student["First Name"]} ${student["Father Name"]}`.trim(),
    sex: student["Sex"],
    course: courseName,
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

  if (!studentId || studentId.length < 5) {
    return res.status(400).json({
      message: "Please provide a valid student ID.",
    });
  }

  try {
    const student = await findStudent(studentId);

    if (!student) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    return res.json(formatStudentResult(student));
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
