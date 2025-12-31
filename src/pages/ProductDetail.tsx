import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  ImageList,
  ImageListItem,
  Card,
  CardContent,
  Stack,
  IconButton,
  Fade,
  Zoom,
  alpha,
  useTheme,
  Tooltip,
  Rating,
} from '@mui/material';
import {
  ShoppingCart,
  ArrowBack,
  LocalShipping,
  VerifiedUser,
  Category,
  CheckCircle,
  ZoomIn,
  AutoAwesome,
  Shield,
  Speed,
  WorkspacePremium,
  Inventory,
  ContactSupport,
  Share,
  Favorite,
  FavoriteBorder,
} from '@mui/icons-material';
import { productService } from '../services/products';
import { Product } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const { addToCart, items } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageZoom, setImageZoom] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    if (!id) return;
    
    setLoading(true);
    setError('');

    try {
      const { data, error } = await productService.getProductById(id);
      if (error) {
        setError('Failed to load product details');
      } else if (data) {
        setProduct(data);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (product) {
      addToCart(product);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  const isInCart = () => {
    return items.some(item => item.product.id === product?.id);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return '#00ff88';
      case 'good':
        return '#00d4ff';
      default:
        return '#ffaa00';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress 
            size={60} 
            sx={{ 
              color: '#00d4ff',
              filter: 'drop-shadow(0 0 20px rgba(0,212,255,0.5))',
            }} 
          />
        </Box>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            bgcolor: 'rgba(255,51,102,0.1)',
            color: '#ff3366',
            border: '1px solid rgba(255,51,102,0.3)',
          }}
        >
          {error || 'Product not found'}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/products')}
          variant="outlined"
          sx={{
            borderColor: 'rgba(0,212,255,0.5)',
            color: '#00d4ff',
            '&:hover': {
              borderColor: '#00d4ff',
              bgcolor: 'rgba(0,212,255,0.1)',
            },
          }}
        >
          Back to Products
        </Button>
      </Container>
    );
  }

  const discountPercentage = product.zetta_price && product.price !== product.zetta_price
    ? Math.round(((product.price - product.zetta_price) / product.price) * 100)
    : 0;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      <Fade in timeout={600}>
        <Box>
          {/* Back Button */}
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/products')}
            sx={{ 
              mb: 3,
              color: 'rgba(255,255,255,0.7)',
              '&:hover': {
                color: '#00d4ff',
                bgcolor: 'rgba(0,212,255,0.1)',
              },
            }}
          >
            Back to Products
          </Button>

          <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
            {/* Image Gallery */}
            <Box sx={{ flex: { xs: '1', md: '0 0 50%' } }}>
              <Zoom in timeout={800}>
                <Box>
                  {/* Main Image */}
                  <Paper
                    elevation={0}
                    sx={{
                      position: 'relative',
                      mb: 2,
                      borderRadius: 3,
                      overflow: 'hidden',
                      bgcolor: 'rgba(15,15,25,0.6)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      cursor: 'zoom-in',
                      transition: 'all 0.3s',
                      '&:hover': {
                        border: '1px solid rgba(0,212,255,0.3)',
                        transform: 'scale(1.02)',
                      },
                    }}
                    onClick={() => setImageZoom(true)}
                  >
                    <Box
                      component="img"
                      src={product.images[selectedImage] || '/placeholder-product.png'}
                      alt={product.title}
                      sx={{
                        width: '100%',
                        height: 500,
                        objectFit: 'contain',
                        p: 3,
                      }}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: 16,
                        right: 16,
                        bgcolor: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'rgba(0,212,255,0.2)',
                          border: '1px solid #00d4ff',
                        },
                      }}
                    >
                      <ZoomIn />
                    </IconButton>
                  </Paper>

                  {/* Thumbnail Gallery */}
                  {product.images.length > 1 && (
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        overflowX: 'auto',
                        pb: 1,
                        '&::-webkit-scrollbar': {
                          height: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                          background: 'rgba(255,255,255,0.05)',
                          borderRadius: '3px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: 'rgba(0,212,255,0.5)',
                          borderRadius: '3px',
                          '&:hover': {
                            background: 'rgba(0,212,255,0.7)',
                          },
                        },
                      }}
                    >
                      {product.images.map((image, index) => (
                        <Box
                          key={index}
                          component="img"
                          src={image}
                          alt={`${product.title} ${index + 1}`}
                          onClick={() => setSelectedImage(index)}
                          sx={{
                            width: 100,
                            height: 100,
                            objectFit: 'cover',
                            borderRadius: 2,
                            cursor: 'pointer',
                            border: selectedImage === index 
                              ? '2px solid #00d4ff' 
                              : '2px solid transparent',
                            opacity: selectedImage === index ? 1 : 0.6,
                            transition: 'all 0.3s',
                            '&:hover': {
                              opacity: 1,
                              transform: 'scale(1.05)',
                              border: '2px solid rgba(0,212,255,0.5)',
                            },
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Zoom>
            </Box>

            {/* Product Info */}
            <Box sx={{ flex: { xs: '1', md: '0 0 50%' } }}>
              <Box>
                {/* Title and Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography 
                    variant="h3" 
                    component="h1"
                    sx={{
                      fontWeight: 700,
                      color: 'white',
                      flex: 1,
                    }}
                  >
                    {product.title}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      onClick={() => setIsFavorite(!isFavorite)}
                      sx={{
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: isFavorite ? '#ff0080' : 'rgba(255,255,255,0.5)',
                        '&:hover': {
                          border: '1px solid #ff0080',
                          bgcolor: 'rgba(255,0,128,0.1)',
                        },
                      }}
                    >
                      {isFavorite ? <Favorite /> : <FavoriteBorder />}
                    </IconButton>
                    <IconButton
                      sx={{
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'rgba(255,255,255,0.5)',
                        '&:hover': {
                          border: '1px solid #00d4ff',
                          bgcolor: 'rgba(0,212,255,0.1)',
                        },
                      }}
                    >
                      <Share />
                    </IconButton>
                  </Stack>
                </Box>

                {/* Rating and Reviews */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Rating 
                    value={4.5} 
                    precision={0.5} 
                    readOnly 
                    sx={{
                      '& .MuiRating-iconFilled': {
                        color: '#ffaa00',
                      },
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    (127 reviews)
                  </Typography>
                </Box>

                {/* Tags */}
                <Stack direction="row" spacing={1.5} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
                  <Chip 
                    icon={<Category />}
                    label={product.category} 
                    sx={{
                      bgcolor: 'rgba(0,212,255,0.1)',
                      border: '1px solid rgba(0,212,255,0.3)',
                      color: '#00d4ff',
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    label={product.condition}
                    sx={{
                      bgcolor: alpha(getConditionColor(product.condition), 0.1),
                      border: `1px solid ${alpha(getConditionColor(product.condition), 0.3)}`,
                      color: getConditionColor(product.condition),
                      fontWeight: 600,
                    }}
                  />
                  {product.warranty_duration && (
                    <Chip
                      icon={<Shield />}
                      label={`${product.warranty_duration} months warranty`}
                      sx={{
                        bgcolor: 'rgba(255,0,128,0.1)',
                        border: '1px solid rgba(255,0,128,0.3)',
                        color: '#ff0080',
                        fontWeight: 600,
                      }}
                    />
                  )}
                  {product.status === 'available' && (
                    <Chip
                      icon={<Inventory />}
                      label="In Stock"
                      sx={{
                        bgcolor: 'rgba(0,255,136,0.1)',
                        border: '1px solid rgba(0,255,136,0.3)',
                        color: '#00ff88',
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Stack>

                {/* Price Section */}
                <Card
                  sx={{
                    mb: 4,
                    bgcolor: 'rgba(0,212,255,0.05)',
                    border: '1px solid rgba(0,212,255,0.2)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                      <Typography 
                        variant="h2" 
                        sx={{
                          fontWeight: 800,
                          background: 'linear-gradient(135deg, #00d4ff 0%, #00ff88 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        {formatPrice(product.zetta_price || product.price)}
                      </Typography>
                      {discountPercentage > 0 && (
                        <>
                          <Typography 
                            variant="h5" 
                            sx={{ 
                              textDecoration: 'line-through',
                              color: 'text.secondary',
                              opacity: 0.6,
                            }}
                          >
                            {formatPrice(product.price)}
                          </Typography>
                          <Chip
                            label={`-${discountPercentage}%`}
                            sx={{
                              bgcolor: '#ff0080',
                              color: 'white',
                              fontWeight: 700,
                              fontSize: '0.9rem',
                            }}
                          />
                        </>
                      )}
                    </Box>
                  </CardContent>
                </Card>

                {/* Description */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" gutterBottom sx={{ color: '#00d4ff', mb: 2 }}>
                    Description
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'text.secondary',
                      lineHeight: 1.8,
                    }}
                  >
                    {product.description}
                  </Typography>
                </Box>

                {/* Features */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" gutterBottom sx={{ color: '#00d4ff', mb: 2 }}>
                    Key Features
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Speed sx={{ color: '#00ff88', fontSize: 30 }} />
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Condition
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {product.condition.charAt(0).toUpperCase() + product.condition.slice(1)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <VerifiedUser sx={{ color: '#00ff88', fontSize: 30 }} />
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Verified
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            Quality Assured
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <LocalShipping sx={{ color: '#00ff88', fontSize: 30 }} />
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Shipping
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            Free over €5,000
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <WorkspacePremium sx={{ color: '#00ff88', fontSize: 30 }} />
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Warranty
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {product.warranty_duration || 'Standard'} months
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Action Buttons */}
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={
                      justAdded || isInCart() ? (
                        <CheckCircle />
                      ) : (
                        <ShoppingCart />
                      )
                    }
                    onClick={handleAddToCart}
                    disabled={product.status !== 'available'}
                    sx={{
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      background: isInCart() 
                        ? 'linear-gradient(135deg, #00ff88 0%, #00cc55 100%)'
                        : 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                      boxShadow: isInCart()
                        ? '0 8px 32px rgba(0,255,136,0.4)'
                        : '0 8px 32px rgba(0,212,255,0.4)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: isInCart()
                          ? '0 12px 40px rgba(0,255,136,0.5)'
                          : '0 12px 40px rgba(0,212,255,0.5)',
                      },
                      '&:disabled': {
                        background: 'rgba(128,128,128,0.3)',
                      },
                    }}
                  >
                    {justAdded
                      ? 'Added to Cart!'
                      : isInCart()
                      ? 'Already in Cart'
                      : product.status === 'available'
                      ? 'Add to Cart'
                      : 'Out of Stock'}
                  </Button>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    {user && (
                      <Button
                        variant="outlined"
                        size="large"
                        fullWidth
                        startIcon={<LocalShipping />}
                        onClick={() => navigate('/logistics')}
                        sx={{
                          py: 1.5,
                          borderColor: 'rgba(255,0,128,0.5)',
                          color: '#ff0080',
                          '&:hover': {
                            borderColor: '#ff0080',
                            bgcolor: 'rgba(255,0,128,0.1)',
                          },
                        }}
                      >
                        Request Logistics
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      size="large"
                      fullWidth
                      startIcon={<ContactSupport />}
                      sx={{
                        py: 1.5,
                        borderColor: 'rgba(0,212,255,0.5)',
                        color: '#00d4ff',
                        '&:hover': {
                          borderColor: '#00d4ff',
                          bgcolor: 'rgba(0,212,255,0.1)',
                        },
                      }}
                    >
                      Contact Support
                    </Button>
                  </Stack>
                </Stack>

                {/* Trust Badges */}
                <Box 
                  sx={{ 
                    mt: 4,
                    p: 3,
                    borderRadius: 2,
                    bgcolor: 'rgba(0,255,136,0.05)',
                    border: '1px solid rgba(0,255,136,0.2)',
                  }}
                >
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <AutoAwesome sx={{ color: '#00ff88' }} />
                      <Typography variant="body2">
                        Quality verified by Zetta Med experts
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Shield sx={{ color: '#00ff88' }} />
                      <Typography variant="body2">
                        Secure payment & buyer protection
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <LocalShipping sx={{ color: '#00ff88' }} />
                      <Typography variant="body2">
                        Fast & reliable shipping worldwide
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Additional Information */}
          <Box sx={{ mt: 8 }}>
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{
                fontWeight: 700,
                mb: 4,
                background: 'linear-gradient(135deg, #00d4ff 0%, #ff0080 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Additional Information
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
              <Box>
                <Card 
                  sx={{ 
                    height: '100%',
                    bgcolor: 'rgba(15,15,25,0.6)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.3s',
                    '&:hover': {
                      border: '1px solid rgba(0,212,255,0.3)',
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Category sx={{ color: '#00d4ff', fontSize: 30 }} />
                      <Typography variant="h6">Product Details</Typography>
                    </Box>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Category
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {product.category}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Condition
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {product.condition.charAt(0).toUpperCase() + product.condition.slice(1)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Availability
                        </Typography>
                        <Typography variant="body1" fontWeight={600} color={product.status === 'available' ? '#00ff88' : 'text.secondary'}>
                          {product.status === 'available' ? 'In Stock' : 'Out of Stock'}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>

              <Box>
                <Card 
                  sx={{ 
                    height: '100%',
                    bgcolor: 'rgba(15,15,25,0.6)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.3s',
                    '&:hover': {
                      border: '1px solid rgba(255,0,128,0.3)',
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Shield sx={{ color: '#ff0080', fontSize: 30 }} />
                      <Typography variant="h6">Warranty & Support</Typography>
                    </Box>
                    <Typography paragraph>
                      {product.warranty_duration 
                        ? `This product comes with ${product.warranty_duration} months of comprehensive warranty coverage.`
                        : 'Standard warranty applies to this product.'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Our expert support team is available 24/7 to assist with any questions or concerns.
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              <Box>
                <Card 
                  sx={{ 
                    height: '100%',
                    bgcolor: 'rgba(15,15,25,0.6)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.3s',
                    '&:hover': {
                      border: '1px solid rgba(0,255,136,0.3)',
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <VerifiedUser sx={{ color: '#00ff88', fontSize: 30 }} />
                      <Typography variant="h6">Quality Assurance</Typography>
                    </Box>
                    <Typography paragraph>
                      All equipment undergoes rigorous testing and certification by our medical equipment specialists.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      We guarantee authenticity and quality for every product in our marketplace.
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Box>
        </Box>
      </Fade>
    </Container>
  );
};

export default ProductDetail;