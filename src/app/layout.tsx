// app/layout.tsx
import "../styles/globals.css";

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Student Workflow App",
  description: "Minimal student planner for tasks, activities, and timetable.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-slate-900`}>
        {children}
      </body>
    </html>
  );
}
