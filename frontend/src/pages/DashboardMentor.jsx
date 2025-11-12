// src/pages/mentor/MentorDashboard.jsx
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

const MentorDashboard = () => {
  const [mentorData, setMentorData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  // 🔹 Fetch mentor data + student requests
  useEffect(() => {
    const fetchMentorData = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login-mentor");
        return;
      }

      try {
        const mentorRef = doc(db, "mentors", user.uid);
        const mentorSnap = await getDoc(mentorRef);

        // Create default profile if missing
        if (!mentorSnap.exists()) {
          await setDoc(mentorRef, {
            name: user.displayName || "",
            email: user.email,
            specialization: "",
            bio: "",
            experience: "",
            availability: "",
            createdAt: serverTimestamp(),
          });
        }

        // Load mentor data
        const mentorData = (await getDoc(mentorRef)).data();
        setMentorData(mentorData);
        setFormData(mentorData);

        // Load student connection requests
        const q = query(
          collection(db, "connectionRequests"),
          where("mentorId", "==", user.uid)
        );
        const querySnap = await getDocs(q);
        setRequests(querySnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error loading mentor data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMentorData();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("userRole");
    navigate("/");
  };

  // 🔹 Save Profile Updates
  const handleSaveProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const mentorRef = doc(db, "mentors", user.uid);
      await updateDoc(mentorRef, formData);
      setMentorData(formData);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Try again.");
    }
  };

  // 🔹 Handle Accept / Reject Request
  const handleRequestUpdate = async (requestId, newStatus) => {
    try {
      const requestRef = doc(db, "connectionRequests", requestId);
      await updateDoc(requestRef, { status: newStatus });
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
      );
    } catch (error) {
      console.error("Error updating request:", error);
      alert("Failed to update request. Try again.");
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-gray-600">
        Loading dashboard...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {mentorData?.name || "Mentor"}
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-xl shadow p-6 mb-10">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Profile</h2>

          {!editing ? (
            <div className="space-y-2">
              <p><strong>Email:</strong> {mentorData.email}</p>
              <p><strong>Specialization:</strong> {mentorData.specialization || "Not set"}</p>
              <p><strong>Experience:</strong> {mentorData.experience || "Not set"}</p>
              <p><strong>Availability:</strong> {mentorData.availability || "Not set"}</p>
              <p><strong>Bio:</strong> {mentorData.bio || "Not set"}</p>
              <button
                onClick={() => setEditing(true)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Specialization"
                value={formData.specialization || ""}
                onChange={(e) =>
                  setFormData({ ...formData, specialization: e.target.value })
                }
                className="w-full border rounded-lg p-2"
              />
              <input
                type="text"
                placeholder="Experience (years)"
                value={formData.experience || ""}
                onChange={(e) =>
                  setFormData({ ...formData, experience: e.target.value })
                }
                className="w-full border rounded-lg p-2"
              />
              <input
                type="text"
                placeholder="Availability"
                value={formData.availability || ""}
                onChange={(e) =>
                  setFormData({ ...formData, availability: e.target.value })
                }
                className="w-full border rounded-lg p-2"
              />
              <textarea
                placeholder="Short bio"
                value={formData.bio || ""}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                className="w-full border rounded-lg p-2"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Student Requests Section */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Student Connection Requests
          </h2>

          {requests.length === 0 ? (
            <p className="text-gray-600">No connection requests yet.</p>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="border p-4 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{req.studentName}</p>
                    <p className="text-sm text-gray-600">{req.studentEmail || ""}</p>
                    <p className="text-sm">
                      <strong>Status:</strong>{" "}
                      <span
                        className={
                          req.status === "accepted"
                            ? "text-green-600"
                            : req.status === "rejected"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }
                      >
                        {req.status || "pending"}
                      </span>
                    </p>
                  </div>

                  {req.status === "pending" && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleRequestUpdate(req.id, "accepted")}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRequestUpdate(req.id, "rejected")}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
