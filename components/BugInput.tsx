"use client";

import { useState, useRef } from "react";
import { Loader2, Send, FolderOpen, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { createBug } from "@/lib/api";

interface Project {
  _id: string;
  name: string;
}

interface BugInputProps {
  projects: Project[];
  currentProjectId: string | null;
  onProjectChange: (projectId: string) => void;
  onNewProject: () => void;
  onBugCreated: (bug: unknown) => void;
}

export default function BugInput({
  projects,
  currentProjectId,
  onProjectChange,
  onNewProject,
  onBugCreated,
}: BugInputProps) {
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentProject = projects.find((p) => p._id === currentProjectId);

  const handleSubmit = async () => {
    const trimmed = errorText.trim();
    if (!trimmed) {
      toast.error("Please paste an error or bug description");
      return;
    }

    if (!currentProjectId) {
      onNewProject();
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("🤖 Gemini is analysing your bug...", {
      duration: 30000,
    });

    try {
      const { bug } = await createBug(currentProjectId, trimmed);
      toast.dismiss(loadingToast);
      toast.success("Bug analysed & saved!");
      setErrorText("");
      onBugCreated(bug);
    } catch (err: unknown) {
      toast.dismiss(loadingToast);
      const e = err as Error;
      toast.error(e.message || "Failed to analyse bug");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div
      className="border-t border-[#1e2740] bg-[#080a0f]/95 backdrop-blur-md p-4"
      style={{ boxShadow: "0 -8px 40px rgba(0, 0, 0, 0.4)" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Project selector strip */}
        <div className="flex items-center gap-2 mb-2.5">
          <FolderOpen size={13} className="text-[#4a5878]" />
          <span className="text-xs text-[#4a5878] font-mono">Project:</span>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#253050] bg-[#0f1420] text-xs font-mono text-amber-400 hover:border-amber-500/30 transition-all"
            >
              {currentProject ? currentProject.name : "Select project"}
              <ChevronDown size={11} />
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute bottom-full left-0 mb-1 z-20 min-w-[180px] rounded-lg border border-[#253050] bg-[#0f1420] shadow-xl overflow-hidden">
                  {projects.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => {
                        onProjectChange(p._id);
                        setShowDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-mono transition-colors ${
                        p._id === currentProjectId
                          ? "bg-amber-500/10 text-amber-400"
                          : "text-[#8896b3] hover:bg-[#131720] hover:text-[#e8edf5]"
                      }`}
                    >
                      {p._id === currentProjectId ? "✓ " : "  "}
                      {p.name}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      onNewProject();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-mono text-[#4a5878] hover:bg-[#131720] hover:text-amber-400 border-t border-[#1e2740] transition-colors"
                  >
                    + New project
                  </button>
                </div>
              </>
            )}
          </div>

          {!currentProject && projects.length === 0 && (
            <span className="text-[10px] text-amber-500/70 font-mono">
              ← Create a project first
            </span>
          )}
        </div>

        {/* Input area */}
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={errorText}
              onChange={(e) => setErrorText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste your error message or describe your bug here..."
              rows={3}
              disabled={loading}
              className="w-full bg-[#0d1017] border border-[#253050] rounded-xl px-4 py-3 font-mono text-sm text-[#e8edf5] placeholder-[#2e3d63] focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/15 transition-all resize-none disabled:opacity-50"
            />
            <div className="absolute bottom-2 right-3 text-[10px] font-mono text-[#2e3d63]">
              {loading ? (
                <span className="text-amber-500/60">analysing...</span>
              ) : (
                "⌘↵ to send"
              )}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !errorText.trim()}
            className="h-[72px] w-12 rounded-xl bg-amber-500 hover:bg-amber-400 text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center shrink-0"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
