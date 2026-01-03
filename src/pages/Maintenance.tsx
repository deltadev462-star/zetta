import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
} from '@mui/material';
import { Build, Send, Warning } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { MaintenanceRequest } from '../types';
import { useTranslation } from 'react-i18next';

const Maintenance: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    productDescription: '',
    issueDescription: '',
    urgency: 'medium',
    preferredContact: 'email',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUrgencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      urgency: event.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setLoading(true);
    setError('');

    try {
      const requestData: Partial<MaintenanceRequest> = {
        user_id: user.id,
        type: 'maintenance',
        status: 'pending',
        issue_description: formData.issueDescription,
        urgency: formData.urgency as any,
        details: JSON.stringify({
          productDescription: formData.productDescription,
          preferredContact: formData.preferredContact,
          contactName: formData.contactName,
          contactPhone: formData.contactPhone,
          contactEmail: formData.contactEmail,
        }),
      };

      const { error: submitError } = await supabase
        .from('service_requests')
        .insert(requestData);

      if (submitError) {
        setError(t('common.error'));
      } else {
        setSuccess(true);
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            productDescription: '',
            issueDescription: '',
            urgency: 'medium',
            preferredContact: 'email',
            contactName: '',
            contactPhone: '',
            contactEmail: '',
          });
          setSuccess(false);
        }, 3000);
      }
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Build sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4">
            {t('maintenance.title')}
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" paragraph>
          {t('maintenance.subtitle')}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {t('maintenance.requestSubmitted')}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            {t('maintenance.equipmentInfo')}
          </Typography>
          
          <TextField
            fullWidth
            label={t('maintenance.productDescription')}
            name="productDescription"
            value={formData.productDescription}
            onChange={handleInputChange}
            required
            sx={{ mb: 3 }}
            placeholder="e.g., MRI Scanner Model XYZ, Serial #12345"
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label={t('maintenance.issueDescription')}
            name="issueDescription"
            value={formData.issueDescription}
            onChange={handleInputChange}
            required
            sx={{ mb: 3 }}
            placeholder={t('maintenance.issuePlaceholder')}
          />

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            {t('maintenance.urgencyLevel')}
          </Typography>

          <RadioGroup
            row
            value={formData.urgency}
            onChange={handleUrgencyChange}
            sx={{ mb: 3 }}
          >
            <FormControlLabel
              value="low"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={t('maintenance.low')} color="success" size="small" />
                  <Typography variant="body2">{t('maintenance.routineMaintenance')}</Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="medium"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={t('maintenance.medium')} color="warning" size="small" />
                  <Typography variant="body2">{t('maintenance.operationalNeedsAttention')}</Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="high"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={t('maintenance.high')} color="error" size="small" />
                  <Typography variant="body2">{t('maintenance.nonOperational')}</Typography>
                </Box>
              }
            />
          </RadioGroup>

          {formData.urgency === 'high' && (
            <Alert severity="warning" sx={{ mb: 3 }} icon={<Warning />}>
              {t('maintenance.highUrgencyWarning')}
            </Alert>
          )}

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            {t('maintenance.contactInfo')}
          </Typography>

          <TextField
            fullWidth
            label={t('maintenance.contactName')}
            name="contactName"
            value={formData.contactName}
            onChange={handleInputChange}
            required
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              label={t('maintenance.phoneNumber')}
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleInputChange}
              required
              type="tel"
            />
            <TextField
              fullWidth
              label={t('maintenance.emailAddress')}
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleInputChange}
              required
              type="email"
            />
          </Box>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>{t('maintenance.preferredContactMethod')}</InputLabel>
            <Select
              value={formData.preferredContact}
              label={t('maintenance.preferredContactMethod')}
              onChange={(e) => setFormData(prev => ({ ...prev, preferredContact: e.target.value }))}
            >
              <MenuItem value="email">{t('maintenance.email')}</MenuItem>
              <MenuItem value="phone">{t('maintenance.phone')}</MenuItem>
              <MenuItem value="both">{t('maintenance.both')}</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => window.history.back()}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Send />}
            >
              {loading ? t('maintenance.submitting') : t('maintenance.submitRequest')}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Paper
        elevation={1}
        sx={{
          p: 3,
          mt: 3,
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(30,60,114,0.1) 0%, rgba(42,82,152,0.1) 50%, rgba(126,34,206,0.1) 100%)',
            pointerEvents: 'none',
          }
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ color: 'white', fontWeight: 600 }}>
          {t('maintenance.whatHappensNext')}
        </Typography>
        <Box component="ol" sx={{ pl: 2 }}>
          <Typography component="li" variant="body2" paragraph sx={{ color: 'rgba(255, 255, 255, 0.95)' }}>
            {t('maintenance.nextStep1')}
          </Typography>
          <Typography component="li" variant="body2" paragraph sx={{ color: 'rgba(255, 255, 255, 0.95)' }}>
            {t('maintenance.nextStep2')}
          </Typography>
          <Typography component="li" variant="body2" paragraph sx={{ color: 'rgba(255, 255, 255, 0.95)' }}>
            {t('maintenance.nextStep3')}
          </Typography>
          <Typography component="li" variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.95)' }}>
            {t('maintenance.nextStep4')}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Maintenance;