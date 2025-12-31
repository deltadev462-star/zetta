import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  IconButton,
  TextField,
  Divider,
  Stack,
  Alert,
  Fade,
  Zoom,
  Card,
  CardContent,
  Chip,
  
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  Delete,
  Add,
  Remove,
  ShoppingCartCheckout,
  ArrowBack,
  ShoppingCart,
  LocalOffer,
  Shield,
  LocalShipping,
  CreditCard,
  AutoAwesome,
  ShoppingBag,
  Clear,
} from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const [removingItem, setRemovingItem] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const handleQuantityChange = (productId: string, newQuantity: string) => {
    const quantity = parseInt(newQuantity);
    if (!isNaN(quantity) && quantity > 0 && quantity <= 99) {
      updateQuantity(productId, quantity);
    }
  };

  const handleRemoveItem = (productId: string) => {
    setRemovingItem(productId);
    setTimeout(() => {
      removeFromCart(productId);
      setRemovingItem(null);
    }, 300);
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  const subtotal = getCartTotal();
  const shipping = subtotal > 5000 ? 0 : 150;
  const tax = subtotal * 0.19; // 19% VAT
  const total = subtotal + shipping + tax;

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return 'var(--success-color)';
      case 'good':
        return 'var(--primary-color)';
      default:
        return 'var(--warning-color)';
    }
  };

  const getConditionRgb = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return 'var(--success-rgb)';
      case 'good':
        return 'var(--primary-rgb)';
      default:
        return 'var(--warning-rgb)';
    }
  };

  if (items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
        <Fade in timeout={600}>
          <Card
            sx={{
              bgcolor: 'var(--bg-secondary)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--border-primary)',
              p: 6,
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
            }}
          >
            <ShoppingCart 
              sx={{ 
                fontSize: 100,
                color: `rgba(var(--primary-rgb), 0.3)`,
                mb: 3,
                filter: `drop-shadow(0 0 30px rgba(var(--primary-rgb), 0.3))`,
              }} 
            />
            <Typography 
              variant="h4" 
              gutterBottom
              sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Your cart is empty
            </Typography>
            <Typography variant="body1" sx={{ color: 'var(--text-secondary)', mb: 4 }}>
              Discover amazing medical equipment in our marketplace
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/products')}
              startIcon={<ShoppingBag />}
              sx={{
                background: `linear-gradient(135deg, var(--primary-color) 0%, #0099cc 100%)`,
                boxShadow: `0 8px 32px rgba(var(--primary-rgb), 0.4)`,
                px: 4,
                py: 1.5,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 12px 40px rgba(var(--primary-rgb), 0.5)`,
                },
              }}
            >
              Start Shopping
            </Button>
          </Card>
        </Fade>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      <Fade in timeout={600}>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
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
              Shopping Cart
            </Typography>
            <Typography variant="body1" sx={{ color: 'var(--text-secondary)' }}>
              {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', lg: 'row' } }}>
            {/* Cart Items */}
            <Box sx={{ flex: 1 }}>
              <Stack spacing={2}>
                {items.map((item, index) => {
                  const price = item.product.zetta_price || item.product.price;
                  const total = price * item.quantity;
                  const isRemoving = removingItem === item.product.id;
                  
                  return (
                    <Zoom 
                      key={item.product.id} 
                      in={!isRemoving} 
                      timeout={300}
                      style={{ transitionDelay: `${index * 50}ms` }}
                    >
                      <Card
                        sx={{
                          bgcolor: 'var(--bg-secondary)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid var(--border-primary)',
                          transition: 'all 0.3s',
                          position: 'relative',
                          overflow: 'hidden',
                          boxShadow: 'var(--shadow-primary)',
                          '&:hover': {
                            border: '1px solid var(--border-active)',
                            transform: 'translateX(4px)',
                            boxShadow: `0 8px 30px rgba(var(--primary-rgb), 0.1)`,
                            '&::before': {
                              opacity: 1,
                            },
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            bottom: 0,
                            width: '4px',
                            background: `linear-gradient(180deg, var(--primary-color) 0%, var(--secondary-color) 100%)`,
                            opacity: 0,
                            transition: 'opacity 0.3s',
                          },
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', gap: 3 }}>
                            {/* Product Image */}
                            <Box
                              component="img"
                              src={item.product.images[0] || '/placeholder-product.png'}
                              alt={item.product.title}
                              sx={{
                                width: 120,
                                height: 120,
                                objectFit: 'cover',
                                borderRadius: 2,
                                border: '1px solid rgba(0,0,0,0.08)',
                              }}
                            />

                            {/* Product Details */}
                            <Box sx={{ flex: 1 }}>
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  fontWeight: 600,
                                  mb: 1,
                                  cursor: 'pointer',
                                  transition: 'color 0.3s',
                                  '&:hover': {
                                    color: 'var(--primary-color)',
                                  },
                                }}
                                onClick={() => navigate(`/products/${item.product.id}`)}
                              >
                                {item.product.title}
                              </Typography>
                              
                              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                <Chip 
                                  label={item.product.category} 
                                  size="small"
                                  sx={{
                                    bgcolor: 'var(--bg-active)',
                                    border: '1px solid var(--border-active)',
                                    color: 'var(--primary-color)',
                                  }}
                                />
                                <Chip
                                  label={item.product.condition}
                                  size="small"
                                  sx={{
                                    bgcolor: `rgba(${getConditionRgb(item.product.condition)}, 0.1)`,
                                    border: `1px solid rgba(${getConditionRgb(item.product.condition)}, 0.3)`,
                                    color: getConditionColor(item.product.condition),
                                  }}
                                />
                              </Stack>

                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                                {/* Quantity Controls */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                                    disabled={item.quantity <= 1}
                                    sx={{
                                      border: '1px solid var(--border-primary)',
                                      '&:hover': {
                                        border: '1px solid var(--primary-color)',
                                        bgcolor: 'var(--bg-active)',
                                      },
                                      '&:disabled': {
                                        opacity: 0.3,
                                      },
                                    }}
                                  >
                                    <Remove />
                                  </IconButton>
                                  <TextField
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => handleQuantityChange(item.product.id, e.target.value)}
                                    inputProps={{
                                      min: 1,
                                      max: 99,
                                      style: { textAlign: 'center' }
                                    }}
                                    sx={{ 
                                      width: '80px',
                                      '& .MuiOutlinedInput-root': {
                                        '& input': {
                                          textAlign: 'center',
                                          fontWeight: 600,
                                          fontSize: '1.1rem',
                                        },
                                      },
                                    }}
                                  />
                                  <IconButton
                                    size="small"
                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                    disabled={item.quantity >= 99}
                                    sx={{
                                      border: '1px solid var(--border-primary)',
                                      '&:hover': {
                                        border: '1px solid var(--primary-color)',
                                        bgcolor: 'var(--bg-active)',
                                      },
                                      '&:disabled': {
                                        opacity: 0.3,
                                      },
                                    }}
                                  >
                                    <Add />
                                  </IconButton>
                                </Box>

                                {/* Price */}
                                <Box sx={{ textAlign: 'right' }}>
                                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                                    {formatPrice(price)} each
                                  </Typography>
                                  <Typography 
                                    variant="h6" 
                                    sx={{
                                      fontWeight: 700,
                                      background: `linear-gradient(135deg, var(--primary-color) 0%, var(--success-color) 100%)`,
                                      WebkitBackgroundClip: 'text',
                                      WebkitTextFillColor: 'transparent',
                                    }}
                                  >
                                    {formatPrice(total)}
                                  </Typography>
                                </Box>

                                {/* Remove Button */}
                                <Tooltip title="Remove from cart" arrow>
                                  <IconButton
                                    onClick={() => handleRemoveItem(item.product.id)}
                                    sx={{
                                      color: 'var(--danger-color)',
                                      border: `1px solid rgba(var(--danger-rgb), 0.3)`,
                                      '&:hover': {
                                        bgcolor: `rgba(var(--danger-rgb), 0.1)`,
                                        border: '1px solid var(--danger-color)',
                                      },
                                    }}
                                  >
                                    <Delete />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Zoom>
                  );
                })}
              </Stack>

              {/* Cart Actions */}
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/products')}
                  startIcon={<ArrowBack />}
                  sx={{
                    borderColor: `rgba(var(--primary-rgb), 0.5)`,
                    color: 'var(--primary-color)',
                    '&:hover': {
                      borderColor: 'var(--primary-color)',
                      bgcolor: 'var(--bg-active)',
                    },
                  }}
                >
                  Continue Shopping
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={clearCart}
                  startIcon={<Clear />}
                  sx={{
                    borderColor: `rgba(var(--danger-rgb), 0.5)`,
                    color: 'var(--danger-color)',
                    '&:hover': {
                      borderColor: 'var(--danger-color)',
                      bgcolor: `rgba(var(--danger-rgb), 0.1)`,
                    },
                  }}
                >
                  Clear Cart
                </Button>
              </Box>
            </Box>

            {/* Order Summary */}
            <Box sx={{ width: { xs: '100%', lg: '400px' } }}>
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
                <CardContent sx={{ p: 4 }}>
                  <Typography 
                    variant="h5" 
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <AutoAwesome sx={{ color: 'var(--primary-color)' }} />
                    Order Summary
                  </Typography>
                  
                  <Box sx={{ mt: 3 }}>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: 'var(--text-secondary)' }}>Subtotal</Typography>
                        <Typography fontWeight={600}>{formatPrice(subtotal)}</Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocalShipping sx={{ fontSize: 18, color: 'var(--text-secondary)' }} />
                          <Typography sx={{ color: 'var(--text-secondary)' }}>Shipping</Typography>
                        </Box>
                        {shipping === 0 ? (
                          <Chip 
                            label="FREE" 
                            size="small" 
                            sx={{ 
                              bgcolor: 'var(--success-color)',
                              color: 'var(--text-primary)',
                              fontWeight: 700,
                            }} 
                          />
                        ) : (
                          <Typography fontWeight={600}>{formatPrice(shipping)}</Typography>
                        )}
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: 'var(--text-secondary)' }}>VAT (19%)</Typography>
                        <Typography fontWeight={600}>{formatPrice(tax)}</Typography>
                      </Box>
                    </Stack>
                    
                    {subtotal < 5000 && (
                      <Box sx={{ mt: 3 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={(subtotal / 5000) * 100}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'var(--bg-active)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              background: `linear-gradient(90deg, var(--primary-color) 0%, var(--success-color) 100%)`,
                            },
                          }}
                        />
                        <Typography variant="body2" sx={{ mt: 1, color: 'var(--text-secondary)' }}>
                          Add {formatPrice(5000 - subtotal)} more for free shipping
                        </Typography>
                      </Box>
                    )}
                    
                    <Divider sx={{ my: 3, borderColor: 'var(--border-primary)' }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                      <Typography variant="h6" fontWeight={700}>Total</Typography>
                      <Typography 
                        variant="h5" 
                        sx={{
                          fontWeight: 800,
                          background: `linear-gradient(135deg, var(--primary-color) 0%, var(--success-color) 100%)`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        {formatPrice(total)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Benefits */}
                  <Stack spacing={1.5} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Shield sx={{ fontSize: 20, color: 'var(--success-color)' }} />
                      <Typography variant="body2">Secure checkout</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <LocalOffer sx={{ fontSize: 20, color: 'var(--success-color)' }} />
                      <Typography variant="body2">Best price guarantee</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CreditCard sx={{ fontSize: 20, color: 'var(--success-color)' }} />
                      <Typography variant="body2">Multiple payment options</Typography>
                    </Box>
                  </Stack>

                  {!user && (
                    <Alert 
                      severity="info" 
                      sx={{ 
                        mb: 3,
                        bgcolor: 'var(--bg-hover)',
                        color: 'var(--info-color)',
                        border: `1px solid rgba(var(--primary-rgb), 0.2)`,
                        '& .MuiAlert-icon': {
                          color: 'var(--info-color)',
                        },
                      }}
                    >
                      Please sign in to proceed to checkout
                    </Alert>
                  )}

                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleCheckout}
                    startIcon={<ShoppingCartCheckout />}
                    sx={{
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      background: `linear-gradient(135deg, var(--primary-color) 0%, #0099cc 100%)`,
                      boxShadow: `0 8px 32px rgba(var(--primary-rgb), 0.4)`,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 12px 40px rgba(var(--primary-rgb), 0.5)`,
                      },
                    }}
                  >
                    {user ? 'Proceed to Checkout' : 'Sign In to Checkout'}
                  </Button>

                  <Typography
                    variant="body2"
                    sx={{ mt: 2, textAlign: 'center', color: 'var(--text-secondary)' }}
                  >
                    Powered by Stripe
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>
      </Fade>
    </Container>
  );
};

export default Cart;