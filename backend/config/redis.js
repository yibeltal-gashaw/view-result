const { createClient } = require("redis");

let redisClient;

async function connectToRedis() {
  redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });

  redisClient.on("error", (err) =>
    console.error("Redis Error:", err)
  );

  await redisClient.connect();
  console.log("✅ Redis connected");

  return redisClient;
}

function getRedisClient() {
  if (!redisClient) {
    throw new Error("Redis not initialized!");
  }
  return redisClient;
}

module.exports = { connectToRedis, getRedisClient };