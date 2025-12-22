import dotenv from "dotenv";
dotenv.config();
import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is not defined");
}

export const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});
