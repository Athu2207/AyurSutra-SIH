import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
// Pages
import AyurPortal from "./LoginDesign";
import DoctorDashboard from "./DoctorDashboard";
import DietPlanner from "./DietPlanner";
import AyurDashboard from "./Dashboard";
import AyurSutra from "./CureVeda";
import AppointmentScheduler from "./AppointmentScheduler";
import HerbalRemedies from "./HerbalRemedies";


function ProtectedRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <Routes>
      {/* Public route */}
      <Route path="/" element={<AyurPortal />} />

      {/* Protected routes */}
      <Route
        path="/ayursutra-home"
        element={
          <ProtectedRoute user={user}>
            <AyurDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/welcome"
        element={
          <ProtectedRoute user={user}>
            <AyurSutra/>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor-dashboard"
        element={
          <ProtectedRoute user={user}>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/remedies"
        element={
          <ProtectedRoute user={user}>
            <HerbalRemedies />
          </ProtectedRoute>
        }
      />
      <Route
        path="/diet-plan"
        element={
          <ProtectedRoute user={user}>
            <DietPlanner />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <ProtectedRoute user={user}>
            <AppointmentScheduler/>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
