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

const Maintenance: React.FC = () => {
  const { user } = useAuth();
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
        setError('Failed to submit request. Please try again.');
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
      setError('An unexpected error occurred');
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
            Maintenance Service Request
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" paragraph>
          Submit a maintenance request for your medical equipment. Our certified technicians
          will review your request and contact you to schedule service.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Your maintenance request has been submitted successfully! We'll contact you soon.
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Equipment Information
          </Typography>
          
          <TextField
            fullWidth
            label="Product/Equipment Description"
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
            label="Issue Description"
            name="issueDescription"
            value={formData.issueDescription}
            onChange={handleInputChange}
            required
            sx={{ mb: 3 }}
            placeholder="Please describe the issue you're experiencing..."
          />

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Urgency Level
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
                  <Chip label="Low" color="success" size="small" />
                  <Typography variant="body2">Routine maintenance</Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="medium"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="Medium" color="warning" size="small" />
                  <Typography variant="body2">Equipment operational but needs attention</Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="high"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="High" color="error" size="small" />
                  <Typography variant="body2">Equipment non-operational</Typography>
                </Box>
              }
            />
          </RadioGroup>

          {formData.urgency === 'high' && (
            <Alert severity="warning" sx={{ mb: 3 }} icon={<Warning />}>
              High urgency requests will be prioritized. Our team will contact you within 24 hours.
            </Alert>
          )}

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Contact Information
          </Typography>

          <TextField
            fullWidth
            label="Contact Name"
            name="contactName"
            value={formData.contactName}
            onChange={handleInputChange}
            required
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="Phone Number"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleInputChange}
              required
              type="tel"
            />
            <TextField
              fullWidth
              label="Email Address"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleInputChange}
              required
              type="email"
            />
          </Box>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Preferred Contact Method</InputLabel>
            <Select
              value={formData.preferredContact}
              label="Preferred Contact Method"
              onChange={(e) => setFormData(prev => ({ ...prev, preferredContact: e.target.value }))}
            >
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="phone">Phone</MenuItem>
              <MenuItem value="both">Both</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Send />}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
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
          What happens next?
        </Typography>
        <Box component="ol" sx={{ pl: 2 }}>
          <Typography component="li" variant="body2" paragraph sx={{ color: 'rgba(255, 255, 255, 0.95)' }}>
            Our technical team will review your request within 24-48 hours
          </Typography>
          <Typography component="li" variant="body2" paragraph sx={{ color: 'rgba(255, 255, 255, 0.95)' }}>
            A certified technician will contact you to discuss the issue and schedule service
          </Typography>
          <Typography component="li" variant="body2" paragraph sx={{ color: 'rgba(255, 255, 255, 0.95)' }}>
            You'll receive a cost estimate before any work begins
          </Typography>
          <Typography component="li" variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.95)' }}>
            Track your service request status in your account dashboard
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Maintenance;