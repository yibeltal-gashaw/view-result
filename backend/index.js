require("dotenv").config();
const express = require("express");
const { createBot } = require("./bot/createBot");
const { connectToDatabase } = require("./config/database");
const { ensureAdminUser } = require("./services/authService");
const resultRoutes = require("./routes/resultRoutes");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const bot = createBot();
const allowedOrigins = [
  "https://mau-examresult.netlify.app",
  "https://mau-exam-result.onrender.com",
  "http://localhost:5173",
];

async function startServer() {
  await connectToDatabase();
  await ensureAdminUser();

  app.use(express.json());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error("CORS origin not allowed"));
      },
      methods: ["GET", "POST","PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  );
  app.use(resultRoutes);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HTTP server listening on port ${PORT}`);
  });

  bot.launch();
  console.log("Telegram bot running...");
}

startServer();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
