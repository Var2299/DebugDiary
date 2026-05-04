"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bug, ArrowRight, Zap, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { deleteProject } from "@/lib/api";

interface ProjectCardProps {
  project: {
    _id: string;
    name: string;
    bugCount: number;
    lastActiveAt: string;
    createdAt: string;
  };
  onDelete: (id: string) => void;
}

export default function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [confirmMode, setConfirmMode] = useState(false);

  const lastActive = new Date(project.lastActiveAt);
  const isNew = Date.now() - lastActive.getTime() < 24 * 60 * 60 * 1000;
  const lastActiveStr =
    project.bugCount === 0
      ? "No bugs yet"
      : `Last fix ${formatDistanceToNow(lastActive, { addSuffix: true })}`;

  const hue =
    project.name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirmMode) {
      setConfirmMode(true);
      setTimeout(() => setConfirmMode(false), 3000);
      return;
    }
    handleConfirmedDelete();
  };

  const handleConfirmedDelete = async () => {
    setDeleting(true);
    try {
      await deleteProject(project._id);
      toast.success(`"${project.name}" deleted`);
      onDelete(project._id);
    } catch (err: unknown) {
      const e = err as Error;
      toast.error(e.message || "Failed to delete project");
      setDeleting(false);
      setConfirmMode(false);
    }
  };

  return (
    <div className="relative group">
      <Link href={`/projects/${project._id}`} className="block">
        <div className="relative overflow-hidden rounded-xl border border-[#1e2740] bg-[#0f1420] p-5 transition-all duration-200 hover:border-[#2e3d63] hover:bg-[#131720] hover:shadow-lg">
          {/* Ambient glow */}
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.06] blur-3xl transition-opacity group-hover:opacity-[0.12]"
            style={{ background: `hsl(${hue}, 70%, 60%)` }}
          />

          {/* Project icon */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-sm font-bold font-mono"
            style={{
              background: `hsla(${hue}, 70%, 60%, 0.12)`,
              border: `1px solid hsla(${hue}, 70%, 60%, 0.2)`,
              color: `hsl(${hue}, 70%, 70%)`,
            }}
          >
            {project.name.slice(0, 2).toUpperCase()}
          </div>

          {/* Name */}
          <h3 className="font-display font-bold text-[#e8edf5] text-base mb-1 truncate pr-8">
            {project.name}
          </h3>

          {/* Stats */}
          <div className="flex items-center gap-2 text-xs font-mono text-[#4a5878] mb-4">
            <Bug size={12} className="text-[#2e3d63]" />
            <span>
              {project.bugCount} bug{project.bugCount !== 1 ? "s" : ""} solved
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#4a5878]">{lastActiveStr}</span>
            <div className="flex items-center gap-2">
              {isNew && project.bugCount > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono">
                  <Zap size={9} />
                  NEW
                </span>
              )}
              <ArrowRight
                size={14}
                className="text-[#2e3d63] group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all"
              />
            </div>
          </div>
        </div>
      </Link>

      {/* Delete button — appears on hover, top-right corner */}
      <button
        onClick={handleDeleteClick}
        disabled={deleting}
        title={confirmMode ? "Click again to confirm delete" : "Delete project"}
        className={`absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono border transition-all duration-200 disabled:opacity-50
          ${
            confirmMode
              ? "bg-red-500/15 border-red-500/40 text-red-400 opacity-100"
              : "bg-[#0f1420] border-[#1e2740] text-[#2e3d63] opacity-0 group-hover:opacity-100 hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/10"
          }`}
      >
        {deleting ? (
          <Loader2 size={11} className="animate-spin" />
        ) : (
          <Trash2 size={11} />
        )}
        {confirmMode && !deleting && "Sure?"}
      </button>
    </div>
  );
}
