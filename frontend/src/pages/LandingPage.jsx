import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";

const LandingPage = () => {
  const navigate = useNavigate();

  // Redirect logged-in users to their dashboard
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRole = localStorage.getItem("userRole");
        if (userRole === "student") navigate("/student/dashboard");
        else if (userRole === "mentor") navigate("/mentor/dashboard");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("userRole");
      alert("Logged out successfully!");
      navigate("/login-student");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  const isLoggedIn = !!auth.currentUser;

  return (
    <div className="min-h-screen flex flex-col font-sans relative">
      {/* 🔹 Logout button only if logged in */}
      {isLoggedIn && (
        <div className="absolute top-4 right-6">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-md shadow hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      )}

      {/* 🔹 Hero Section */}
      <div
        className="h-[60vh] flex flex-col justify-center items-center text-center bg-cover bg-center relative"
        style={{ backgroundImage: "url('/hero-career.jpg')" }}
      >
        <div className="absolute inset-0 bg-white bg-opacity-70 backdrop-blur-sm"></div>

        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <h1 className="text-5xl font-extrabold mb-4 text-gray-900">
            Discover Your{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
              Perfect Career Path
            </span>
          </h1>

          <p className="text-gray-700 mb-8 text-lg">
            Take our comprehensive assessment to get personalized recommendations,
            analyze your skill gaps, and connect with mentors who can guide you
            toward your dream career.
          </p>

          {/* 🔹 Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate("/student/personal-info")}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-md shadow-md hover:from-blue-600 hover:to-cyan-500 transition"
            >
              Take Assessment
            </button>

            <button
              onClick={() => navigate("/signup-student")}
              className="px-6 py-3 bg-green-500 text-white rounded-md shadow-md hover:bg-green-600 transition"
            >
              Signup as Student
            </button>

            <button
              onClick={() => navigate("/signup-mentor")}
              className="px-6 py-3 bg-purple-500 text-white rounded-md shadow-md hover:bg-purple-600 transition"
            >
              Signup as Mentor
            </button>

            <button
              onClick={() => navigate("/login-student")}
              className="px-6 py-3 border border-blue-400 text-blue-600 rounded-md hover:bg-blue-50 transition"
            >
              Student Login
            </button>

            <button
              onClick={() => navigate("/login-mentor")}
              className="px-6 py-3 border border-purple-400 text-purple-600 rounded-md hover:bg-purple-50 transition"
            >
              Mentor Login
            </button>
          </div>
        </div>
      </div>

      {/* 🔹 How It Works Section + Feature Cards */}
      <div className="flex flex-col items-center py-16 bg-white">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
        <p className="text-gray-600 mb-12 text-center max-w-xl">
          Our intelligent platform helps students discover and achieve their ideal career paths through personalized insights.
        </p>

        {/* 🔹 Four Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 px-6 max-w-6xl">
          <div className="p-6 border rounded-2xl shadow-sm hover:shadow-lg transition text-center bg-white">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="font-semibold text-lg mb-2 text-gray-800">
              Personalized Assessment
            </h3>
            <p className="text-gray-600 text-sm">
              Evaluate your interests, skills, and goals to receive customized career matches tailored just for you.
            </p>
          </div>

          <div className="p-6 border rounded-2xl shadow-sm hover:shadow-lg transition text-center bg-white">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="font-semibold text-lg mb-2 text-gray-800">
              Career Insights
            </h3>
            <p className="text-gray-600 text-sm">
              Access real-world insights about trending careers, required qualifications, and growth opportunities.
            </p>
          </div>

          <div className="p-6 border rounded-2xl shadow-sm hover:shadow-lg transition text-center bg-white">
            <div className="text-4xl mb-3">🧭</div>
            <h3 className="font-semibold text-lg mb-2 text-gray-800">
              Custom Roadmaps
            </h3>
            <p className="text-gray-600 text-sm">
              Follow step-by-step learning paths to close skill gaps and reach your dream career efficiently.
            </p>
          </div>

          <div className="p-6 border rounded-2xl shadow-sm hover:shadow-lg transition text-center bg-white">
            <div className="text-4xl mb-3">🤝</div>
            <h3 className="font-semibold text-lg mb-2 text-gray-800">
              Mentor Matching
            </h3>
            <p className="text-gray-600 text-sm">
              Get matched with experienced mentors who provide guidance and practical insights for your success.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
