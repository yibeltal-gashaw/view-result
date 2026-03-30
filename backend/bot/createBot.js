const { Markup, Telegraf } = require("telegraf");
const {
  femaleImagePath,
  imagePath,
  maleImagePath,
  webAppUrl,
} = require("../config/assets");
const { findStudent, formatStudentResult } = require("../services/resultService");
const { normalizeStudentId } = require("../utils/text");

function buildResultUrl(studentId) {
  return `${webAppUrl}${webAppUrl.includes("?") ? "&" : "?"}studentId=${encodeURIComponent(studentId)}`;
}

function createBot() {
  const bot = new Telegraf(process.env.BOT_TOKEN);

  bot.start(async (ctx) => {
    try {
      await ctx.replyWithPhoto(
        { source: imagePath },
        {
          caption: `Welcome to the Exam Result Bot.\n\nSend your Student ID to open your result in the mini app.\n\nExample: MAU1602154`,
        },
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
        await ctx.replyWithPhoto(
          { source: imageToSend },
          {
            caption: `Result found for ${studentResult.fullName}.\nTap below to open your result slip in the mini app.`,
            ...Markup.inlineKeyboard([
              Markup.button.webApp("Open Result", buildResultUrl(studentId)),
            ]),
          },
        );
        return;
      }

      await ctx.replyWithPhoto(
        { source: imageToSend },
        {
          caption: `Exam Result\n\nName: ${studentResult.fullName}\nID: ${studentResult.studentId}\nCourse: ${studentResult.course}\nTotal: ${studentResult.total}\nGrade: ${studentResult.grade}`,
        },
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

  return bot;
}

module.exports = {
  createBot,
};
