"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  Trash2,
  Copy,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import { updateBugStatus, deleteBug } from "@/lib/api";

interface BugEntryCardProps {
  bug: {
    _id: string;
    errorText: string;
    aiFixMarkdown: string;
    status: "solved" | "investigating";
    createdAt: string;
    projectId?: { name: string };
  };
  showProject?: boolean;
  onUpdate: (id: string, updates: Partial<BugEntryCardProps["bug"]>) => void;
  onDelete: (id: string) => void;
}

export default function BugEntryCard({
  bug,
  showProject,
  onUpdate,
  onDelete,
}: BugEntryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleToggleStatus = async () => {
    const newStatus = bug.status === "solved" ? "investigating" : "solved";
    setStatusLoading(true);
    try {
      await updateBugStatus(bug._id, newStatus);
      onUpdate(bug._id, { status: newStatus });
      toast.success(
        newStatus === "solved" ? "Marked as solved ✓" : "Reopened for investigation"
      );
    } catch {
      toast.error("Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this bug entry?")) return;
    try {
      await deleteBug(bug._id);
      onDelete(bug._id);
      toast.success("Bug entry deleted");
    } catch {
      toast.error("Failed to delete bug");
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(bug.errorText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timeAgo = formatDistanceToNow(new Date(bug.createdAt), {
    addSuffix: true,
  });

  const truncatedError =
    bug.errorText.length > 200
      ? bug.errorText.slice(0, 200) + "..."
      : bug.errorText;

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        bug.status === "solved"
          ? "border-green-500/20 bg-[#0a1210]"
          : "border-[#1e2740] bg-[#0f1420]"
      }`}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Status + time */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleToggleStatus}
              disabled={statusLoading}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border transition-all ${
                bug.status === "solved"
                  ? "bg-green-500/10 border-green-500/25 text-green-400 hover:bg-green-500/20"
                  : "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
              } disabled:opacity-50`}
            >
              {bug.status === "solved" ? (
                <CheckCircle size={11} />
              ) : (
                <Clock size={11} />
              )}
              {bug.status === "solved" ? "Solved ✓" : "Investigating"}
            </button>

            {showProject && bug.projectId && (
              <span className="px-2 py-1 rounded-full bg-[#131720] border border-[#1e2740] text-[#4a5878] text-xs font-mono">
                {bug.projectId.name}
              </span>
            )}

            <span className="text-[#4a5878] text-xs">{timeAgo}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md text-[#4a5878] hover:text-[#e8edf5] hover:bg-[#1e2740] transition-all"
              title="Copy error"
            >
              {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-md text-[#4a5878] hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Error text */}
        <div className="relative">
          <pre className="font-mono text-xs text-[#8896b3] bg-[#060810] border border-[#1e2740] rounded-lg p-3 overflow-hidden whitespace-pre-wrap break-all leading-relaxed">
            {expanded ? bug.errorText : truncatedError}
          </pre>
          {bug.errorText.length > 200 && (
            <div
              className={`absolute bottom-0 left-0 right-0 flex justify-center pb-1 ${
                !expanded
                  ? "bg-gradient-to-t from-[#060810] to-transparent pt-6"
                  : ""
              }`}
            >
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs text-[#4a5878] hover:text-amber-400 font-mono transition-colors"
              >
                {expanded ? (
                  <>
                    <ChevronUp size={12} /> Collapse
                  </>
                ) : (
                  <>
                    <ChevronDown size={12} /> Show full error
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Toggle AI fix */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1.5 text-xs font-mono text-amber-500 hover:text-amber-300 transition-colors"
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {expanded ? "Hide AI Fix" : "Show AI Fix →"}
        </button>
      </div>

      {/* AI Fix (collapsible) */}
      {expanded && (
        <div className="border-t border-[#1e2740] px-4 pb-4 pt-4 bg-[#080c14]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 rounded bg-amber-500/15 flex items-center justify-center">
              <span className="text-amber-400" style={{ fontSize: "10px" }}>AI</span>
            </div>
            <span className="text-xs font-mono text-[#4a5878] uppercase tracking-wider">
              Fix Guide
            </span>
          </div>
          <div className="prose-dark">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {bug.aiFixMarkdown}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
