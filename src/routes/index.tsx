import { createFileRoute } from "@tanstack/react-router";
import homeHtml from "../../public/index.html?raw";

// Serve the original BWU static home page directly at "/" (no redirect, no client 404).
export const Route = createFileRoute("/")({
  server: {
    handlers: {
      GET: async () =>
        new Response(homeHtml, { headers: { "content-type": "text/html; charset=utf-8" } }),
    },
  },
  head: () => ({
    meta: [
      { title: "BWU — University Academic Management System" },
      { name: "description", content: "Student, faculty and admin portal for BWU academic management." },
      { property: "og:title", content: "BWU — University Academic Management System" },
      { property: "og:description", content: "Student, faculty and admin portal for BWU academic management." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
