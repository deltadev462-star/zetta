import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  Fade,
  Zoom,
  Card,
  alpha,
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Lock,
  Login as LoginIcon,
  AutoAwesome,
  ArrowForward,
  PersonAdd,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{email?: string, password?: string}>({});

  const validateForm = (): boolean => {
    const errors: {email?: string, password?: string} = {};
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4 }}>
<Fade in timeout={800}>
<Box sx={{ width: '100%' }}>
  {/* Background Effects */}
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '20%',
        left: '10%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)',
        filter: 'blur(60px)',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: '20%',
        right: '10%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,0,128,0.15) 0%, transparent 70%)',
        filter: 'blur(60px)',
      },
    }}
  />

  <Card
    elevation={0}
    sx={{
      position: 'relative',
      bgcolor: 'var(--bg-secondary)',
      backdropFilter: 'blur(10px)',
      border: '1px solid var(--border-primary)',
      borderRadius: 4,
      overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: `linear-gradient(90deg, var(--primary-color) 0%, var(--secondary-color) 50%, var(--primary-color) 100%)`,
        backgroundSize: '200% 100%',
        animation: 'gradient-shift 3s ease infinite',
      },
    }}
  >
            <Box sx={{ p: { xs: 4, sm: 6 } }}>
              {/* Logo and Title */}
              <Stack direction="column" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                <Zoom in timeout={1000}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 8px 32px rgba(var(--primary-rgb), 0.4)`,
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        inset: -2,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)`,
                        filter: 'blur(20px)',
                        opacity: 0.6,
                      },
                    }}
                  >
                    <AutoAwesome sx={{ fontSize: 40, color: 'white', zIndex: 1 }} />
                  </Box>
                </Zoom>
                
                <Box textAlign="center">
                  <Typography 
                    variant="h3" 
                    sx={{
                      fontWeight: 800,
                      background: `linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1,
                    }}
                  >
                    Zetta Med
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'var(--text-secondary)' }}>
                    Welcome back
                  </Typography>
                </Box>
              </Stack>

              {error && (
                <Zoom in>
                  <Alert 
                    severity="error"
                    sx={{
                      mb: 3,
                      bgcolor: `rgba(var(--danger-rgb), 0.08)`,
                      color: 'var(--danger-color)',
                      border: `1px solid rgba(var(--danger-rgb), 0.2)`,
                      '& .MuiAlert-icon': {
                        color: 'var(--danger-color)',
                      },
                    }}
                    onClose={() => setError('')}
                  >
                    {error}
                  </Alert>
                </Zoom>
              )}

              {/* Login Form */}
              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) {
                        setFieldErrors(prev => ({ ...prev, email: undefined }));
                      }
                    }}
                    error={!!fieldErrors.email}
                    helperText={fieldErrors.email}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: 'var(--primary-color)' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'rgba(0,0,0,0.02)',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.04)',
                        },
                        '&.Mui-focused': {
                          bgcolor: 'white',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'var(--primary-color)',
                            borderWidth: '2px',
                          },
                        },
                        '&.Mui-error': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'var(--danger-color)',
                          },
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'var(--text-secondary)',
                      },
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) {
                        setFieldErrors(prev => ({ ...prev, password: undefined }));
                      }
                    }}
                    error={!!fieldErrors.password}
                    helperText={fieldErrors.password}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: 'var(--primary-color)' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            onMouseDown={(e) => e.preventDefault()}
                            edge="end"
                            sx={{
                              color: 'var(--text-disabled)',
                              '&:hover': {
                                color: 'var(--primary-color)',
                              },
                            }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'rgba(0,0,0,0.02)',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.04)',
                        },
                        '&.Mui-focused': {
                          bgcolor: 'white',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'var(--primary-color)',
                            borderWidth: '2px',
                          },
                        },
                        '&.Mui-error': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'var(--danger-color)',
                          },
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'var(--text-secondary)',
                      },
                    }}
                  />

                  <Box sx={{ textAlign: 'right' }}>
                    <Link
                      component={RouterLink}
                      to="/forgot-password"
                      sx={{
                        color: 'var(--primary-color)',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        transition: 'all 0.3s',
                        '&:hover': {
                          color: '#5dffff',
                          textShadow: `0 0 10px rgba(var(--primary-rgb), 0.5)`,
                        },
                      }}
                    >
                      Forgot password?
                    </Link>
                  </Box>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                    sx={{
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      background: loading 
                        ? 'rgba(128,128,128,0.3)'
                        : `linear-gradient(135deg, var(--primary-color) 0%, #0099cc 100%)`,
                      boxShadow: loading ? 'none' : `0 8px 32px rgba(var(--primary-rgb), 0.4)`,
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: loading ? 'none' : 'translateY(-2px)',
                        boxShadow: loading ? 'none' : `0 12px 40px rgba(var(--primary-rgb), 0.5)`,
                      },
                    }}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </Stack>
              </Box>

              {/* Divider */}
              <Box sx={{ my: 4, position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    flex: 1,
                    height: '1px',
                    bgcolor: 'var(--border-primary)',
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{ px: 2, color: 'var(--text-secondary)' }}
                >
                  New to Zetta Med?
                </Typography>
                <Box
                  sx={{
                    flex: 1,
                    height: '1px',
                    bgcolor: 'var(--border-primary)',
                  }}
                />
              </Box>

              {/* Sign Up Link */}
              <Button
                component={RouterLink}
                to="/register"
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<PersonAdd />}
                endIcon={<ArrowForward />}
                sx={{
                  py: 1.5,
                  borderColor: `rgba(var(--secondary-rgb), 0.5)`,
                  color: 'var(--secondary-color)',
                  fontWeight: 600,
                  transition: 'all 0.3s',
                  '&:hover': {
                    borderColor: 'var(--secondary-color)',
                    bgcolor: `rgba(var(--secondary-rgb), 0.1)`,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Create Account
              </Button>

              {/* Footer Text */}
              <Typography 
                variant="body2"
                align="center"
                sx={{ mt: 4, color: 'var(--text-secondary)' }}
              >
                By signing in, you agree to our{' '}
                <Link
                  href="#"
                  sx={{
                    color: 'var(--primary-color)',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Terms of Service
                </Link>
                {' and '}
                <Link
                  href="#"
                  sx={{
                    color: 'var(--primary-color)',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Privacy Policy
                </Link>
              </Typography>
            </Box>
          </Card>
        </Box>
      {/* <style jsx global>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style> */}
      </Fade>
    </Container>
  );
};

export default Login;