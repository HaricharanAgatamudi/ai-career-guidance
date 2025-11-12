import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import SignupStudent from "./pages/SignupStudent";
import SignupMentor from "./pages/SignupMentor";
import LoginStudent from "./pages/LoginStudent";
import LoginMentor from "./pages/LoginMentor";
import DashboardStudent from "./pages/DashboardStudent";
import DashboardMentor from "./pages/DashboardMentor";
import ProtectedRoute from "./components/ProtectedRoute";
import PersonalInfo from "./pages/assessment/PersonalInfo";
import Assessment from "./pages/assessment/Assessment"; // ✅ Add this
import CareerResults from "./pages/CareerResults";
function App() {
  return (
    <Router>
      <Routes>
        {/* 🔹 Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* 🔹 Auth Routes */}
        <Route path="/signup-student" element={<SignupStudent />} />
        <Route path="/signup-mentor" element={<SignupMentor />} />
        <Route path="/login-student" element={<LoginStudent />} />
        <Route path="/login-mentor" element={<LoginMentor />} />
        <Route path="/career-results" element={<CareerResults />} />
        {/* 🔹 Student Assessment Flow */}
        <Route path="/student/personal-info" element={<PersonalInfo />} />
        <Route
          path="/student/assessment"
          element={
            <ProtectedRoute role="student">
              <Assessment />
            </ProtectedRoute>
          }
        />

        {/* 🔹 Protected Dashboards */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute role="student">
              <DashboardStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentor/dashboard"
          element={
            <ProtectedRoute role="mentor">
              <DashboardMentor />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
