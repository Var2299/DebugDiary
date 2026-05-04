"use client";

const USER_ID_KEY = "debugdiary_user_id";

export function getUserId(): string {
  if (typeof window === "undefined") return "anonymous";

  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId =
      "user_" +
      Math.random().toString(36).slice(2) +
      Date.now().toString(36);
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}
