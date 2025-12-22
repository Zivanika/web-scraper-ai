import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { db } from "@/app/db";
import { tasks } from "@/app/db/schema";
import { eq } from "drizzle-orm";

const connection = new IORedis(process.env.REDIS_URL!);

export const scrapeQueue = new Queue("scrape-tasks", { connection });

// Worker to process jobs
const worker = new Worker(
  "scrape-tasks",
  async (job) => {
    const { taskId, websiteUrl, question } = job.data;

    // 1. Scrape website (use Puppeteer/Playwright)
    const scrapedContent = await scrapeWebsite(websiteUrl);

    // 2. Call AI API
    const aiAnswer = await queryAI(scrapedContent, question);

    // 3. Update database via Drizzle
    await db
      .update(tasks)
      .set({
        status: "completed",
        scrapedContent,
        aiAnswer,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId));

    return { success: true };
  },
  { connection }
);
await scrapeQueue.add('process', { taskId, websiteUrl, question });