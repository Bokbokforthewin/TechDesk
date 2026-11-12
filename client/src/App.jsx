import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout & Auth Pages
import Layout from './components/shared/Layout';
import Login from './pages/Login';

// Actual Page Components
import TechnicalAssistance from './pages/TechnicalAssistance';
import RepairAssistance from './pages/RepairAssistance';
import ManageSubjects from './pages/ManageSubjects';
import Dashboard from './pages/Dashboard';

const MyAccount = () => (
  <div>
    <h1 className="text-2xl font-bold text-slate-800">My Account</h1>
    <p className="text-slate-500 mt-1">User profile and unit details.</p>
  </div>
);

// Protected Route Guard Component
const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route
          path="/login"
          element={
            user ? <Navigate to="/dashboard" replace /> : <Login setUser={setUser} />
          }
        />

        {/* Protected System Routes with Persistent Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute user={user}>
              <Layout user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        >
          {/* Default Page After Login */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="technical-assistance" element={<TechnicalAssistance />} />
          <Route path="repair-assistance" element={<RepairAssistance />} />
          <Route path="manage-subjects" element={<ManageSubjects />} />
          <Route path="my-account" element={<MyAccount />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}