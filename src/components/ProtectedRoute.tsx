import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box, Typography, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Lock } from '@mui/icons-material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  sellerOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false, sellerOnly = false }) => {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const [showMessage, setShowMessage] = useState(false);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    if (!showMessage) {
      setShowMessage(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    }
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ bgcolor: 'background.default' }}
      >
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            maxWidth: 400,
            background: 'linear-gradient(135deg, rgba(255,0,0,0.1) 0%, rgba(255,0,0,0.05) 100%)',
            border: '1px solid rgba(255,0,0,0.2)',
          }}
        >
          <Lock sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'text.primary', mb: 1 }}>
            {t('protectedRoute.message')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('protectedRoute.redirecting')}
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (sellerOnly && user.role !== 'seller' && user.role !== 'admin') {
    if (!showMessage) {
      setShowMessage(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    }
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ bgcolor: 'background.default' }}
      >
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            maxWidth: 400,
            background: 'linear-gradient(135deg, rgba(255,0,0,0.1) 0%, rgba(255,0,0,0.05) 100%)',
            border: '1px solid rgba(255,0,0,0.2)',
          }}
        >
          <Lock sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'text.primary', mb: 1 }}>
            {t('protectedRoute.message')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('protectedRoute.redirecting')}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;