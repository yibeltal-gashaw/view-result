require("dotenv").config();
const express = require("express");
const { createBot } = require("./bot/createBot");
const { connectToDatabase } = require("./config/database");
const corsMiddleware = require("./middleware/cors");
const resultRoutes = require("./routes/resultRoutes");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const bot = createBot();

async function startServer() {
  await connectToDatabase();

  app.use(express.json());
  app.use(
    cors({
      origin: "https://mau-examresult.netlify.app",
      // origin: "http://localhost:5173",
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type"],
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
