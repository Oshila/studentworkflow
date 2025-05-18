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

interface Task {
  id: string;
  title: string;
  dueDate: string;
  status: "pending" | "done";
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<"pending" | "done">("pending");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);

  // Set userId once on mount (you can also listen to auth changes if you want)
  useEffect(() => {
    if (auth.currentUser) {
      setUserId(auth.currentUser.uid);
    } else {
      setUserId(null);
    }
  }, []);

  // Subscribe to tasks when userId is set
  useEffect(() => {
    if (!userId) return;

    const tasksRef = collection(db, "users", userId, "tasks");
    const q = query(tasksRef, orderBy("dueDate"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tsks: Task[] = [];
      querySnapshot.forEach((doc) => {
        tsks.push({ id: doc.id, ...(doc.data() as Omit<Task, "id">) });
      });
      setTasks(tsks);
      setLoading(false);
    });

    return () => unsubscribe();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const clearForm = () => {
    setTitle("");
    setDueDate("");
    setStatus("pending");
    setEditingId(null);
  };

  const handleAddOrUpdate = async () => {
    if (!userId) {
      alert("You must be logged in to add or edit tasks.");
      return;
    }

    if (!title.trim()) {
      alert("Title is required");
      return;
    }
    if (!dueDate) {
      alert("Due date is required");
      return;
    }

    try {
      if (editingId) {
        const docRef = doc(db, "users", userId, "tasks", editingId);
        await updateDoc(docRef, { title, dueDate, status });
      } else {
        const tasksRef = collection(db, "users", userId, "tasks");
        await addDoc(tasksRef, { title, dueDate, status });
      }
      clearForm();
    } catch (error) {
      console.error("Error saving task: ", error);
      alert("Error saving task");
    }
  };

  const handleEdit = (task: Task) => {
    setTitle(task.title);
    setDueDate(task.dueDate);
    setStatus(task.status);
    setEditingId(task.id);
  };

  const handleDelete = async (id: string) => {
    if (!userId) {
      alert("You must be logged in to delete tasks.");
      return;
    }
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const docRef = doc(db, "users", userId, "tasks", id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting task: ", error);
      alert("Error deleting task");
    }
  };

  if (loading) return <p>Loading tasks...</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tasks</h1>

      <div className="mb-6 p-4 border rounded shadow-sm">
        <h2 className="text-xl mb-2">{editingId ? "Edit Task" : "Add New Task"}</h2>
        <input
          type="text"
          placeholder="Title"
          className="w-full border px-3 py-2 rounded mb-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="date"
          className="w-full border px-3 py-2 rounded mb-2"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <select
          className="w-full border px-3 py-2 rounded mb-2"
          value={status}
          onChange={(e) => setStatus(e.target.value as "pending" | "done")}
        >
          <option value="pending">Pending</option>
          <option value="done">Done</option>
        </select>

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
        {tasks.length === 0 && <p>No tasks yet. Add some!</p>}
        {tasks.map((task) => (
          <li
            key={task.id}
            className="border-b py-3 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{task.title}</p>
              <p className="text-sm text-gray-600">Due: {task.dueDate}</p>
              <p
                className={`text-sm font-medium ${
                  task.status === "done" ? "text-green-600" : "text-yellow-600"
                }`}
              >
                Status: {task.status}
              </p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleEdit(task)}
                className="text-indigo-600 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(task.id)}
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
