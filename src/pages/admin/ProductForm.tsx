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
import { useTranslation } from 'react-i18next';

const ProductForm: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    t('admin.basicInformation'),
    t('admin.pricingInventory'),
    t('admin.imagesDetails')
  ];

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
      setError(t('common.error'));
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
      setError(t('checkout.fillAllRequiredFields'));
      setActiveStep(0);
      return false;
    }
    if (!formData.price || formData.price <= 0) {
      setError(t('auth.enterValidEmail')); // Using a similar validation message
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
        setSuccess(t('common.success'));
      } else {
        const { error } = await productService.createProduct(productData as Omit<Product, 'id' | 'created_at' | 'updated_at'>);
        if (error) throw error;
        setSuccess(t('common.success'));
      }

      setTimeout(() => {
        navigate('/admin/products');
      }, 1500);
    } catch (err: any) {
      setError(err.message || t('common.error'));
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
              label={t('admin.productTitle')}
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              sx={{ mb: 3 }}
              placeholder={`${t('products.viewDetails')}...`}
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label={t('products.description')}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              sx={{ mb: 3 }}
              placeholder={`${t('maintenance.issuePlaceholder')}...`}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr', md: '1fr 1fr' }, gap: { xs: 2, md: 3 } }}>
              <FormControl fullWidth required>
                <InputLabel>{t('products.category')}</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={handleSelectChange('category')}
                >
                  <MenuItem value="">{t('common.select')}</MenuItem>
                  <MenuItem value="imaging">{t('productCategories.imagingEquipment')}</MenuItem>
                  <MenuItem value="surgical">{t('productCategories.surgicalEquipment')}</MenuItem>
                  <MenuItem value="diagnostic">{t('productCategories.diagnosticEquipment')}</MenuItem>
                  <MenuItem value="monitoring">{t('productCategories.monitoringEquipment')}</MenuItem>
                  <MenuItem value="laboratory">{t('productCategories.laboratoryEquipment')}</MenuItem>
                  <MenuItem value="respiratory">{t('productCategories.respiratoryEquipment')}</MenuItem>
                  <MenuItem value="sterilization">{t('productCategories.sterilizationEquipment') || 'Sterilization Equipment'}</MenuItem>
                  <MenuItem value="emergency">{t('productCategories.emergencyEquipment')}</MenuItem>
                  <MenuItem value="infusion">{t('productCategories.infusionEquipment')}</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>{t('products.condition')}</InputLabel>
                <Select
                  value={formData.condition}
                  label="Condition"
                  onChange={handleSelectChange('condition')}
                >
                  <MenuItem value="excellent">{t('products.excellent')}</MenuItem>
                  <MenuItem value="good">{t('products.good')}</MenuItem>
                  <MenuItem value="fair">{t('products.fair')}</MenuItem>
                </Select>
                <FormHelperText>{t('products.condition')}</FormHelperText>
              </FormControl>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr', md: '1fr 1fr' }, gap: { xs: 2, md: 3 } }}>
              <TextField
                fullWidth
                label={t('admin.originalPrice')}
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">€</InputAdornment>,
                }}
                helperText={t('admin.sellingPriceBeforeCommission')}
              />

              <TextField
                fullWidth
                label={t('admin.zettaPrice')}
                name="zetta_price"
                type="number"
                value={formData.zetta_price}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">€</InputAdornment>,
                }}
                helperText={t('admin.finalPriceAfterCommission')}
              />

              <TextField
                fullWidth
                label={t('admin.warrantyDuration')}
                name="warranty_duration"
                type="number"
                value={formData.warranty_duration}
                onChange={handleInputChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">{t('warranty.months')}</InputAdornment>,
                }}
                helperText={t('admin.warrantyPeriodInMonths')}
              />

              <FormControl fullWidth>
                <InputLabel>{t('common.status')}</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={handleSelectChange('status')}
                >
                  <MenuItem value="available">{t('admin.available')}</MenuItem>
                  <MenuItem value="sold">{t('admin.sold')}</MenuItem>
                  <MenuItem value="pending">{t('warranty.pending')}</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {formData.price && formData.zetta_price && (
              <Box sx={{
                mt: 3,
                p: { xs: 1.5, sm: 2 },
                bgcolor: 'rgba(255,0,128,0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(255,0,128,0.2)'
              }}>
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  {t('admin.commissionCalculation')}
                </Typography>
                <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  {t('admin.commissionAmount')}: <strong>€{(formData.price - (formData.zetta_price || 0)).toFixed(2)}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' } }}>
                  {t('admin.commissionRate')}: {((1 - ((formData.zetta_price || 0) / formData.price)) * 100).toFixed(1)}%
                </Typography>
              </Box>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              {t('admin.productImages')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              {t('admin.addImageUrlsDescription')}
            </Typography>

            {imageUrls.map((url, index) => (
              <Box key={index} sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, mb: 2 }}>
                <TextField
                  fullWidth
                  label={`${t('admin.imageUrl')} ${index + 1}`}
                  value={url}
                  onChange={(e) => handleImageUrlChange(index, e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  size="small"
                  sx={{
                    flex: 1,
                    '& input': {
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }
                  }}
                />
                <IconButton
                  onClick={() => removeImageUrl(index)}
                  disabled={imageUrls.length === 1}
                  size="small"
                  sx={{ color: '#ff3366' }}
                >
                  <Delete />
                </IconButton>
              </Box>
            ))}

            <Button
              startIcon={<AddPhotoAlternate />}
              onClick={addImageUrl}
              size="small"
              sx={{ mt: 1, fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              {t('admin.addAnotherImage')}
            </Button>

            {imageUrls.some(url => url.trim() !== '') && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('admin.imagePreview')}
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 1, sm: 2 } }}>
                  {imageUrls.filter(url => url.trim() !== '').map((url, index) => (
                    <Box
                      key={index}
                      sx={{
                        aspectRatio: '1 / 1',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
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
                          label={t('admin.main')}
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
          p: { xs: 2, sm: 3, md: 4 },
          bgcolor: 'oklch(98.5% 0.001 106.423)',
          borderRadius: '8px',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
            fontWeight: 700,
            background: 'linear-gradient(135deg, #00d4ff 0%, #ff0080 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {isEditMode ? t('admin.editProduct') : t('admin.addNewProduct')}
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

        <Stepper
          activeStep={activeStep}
          sx={{
            mb: 4,
            '& .MuiStepLabel-label': {
              fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
            },
            '& .MuiStepIcon-root': {
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }
          }}
        >
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel sx={{
                '& .MuiStepLabel-label': {
                  display: { xs: activeStep === index ? 'block' : 'none', sm: 'block' }
                }
              }}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}

        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mt: 4,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/admin/products')}
            startIcon={<Cancel />}
            size="small"
            sx={{
              minWidth: { xs: '100px', sm: 'auto' },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              borderColor: 'rgba(255,255,255,0.3)',
              color: 'rgba(255,255,255,0.7)',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.5)',
                bgcolor: 'oklch(98.5% 0.001 106.423)',
              },
            }}
          >
            {t('common.cancel')}
          </Button>

          <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap' }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBack />}
              size="small"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              {t('common.back')}
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={16} /> : <Save />}
                size="small"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  minWidth: { xs: '120px', sm: '150px' },
                  background: 'linear-gradient(135deg, #00ff88 0%, #00cc55 100%)',
                  boxShadow: '0 2px 8px rgba(0,255,136,0.2)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 3px 12px rgba(0,255,136,0.25)',
                  },
                  '&:disabled': {
                    background: 'rgba(128,128,128,0.3)',
                  },
                }}
              >
                {saving ? `${t('common.loading')}...` : (isEditMode ? t('admin.update') : t('admin.create'))}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForward />}
                size="small"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                  boxShadow: '0 2px 8px rgba(0,212,255,0.2)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 3px 12px rgba(0,212,255,0.25)',
                  },
                }}
              >
                {t('common.next')}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProductForm;