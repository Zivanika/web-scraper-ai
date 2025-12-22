"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const bullmq_1 = require("bullmq");
const connection_1 = require("../redis/connection");
const index_1 = require("../db/index");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const cheerio = __importStar(require("cheerio"));
async function scrapeWebsite(url) {
    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
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
        const textParts = [];
        // Extract text from headings and paragraphs
        selectors.forEach((selector) => {
            $(selector).each((_index, element) => {
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
    }
    catch (error) {
        throw new Error(`Web scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}
async function queryAI(scrapedContent, question) {
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
                        content: "You are a helpful assistant that answers questions based on provided website content. Be concise and accurate.",
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
            throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
        }
        const data = await response.json();
        const aiAnswer = data.choices?.[0]?.message?.content;
        if (!aiAnswer) {
            throw new Error("No response from OpenAI API");
        }
        return aiAnswer;
    }
    catch (error) {
        throw new Error(`AI query failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}
const worker = new bullmq_1.Worker("scrape-tasks", async (job) => {
    const { taskId, websiteUrl, question } = job.data;
    try {
        await index_1.db
            .update(schema_1.tasks)
            .set({
            status: "processing",
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.tasks.id, taskId));
        const scrapedContent = await scrapeWebsite(websiteUrl);
        const aiAnswer = await queryAI(scrapedContent, question);
        await index_1.db
            .update(schema_1.tasks)
            .set({
            status: "completed",
            scrapedContent,
            aiAnswer,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.tasks.id, taskId));
        console.log(`Task ${taskId} completed successfully`);
    }
    catch (error) {
        // Update task as failed
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        await index_1.db
            .update(schema_1.tasks)
            .set({
            status: "failed",
            errorMessage,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.tasks.id, taskId));
        console.error(`Task ${taskId} failed:`, errorMessage);
        throw error; // Re-throw to mark job as failed in BullMQ
    }
}, {
    connection: connection_1.connection,
    concurrency: 5,
});
worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});
worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
});
console.log("Scrape worker started and listening for jobs...");
