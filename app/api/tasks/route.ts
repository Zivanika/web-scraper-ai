import { db } from "@/app/db";
import { tasks } from "@/app/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  const allTasks = await db.select().from(tasks);
  return NextResponse.json(allTasks);
}
