// src/pages/assessment/PersonalInfo.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

const PersonalInfo = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    age: "",
    educationLevel: "",
    streamOrField: "",
    careerGoals: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNext = async () => {
    setError("");

    if (!form.name || !form.age || !form.educationLevel || !form.careerGoals) {
      setError("Please fill in all required fields.");
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError("You must be logged in to submit personal information.");
      navigate("/login-student");
      return;
    }

    setLoading(true);
    try {
      const studentDocRef = doc(db, "students", currentUser.uid);

      await setDoc(
        studentDocRef,
        {
          name: form.name,
          age: form.age,
          education: form.educationLevel,
          specialization: form.streamOrField,
          careerGoals: form.careerGoals,
          email: currentUser.email,
          personalInfo: form,
          assessmentStatus: "personalInfoCompleted",
        },
        { merge: true }
      );

      console.log("Personal Info saved:", currentUser.uid);
      navigate("/student/assessment");
    } catch (err) {
      console.error(err);
      setError("Failed to save information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-2 text-gray-900">Career Assessment</h2>
        <p className="text-gray-600 mb-4 text-sm">
          Tell us about yourself to help us provide personalized career recommendations.
        </p>

        {/* Form Fields */}
        <div className="space-y-4">
          <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} className="w-full p-3 border rounded-lg" />

          <input type="number" name="age" placeholder="Age" value={form.age} onChange={handleChange} className="w-full p-3 border rounded-lg" />

          <select name="educationLevel" value={form.educationLevel} onChange={handleChange} className="w-full p-3 border rounded-lg">
            <option value="">Select Education Level</option>
            <option value="High School">High School</option>
            <option value="Intermediate">Intermediate / PU</option>
            <option value="Graduation">Graduation</option>
            <option value="Post Graduation">Post Graduation</option>
          </select>

          <input type="text" name="streamOrField" placeholder="Field (e.g., CSE, Commerce)" value={form.streamOrField} onChange={handleChange} className="w-full p-3 border rounded-lg" />

          <textarea name="careerGoals" placeholder="Career aspirations..." value={form.careerGoals} onChange={handleChange} className="w-full p-3 border rounded-lg" />
        </div>

        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

        <div className="flex justify-between mt-6">
          <button className="bg-gray-200 px-4 py-2 rounded-lg cursor-not-allowed" disabled>Back</button>

          <button onClick={handleNext} className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-4 py-2 rounded-lg">
            {loading ? "Saving..." : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
