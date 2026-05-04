import { getUserId } from "./userId";

async function apiFetch(url: string, options: RequestInit = {}) {
  const userId = getUserId();
  const headers = {
    "Content-Type": "application/json",
    "x-user-id": userId,
    ...(options.headers || {}),
  };
  const res = await fetch(url, { ...options, headers });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "API Error");
  }
  return data;
}

// Projects
export const getProjects = () => apiFetch("/api/projects");

export const createProject = (name: string) =>
  apiFetch("/api/projects", {
    method: "POST",
    body: JSON.stringify({ name }),
  });

// Bugs
export const getBugs = (params: {
  projectId?: string;
  search?: string;
  page?: number;
  all?: boolean;
}) => {
  const qs = new URLSearchParams();
  if (params.projectId) qs.set("projectId", params.projectId);
  if (params.search) qs.set("search", params.search);
  if (params.page) qs.set("page", String(params.page));
  if (params.all) qs.set("all", "true");
  return apiFetch(`/api/bugs?${qs.toString()}`);
};

export const createBug = (projectId: string, errorText: string) =>
  apiFetch("/api/bugs", {
    method: "POST",
    body: JSON.stringify({ projectId, errorText }),
  });

export const updateBugStatus = (
  id: string,
  status: "solved" | "investigating"
) =>
  apiFetch(`/api/bugs/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const deleteBug = (id: string) =>
  apiFetch(`/api/bugs/${id}`, { method: "DELETE" });

export const deleteProject = (id: string) =>
  apiFetch(`/api/projects/${id}`, { method: "DELETE" });
