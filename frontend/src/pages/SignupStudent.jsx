// src/pages/SignupStudent.jsx
import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const SignupStudent = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [debugLog, setDebugLog] = useState([]); // visible debug lines
  const navigate = useNavigate();

  const addLog = (line) => {
    console.log(line);
    setDebugLog((s) => [...s, `${new Date().toISOString()} - ${line}`]);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // basic email format check
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    addLog("Signup clicked");
    if (!form.name || !form.email || !form.password) {
      setError("Please fill all fields.");
      addLog("Validation failed: missing fields");
      return;
    }

    if (!isValidEmail(form.email)) {
      setError("Invalid email format.");
      addLog(`Invalid email format: "${form.email}"`);
      return;
    }

    setLoading(true);

    try {
      addLog("Calling createUserWithEmailAndPassword...");
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      addLog("Auth createUserWithEmailAndPassword succeeded");
      const user = userCredential.user;
      addLog(`Firebase Auth uid: ${user?.uid}`);

      addLog("Writing Firestore doc: students/" + user.uid);
      await setDoc(doc(db, "students", user.uid), {
        name: form.name,
        email: form.email,
        role: "student",
        createdAt: new Date().toISOString(),
      });
      addLog("Firestore setDoc succeeded");

      // double-check current user
      addLog(`auth.currentUser?.uid = ${auth.currentUser ? auth.currentUser.uid : "null"}`);

      // success UI + redirect
      alert("🎉 Signup successful! Redirecting to student dashboard...");
      addLog("Navigating to /student/dashboard");
      navigate("/student/dashboard");
    } catch (err) {
      // Make sure we show the raw error and log it
      const msg = err?.message || String(err);
      setError(msg);
      addLog("Error: " + msg);
      // also show firebase error code if present
      if (err?.code) addLog("Error code: " + err.code);
      // show a browser alert too so you don't miss it
      alert("Signup failed: " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Signup (Debug)</h2>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full name"
            className="w-full p-3 border rounded"
          />
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full p-3 border rounded"
          />
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            type="password"
            className="w-full p-3 border rounded"
          />

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            {loading ? "Creating Account..." : "Signup"}
          </button>
        </form>

        <div className="mt-4">
          <h3 className="font-semibold">Live debug log</h3>
          <div className="max-h-40 overflow-auto p-2 bg-gray-50 border rounded text-xs">
            {debugLog.length === 0 ? (
              <div className="text-gray-500">No logs yet — open DevTools console too.</div>
            ) : (
              debugLog.map((l, i) => <div key={i}>{l}</div>)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupStudent;
