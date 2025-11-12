import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(undefined);
  const [role, setRole] = useState(undefined);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Check both mentor and student collections
        const mentorDoc = await getDoc(doc(db, "mentors", currentUser.uid));
        const studentDoc = await getDoc(doc(db, "students", currentUser.uid));

        if (mentorDoc.exists()) setRole("mentor");
        if (studentDoc.exists()) setRole("student");
      } else {
        setRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Still loading auth
  if (user === undefined || role === undefined) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-gray-600 text-lg font-medium">Loading...</p>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    const isMentorRoute = location.pathname.includes("mentor");
    return <Navigate to={isMentorRoute ? "/login-mentor" : "/login-student"} replace />;
  }

  // Route role-blocking
  if (location.pathname.includes("mentor") && role !== "mentor") {
    return <Navigate to="/student-dashboard" replace />;
  }

  if (location.pathname.includes("student") && role !== "student") {
    return <Navigate to="/mentor-dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
