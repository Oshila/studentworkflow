"use client";

import { useState, useEffect } from "react";

interface NavbarProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function Navbar({ setSidebarOpen }: NavbarProps) {
  // Placeholder user info - replace with actual user info later
  const [userName, setUserName] = useState("Student");

  useEffect(() => {
    // TODO: Fetch user info from auth context or Firebase
    // setUserName(authUser.displayName || "Student");
  }, []);

  return (
    <header className="flex items-center justify-between bg-white border-b border-gray-200 h-16 px-4 shadow-sm">
      <button
        className="text-gray-600 focus:outline-none md:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        {/* Hamburger icon */}
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div className="flex items-center space-x-4">
        {/* User info */}
        <span className="hidden md:inline-block font-medium text-gray-700">
          Hi, {userName}
        </span>
        {/* Avatar image removed */}
      </div>
    </header>
  );
}

