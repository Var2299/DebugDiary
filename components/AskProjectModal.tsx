"use client";

import { useState, useEffect, useRef } from "react";
import { X, FolderPlus, Loader2 } from "lucide-react";

interface AskProjectModalProps {
  onClose: () => void;
  onCreateProject: (name: string) => Promise<void>;
}

export default function AskProjectModal({
  onClose,
  onCreateProject,
}: AskProjectModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") onClose();
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Project name cannot be empty");
      return;
    }
    if (trimmed.length > 50) {
      setError("Project name must be under 50 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onCreateProject(trimmed);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(8, 10, 15, 0.85)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-md rounded-xl border border-[#253050] bg-[#0f1420] p-6 shadow-2xl animate-slide-up"
        style={{ boxShadow: "0 0 60px rgba(245, 158, 11, 0.08)" }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-md text-[#4a5878] hover:text-[#e8edf5] hover:bg-[#1e2740] transition-colors"
        >
          <X size={16} />
        </button>

        {/* Icon + Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <FolderPlus size={20} className="text-amber-400" />
          </div>
          <div>
            <h2 className="font-display text-[#e8edf5] font-bold text-base">
              Which project is this for?
            </h2>
            <p className="text-[#4a5878] text-xs mt-0.5">
              Create a project to organise your bugs
            </p>
          </div>
        </div>

        {/* Input */}
        <div className="space-y-3">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder="e.g., WorkApp, MyPortfolio, FreelanceClient"
              maxLength={50}
              className="w-full bg-[#080a0f] border border-[#253050] rounded-lg px-4 py-3 text-[#e8edf5] font-mono text-sm placeholder-[#4a5878] focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a5878] text-xs font-mono">
              {name.length}/50
            </span>
          </div>

          {error && (
            <p className="text-red-400 text-xs font-mono flex items-center gap-1.5">
              <span>✕</span> {error}
            </p>
          )}

          {/* Suggestions */}
          <div className="flex flex-wrap gap-2">
            {["WorkApp", "MyPortfolio", "FreelanceClient", "Experiments"].map(
              (suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setName(suggestion)}
                  className="px-2.5 py-1 text-xs font-mono rounded-md border border-[#1e2740] text-[#4a5878] hover:text-amber-400 hover:border-amber-500/30 transition-all"
                >
                  {suggestion}
                </button>
              )
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold font-display text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating...
              </>
            ) : (
              "Create Project & Analyse Bug →"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
