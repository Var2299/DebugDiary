import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "DebugDiary — AI Bug Fixing Journal",
  description:
    "Paste errors, get AI-guided fixes, build your personal debugging knowledge base.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080a0f] text-[#e8edf5] min-h-screen">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#131720",
              color: "#e8edf5",
              border: "1px solid #253050",
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: "0.875rem",
            },
            success: {
              iconTheme: { primary: "#22c55e", secondary: "#131720" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#131720" },
            },
          }}
        />
      </body>
    </html>
  );
}
