import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  LocalShipping,
  Payment,
  CheckCircle,
  CreditCard,
  AccountBalance,
  ArrowBack,
  ArrowForward,
  ShoppingCart,
  Lock,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../services/supabase';
import { mockPaymentService } from '../services/payment';
import { ShippingAddress, Order } from '../types';


const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { items, clearCart, getCartTotal } = useCart();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  
  const steps = [t('checkout.shippingInfo'), t('checkout.paymentMethod'), t('checkout.reviewConfirm')];

  const [shippingInfo, setShippingInfo] = useState<ShippingAddress>({
    full_name: user?.profile?.full_name || '',
    address_line1: user?.profile?.address || '',
    address_line2: '',
    city: user?.profile?.city || '',
    state: '',
    country: user?.profile?.country || '',
    postal_code: user?.profile?.postal_code || '',
    phone: user?.profile?.phone || '',
  });

  const [paymentMethod, setPaymentMethod] = useState('card');

  const subtotal = getCartTotal();
  const shipping = subtotal > 500 ? 0 : 50; // Free shipping over €500
  const total = subtotal + shipping;
  const commission = total * 0.15; // 15% commission

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
    }
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [user, items, navigate]);

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateShipping = () => {
    const required = ['full_name', 'address_line1', 'city', 'country', 'postal_code', 'phone'];
    for (const field of required) {
      if (!shippingInfo[field as keyof ShippingAddress]) {
        setError(t('checkout.fillAllRequiredFields'));
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateShipping()) {
      return;
    }
    setError('');
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const createOrder = async () => {
    setLoading(true);
    setError('');

    try {
      // Create order items data
      const orderItems = items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.zetta_price || item.product.price,
        total_price: (item.product.zetta_price || item.product.price) * item.quantity,
      }));

      // Create the order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          buyer_id: user?.id,
          seller_id: items[0].product.seller_id, // Assuming all items from same seller
          total_amount: total,
          commission_amount: commission,
          status: 'pending',
          payment_status: 'pending',
          payment_method: paymentMethod,
          shipping_address: shippingInfo,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems.map(item => ({
          ...item,
          order_id: orderData.id,
        })));

      if (itemsError) throw itemsError;

      setOrderId(orderData.id);
      return orderData;
    } catch (error: any) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const processPayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Create order first
      const order = await createOrder();

      // Process payment (using mock service for now)
      const { data: paymentIntent, error: paymentError } = await mockPaymentService.createPaymentIntent(
        order.id,
        total,
        'EUR'
      );

      if (paymentError) throw paymentError;

      // Simulate payment confirmation
      const { error: confirmError } = await mockPaymentService.confirmPayment(order.id);

      if (confirmError) throw confirmError;

      // Update product status to sold
      for (const item of items) {
        await supabase
          .from('products')
          .update({ status: 'sold' })
          .eq('id', item.product.id);
      }

      setSuccess(true);
      clearCart();

      // Redirect to success page after 2 seconds
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              {t('checkout.shippingInfo')}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
              <TextField
                  fullWidth
                  label={t('checkout.fullName')}
                  name="full_name"
                  value={shippingInfo.full_name}
                  onChange={handleShippingChange}
                  required
                />
              </Box>
              <TextField
                  fullWidth
                  label={t('checkout.addressLine1')}
                  name="address_line1"
                  value={shippingInfo.address_line1}
                  onChange={handleShippingChange}
                  required
                />
              <TextField
                  fullWidth
                  label={t('checkout.addressLine2')}
                  name="address_line2"
                  value={shippingInfo.address_line2}
                  onChange={handleShippingChange}
                />
                <TextField
                  fullWidth
                  label={t('checkout.city')}
                  name="city"
                  value={shippingInfo.city}
                  onChange={handleShippingChange}
                  required
                />
                <TextField
                  fullWidth
                  label={t('checkout.state')}
                  name="state"
                  value={shippingInfo.state}
                  onChange={handleShippingChange}
                />
                <TextField
                  fullWidth
                  label={t('checkout.country')}
                  name="country"
                  value={shippingInfo.country}
                  onChange={handleShippingChange}
                  required
                />
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                <TextField
                  fullWidth
                  label={t('checkout.postalCode')}
                  name="postal_code"
                  value={shippingInfo.postal_code}
                  onChange={handleShippingChange}
                  required
                />
              <TextField
                  fullWidth
                  label={t('checkout.phoneNumber')}
                  name="phone"
                  value={shippingInfo.phone}
                  onChange={handleShippingChange}
                  required
                  type="tel"
                />
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              {t('checkout.paymentMethod')}
            </Typography>
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <Paper
                  sx={{
                    p: 2,
                    mb: 2,
                    cursor: 'pointer',
                    border: paymentMethod === 'card' ? '2px solid var(--primary-color)' : '1px solid var(--border-primary)',
                    bgcolor: paymentMethod === 'card' ? 'var(--bg-hover)' : 'var(--bg-secondary)',
                    boxShadow: paymentMethod === 'card' ? `0 4px 20px rgba(var(--primary-rgb), 0.1)` : 'var(--shadow-primary)',
                  }}
                  onClick={() => setPaymentMethod('card')}
                >
                  <FormControlLabel
                    value="card"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CreditCard />
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            {t('checkout.creditDebitCard')}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                            {t('checkout.securePaymentStripe')}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </Paper>

                <Paper
                  sx={{
                    p: 2,
                    mb: 2,
                    cursor: 'pointer',
                    border: paymentMethod === 'transfer' ? '2px solid var(--primary-color)' : '1px solid var(--border-primary)',
                    bgcolor: paymentMethod === 'transfer' ? 'var(--bg-hover)' : 'var(--bg-secondary)',
                    boxShadow: paymentMethod === 'transfer' ? `0 4px 20px rgba(var(--primary-rgb), 0.1)` : 'var(--shadow-primary)',
                  }}
                  onClick={() => setPaymentMethod('transfer')}
                >
                  <FormControlLabel
                    value="transfer"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <AccountBalance />
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            {t('checkout.bankTransfer')}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                            {t('checkout.directBankTransfer')}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </Paper>
              </RadioGroup>
            </FormControl>

            <Alert
              severity="info"
              sx={{
                mt: 3,
                bgcolor: 'var(--bg-hover)',
                color: 'var(--info-color)',
                border: `1px solid rgba(var(--primary-rgb), 0.2)`,
                '& .MuiAlert-icon': {
                  color: 'var(--info-color)',
                },
              }}
            >
              <Typography variant="body2">
                <strong>{t('checkout.securePayment')}:</strong> {t('checkout.paymentInfoEncrypted')}
              </Typography>
            </Alert>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              {t('checkout.reviewYourOrder')}
            </Typography>

            {/* Order Items */}
            <Paper sx={{
              p: 3,
              mb: 3,
              bgcolor: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              boxShadow: 'var(--shadow-primary)',
            }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {t('checkout.orderItems')}
              </Typography>
              <List>
                {items.map((item, index) => (
                  <React.Fragment key={item.product.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar
                          variant="rounded"
                          src={item.product.images?.[0]}
                          sx={{ width: 60, height: 60 }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.product.title}
                        secondary={t('checkout.quantity', { quantity: item.quantity })}
                        sx={{ ml: 2 }}
                      />
                      <Typography variant="body1" fontWeight={600}>
                        €{((item.product.zetta_price || item.product.price) * item.quantity).toFixed(2)}
                      </Typography>
                    </ListItem>
                    {index < items.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>

            {/* Shipping Address */}
            <Paper sx={{
              p: 3,
              mb: 3,
              bgcolor: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              boxShadow: 'var(--shadow-primary)',
            }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {t('checkout.shippingAddress')}
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                {shippingInfo.full_name}<br />
                {shippingInfo.address_line1}<br />
                {shippingInfo.address_line2 && <>{shippingInfo.address_line2}<br /></>}
                {shippingInfo.city}, {shippingInfo.state} {shippingInfo.postal_code}<br />
                {shippingInfo.country}<br />
                {t('checkout.phone', { phone: shippingInfo.phone })}
              </Typography>
            </Paper>

            {/* Payment Summary */}
            <Paper sx={{
              p: 3,
              bgcolor: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              boxShadow: 'var(--shadow-primary)',
            }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {t('checkout.paymentSummary')}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>{t('checkout.subtotal')}</Typography>
                  <Typography variant="body2">€{subtotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>{t('checkout.shipping')}</Typography>
                  <Typography variant="body2">
                    {shipping === 0 ? t('checkout.free') : `€${shipping.toFixed(2)}`}
                  </Typography>
                </Box>
                <Divider sx={{ my: 2, borderColor: 'var(--border-primary)' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" fontWeight={700}>{t('checkout.total')}</Typography>
                  <Typography variant="h6" fontWeight={700} color="primary">
                    €{total.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  if (success) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <CheckCircle sx={{ fontSize: 80, color: 'var(--success-color)', mb: 3 }} />
        <Typography variant="h4" gutterBottom fontWeight={700}>
          {t('checkout.paymentSuccessful')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: 'var(--text-secondary)' }}>
          {t('checkout.orderConfirmed', { id: orderId.slice(0, 8) })}
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
          {t('checkout.redirectingToOrders')}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4 }}>
        {/* Main Content */}
        <Box>
          <Paper
            sx={{
              p: 4,
              bgcolor: 'var(--bg-secondary)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--border-primary)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
            }}
          >
            <Typography 
              variant="h4" 
              gutterBottom
              sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 4,
              }}
            >
              {t('checkout.title')}
            </Typography>

            {error && (
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
                disabled={activeStep === 0 || loading}
                onClick={handleBack}
                startIcon={<ArrowBack />}
              >
                {t('checkout.back')}
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={processPayment}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Lock />}
                  sx={{
                    background: `linear-gradient(135deg, var(--success-color) 0%, #00cc55 100%)`,
                    boxShadow: `0 4px 20px rgba(var(--success-rgb), 0.3)`,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 6px 30px rgba(var(--success-rgb), 0.4)`,
                    },
                    '&:disabled': {
                      background: 'rgba(128,128,128,0.3)',
                    },
                  }}
                >
                  {loading ? t('checkout.processing') : t('checkout.completeOrder')}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForward />}
                  sx={{
                    background: `linear-gradient(135deg, var(--primary-color) 0%, #0099cc 100%)`,
                    boxShadow: `0 4px 20px rgba(var(--primary-rgb), 0.3)`,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 6px 30px rgba(var(--primary-rgb), 0.4)`,
                    },
                  }}
                >
                  {t('checkout.next')}
                </Button>
              )}
            </Box>
          </Paper>
        </Box>

        {/* Order Summary Sidebar */}
        <Box>
          <Card
            sx={{
              position: 'sticky',
              top: 100,
              bgcolor: 'var(--bg-secondary)',
              backdropFilter: 'blur(10px)',
              border: `1px solid rgba(var(--primary-rgb), 0.2)`,
              boxShadow: `0 8px 32px rgba(var(--primary-rgb), 0.08)`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <ShoppingCart />
                <Typography variant="h6" fontWeight={600}>
                  {t('checkout.orderSummary')}
                </Typography>
              </Box>

              <List dense>
                {items.map((item) => (
                  <ListItem key={item.product.id} sx={{ px: 0 }}>
                    <ListItemText
                      primary={item.product.title}
                      secondary={t('cart.quantity', { quantity: item.quantity })}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                    <Typography variant="body2">
                      €{((item.product.zetta_price || item.product.price) * item.quantity).toFixed(2)}
                    </Typography>
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2, borderColor: 'var(--border-primary)' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>{t('checkout.subtotal')}</Typography>
                <Typography variant="body2">€{subtotal.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>{t('checkout.shipping')}</Typography>
                <Typography variant="body2">
                  {shipping === 0 ? (
                    <Chip label={t('checkout.free')} size="small" color="success" />
                  ) : (
                    `€${shipping.toFixed(2)}`
                  )}
                </Typography>
              </Box>

              <Divider sx={{ mb: 2, borderColor: 'var(--border-primary)' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>{t('checkout.total')}</Typography>
                <Typography variant="h6" fontWeight={700} color="primary">
                  €{total.toFixed(2)}
                </Typography>
              </Box>

              <Alert
                severity="info"
                icon={<Lock />}
                sx={{
                  bgcolor: 'var(--bg-hover)',
                  color: 'var(--info-color)',
                  border: `1px solid rgba(var(--primary-rgb), 0.2)`,
                  '& .MuiAlert-icon': {
                    color: 'var(--info-color)',
                  },
                }}
              >
                <Typography variant="caption">
                  {t('checkout.secureCheckoutPoweredByStripe')}
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default Checkout;