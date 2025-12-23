import dotenv from "dotenv";
dotenv.config();

import { Worker } from "bullmq";
import { connection } from "../redis/connection";
import { db } from "../db/index";
import { tasks } from "../db/schema";
import { eq } from "drizzle-orm";
import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";

async function scrapeWebsite(url: string): Promise<string> {
  try {
    const headers: HeadersInit = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Upgrade-Insecure-Requests": "1",
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    let response: Response;
    try {
      response = await fetch(url, {
        headers,
        signal: controller.signal,
        redirect: "follow",
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        throw new Error("Request timeout: Website took too long to respond");
      }
      throw fetchError;
    }

    // Handle non-standard status codes (like 471 from Cloudflare/anti-bot)
    if (!response.ok) {
      const status = response.status;
      let errorMessage = `Failed to fetch website: ${status} ${response.statusText}`;
      
      // Provide more helpful error messages for common issues
      if (status === 403 || status === 471) {
        errorMessage = `Access denied (${status}): Website may be blocking automated requests. This could be due to Cloudflare protection or anti-bot measures.`;
      } else if (status === 429) {
        errorMessage = `Rate limited (${status}): Too many requests. Please try again later.`;
      } else if (status >= 500) {
        errorMessage = `Server error (${status}): The website's server is experiencing issues.`;
      }
      
      throw new Error(errorMessage);
    }

    const html = await response.text();
    
    if (!html || html.length < 100) {
      throw new Error("Website returned empty or very short content");
    }

    const $ = cheerio.load(html);

    // Log HTML length for debugging
    console.log(`HTML length: ${html.length} characters`);

    // Remove script, style, and other non-content elements
    $("script, style, noscript, iframe, svg").remove();

    // Strategy 1: Try to get all visible text first (most aggressive)
    let textContent = $("body").text().trim();
    
    // Clean up text aggressively
    textContent = textContent
      .replace(/\s+/g, " ") // Normalize all whitespace to single spaces
      .replace(/\n+/g, " ") // Replace newlines with spaces
      .trim();

    console.log(`Initial text extraction: ${textContent.length} characters`);

    // If we got very little content, try more specific selectors
    if (textContent.length < 100) {
      console.log("Text too short, trying specific selectors...");
      
      const selectors = [
        "article",
        "main",
        "[role='main']",
        ".content",
        ".main-content",
        ".article-content",
        ".post-content",
        ".entry-content",
        "#content",
        "#main-content",
        "h1, h2, h3, h4, h5, h6",
        "p",
        "section",
        "div",
        "span",
        "li",
        "td",
        "dd",
        "blockquote",
        "pre",
        "code",
      ];

      const textParts: string[] = [];
      const seenTexts = new Set<string>();

      for (const selector of selectors) {
        try {
          $(selector).each((_index: number, element: AnyNode) => {
            const text = $(element).text().trim();
            // Very lenient: accept any text with 3+ characters
            if (text && text.length >= 3) {
              const normalized = text.replace(/\s+/g, " ");
              if (!seenTexts.has(normalized)) {
                seenTexts.add(normalized);
                textParts.push(normalized);
              }
            }
          });
          
          // If we found enough content, stop
          if (textParts.join(" ").length > 100) {
            break;
          }
        } catch (e) {
          // Skip invalid selectors
        }
      }

      if (textParts.length > 0) {
        textContent = textParts.join(" ");
        console.log(`Selector extraction: ${textContent.length} characters`);
      }
    }

    // If still no content, try getting ALL text nodes
    if (textContent.length < 50) {
      console.log("Still too short, extracting all text...");
      textContent = $.text().replace(/\s+/g, " ").trim();
      console.log(`Full text extraction: ${textContent.length} characters`);
    }

    // Remove common noise patterns (but keep most content)
    textContent = textContent
      .replace(/Cookie\s*policy/gi, "")
      .replace(/Privacy\s*policy/gi, "")
      .replace(/Terms\s*of\s*service/gi, "")
      .replace(/Skip\s*to\s*content/gi, "")
      .replace(/Accept\s*cookies/gi, "")
      .replace(/\[object\s*Object\]/gi, "")
      .trim();

    // Limit to 15k characters for AI processing (increased from 10k)
    if (textContent.length > 15000) {
      textContent = textContent.substring(0, 15000) + "...";
    }

    console.log(`Final text length: ${textContent.length} characters`);

    // Very lenient minimum - if we got ANY text, try to use it
    if (!textContent || textContent.length < 20) {
      // Log the first 500 characters of HTML for debugging
      const htmlPreview = html.substring(0, 500).replace(/\s+/g, " ");
      console.error(`HTML preview: ${htmlPreview}...`);
      
      throw new Error(
        `Insufficient content scraped from website (only ${textContent.length} characters found). ` +
        `The website may require JavaScript to load content, may be blocking automated access, ` +
        `or may be a single-page application (SPA). HTML length: ${html.length} characters.`
      );
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

// Initialize worker with error handling
let worker: Worker;

try {
  console.log("Creating BullMQ worker...");
  
  worker = new Worker(
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

        console.log(`✓ Task ${taskId} completed successfully`);
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

        console.error(`✗ Task ${taskId} failed:`, errorMessage);
        throw error; // Re-throw to mark job as failed in BullMQ
      }
    },
    {
      connection,
      concurrency: 5,
    }
  );

  worker.on("completed", (job) => {
    console.log(`✓ Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`✗ Job ${job?.id} failed:`, err.message);
  });

  worker.on("ready", () => {
    console.log("✓ Scrape worker ready and listening for jobs...");
  });

  worker.on("error", (error) => {
    console.error("✗ Worker error:", error);
  });

  console.log("✓ Scrape worker initialized successfully");
} catch (error) {
  console.error("✗ Failed to create worker:", error);
  // Don't throw - allow the API server to start even if worker fails
  // This helps with debugging
}
