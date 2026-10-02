import { createFileRoute, redirect } from "@tanstack/react-router";

// The BWU site is served as static pages from /public; send visitors to its home page.
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ href: "/index-with-admin-login.html" });
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
