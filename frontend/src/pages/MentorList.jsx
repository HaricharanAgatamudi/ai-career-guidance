// src/pages/MentorList.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

const MentorList = () => {
  const [mentors, setMentors] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch mentors from Firestore
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "mentors"));
        const mentorData = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Firestore doc ID
          ...doc.data(),
        }));
        setMentors(mentorData);
        setFilteredMentors(mentorData);
      } catch (error) {
        console.error("Error fetching mentors:", error);
      }
    };

    fetchMentors();
  }, []);

  // 🔹 Filter mentors by expertise
  useEffect(() => {
    const filtered = mentors.filter((m) => {
      const expertise = Array.isArray(m.expertise)
        ? m.expertise.join(" ").toLowerCase()
        : (m.expertise || "").toLowerCase();
      return expertise.includes(search.toLowerCase());
    });
    setFilteredMentors(filtered);
  }, [search, mentors]);

  // 🔹 Handle connection request
  const handleConnect = async () => {
    if (!auth.currentUser) {
      alert("Please log in as a student to connect with mentors.");
      return;
    }

    if (!message.trim()) {
      alert("Please enter a message before sending.");
      return;
    }

    setLoading(true);
    try {
      // ✅ Use mentor’s UID (or fallback to document ID)
      const mentorUid = selectedMentor.uid || selectedMentor.id;

      await addDoc(collection(db, "mentor_connections"), {
        studentId: auth.currentUser.uid,
        mentorId: mentorUid, // must match mentor.uid for dashboard
        mentorName: selectedMentor.name,
        mentorEmail: selectedMentor.email || "",
        message,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setSuccess("Connection request sent successfully!");
      setMessage("");
      setSelectedMentor(null);
    } catch (error) {
      console.error("❌ Error sending connection:", error);
      alert("Failed to send request. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <h1 className="text-3xl font-bold text-blue-700 text-center mb-8">
        Find Your Mentor 👨‍🏫
      </h1>

      <div className="flex justify-center mb-8">
        <input
          type="text"
          placeholder="Search by expertise (e.g., AI, Design, Marketing)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {success && (
        <div className="text-green-600 text-center mb-4 font-medium">
          {success}
        </div>
      )}

      {/* Mentor List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredMentors.map((m) => (
          <div
            key={m.id}
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{m.name}</h2>
            <p className="text-gray-600">
              <strong>Expertise:</strong>{" "}
              {Array.isArray(m.expertise)
                ? m.expertise.join(", ")
                : m.expertise || "Not specified"}
            </p>
            <p className="text-gray-600 mt-2">
              <strong>Experience:</strong> {m.experience || "N/A"}
            </p>

            <button
              onClick={() => setSelectedMentor(m)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full"
            >
              Connect
            </button>
          </div>
        ))}
      </div>

      {/* 🔹 Connect Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-700">
              Connect with {selectedMentor.name}
            </h2>

            <textarea
              placeholder="Write a short message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 mb-4"
              rows="4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedMentor(null)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConnect}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {loading ? "Sending..." : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorList;
