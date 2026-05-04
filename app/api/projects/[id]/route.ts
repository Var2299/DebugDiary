import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Project from "@/models/Project";
import BugEntry from "@/models/BugEntry";
import mongoose from "mongoose";

// DELETE /api/projects/:id — delete project + all its bugs
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const userId = req.headers.get("x-user-id") || "anonymous";
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    const project = await Project.findOneAndDelete({ _id: id, userId });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Cascade delete all bug entries for this project
    await BugEntry.deleteMany({ projectId: id, userId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/projects/:id error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
