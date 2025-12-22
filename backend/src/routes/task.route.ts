import { Router } from "express";
import { scrapeQueue } from "../queues/scrape.queue";
import { db } from "../db/index";
import { tasks } from "../db/schema";
import { eq, desc } from "drizzle-orm";

const router = Router();

// GET all tasks
router.get("/tasks", async (req, res) => {
  try {
    const allTasks = await db.select().from(tasks).orderBy(desc(tasks.createdAt));
    res.json(allTasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({
      error: "Failed to fetch tasks",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET single task by ID
router.get("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const task = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);

    if (task.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(task[0]);
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({
      error: "Failed to fetch task",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// POST create new task and queue it
router.post("/tasks", async (req, res) => {
  try {
    const { websiteUrl, question } = req.body;

    // Validate input
    if (!websiteUrl || !question) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "websiteUrl and question are required",
      });
    }

    // Validate URL format
    try {
      new URL(websiteUrl);
    } catch {
      return res.status(400).json({
        error: "Invalid URL",
        message: "websiteUrl must be a valid URL",
      });
    }

    // Create task in database with pending status
    const [newTask] = await db
      .insert(tasks)
      .values({
        websiteUrl,
        question,
        status: "pending",
      })
      .returning();

    // Add job to queue
    await scrapeQueue.add(
      "process",
      {
        taskId: newTask.id,
        websiteUrl: newTask.websiteUrl,
        question: newTask.question,
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: true,
      }
    );

    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({
      error: "Failed to create task",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
