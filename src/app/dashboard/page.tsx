"use client";

import React, { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  if (loadingAuth) return <p>Loading authentication...</p>;

  if (!user) return <p>Please log in to access your dashboard.</p>;

  return (
    <main className="p-6 max-w-3xl mx-auto text-center bg-white rounded shadow">
      <h1 className="text-4xl font-extrabold mb-6 text-indigo-700">
        Welcome back, {user.displayName || "Student"}!
      </h1>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">🎯 Today's Focus</h2>
        <p className="text-lg text-gray-700">
          Break your study goals into manageable tasks. Remember, consistency beats intensity.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">📅 Workflow Reminder</h2>
        <p className="text-gray-600 italic">
          "Organize your time, prioritize your tasks, and track your progress. The journey to success starts here."
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">💡 Quick Tips</h2>
        <ul className="list-disc list-inside text-left max-w-md mx-auto text-gray-700">
          <li>Use short bursts of focused study with breaks in between.</li>
          <li>Review your tasks daily and adjust your plan as needed.</li>
          <li>Keep distractions away — your workflow depends on focus.</li>
        </ul>
      </section>
    </main>
  );
}
