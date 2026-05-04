import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Project from "@/models/Project";

// GET /api/projects — list all projects with stats
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const userId = req.headers.get("x-user-id") || "anonymous";

    const projects = await Project.find({ userId })
      .sort({ lastActiveAt: -1 })
      .lean();

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST /api/projects — create a new project
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const userId = req.headers.get("x-user-id") || "anonymous";
    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Check for duplicate name per user
    const existing = await Project.findOne({ name: trimmedName, userId });
    if (existing) {
      return NextResponse.json(
        { error: "A project with this name already exists" },
        { status: 409 }
      );
    }

    const project = await Project.create({
      name: trimmedName,
      userId,
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
