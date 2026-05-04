"use client";

import { useState, useEffect } from "react";
import { Search, X, Globe } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string, allProjects: boolean) => void;
  isGlobal?: boolean;
}

export default function SearchBar({ onSearch, isGlobal = false }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [allProjects, setAllProjects] = useState(isGlobal);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearch(query, allProjects);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, allProjects, onSearch]);

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a5878]"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search errors and fixes..."
          className="w-full bg-[#0d1017] border border-[#1e2740] rounded-lg pl-9 pr-8 py-2 text-sm font-mono text-[#e8edf5] placeholder-[#2e3d63] focus:outline-none focus:border-[#253050] transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#4a5878] hover:text-[#e8edf5] transition-colors"
          >
            <X size={12} />
          </button>
        )}
      </div>

      <button
        onClick={() => setAllProjects(!allProjects)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-mono transition-all ${
          allProjects
            ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
            : "border-[#1e2740] text-[#4a5878] hover:border-[#253050] hover:text-[#8896b3]"
        }`}
        title={allProjects ? "Searching all projects" : "Search all projects"}
      >
        <Globe size={12} />
        All
      </button>
    </div>
  );
}
