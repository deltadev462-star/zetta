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
  Stepper,
  Step,
  StepLabel,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { LocalShipping, Send } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { LogisticsRequest } from '../types';

const steps = ['Service Details', 'Address Information', 'Review & Submit'];

const Logistics: React.FC = () => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    serviceType: '',
    pickupAddress: '',
    deliveryAddress: '',
    preferredDate: null as Date | null,
    specialInstructions: '',
    contactName: '',
    contactPhone: '',
    agreeToTerms: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: event.target.value,
    }));
  };

  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({
      ...prev,
      preferredDate: date,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      agreeToTerms: e.target.checked,
    }));
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');

    try {
      const requestData: Partial<LogisticsRequest> = {
        user_id: user.id,
        type: 'logistics',
        status: 'pending',
        service_type: formData.serviceType as any,
        pickup_address: formData.pickupAddress,
        delivery_address: formData.deliveryAddress,
        preferred_date: formData.preferredDate?.toISOString(),
        details: JSON.stringify({
          specialInstructions: formData.specialInstructions,
          contactName: formData.contactName,
          contactPhone: formData.contactPhone,
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
            serviceType: '',
            pickupAddress: '',
            deliveryAddress: '',
            preferredDate: null,
            specialInstructions: '',
            contactName: '',
            contactPhone: '',
            agreeToTerms: false,
          });
          setActiveStep(0);
          setSuccess(false);
        }, 3000);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Service Type</InputLabel>
              <Select
                value={formData.serviceType}
                label="Service Type"
                onChange={handleSelectChange('serviceType')}
                required
              >
                <MenuItem value="delivery">Delivery Service</MenuItem>
                <MenuItem value="storage">Storage Service</MenuItem>
                <MenuItem value="transport">Transport Service</MenuItem>
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Preferred Date"
                value={formData.preferredDate}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: { mb: 3 },
                  },
                }}
              />
            </LocalizationProvider>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Special Instructions"
              name="specialInstructions"
              value={formData.specialInstructions}
              onChange={handleInputChange}
              placeholder="Any special requirements or instructions..."
            />
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Pickup Address"
              name="pickupAddress"
              value={formData.pickupAddress}
              onChange={handleInputChange}
              required
              sx={{ mb: 3 }}
              multiline
              rows={2}
            />

            <TextField
              fullWidth
              label="Delivery Address"
              name="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={handleInputChange}
              required
              sx={{ mb: 3 }}
              multiline
              rows={2}
            />

            <TextField
              fullWidth
              label="Contact Name"
              name="contactName"
              value={formData.contactName}
              onChange={handleInputChange}
              required
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Contact Phone"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleInputChange}
              required
              type="tel"
            />
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Service Summary
            </Typography>
            
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
              <Typography><strong>Service Type:</strong> {formData.serviceType}</Typography>
              <Typography><strong>Preferred Date:</strong> {formData.preferredDate?.toLocaleDateString()}</Typography>
              <Typography><strong>Pickup Address:</strong> {formData.pickupAddress}</Typography>
              <Typography><strong>Delivery Address:</strong> {formData.deliveryAddress}</Typography>
              <Typography><strong>Contact:</strong> {formData.contactName} ({formData.contactPhone})</Typography>
              {formData.specialInstructions && (
                <Typography><strong>Special Instructions:</strong> {formData.specialInstructions}</Typography>
              )}
            </Paper>

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.agreeToTerms}
                  onChange={handleCheckboxChange}
                  color="primary"
                />
              }
              label="I agree to the terms and conditions for logistics services"
            />

            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Your logistics request has been submitted successfully!
              </Alert>
            )}
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return formData.serviceType !== '';
      case 1:
        return (
          formData.pickupAddress !== '' &&
          formData.deliveryAddress !== '' &&
          formData.contactName !== '' &&
          formData.contactPhone !== ''
        );
      case 2:
        return formData.agreeToTerms;
      default:
        return false;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <LocalShipping sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4">
            Logistics Service Request
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!isStepValid() || loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Send />}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Logistics;