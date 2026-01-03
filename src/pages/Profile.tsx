import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  Card,
  CardContent,
  InputAdornment,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Fade,
  Zoom,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  Save,
  Person,
  Business,
  Phone,
  LocationOn,
  Email,
  Badge,
  Edit,
  CheckCircle,
  AutoAwesome,
  Security,
  AccountCircle,
  Map,
  Flag,
  Home,
  LocalPostOffice,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../types';

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    full_name: '',
    company_name: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postal_code: '',
  });

  useEffect(() => {
    if (user?.profile) {
      setFormData({
        full_name: user.profile.full_name || '',
        company_name: user.profile.company_name || '',
        phone: user.profile.phone || '',
        address: user.profile.address || '',
        city: user.profile.city || '',
        country: user.profile.country || '',
        postal_code: user.profile.postal_code || '',
      });
    }
  }, [user]);

  // Calculate profile completion
  const calculateCompletion = () => {
    const fields = ['full_name', 'company_name', 'phone', 'address', 'city', 'country', 'postal_code'];
    const filledFields = fields.filter(field => formData[field as keyof typeof formData]);
    return Math.round((filledFields.length / fields.length) * 100);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const { error } = await updateProfile(formData);
      if (error) {
        setError(error.message || 'Failed to update profile');
      } else {
        setSuccess(true);
        setEditMode(false);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const completionPercentage = calculateCompletion();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Fade in timeout={600}>
        <Box>
          {/* Header Section */}
          <Box sx={{ mb: 6 }}>
            <Typography 
              variant="h3" 
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 800,
                background: `linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              {t('profile.title')}
            </Typography>
            <Typography variant="body1" sx={{ color: 'var(--text-secondary)' }}>
              {t('profile.subtitle')}
            </Typography>
          </Box>

          {/* Profile Overview Card */}
          <Zoom in timeout={800}>
            <Card
              sx={{
                mb: 4,
                bgcolor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0,0,0,0.08)',
                position: 'relative',
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
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
                  {/* Avatar and Basic Info */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ position: 'relative', mb: 3 }}>
                      <Avatar
                        sx={{
                          width: 120,
                          height: 120,
                          bgcolor: `rgba(var(--primary-rgb), 0.2)`,
                          border: '3px solid',
                          borderColor: `rgba(var(--primary-rgb), 0.5)`,
                          boxShadow: `0 8px 32px rgba(var(--primary-rgb), 0.3)`,
                        }}
                      >
                        <AccountCircle sx={{ fontSize: 80, color: 'var(--primary-color)' }} />
                      </Avatar>
                      <IconButton
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          bgcolor: 'var(--bg-secondary)',
                          border: `2px solid var(--primary-color)`,
                          boxShadow: 'var(--shadow-primary)',
                          '&:hover': {
                            bgcolor: 'var(--bg-active)',
                          },
                        }}
                        size="small"
                      >
                        <Edit sx={{ fontSize: 18, color: 'var(--primary-color)' }} />
                      </IconButton>
                    </Box>
                    
                    <Typography variant="h5" gutterBottom fontWeight={700}>
                      {formData.full_name || t('profile.user')}
                    </Typography>
                    
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <Chip
                        icon={<Email />}
                        label={user?.email}
                        size="small"
                        sx={{
                          bgcolor: 'var(--bg-active)',
                          border: '1px solid var(--border-active)',
                          color: 'var(--primary-color)',
                        }}
                      />
                      <Chip
                        icon={<Security />}
                        label={user?.role === 'admin' ? t('profile.administrator') : t('profile.buyer')}
                        size="small"
                        sx={{
                          bgcolor: user?.role === 'admin'
                            ? `rgba(var(--secondary-rgb), 0.1)`
                            : `rgba(var(--success-rgb), 0.1)`,
                          border: user?.role === 'admin'
                            ? `1px solid rgba(var(--secondary-rgb), 0.3)`
                            : `1px solid rgba(var(--success-rgb), 0.3)`,
                          color: user?.role === 'admin' ? 'var(--secondary-color)' : 'var(--success-color)',
                        }}
                      />
                    </Stack>
                  </Box>

                  {/* Profile Completion */}
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                          {t('profile.profileCompletion')}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{
                            color: completionPercentage === 100 ? 'var(--success-color)' : 'var(--primary-color)',
                            fontWeight: 600,
                          }}
                        >
                          {completionPercentage}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={completionPercentage}
                        sx={{
                          height: 10,
                          borderRadius: 1,
                          bgcolor: 'rgba(0,0,0,0.08)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 1,
                            background: completionPercentage === 100
                              ? `linear-gradient(90deg, var(--success-color) 0%, #00cc55 100%)`
                              : `linear-gradient(90deg, var(--primary-color) 0%, #0099cc 100%)`,
                          },
                        }}
                      />
                      {completionPercentage < 100 && (
                        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'var(--text-secondary)' }}>
                          {t('profile.completeProfileMessage')}
                        </Typography>
                      )}
                    </Box>

                    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                      {formData.company_name && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Business sx={{ fontSize: 20, color: 'var(--text-secondary)' }} />
                          <Typography variant="body2">{formData.company_name}</Typography>
                        </Box>
                      )}
                      {formData.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Phone sx={{ fontSize: 20, color: 'var(--text-secondary)' }} />
                          <Typography variant="body2">{formData.phone}</Typography>
                        </Box>
                      )}
                      {formData.city && formData.country && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn sx={{ fontSize: 20, color: 'var(--text-secondary)' }} />
                          <Typography variant="body2">{formData.city}, {formData.country}</Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>

                  {/* Action Button */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Button
                      variant={editMode ? 'outlined' : 'contained'}
                      onClick={() => setEditMode(!editMode)}
                      startIcon={editMode ? <CheckCircle /> : <Edit />}
                      sx={editMode ? {
                        borderColor: `rgba(var(--danger-rgb), 0.5)`,
                        color: 'var(--danger-color)',
                        '&:hover': {
                          borderColor: 'var(--danger-color)',
                          bgcolor: `rgba(var(--danger-rgb), 0.1)`,
                        },
                      } : {
                        background: `linear-gradient(135deg, var(--primary-color) 0%, #0099cc 100%)`,
                        boxShadow: `0 4px 20px rgba(var(--primary-rgb), 0.3)`,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 6px 30px rgba(var(--primary-rgb), 0.4)`,
                        },
                      }}
                    >
                      {editMode ? t('profile.cancel') : t('profile.editProfile')}
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Zoom>

          {/* Alerts */}
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
          
          {success && (
            <Zoom in>
              <Alert 
                severity="success"
                sx={{
                  mb: 3,
                  bgcolor: `rgba(var(--success-rgb), 0.08)`,
                  color: 'var(--success-color)',
                  border: `1px solid rgba(var(--success-rgb), 0.2)`,
                  '& .MuiAlert-icon': {
                    color: 'var(--success-color)',
                  },
                }}
              >
                {t('profile.profileUpdatedSuccess')}
              </Alert>
            </Zoom>
          )}

          {/* Profile Form */}
          <Card
            sx={{
              bgcolor: 'var(--bg-secondary)',
              backdropFilter: 'blur(10px)',
              border: `1px solid var(--border-primary)`,
              transition: 'all 0.3s',
              boxShadow: 'var(--shadow-primary)',
              ...(editMode && {
                border: '1px solid var(--border-active)',
                boxShadow: `0 8px 32px rgba(var(--primary-rgb), 0.15)`,
              }),
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <AutoAwesome sx={{ color: 'var(--primary-color)', fontSize: 28 }} />
                <Typography variant="h5" fontWeight={700}>
                  {t('profile.personalInfo')}
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleSubmit}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                  <TextField
                    fullWidth
                    label={t('profile.fullName')}
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    disabled={loading || !editMode}
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
                    label={t('profile.companyName')}
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    disabled={loading || !editMode}
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
                    label={t('profile.phoneNumber')}
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={loading || !editMode}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone sx={{ color: 'var(--primary-color)' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    label={t('profile.country')}
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    disabled={loading || !editMode}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Flag sx={{ color: 'var(--primary-color)' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    label={t('profile.address')}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={loading || !editMode}
                    sx={{ gridColumn: { md: 'span 2' } }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Home sx={{ color: 'var(--primary-color)' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    label={t('profile.city')}
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={loading || !editMode}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Map sx={{ color: 'var(--primary-color)' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    label={t('profile.postalCode')}
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    disabled={loading || !editMode}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalPostOffice sx={{ color: 'var(--primary-color)' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                {editMode && (
                  <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setEditMode(false)}
                      disabled={loading}
                      sx={{
                        borderColor: 'var(--border-primary)',
                        color: 'var(--text-secondary)',
                        '&:hover': {
                          borderColor: 'var(--border-primary)',
                          bgcolor: 'rgba(0,0,0,0.04)',
                        },
                      }}
                    >
                      {t('profile.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                      disabled={loading}
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
                      {loading ? t('profile.saving') : t('profile.saveChanges')}
                    </Button>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Additional Settings */}
          <Box sx={{ mt: 4, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Card
              sx={{
                bgcolor: 'var(--bg-secondary)',
                backdropFilter: 'blur(10px)',
                border: `1px solid var(--border-primary)`,
                transition: 'all 0.3s',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-primary)',
                '&:hover': {
                  border: '1px solid var(--border-active)',
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 30px rgba(var(--primary-rgb), 0.1)`,
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Security sx={{ fontSize: 48, color: 'var(--primary-color)', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {t('profile.securitySettings')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                  {t('profile.securitySettingsDesc')}
                </Typography>
              </CardContent>
            </Card>

            <Card
              sx={{
                bgcolor: 'var(--bg-secondary)',
                backdropFilter: 'blur(10px)',
                border: `1px solid var(--border-primary)`,
                transition: 'all 0.3s',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-primary)',
                '&:hover': {
                  border: `1px solid rgba(var(--secondary-rgb), 0.3)`,
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 30px rgba(var(--secondary-rgb), 0.1)`,
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <AutoAwesome sx={{ fontSize: 48, color: 'var(--secondary-color)', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {t('profile.preferences')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                  {t('profile.preferencesDesc')}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Fade>
    </Container>
  );
};

export default Profile;