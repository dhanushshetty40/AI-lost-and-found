import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from './LoadingSpinner';

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated && !isAdmin) {
      addToast('Access denied: Administrative privileges required.', 'warning');
    }
  }, [loading, isAuthenticated, isAdmin, addToast]);

  if (loading) {
    return <LoadingSpinner fullScreen label="Checking admin permissions..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
