// src/pages/student/DashboardStudent.jsx
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const DashboardStudent = () => {
  const [studentData, setStudentData] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMentors, setShowMentors] = useState(false);
  const navigate = useNavigate();

  // 🔹 Fetch student data and mentors
  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login-student");
        return;
      }

      try {
        // Get student profile
        const studentRef = doc(db, "students", user.uid);
        const studentSnap = await getDoc(studentRef);
        if (studentSnap.exists()) setStudentData(studentSnap.data());

        // Get all mentors
        const mentorsSnap = await getDocs(collection(db, "mentors"));
        const mentorsList = mentorsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort by latest created
        setMentors(mentorsList.sort((a, b) => b.createdAt - a.createdAt));
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // 🔹 Logout
  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("userRole");
    navigate("/");
  };

  // 🔹 Send connection request
  const handleConnect = async (mentorId) => {
    const user = auth.currentUser;
    if (!user) return alert("Please login first.");

    try {
      const studentRef = doc(db, "students", user.uid);
      const studentSnap = await getDoc(studentRef);
      const student = studentSnap.data();

      const requestsRef = collection(db, "connectionRequests");
      const existingQuery = query(
        requestsRef,
        where("studentId", "==", user.uid),
        where("mentorId", "==", mentorId)
      );
      const existingSnap = await getDocs(existingQuery);

      if (!existingSnap.empty) {
        alert("You have already sent a request to this mentor!");
        return;
      }

      await addDoc(requestsRef, {
        studentId: user.uid,
        mentorId,
        studentName: student?.name || "",
        studentEmail: student?.email || "",
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      alert("Connection request sent successfully!");
    } catch (err) {
      console.error("Error sending request:", err);
      alert("Failed to send request. Try again.");
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
            Welcome, {studentData?.name || "Student"}
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Profile */}
        <div className="bg-white rounded-xl shadow p-6 mb-10">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Your Profile
          </h2>
          <p><strong>Email:</strong> {studentData?.email}</p>
          <p><strong>Interest Area:</strong> {studentData?.interestArea || "Not set"}</p>
          <p>
            <strong>Assessment Completed:</strong>{" "}
            {studentData?.assessmentCompleted ? "Yes" : "No"}
          </p>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => navigate("/student/personal-info")}
              className="px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
              Take/Retake Assessment
            </button>
            <button
              onClick={() => setShowMentors(!showMentors)}
              className="px-5 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
            >
              {showMentors ? "Hide Mentors" : "Find Mentors"}
            </button>
          </div>
        </div>

        {/* Mentors List */}
        {showMentors && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Available Mentors
            </h2>

            {mentors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mentors.map((mentor) => (
                  <div
                    key={mentor.id}
                    className="border rounded-lg p-5 shadow hover:shadow-md transition bg-white"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {mentor.name || "Unnamed Mentor"}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Specialization:</strong>{" "}
                      {mentor.specialization || "Not set"}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Experience:</strong>{" "}
                      {mentor.experience || "Not set"}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Availability:</strong>{" "}
                      {mentor.availability || "Not set"}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      <strong>Bio:</strong> {mentor.bio || "No bio provided"}
                    </p>
                    <button
                      onClick={() => handleConnect(mentor.id)}
                      className="w-full mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                    >
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No mentors available right now.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardStudent;
