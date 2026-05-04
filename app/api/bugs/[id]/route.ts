import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import BugEntry from "@/models/BugEntry";
import mongoose from "mongoose";

// PATCH /api/bugs/:id — update status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const userId = req.headers.get("x-user-id") || "anonymous";
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid bug ID" }, { status: 400 });
    }

    const body = await req.json();
    const { status } = body;

    if (!["solved", "investigating"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be 'solved' or 'investigating'" },
        { status: 400 }
      );
    }

    const bug = await BugEntry.findOneAndUpdate(
      { _id: id, userId },
      { status },
      { new: true }
    )
      .populate("projectId", "name")
      .lean();

    if (!bug) {
      return NextResponse.json({ error: "Bug not found" }, { status: 404 });
    }

    return NextResponse.json({ bug });
  } catch (error) {
    console.error("PATCH /api/bugs/:id error:", error);
    return NextResponse.json(
      { error: "Failed to update bug" },
      { status: 500 }
    );
  }
}

// DELETE /api/bugs/:id
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const userId = req.headers.get("x-user-id") || "anonymous";
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid bug ID" }, { status: 400 });
    }

    const bug = await BugEntry.findOneAndDelete({ _id: id, userId });

    if (!bug) {
      return NextResponse.json({ error: "Bug not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/bugs/:id error:", error);
    return NextResponse.json(
      { error: "Failed to delete bug" },
      { status: 500 }
    );
  }
}
