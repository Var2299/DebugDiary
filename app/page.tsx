"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Bug, Terminal } from "lucide-react";
import toast from "react-hot-toast";
import { getProjects, createProject } from "@/lib/api";
import { getUserId } from "@/lib/userId";
import ProjectCard from "@/components/ProjectCard";
import AskProjectModal from "@/components/AskProjectModal";
import BugInput from "@/components/BugInput";
import { SkeletonCard } from "@/components/Skeleton";

interface Project {
  _id: string;
  name: string;
  bugCount: number;
  lastActiveAt: string;
  createdAt: string;
}

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize user ID
  useEffect(() => {
    getUserId();
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const { projects } = await getProjects();
      setProjects(projects);
      if (projects.length > 0 && !currentProjectId) {
        setCurrentProjectId(projects[0]._id);
      }
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [currentProjectId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (name: string) => {
    const { project } = await createProject(name);
    setProjects((prev) => [project, ...prev]);
    setCurrentProjectId(project._id);
    setShowModal(false);
    toast.success(`Project "${name}" created!`);
  };

  const handleBugCreated = (bug: unknown) => {
    const b = bug as { projectId: { _id?: string } | string };
    const pid = typeof b.projectId === "object" && b.projectId
      ? (b.projectId._id || b.projectId)
      : b.projectId;

    setProjects((prev) =>
      prev.map((p) =>
        p._id === pid
          ? { ...p, bugCount: p.bugCount + 1, lastActiveAt: new Date().toISOString() }
          : p
      )
    );
  };

  const totalBugs = projects.reduce((sum, p) => sum + p.bugCount, 0);

  // Client‑side filter
  const filteredProjects = searchQuery
    ? projects.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projects; // If no query, show all

  return (
    <div className="min-h-screen flex flex-col bg-[#080a0f]">
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(37,48,80,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(37,48,80,0.2) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-[#1e2740] bg-[#080a0f]/90 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
              <Terminal size={16} className="text-amber-400" />
            </div>
            <div>
              <h1 className="font-display font-bold text-[#e8edf5] text-lg leading-none">
                DebugDiary
              </h1>
              <p className="text-[#4a5878] text-[10px] font-mono mt-0.5">
                AI Bug Fixing Journal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {totalBugs > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0f1420] border border-[#1e2740]">
                <Bug size={12} className="text-amber-400" />
                <span className="font-mono text-xs text-amber-400">
                  {totalBugs} bug{totalBugs !== 1 ? "s" : ""} crushed
                </span>
              </div>
            )}

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0f1420] border border-[#253050] text-[#8896b3] hover:text-[#e8edf5] hover:border-amber-500/30 text-sm font-mono transition-all"
            >
              <Plus size={14} />
              New Project
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 px-6 py-8 pb-36">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : projects.length === 0 ? (
            /* Empty state – no projects at all */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
                <Bug size={28} className="text-amber-400" />
              </div>
              <h2 className="font-display font-bold text-[#e8edf5] text-xl mb-2">
                No bugs fixed yet
              </h2>
              <p className="text-[#4a5878] text-sm max-w-xs mb-2">
                Paste your first error below to get started →
              </p>
              <p className="text-[#2e3d63] text-xs font-mono">
                Your AI debugging partner is ready
              </p>
            </div>
          ) : (
            <>
              {/* Section header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-[#8896b3] text-sm font-bold uppercase tracking-widest">
                  Projects
                  <span className="ml-2 text-[#4a5878] font-normal normal-case tracking-normal">
                    ({filteredProjects.length})
                  </span>
                </h2>
              </div>

              {/* Search bar – only visible when total projects > 10 */}
              {projects.length > 10 && (
                <div className="mb-5">
                  <input
                    type="text"
                    placeholder="Filter projects…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-xs px-3 py-2 rounded-lg bg-[#0f1420] border border-[#1e2740] text-[#e8edf5] text-sm placeholder:text-[#4a5878] focus:outline-none focus:border-amber-500/40"
                  />
                </div>
              )}

              {/* Project grid */}
              {filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProjects.map((project) => (
                    <ProjectCard
                      key={project._id}
                      project={project}
                      onDelete={(id) =>
                        setProjects((prev) => prev.filter((p) => p._id !== id))
                      }
                    />
                  ))}

                  {/* Add project card */}
                  <button
                    onClick={() => setShowModal(true)}
                    className="rounded-xl border border-dashed border-[#1e2740] bg-transparent p-5 flex flex-col items-center justify-center gap-2 text-[#2e3d63] hover:text-[#4a5878] hover:border-[#253050] transition-all group min-h-[140px]"
                  >
                    <Plus
                      size={20}
                      className="group-hover:scale-110 transition-transform"
                    />
                    <span className="text-xs font-mono">New Project</span>
                  </button>
                </div>
              ) : (
                /* No matches (only shown when search is active) */
                projects.length > 10 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-[#4a5878] text-sm">
                      No projects match{" "}
                      <span className="text-[#8896b3] font-medium">
                        “{searchQuery}”
                      </span>
                    </p>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="mt-3 text-xs text-amber-400 hover:text-amber-300 underline underline-offset-2"
                    >
                      Clear search
                    </button>
                  </div>
                )
              )}

              {/* Recent activity hint */}
              <div className="mt-10 border-t border-[#1e2740] pt-6">
                <p className="text-[#4a5878] text-xs font-mono text-center">
                  Click any project to view its bug diary →
                </p>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Sticky bug input */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <BugInput
          projects={projects}
          currentProjectId={currentProjectId}
          onProjectChange={setCurrentProjectId}
          onNewProject={() => setShowModal(true)}
          onBugCreated={(bug) => {
            handleBugCreated(bug);
            if (currentProjectId) {
              window.location.href = `/projects/${currentProjectId}`;
            }
          }}
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