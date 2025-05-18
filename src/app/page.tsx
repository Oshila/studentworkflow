// app/page.tsx
"use client";

import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-sky-100 text-slate-900 flex flex-col justify-center items-center px-6 py-12">
      <div className="text-center max-w-2xl space-y-6">
        <h1 className="text-4xl md:text-5xl font-extrabold">
          Welcome to Student Workflow App
        </h1>
        <p className="text-lg text-slate-600">
          Plan your tasks, track activities, and manage your timetable — all in one minimal student-focused dashboard.
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="/signup"
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-indigo-700 transition"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="border border-slate-300 text-slate-800 px-6 py-3 rounded-xl font-semibold hover:bg-slate-100 transition"
          >
            Log In
          </a>
        </div>
      </div>
      <div className="mt-12 max-w-xl w-full relative h-[300px] md:h-[400px]">
        <Image
          src="/student-illustration.svg"
          alt="Student illustration"
          fill
          style={{ objectFit: "contain" }}
          priority
        />
      </div>
    </main>
  );
}
