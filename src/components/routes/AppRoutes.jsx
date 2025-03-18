import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from '../auth/LoginForm/LoginForm';
import Dashboard from '../dashboard/Dashboard';
import ApiDocs from '../ApiDocs/ApiDocs';
import { AuthContext } from '../context/AuthContext';

const AppRoutes = () => {
  const { token } = useContext(AuthContext);

  return (
    <Routes>
      <Route
        path="/"
        element={token ? <Navigate to="/dashboard" replace /> : <LoginForm />}
      />
      <Route
        path="/dashboard"
        element={token ? <Dashboard /> : <Navigate to="/" replace />}
      />
      <Route path="/api-docs" element={<ApiDocs />} />
      {/* Catch-all route for handling invalid paths */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
