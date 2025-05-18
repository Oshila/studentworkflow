"use client";

import React, { useState } from "react";
import { auth } from "../../../lib/firebase";
import { updateProfile } from "firebase/auth";

export default function ProfilePage() {
  const user = auth.currentUser;

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [message, setMessage] = useState("");

  const handleUpdate = async () => {
    if (!user) return;

    try {
      await updateProfile(user, {
        displayName,
        // photoURL omitted
      });
      setMessage("Profile updated successfully.");
    } catch (error) {
      console.error("Profile update error:", error);
      setMessage("Failed to update profile.");
    }
  };

  if (!user) {
    return <p>Please log in to view profile.</p>;
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>

      {/* Removed profile picture and photoURL input */}

      <label className="block font-medium mb-1">Display Name</label>
      <input
        type="text"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-4"
      />

      <label className="block font-medium mb-1">Email (readonly)</label>
      <input
        type="email"
        value={user.email || ""}
        readOnly
        className="w-full border rounded px-3 py-2 mb-4 bg-gray-100 cursor-not-allowed"
      />

      <button
        onClick={handleUpdate}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        Update Profile
      </button>

      {message && <p className="mt-3 text-green-600">{message}</p>}
    </div>
  );
}
