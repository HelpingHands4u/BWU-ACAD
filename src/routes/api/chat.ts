import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";

const SYSTEM = `You are the BWU Assistant, the help desk for Brainware University's Academic Management System.
The site has Student, Faculty and Admin portals (login buttons on the home page).
Students: dashboard with courses, attendance, timetable, exams, marks, SGPA/CGPA, academic resources and syllabus.
Faculty: assigned courses, attendance marking, marks & examination entry, syllabus monitoring.
Admins: student/faculty/course management, faculty-course assignment, class timetable, attendance overview, marks & examination, reports, user access control, system settings.
Answer briefly and helpfully. If you don't know a specific personal record, tell the user where in the portal to find it.`;

const Body = z.object({
  message: z.string().min(1).max(4000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(8000),
      }),
    )
    .max(40)
    .optional(),
});

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = Body.safeParse(await request.json().catch(() => null));

        if (!parsed.success) {
          return Response.json({ reply: "Invalid request." }, { status: 400 });
        }

        const key = process.env["GROQ_API_KEY"];

        if (!key) {
          return Response.json({ reply: "The AI is not configured." }, { status: 500 });
        }

        const messages = (parsed.data.history ?? []).slice(-20);

        if (messages.at(-1)?.content !== parsed.data.message) {
          messages.push({
            role: "user",
            content: parsed.data.message,
          });
        }

        const groq = createOpenAI({
          baseURL: "https://api.groq.com/openai/v1",
          apiKey: key,
        });

        try {
          const result = streamText({
            model: groq("openai/gpt-oss-20b"),
            system: SYSTEM,
            messages,
          });

          const reply = await result.text;

          return Response.json({
            reply: reply || "No reply received.",
          });
        } catch (e: unknown) {
          const error = e as {
            statusCode?: number;
            status?: number;
            message?: string;
          };

          const status = error.statusCode ?? error.status ?? 500;

          const msg =
            status === 401
              ? "The AI service authentication failed."
              : status === 429
                ? "Too many requests — please try again in a moment."
                : "Sorry, the assistant is unavailable right now.";

          console.error("Groq chat error", status, error.message);

          return Response.json({ reply: msg }, { status });
        }
      },
    },
  },
});
