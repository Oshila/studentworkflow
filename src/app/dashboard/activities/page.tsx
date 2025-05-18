"use client";

import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db, auth } from "../../../lib/firebase";

interface Activity {
  id: string;
  title: string;
  description: string;
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // We'll track user id in a state to react to auth changes if needed
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to auth state changes to update userId reactively
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      setUserId(user ? user.uid : null);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const activitiesRef = collection(db, "users", userId, "activities");
    const q = query(activitiesRef, orderBy("title"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const acts: Activity[] = [];
      querySnapshot.forEach((doc) => {
        acts.push({ id: doc.id, ...(doc.data() as Omit<Activity, "id">) });
      });
      setActivities(acts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const clearForm = () => {
    setTitle("");
    setDescription("");
    setEditingId(null);
  };

  const handleAddOrUpdate = async () => {
    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    if (!userId) {
      alert("User not authenticated");
      return;
    }

    try {
      if (editingId) {
        // Update existing
        const docRef = doc(db, "users", userId, "activities", editingId);
        await updateDoc(docRef, { title, description });
      } else {
        // Add new
        const activitiesRef = collection(db, "users", userId, "activities");
        await addDoc(activitiesRef, { title, description });
      }
      clearForm();
    } catch (error) {
      console.error("Error saving activity: ", error);
      alert("Error saving activity");
    }
  };

  const handleEdit = (activity: Activity) => {
    setTitle(activity.title);
    setDescription(activity.description);
    setEditingId(activity.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this activity?")) return;

    if (!userId) {
      alert("User not authenticated");
      return;
    }

    try {
      const docRef = doc(db, "users", userId, "activities", id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting activity: ", error);
      alert("Error deleting activity");
    }
  };

  if (loading) return <p>Loading activities...</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Activities</h1>

      <div className="mb-6 p-4 border rounded shadow-sm">
        <h2 className="text-xl mb-2">{editingId ? "Edit Activity" : "Add New Activity"}</h2>
        <input
          type="text"
          placeholder="Title"
          className="w-full border px-3 py-2 rounded mb-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description (optional)"
          className="w-full border px-3 py-2 rounded mb-2"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
        <div className="flex space-x-2">
          <button
            onClick={handleAddOrUpdate}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            {editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button
              onClick={clearForm}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <ul>
        {activities.length === 0 && <p>No activities yet. Add some!</p>}
        {activities.map((activity) => (
          <li
            key={activity.id}
            className="border-b py-3 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{activity.title}</p>
              {activity.description && (
                <p className="text-gray-600 text-sm">{activity.description}</p>
              )}
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleEdit(activity)}
                className="text-indigo-600 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(activity.id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
