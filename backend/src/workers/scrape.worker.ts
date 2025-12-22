import dotenv from "dotenv";
dotenv.config();

import { Worker } from "bullmq";
import { connection } from "../redis/connection";
import { db } from "../db/index";
import { tasks } from "../db/schema";
import { eq } from "drizzle-orm";
import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import type { Cheerio } from "cheerio";

async function scrapeWebsite(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove script and style elements
    $("script, style, noscript, iframe").remove();

    // Extract text from important elements
    const selectors = [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "article",
      "main",
      "section",
      "div.content",
      "div.main-content",
      "div.article",
      "li",
    ];

    const textParts: string[] = [];

    // Extract text from headings and paragraphs
    selectors.forEach((selector) => {
      $(selector).each((_index: number, element: Cheerio<any>) => {
        const text = $(element).text().trim();
        if (text && text.length > 10) {
          textParts.push(text);
        }
      });
    });

    // Fallback: get all text if selectors didn't find much
    if (textParts.length === 0) {
      const bodyText = $("body").text();
      if (bodyText) {
        textParts.push(bodyText);
      }
    }

    // Combine and clean up text
    let textContent = textParts
      .join("\n\n")
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/\n\s*\n/g, "\n\n") // Normalize line breaks
      .trim();

    // Limit to 10k characters for AI processing
    if (textContent.length > 10000) {
      textContent = textContent.substring(0, 10000) + "...";
    }

    if (!textContent || textContent.length < 50) {
      throw new Error("Insufficient content scraped from website");
    }

    return textContent;
  } catch (error) {
    throw new Error(
      `Web scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

async function queryAI(scrapedContent: string, question: string): Promise<string> {
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!openaiApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that answers questions based on provided website content. Be concise and accurate.",
          },
          {
            role: "user",
            content: `Website Content:\n${scrapedContent}\n\nQuestion: ${question}\n\nPlease answer the question based on the website content provided.`,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    const aiAnswer = data.choices?.[0]?.message?.content;

    if (!aiAnswer) {
      throw new Error("No response from OpenAI API");
    }

    return aiAnswer;
  } catch (error) {
    throw new Error(
      `AI query failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

const worker = new Worker(
  "scrape-tasks",
  async (job) => {
    const { taskId, websiteUrl, question } = job.data;

    try {
      await db
        .update(tasks)
        .set({
          status: "processing",
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, taskId));

      const scrapedContent = await scrapeWebsite(websiteUrl);

      const aiAnswer = await queryAI(scrapedContent, question);

      await db
        .update(tasks)
        .set({
          status: "completed",
          scrapedContent,
          aiAnswer,
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, taskId));

      console.log(`Task ${taskId} completed successfully`);
    } catch (error) {
      // Update task as failed
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      await db
        .update(tasks)
        .set({
          status: "failed",
          errorMessage,
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, taskId));

      console.error(`Task ${taskId} failed:`, errorMessage);
      throw error; // Re-throw to mark job as failed in BullMQ
    }
  },
  {
    connection,
    concurrency: 5,
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

console.log("Scrape worker started and listening for jobs...");
