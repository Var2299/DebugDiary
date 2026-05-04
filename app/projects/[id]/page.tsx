"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Terminal,
  Bug,
  ChevronLeft,
  ChevronRight,
  Plus,
  Home,
} from "lucide-react";
import toast from "react-hot-toast";
import { getProjects, getBugs, createProject } from "@/lib/api";
import { getUserId } from "@/lib/userId";
import BugEntryCard from "@/components/BugEntryCard";
import BugInput from "@/components/BugInput";
import SearchBar from "@/components/SearchBar";
import AskProjectModal from "@/components/AskProjectModal";
import { SkeletonBug } from "@/components/Skeleton";

interface Project {
  _id: string;
  name: string;
  bugCount: number;
  lastActiveAt: string;
  createdAt: string;
}

interface BugEntry {
  _id: string;
  errorText: string;
  aiFixMarkdown: string;
  status: "solved" | "investigating";
  createdAt: string;
  projectId?: { name: string; _id?: string };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ProjectDiaryPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [projects, setProjects] = useState<Project[]>([]);
  const [bugs, setBugs] = useState<BugEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchAllProjects, setSearchAllProjects] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const bugsTopRef = useRef<HTMLDivElement>(null);

  const currentProject = projects.find((p) => p._id === projectId);

  useEffect(() => {
    getUserId();
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const { projects } = await getProjects();
      setProjects(projects);
    } catch {
      toast.error("Failed to load projects");
    }
  }, []);

  const fetchBugs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBugs({
        projectId: searchAllProjects ? undefined : projectId,
        search: searchQuery,
        page: currentPage,
        all: searchAllProjects,
      });
      setBugs(data.bugs);
      setPagination(data.pagination);
    } catch {
      toast.error("Failed to load bugs");
    } finally {
      setLoading(false);
    }
  }, [projectId, searchQuery, currentPage, searchAllProjects]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchBugs();
  }, [fetchBugs]);

  const handleSearch = useCallback((query: string, allProjects: boolean) => {
    setSearchQuery(query);
    setSearchAllProjects(allProjects);
    setCurrentPage(1);
  }, []);

  const handleCreateProject = async (name: string) => {
    const { project } = await createProject(name);
    setProjects((prev) => [project, ...prev]);
    setShowModal(false);
    router.push(`/projects/${project._id}`);
    toast.success(`Project "${name}" created!`);
  };

  const handleBugCreated = (bug: unknown) => {
    const b = bug as BugEntry;
    setBugs((prev) => [b, ...prev]);
    setProjects((prev) =>
      prev.map((p) =>
        p._id === projectId
          ? { ...p, bugCount: p.bugCount + 1, lastActiveAt: new Date().toISOString() }
          : p
      )
    );
    bugsTopRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleBugUpdate = (id: string, updates: Partial<BugEntry>) => {
    setBugs((prev) =>
      prev.map((b) => (b._id === id ? { ...b, ...updates } : b))
    );
  };

  const handleBugDelete = (id: string) => {
    setBugs((prev) => prev.filter((b) => b._id !== id));
    setProjects((prev) =>
      prev.map((p) =>
        p._id === projectId
          ? { ...p, bugCount: Math.max(0, p.bugCount - 1) }
          : p
      )
    );
  };

  const totalBugs = projects.reduce((sum, p) => sum + p.bugCount, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#080a0f]">
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(37,48,80,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(37,48,80,0.15) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-[#1e2740] bg-[#080a0f]/90 backdrop-blur-md px-4 py-3">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 text-[#4a5878] hover:text-[#8896b3] transition-colors">
                <Home size={14} />
              </Link>
              <span className="text-[#2e3d63]">/</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                  <Terminal size={12} className="text-amber-400" />
                </div>
                <span className="font-display font-bold text-[#e8edf5] text-sm">
                  DebugDiary
                </span>
              </div>
            </div>

            {totalBugs > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0f1420] border border-[#1e2740]">
                <Bug size={11} className="text-amber-400" />
                <span className="font-mono text-[10px] text-amber-400">
                  {totalBugs} crushed
                </span>
              </div>
            )}
          </div>

          {/* Project tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0 no-scrollbar">
            {projects.map((project) => (
              <Link
                key={project._id}
                href={`/projects/${project._id}`}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-mono whitespace-nowrap border-t border-l border-r transition-all ${
                  project._id === projectId
                    ? "bg-[#0f1420] border-[#253050] text-amber-400 border-b-[#0f1420]"
                    : "bg-transparent border-transparent text-[#4a5878] hover:text-[#8896b3] hover:bg-[#0d1017]"
                }`}
              >
                {project._id === projectId && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                )}
                {project.name}
                <span
                  className={`text-[9px] px-1 py-0.5 rounded font-mono ${
                    project._id === projectId
                      ? "bg-amber-500/15 text-amber-500"
                      : "bg-[#1e2740] text-[#2e3d63]"
                  }`}
                >
                  {project.bugCount}
                </span>
              </Link>
            ))}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono text-[#2e3d63] hover:text-[#4a5878] transition-colors"
            >
              <Plus size={11} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 px-4 py-6 pb-40">
        <div className="max-w-5xl mx-auto">

          {/* Project header */}
          {currentProject && (
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h1 className="font-display font-bold text-[#e8edf5] text-xl mb-1">
                  {currentProject.name}
                </h1>
                <p className="text-[#4a5878] text-xs font-mono">
                  {currentProject.bugCount} bug{currentProject.bugCount !== 1 ? "s" : ""} in this project
                </p>
              </div>
            </div>
          )}

          {/* Search bar */}
          <div className="mb-5">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Search context notice */}
          {searchAllProjects && searchQuery && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/15 text-amber-500/80 text-xs font-mono">
              Searching all projects for &quot;{searchQuery}&quot;
            </div>
          )}

          {/* Bug list */}
          <div ref={bugsTopRef} className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonBug key={i} />)
            ) : bugs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-xl bg-[#0f1420] border border-[#1e2740] flex items-center justify-center mb-4">
                  <Bug size={20} className="text-[#2e3d63]" />
                </div>
                <p className="font-display text-[#8896b3] text-sm font-bold mb-1">
                  {searchQuery ? "No bugs found" : "No bugs yet"}
                </p>
                <p className="text-[#4a5878] text-xs">
                  {searchQuery
                    ? "Try a different search term"
                    : "Paste your first error in the input below ↓"}
                </p>
              </div>
            ) : (
              bugs.map((bug) => (
                <BugEntryCard
                  key={bug._id}
                  bug={bug}
                  showProject={searchAllProjects}
                  onUpdate={handleBugUpdate}
                  onDelete={handleBugDelete}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 px-1">
              <span className="text-xs font-mono text-[#4a5878]">
                Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page === 1}
                  className="p-1.5 rounded-md border border-[#1e2740] text-[#4a5878] hover:text-[#e8edf5] hover:border-[#253050] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-1.5 rounded-md border border-[#1e2740] text-[#4a5878] hover:text-[#e8edf5] hover:border-[#253050] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Sticky input */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <BugInput
          projects={projects}
          currentProjectId={projectId}
          onProjectChange={(id) => router.push(`/projects/${id}`)}
          onNewProject={() => setShowModal(true)}
          onBugCreated={handleBugCreated}
        />
      </div>

      {/* Modal */}
      {showModal && (
        <AskProjectModal
          onClose={() => setShowModal(false)}
          onCreateProject={handleCreateProject}
        />
      )}
    </div>
  );
}
