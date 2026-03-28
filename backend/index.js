require("dotenv").config();
const { Telegraf } = require("telegraf");
const mongoose = require("mongoose");
const path = require("path");
const express = require("express");
const app = express();


const imagePath = path.join(__dirname, "public", "img.png");
const maleImagePath = path.join(__dirname, "public", "male.png");
const femaleImagePath = path.join(__dirname, "public", "female.png");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });

const Student = require("./model/student.model");

app.get("/", (req, res) => {
  res.send("Telegram bot is running 🚀");
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
        caption: `🎉 *Welcome to the Exam Result Bot!* 🎉
Send your *Student ID* to get your exam result instantly.

📌 Example: MAU1602154`,
        parse_mode: "Markdown",
      }
    );
  } catch (err) {
    if (err.code === 403) {
      console.log(`⚠️ User ${ctx.from.id} blocked the bot`);
    } else {
      console.error("Start command error:", err);
    }
  }
});


bot.on("text", async (ctx) => {
  try {
    const studentId = ctx.message.text.trim().toUpperCase();

    if (!studentId || studentId.length < 5) {
      return await ctx.reply("❌ *Invalid input.* Please enter a valid Student ID.", {
        parse_mode: "Markdown",
      });
    }

    let student;
    try {
      student = await Student.findOne({ "Student ID": studentId });
    } catch (dbErr) {
      console.error("DB query failed:", dbErr);
      return await ctx.reply("⚠️ *Service unavailable.* Please try again later.", {
        parse_mode: "Markdown",
      });
    }

    if (!student) {
      return await ctx.reply("❌ *Student not found.* Please check your Student ID.", {
        parse_mode: "Markdown",
      });
    }

    const imageToSend =
      student["Sex"] === "M" ? maleImagePath : femaleImagePath;

    const result = `
🎓 *EXAM RESULT SLIP*
────────────────────────
*Course:* Fundamentals of Software Security

👤 *Student Information*
• Name: ${student["First Name"]} ${student["Father Name"]}
• ID: ${student["Student ID"]}

📊 *Assessment Breakdown*
• Mid Exam: ${student["mid exam"]}
• Quiz: ${student["quiz"]}
• Lab: ${student["lab"]}
• Final Exam: ${student["final exam"]}
• Project: ${student["project"]}

────────────────────────
✅ *Total Score:* ${student["total"]}
🏅 *Grade:* *${student["grade"]}*
`;

    await ctx.replyWithPhoto(
      { source: imageToSend },
      {
        caption: result,
        parse_mode: "Markdown",
      }
    );
  } catch (err) {
    if (err.code === 403) {
      console.log(`⚠️ Blocked by user: ${ctx.from.id}`);
    } else {
      console.error("Text handler error:", err);
    }
  }
});


bot.catch((err, ctx) => {
  if (err.code === 403) {
    console.log(`⚠️ Global catch: user blocked bot (${ctx?.from?.id})`);
    return;
  }
  console.error("🔥 Unhandled Telegraf error:", err);
});

bot.launch();
console.log("Telegram bot running...");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
