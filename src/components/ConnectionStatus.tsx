import React, { useEffect, useState } from 'react';
import {
  Alert,
  Snackbar,
  Button,
  CircularProgress,
  Box,
  Typography,
  IconButton,
  Collapse,
  LinearProgress,
} from '@mui/material';
import {
  WifiOff,
  Wifi,
  Sync,
  Close,
  CloudOff,
  CloudDone,
  ErrorOutline,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

export const ConnectionStatus: React.FC = () => {
  const { connectionStatus, retryConnection } = useAuth();
  const [showStatus, setShowStatus] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [permanentDismiss, setPermanentDismiss] = useState(false);

  useEffect(() => {
    // Show status when disconnected or connecting for more than 3 seconds
    if (connectionStatus === 'disconnected') {
      setShowStatus(true);
      setPermanentDismiss(false);
    } else if (connectionStatus === 'connecting') {
      const timer = setTimeout(() => setShowStatus(true), 3000);
      return () => clearTimeout(timer);
    } else {
      // Hide after successful connection
      const timer = setTimeout(() => {
        if (!permanentDismiss) {
          setShowStatus(false);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [connectionStatus, permanentDismiss]);

  const handleRetry = async () => {
    setRetrying(true);
    await retryConnection();
    setRetrying(false);
  };

  const handleClose = () => {
    setPermanentDismiss(true);
    setShowStatus(false);
  };

  const getStatusContent = () => {
    switch (connectionStatus) {
      case 'disconnected':
        return {
          severity: 'error' as const,
          icon: <CloudOff />,
          title: 'Connection Lost',
          message: 'Unable to connect to the server. Please check your internet connection.',
          action: (
            <Button
              size="small"
              variant="outlined"
              onClick={handleRetry}
              disabled={retrying}
              startIcon={retrying ? <CircularProgress size={16} /> : <Sync />}
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              {retrying ? 'Retrying...' : 'Retry'}
            </Button>
          ),
        };
      case 'connecting':
        return {
          severity: 'info' as const,
          icon: <Sync className="rotating" />,
          title: 'Connecting...',
          message: 'Establishing connection to the server...',
          showProgress: true,
        };
      case 'connected':
        return {
          severity: 'success' as const,
          icon: <CloudDone />,
          title: 'Connected',
          message: 'Connection established successfully!',
        };
      default:
        return null;
    }
  };

  const content = getStatusContent();
  if (!content || !showStatus) return null;

  return (
    <>
      <Snackbar
        open={showStatus}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ 
          mt: 8,
          '& .MuiSnackbarContent-root': {
            p: 0,
            bgcolor: 'transparent',
            boxShadow: 'none',
          },
        }}
      >
        <Alert
          severity={content.severity}
          icon={content.icon}
          action={
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {content.action}
              {connectionStatus !== 'connecting' && (
                <IconButton
                  size="small"
                  aria-label="close"
                  color="inherit"
                  onClick={handleClose}
                >
                  <Close fontSize="small" />
                </IconButton>
              )}
            </Box>
          }
          sx={{
            width: '100%',
            minWidth: 350,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: `1px solid ${
              content.severity === 'error' 
                ? 'rgba(var(--danger-rgb), 0.3)' 
                : content.severity === 'success'
                ? 'rgba(var(--success-rgb), 0.3)'
                : 'rgba(var(--info-rgb), 0.3)'
            }`,
            '& .MuiAlert-icon': {
              fontSize: 28,
            },
            '& .rotating': {
              animation: 'spin 2s linear infinite',
            },
          }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {content.title}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
              {content.message}
            </Typography>
            {content.showProgress && (
              <LinearProgress 
                sx={{ 
                  mt: 2, 
                  height: 2,
                  borderRadius: 1,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'currentColor',
                  },
                }} 
              />
            )}
          </Box>
        </Alert>
      </Snackbar>

      {/* Additional offline indicator */}
      <Collapse in={!navigator.onLine}>
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 2,
            py: 1,
            px: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            zIndex: 1400,
          }}
        >
          <WifiOff sx={{ color: 'var(--danger-color)', fontSize: 20 }} />
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            You are offline
          </Typography>
        </Box>
      </Collapse>
    </>
  );
};

export default ConnectionStatus;