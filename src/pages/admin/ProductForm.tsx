import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Chip,
  FormHelperText,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Save,
  Cancel,
  AddPhotoAlternate,
  Delete,
  ArrowBack,
  ArrowForward,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { productService } from '../../services/products';
import { Product } from '../../types';
import { useNavigate, useParams } from 'react-router-dom';

const steps = ['Basic Information', 'Pricing & Inventory', 'Images & Details'];

const ProductForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  const [formData, setFormData] = useState<Partial<Product>>({
    title: '',
    description: '',
    category: '',
    condition: 'good',
    price: 0,
    zetta_price: 0,
    images: [],
    status: 'available',
    warranty_duration: 6,
  });

  const [imageUrls, setImageUrls] = useState<string[]>(['']);

  useEffect(() => {
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data, error } = await productService.getProductById(id!);
      if (error) throw error;
      if (data) {
        setFormData(data);
        setImageUrls(data.images?.length ? data.images : ['']);
      }
    } catch (err: any) {
      setError('Failed to fetch product');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'zetta_price' || name === 'warranty_duration' 
        ? parseFloat(value) || 0 
        : value,
    }));

    // Auto-calculate Zetta price if price changes
    if (name === 'price' && !formData.zetta_price) {
      const price = parseFloat(value) || 0;
      const zettaPrice = price * 0.94; // 6% discount as default
      setFormData(prev => ({
        ...prev,
        zetta_price: Math.round(zettaPrice * 100) / 100,
      }));
    }
  };

  const handleSelectChange = (name: string) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: event.target.value,
    }));
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
    
    // Update formData images
    const validUrls = newUrls.filter(url => url.trim() !== '');
    setFormData(prev => ({
      ...prev,
      images: validUrls,
    }));
  };

  const addImageUrl = () => {
    setImageUrls([...imageUrls, '']);
  };

  const removeImageUrl = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls.length > 0 ? newUrls : ['']);
    
    // Update formData images
    const validUrls = newUrls.filter(url => url.trim() !== '');
    setFormData(prev => ({
      ...prev,
      images: validUrls,
    }));
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const validateForm = () => {
    if (!formData.title || !formData.description || !formData.category) {
      setError('Please fill in all required fields');
      setActiveStep(0);
      return false;
    }
    if (!formData.price || formData.price <= 0) {
      setError('Please enter a valid price');
      setActiveStep(1);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const productData = {
        ...formData,
        seller_id: user?.id || '',
        images: imageUrls.filter(url => url.trim() !== ''),
      };

      if (isEditMode) {
        const { error } = await productService.updateProduct(id!, productData);
        if (error) throw error;
        setSuccess('Product updated successfully!');
      } else {
        const { error } = await productService.createProduct(productData as Omit<Product, 'id' | 'created_at' | 'updated_at'>);
        if (error) throw error;
        setSuccess('Product created successfully!');
      }

      setTimeout(() => {
        navigate('/admin/products');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Product Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              sx={{ mb: 3 }}
              placeholder="e.g., Siemens MAGNETOM Altea 1.5T MRI Scanner"
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              sx={{ mb: 3 }}
              placeholder="Provide detailed information about the equipment, including specifications, condition, and service history..."
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={handleSelectChange('category')}
                >
                  <MenuItem value="">Select Category</MenuItem>
                  <MenuItem value="imaging">Imaging Equipment</MenuItem>
                  <MenuItem value="surgical">Surgical Equipment</MenuItem>
                  <MenuItem value="diagnostic">Diagnostic Equipment</MenuItem>
                  <MenuItem value="monitoring">Patient Monitoring</MenuItem>
                  <MenuItem value="laboratory">Laboratory Equipment</MenuItem>
                  <MenuItem value="respiratory">Respiratory Equipment</MenuItem>
                  <MenuItem value="sterilization">Sterilization Equipment</MenuItem>
                  <MenuItem value="emergency">Emergency Equipment</MenuItem>
                  <MenuItem value="infusion">Infusion Equipment</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Condition</InputLabel>
                <Select
                  value={formData.condition}
                  label="Condition"
                  onChange={handleSelectChange('condition')}
                >
                  <MenuItem value="excellent">Excellent</MenuItem>
                  <MenuItem value="good">Good</MenuItem>
                  <MenuItem value="fair">Fair</MenuItem>
                </Select>
                <FormHelperText>Overall condition of the equipment</FormHelperText>
              </FormControl>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <TextField
                fullWidth
                label="Original Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">€</InputAdornment>,
                }}
                helperText="Your selling price before Zetta commission"
              />

              <TextField
                fullWidth
                label="Zetta Price"
                name="zetta_price"
                type="number"
                value={formData.zetta_price}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">€</InputAdornment>,
                }}
                helperText="Final price shown to buyers (after commission)"
              />

              <TextField
                fullWidth
                label="Warranty Duration"
                name="warranty_duration"
                type="number"
                value={formData.warranty_duration}
                onChange={handleInputChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">months</InputAdornment>,
                }}
                helperText="Warranty period in months"
              />

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={handleSelectChange('status')}
                >
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="sold">Sold</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {formData.price && formData.zetta_price && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(255,0,128,0.1)', borderRadius: 1, border: '1px solid rgba(255,0,128,0.3)' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Commission Calculation
                </Typography>
                <Typography variant="body1">
                  Commission Amount: <strong>€{(formData.price - (formData.zetta_price || 0)).toFixed(2)}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Commission Rate: {((1 - ((formData.zetta_price || 0) / formData.price)) * 100).toFixed(1)}%
                </Typography>
              </Box>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Product Images
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add image URLs for your product. The first image will be the main product image.
            </Typography>

            {imageUrls.map((url, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label={`Image URL ${index + 1}`}
                  value={url}
                  onChange={(e) => handleImageUrlChange(index, e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  sx={{ flex: 1 }}
                />
                <IconButton
                  onClick={() => removeImageUrl(index)}
                  disabled={imageUrls.length === 1}
                  sx={{ color: '#ff3366' }}
                >
                  <Delete />
                </IconButton>
              </Box>
            ))}

            <Button
              startIcon={<AddPhotoAlternate />}
              onClick={addImageUrl}
              sx={{ mt: 1 }}
            >
              Add Another Image
            </Button>

            {imageUrls.some(url => url.trim() !== '') && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Image Preview
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {imageUrls.filter(url => url.trim() !== '').map((url, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 150,
                        height: 150,
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.1)',
                        position: 'relative',
                      }}
                    >
                      <img
                        src={url}
                        alt={`Product ${index + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-product.png';
                        }}
                      />
                      {index === 0 && (
                        <Chip
                          label="Main"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            bgcolor: 'rgba(0,212,255,0.9)',
                          }}
                        />
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Paper
        sx={{
          p: 4,
          bgcolor: 'rgba(15,15,25,0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Typography 
          variant="h4" 
          gutterBottom
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #00d4ff 0%, #ff0080 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

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
            variant="outlined"
            onClick={() => navigate('/admin/products')}
            startIcon={<Cancel />}
            sx={{
              borderColor: 'rgba(255,255,255,0.3)',
              color: 'rgba(255,255,255,0.7)',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.5)',
                bgcolor: 'rgba(255,255,255,0.05)',
              },
            }}
          >
            Cancel
          </Button>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBack />}
            >
              Back
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                sx={{
                  background: 'linear-gradient(135deg, #00ff88 0%, #00cc55 100%)',
                  boxShadow: '0 4px 20px rgba(0,255,136,0.3)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 30px rgba(0,255,136,0.4)',
                  },
                  '&:disabled': {
                    background: 'rgba(128,128,128,0.3)',
                  },
                }}
              >
                {saving ? 'Saving...' : (isEditMode ? 'Update Product' : 'Create Product')}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForward />}
                sx={{
                  background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                  boxShadow: '0 4px 20px rgba(0,212,255,0.3)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 30px rgba(0,212,255,0.4)',
                  },
                }}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProductForm;