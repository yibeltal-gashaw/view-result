require("dotenv").config();
const { Telegraf } = require("telegraf");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const imagePath = path.join(__dirname, "public", "img.png");
const maleImagePath = path.join(__dirname, "public", "male.png");
const femaleImagePath = path.join(__dirname, "public", "female.png");
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));
const Student = require("./model/student.model");

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(async (ctx) => {
  await ctx.replyWithPhoto(
    { source: imagePath },
    {
      caption: `🎉 *Welcome to the Exam Result Bot!* 🎉
        Send your *Student ID* to get your exam result instantly.

        📌 Example: MAU1602154`,
      parse_mode: "Markdown",
    }
  );
});

bot.on("text", async (ctx) => {
  const studentId = ctx.message.text.trim();
  const upperStudentId = studentId.toUpperCase();

  const student = await Student.findOne({ "Student ID": upperStudentId });
  if (!student) {
    return ctx.reply("❌ Invalid Student ID. Please try again.");
  }
  const path = student["Sex"] === "M" ? maleImagePath : femaleImagePath;
  const result = `
🎓 *Fundamentals Of Software Security Exam Result*

👤 Name: ${student["First Name"]} ${student["Father Name"]}    🆔 ID: ${student["Student ID"]}

📊 *Scores*
Mid Exam: ${student["mid exam"]}
Lab: ${student["lab"]}
Final Exam: ${student["final exam"]}
Project: ---

✅ *Total: ${student["total"]}*
`;

  ctx.replyWithPhoto(
    { source: path },
    {
      caption: result,
      parse_mode: "Markdown",
    }
  );
});

bot.launch();
console.log("Telegram bot running...");
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
