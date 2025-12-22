import { Queue } from "bullmq";
import { connection } from "../redis/connection";

export const scrapeQueue = new Queue("scrape-tasks", {
  connection,
});
