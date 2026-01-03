import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Stack,
  Card,
  Fade,
  Zoom,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  alpha,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Business,
  Phone,
  CheckCircle,
  PersonAdd,
  ArrowForward,
  ArrowBack,
  AutoAwesome,
  Badge,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    companyName: '',
    phone: '',
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const steps = [
    { label: t('auth.accountInformation'), icon: <Email /> },
    { label: t('auth.personalDetails'), icon: <Person /> },
    { label: t('auth.completeRegistration'), icon: <CheckCircle /> },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'acceptTerms' ? checked : value,
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    
    switch (step) {
      case 0:
        if (!formData.email) {
          errors.email = t('auth.emailRequired');
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          errors.email = t('auth.enterValidEmail');
        }
        
        if (!formData.password) {
          errors.password = t('auth.passwordRequired');
        } else if (formData.password.length < 6) {
          errors.password = t('auth.passwordMinLength');
        }
        
        if (!formData.confirmPassword) {
          errors.confirmPassword = t('auth.confirmPasswordRequired');
        } else if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = t('auth.passwordsDoNotMatch');
        }
        break;
        
      case 1:
        if (!formData.fullName) {
          errors.fullName = t('auth.fullNameRequired');
        }
        break;
        
      case 2:
        if (!formData.acceptTerms) {
          errors.acceptTerms = t('auth.mustAcceptTerms');
        }
        break;
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!validateStep(activeStep)) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(formData.email, formData.password);
      if (error) {
        setError(error.message);
      } else {
        navigate('/profile/setup');
      }
    } catch (err: any) {
      setError(t('auth.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            <TextField
              fullWidth
              id="email"
              label={t('auth.emailAddress')}
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
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
            />
            
            <TextField
              fullWidth
              name="password"
              label={t('auth.password')}
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
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
                      onClick={() => setShowPassword(!showPassword)}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                      sx={{
                        color: 'var(--text-disabled)',
                        '&:hover': { color: 'var(--primary-color)' },
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              fullWidth
              name="confirmPassword"
              label={t('auth.confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!fieldErrors.confirmPassword}
              helperText={fieldErrors.confirmPassword}
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
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                      sx={{
                        color: 'var(--text-disabled)',
                        '&:hover': { color: 'var(--primary-color)' },
                      }}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        );
        
      case 1:
        return (
          <Stack spacing={3}>
            <TextField
              fullWidth
              id="fullName"
              label={t('auth.fullName')}
              name="fullName"
              autoComplete="name"
              value={formData.fullName}
              onChange={handleChange}
              error={!!fieldErrors.fullName}
              helperText={fieldErrors.fullName}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Badge sx={{ color: 'var(--primary-color)' }} />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              fullWidth
              id="companyName"
              label={t('auth.companyNameOptional')}
              name="companyName"
              autoComplete="organization"
              value={formData.companyName}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Business sx={{ color: 'var(--primary-color)' }} />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              fullWidth
              id="phone"
              label={t('auth.phoneNumberOptional')}
              name="phone"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone sx={{ color: 'var(--primary-color)' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        );
        
      case 2:
        return (
          <Stack spacing={3}>
            <Card
              sx={{
                bgcolor: 'var(--bg-hover)',
                border: `1px solid rgba(var(--primary-rgb), 0.3)`,
                p: 3,
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ color: 'var(--primary-color)' }}>
                {t('auth.accountSummary')}
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  <strong>{t('auth.email')}</strong> {formData.email}
                </Typography>
                <Typography variant="body2">
                  <strong>{t('auth.name')}</strong> {formData.fullName}
                </Typography>
                {formData.companyName && (
                  <Typography variant="body2">
                    <strong>{t('auth.company')}</strong> {formData.companyName}
                  </Typography>
                )}
                {formData.phone && (
                  <Typography variant="body2">
                    <strong>{t('auth.phone')}</strong> {formData.phone}
                  </Typography>
                )}
              </Stack>
            </Card>
            
            <FormControlLabel
              control={
                <Checkbox
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  sx={{
                    color: 'var(--text-disabled)',
                    '&.Mui-checked': {
                      color: 'var(--primary-color)',
                    },
                  }}
                />
              }
              label={
                <Typography variant="body2">
                  {t('auth.iAcceptThe')}{' '}
                  <Link
                    href="#"
                    sx={{
                      color: 'var(--primary-color)',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    {t('auth.termsOfService')}
                  </Link>
                  {' '}{t('auth.and')}{' '}
                  <Link
                    href="#"
                    sx={{
                      color: 'var(--primary-color)',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    {t('auth.privacyPolicy')}
                  </Link>
                </Typography>
              }
            />
            {fieldErrors.acceptTerms && (
              <Typography variant="caption" color="error">
                {fieldErrors.acceptTerms}
              </Typography>
            )}
          </Stack>
        );
        
      default:
        return null;
    }
  };

  return (
    <Container component="main" maxWidth="md" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4 }}>
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
                top: '10%',
                right: '20%',
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,0,128,0.15) 0%, transparent 70%)',
                filter: 'blur(60px)',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '10%',
                left: '20%',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)',
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
              borderRadius: 1,
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, var(--secondary-color) 0%, var(--primary-color) 50%, var(--secondary-color) 100%)`,
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
                      background: `linear-gradient(135deg, var(--secondary-color) 0%, var(--primary-color) 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 8px 32px rgba(var(--secondary-rgb), 0.4)`,
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        inset: -2,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, var(--secondary-color) 0%, var(--primary-color) 100%)`,
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
                      background: `linear-gradient(135deg, var(--secondary-color) 0%, var(--primary-color) 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1,
                    }}
                  >
                    {t('auth.joinZettaMed')}
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'var(--text-secondary)' }}>
                    {t('auth.createYourAccount')}
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

              {/* Stepper */}
              <Stepper 
                activeStep={activeStep} 
                sx={{ 
                  mb: 4,
                  '& .MuiStepLabel-root .Mui-completed': {
                    color: 'var(--success-color)',
                  },
                  '& .MuiStepLabel-root .Mui-active': {
                    color: 'var(--primary-color)',
                  },
                  '& .MuiStepConnector-line': {
                    borderColor: 'var(--border-secondary)',
                  },
                  '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
                    borderColor: 'var(--success-color)',
                  },
                  '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': {
                    borderColor: 'var(--primary-color)',
                  },
                }}
              >
                {steps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel
                      StepIconProps={{
                        icon: step.icon,
                      }}
                    >
                      {step.label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* Form Content */}
              <Box sx={{ mb: 4 }}>
                {getStepContent(activeStep)}
              </Box>

              {/* Action Buttons */}
              <Stack direction="row" spacing={2}>
                {activeStep > 0 && (
                  <Button
                    onClick={handleBack}
                    startIcon={<ArrowBack />}
                    sx={{
                      color: 'var(--text-secondary)',
                      '&:hover': {
                        color: 'var(--primary-color)',
                        bgcolor: 'var(--bg-hover)',
                      },
                    }}
                  >
                    {t('auth.back')}
                  </Button>
                )}
                
                <Box sx={{ flex: 1 }} />
                
                {activeStep < steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ArrowForward />}
                    sx={{
                      background: `linear-gradient(135deg, var(--primary-color) 0%, #0099cc 100%)`,
                      boxShadow: `0 8px 32px rgba(var(--primary-rgb), 0.4)`,
                      fontWeight: 600,
                      px: 4,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 12px 40px rgba(var(--primary-rgb), 0.5)`,
                      },
                    }}
                  >
                    {t('auth.next')}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <PersonAdd />}
                    sx={{
                      background: loading
                        ? 'rgba(128,128,128,0.3)'
                        : `linear-gradient(135deg, var(--success-color) 0%, #00cc55 100%)`,
                      boxShadow: loading ? 'none' : `0 8px 32px rgba(var(--success-rgb), 0.4)`,
                      fontWeight: 700,
                      px: 4,
                      '&:hover': {
                        transform: loading ? 'none' : 'translateY(-2px)',
                        boxShadow: loading ? 'none' : `0 12px 40px rgba(var(--success-rgb), 0.5)`,
                      },
                    }}
                  >
                    {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
                  </Button>
                )}
              </Stack>

              {/* Sign In Link */}
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                  {t('auth.alreadyHaveAccount')}{' '}
                  <Link
                    component={RouterLink}
                    to="/login"
                    sx={{
                      color: 'var(--primary-color)',
                      textDecoration: 'none',
                      fontWeight: 600,
                      transition: 'all 0.3s',
                      '&:hover': {
                        color: '#5dffff',
                        textShadow: `0 0 10px rgba(var(--primary-rgb), 0.5)`,
                      },
                    }}
                  >
                    {t('auth.signIn')}
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Card>
        </Box>
      </Fade>
      {/* <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style> */}
    </Container>
  );
};

export default Register;