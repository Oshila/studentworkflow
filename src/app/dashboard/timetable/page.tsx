"use client";

import React, { useState, useEffect } from "react";
import { db, auth } from "../../../lib/firebase"; 
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

interface ClassSlot {
  subject: string;
  startTime: string;
  endTime: string;
}

interface TimetableEntry extends ClassSlot {
  id?: string;
  day: string;
}

export default function TimetablePage() {
  const user = auth.currentUser;
  const [slotsByDay, setSlotsByDay] = useState<Record<string, ClassSlot[]>>(() => {
    // Initialize empty slots for each day with one empty slot
    const initial: Record<string, ClassSlot[]> = {};
    days.forEach((day) => {
      initial[day] = [{ subject: "", startTime: "", endTime: "" }];
    });
    return initial;
  });

  const [savedTimetable, setSavedTimetable] = useState<Record<string, TimetableEntry[]>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch saved timetable from Firestore
  const fetchTimetable = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "timetables"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const timetableEntries: TimetableEntry[] = [];
      querySnapshot.forEach((docSnap) => {
        timetableEntries.push({ id: docSnap.id, ...docSnap.data() } as TimetableEntry);
      });

      // Group by day
      const grouped: Record<string, TimetableEntry[]> = {};
      days.forEach((day) => (grouped[day] = []));
      timetableEntries.forEach((entry) => {
        if (entry.day && grouped[entry.day]) {
          grouped[entry.day].push(entry);
        }
      });
      setSavedTimetable(grouped);
    } catch (e) {
      setError("Failed to load timetable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [user]);

  // Handle input change in form
  const handleChange = (
    day: string,
    index: number,
    field: keyof ClassSlot,
    value: string
  ) => {
    setSlotsByDay((prev) => {
      const daySlots = [...prev[day]];
      daySlots[index] = { ...daySlots[index], [field]: value };
      return { ...prev, [day]: daySlots };
    });
  };

  // Add new class slot row
  const addSlot = (day: string) => {
    setSlotsByDay((prev) => {
      const daySlots = [...prev[day], { subject: "", startTime: "", endTime: "" }];
      return { ...prev, [day]: daySlots };
    });
  };

  // Remove class slot row
  const removeSlot = (day: string, index: number) => {
    setSlotsByDay((prev) => {
      const daySlots = prev[day].filter((_, i) => i !== index);
      return { ...prev, [day]: daySlots.length > 0 ? daySlots : [{ subject: "", startTime: "", endTime: "" }] };
    });
  };

  // Clear saved timetable from Firestore for user before saving new (simple way)
  const clearOldTimetable = async () => {
    if (!user) return;
    const q = query(collection(db, "timetables"), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const deletions = querySnapshot.docs.map((docSnap) => deleteDoc(doc(db, "timetables", docSnap.id)));
    await Promise.all(deletions);
  };

  // Save all slots to Firestore
  const handleSave = async () => {
    if (!user) {
      setError("You must be logged in");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await clearOldTimetable();

      // Flatten all slots and filter out empty subjects
      const allSlots: Omit<TimetableEntry, "id">[] = [];
      days.forEach((day) => {
        slotsByDay[day].forEach(({ subject, startTime, endTime }) => {
          if (subject.trim() !== "") {
            allSlots.push({
              userId: user.uid,
              day,
              subject: subject.trim(),
              startTime,
              endTime,
            });
          }
        });
      });

      // Add each slot as a doc
      const colRef = collection(db, "timetables");
      const promises = allSlots.map((slot) => addDoc(colRef, slot));
      await Promise.all(promises);

      // Refresh display
      fetchTimetable();
      alert("Timetable saved successfully!");
    } catch (e) {
      setError("Failed to save timetable");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6 text-center">Your Timetable</h1>

      {/* Display saved timetable */}
      {loading ? (
        <p>Loading timetable...</p>
      ) : (
        <div className="mb-8 space-y-4">
          {days.map((day) => (
            <div key={day} className="border rounded p-4 bg-white shadow-sm">
              <h2 className="text-xl font-semibold mb-2">{day}</h2>
              {savedTimetable[day] && savedTimetable[day].length > 0 ? (
                <ul className="space-y-1">
                  {savedTimetable[day].map(({ id, subject, startTime, endTime }) => (
                    <li key={id} className="flex justify-between bg-gray-50 p-2 rounded">
                      <span>{subject}</span>
                      <span>{startTime} - {endTime}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="italic text-gray-400">No classes saved.</p>
              )}
            </div>
          ))}
        </div>
      )}

      <hr className="my-6" />

      {/* Input form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="space-y-6"
      >
        {days.map((day) => (
          <div key={day} className="border rounded p-4 bg-white shadow-sm">
            <h2 className="text-xl font-semibold mb-4">{day}</h2>
            {slotsByDay[day].map((slot, i) => (
              <div
                key={i}
                className="flex flex-col md:flex-row md:space-x-4 items-center mb-3"
              >
                <input
                  type="text"
                  placeholder="Subject"
                  className="border rounded px-3 py-2 w-full md:w-1/3 mb-2 md:mb-0"
                  value={slot.subject}
                  onChange={(e) => handleChange(day, i, "subject", e.target.value)}
                  required
                />
                <input
                  type="time"
                  className="border rounded px-3 py-2 w-full md:w-1/6 mb-2 md:mb-0"
                  value={slot.startTime}
                  onChange={(e) => handleChange(day, i, "startTime", e.target.value)}
                  required
                />
                <input
                  type="time"
                  className="border rounded px-3 py-2 w-full md:w-1/6 mb-2 md:mb-0"
                  value={slot.endTime}
                  onChange={(e) => handleChange(day, i, "endTime", e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700 font-semibold md:ml-2"
                  onClick={() => removeSlot(day, i)}
                  disabled={slotsByDay[day].length === 1}
                  title={slotsByDay[day].length === 1 ? "At least one slot required" : "Remove class"}
                >
                  &times;
                </button>
              </div>
            ))}

            <button
              type="button"
              className="mt-2 text-blue-600 hover:underline"
              onClick={() => addSlot(day)}
            >
              + Add Class
            </button>
          </div>
        ))}

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Timetable"}
        </button>
      </form>
    </div>
  );
}
