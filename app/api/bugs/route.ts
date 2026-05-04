import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import BugEntry from "@/models/BugEntry";
import Project from "@/models/Project";
import { generateBugFix } from "@/lib/gemini";
import mongoose from "mongoose";

// GET /api/bugs?projectId=xxx&search=yyy&page=1&all=true
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const userId = req.headers.get("x-user-id") || "anonymous";
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const all = searchParams.get("all") === "true";
    const limit = 10;
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { userId };

    if (!all && projectId) {
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return NextResponse.json({ error: "Invalid projectId" }, { status: 400 });
      }
      query.projectId = new mongoose.Types.ObjectId(projectId);
    }

    if (search) {
      query.$text = { $search: search };
    }

    const [bugs, total] = await Promise.all([
      BugEntry.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("projectId", "name")
        .lean(),
      BugEntry.countDocuments(query),
    ]);

    return NextResponse.json({
      bugs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/bugs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bugs" },
      { status: 500 }
    );
  }
}

// POST /api/bugs — create bug entry + trigger Gemini
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const userId = req.headers.get("x-user-id") || "anonymous";
    const body = await req.json();
    const { projectId, errorText } = body;

    if (!projectId || !errorText) {
      return NextResponse.json(
        { error: "projectId and errorText are required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return NextResponse.json({ error: "Invalid projectId" }, { status: 400 });
    }

    // Verify project belongs to user
    const project = await Project.findOne({
      _id: projectId,
      userId,
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Generate AI fix from Gemini
    const aiFixMarkdown = await generateBugFix(errorText, project.name);

    // Save bug entry
    const bug = await BugEntry.create({
      projectId: project._id,
      userId,
      errorText,
      aiFixMarkdown,
      status: "investigating",
    });

    // Update project stats
    await Project.findByIdAndUpdate(project._id, {
      $inc: { bugCount: 1 },
      lastActiveAt: new Date(),
    });

    const populatedBug = await BugEntry.findById(bug._id)
      .populate("projectId", "name")
      .lean();

    return NextResponse.json({ bug: populatedBug }, { status: 201 });
  } catch (error) {
    console.error("POST /api/bugs error:", error);
    return NextResponse.json(
      { error: "Failed to create bug entry" },
      { status: 500 }
    );
  }
}
