"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Activities", href: "/dashboard/activities" },
  { label: "Tasks", href: "/dashboard/tasks" },
  { label: "Timetable", href: "/dashboard/timetable" },
  { label: "Profile", href: "/dashboard/profile" },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login"); // Redirect to login page after logout
    } catch (error) {
      console.error("Logout error:", error);
      // Optional: add toast or alert to show error
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 shadow-md transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:flex md:flex-col`}
      >
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <h2 className="text-xl font-bold text-indigo-600">Student Workflow</h2>
        </div>
        <nav className="flex flex-col flex-grow p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded px-3 py-2 font-medium text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 ${
                pathname === item.href ? "bg-indigo-100 text-indigo-700 font-semibold" : ""
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout Button at bottom */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full text-left rounded px-3 py-2 text-red-600 hover:bg-red-100 font-semibold"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
