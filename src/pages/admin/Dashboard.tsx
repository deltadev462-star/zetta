import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  Button,
  Tab,
  Tabs,
  LinearProgress,
  Chip,
  Fade,
  Grow,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  ShoppingCart,
  AttachMoney,
  Inventory,
  People,
  Add,
  Refresh,
  ArrowUpward,
  ArrowDownward,
  LocalShipping,
  Edit,
  Delete,
  Visibility,
  Assessment,
  CheckCircle,
  Cancel,
  Schedule,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { DashboardStats, Order, Product } from '../../types';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/products';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  color: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color, delay = 0 }) => {
  return (
    <Grow in timeout={600 + delay}>
      <Card
        sx={{
          height: '100%',
          bgcolor: 'rgba(15,15,25,0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          transition: 'all 0.3s',
          '&:hover': {
            transform: 'translateY(-4px)',
            border: `1px solid ${color}30`,
            boxShadow: `0 12px 40px ${color}30`,
          },
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: `${color}20`,
                display: 'inline-flex',
              }}
            >
              <Box sx={{ fontSize: 28, color }}>
                {icon}
              </Box>
            </Box>
            {trend !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {trend >= 0 ? (
                  <ArrowUpward sx={{ fontSize: 16, color: '#00ff88' }} />
                ) : (
                  <ArrowDownward sx={{ fontSize: 16, color: '#ff3366' }} />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    color: trend >= 0 ? '#00ff88' : '#ff3366',
                    fontWeight: 600,
                  }}
                >
                  {Math.abs(trend)}%
                </Typography>
              </Box>
            )}
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </CardContent>
      </Card>
    </Grow>
  );
};

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState<DashboardStats>({
    total_sales: 0,
    total_orders: 0,
    pending_orders: 0,
    total_revenue: 0,
    commission_earned: 0,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && activeTab === 1) {
      fetchOrders();
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (user && activeTab === 2) {
      fetchProducts();
    }
  }, [user, activeTab]);

  const fetchDashboardStats = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      // Fetch orders for this seller
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('seller_id', user.id);

      if (ordersError) throw ordersError;

      // Calculate statistics
      const totalOrders = orders?.length || 0;
      const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const commissionEarned = orders?.reduce((sum, order) => sum + (order.commission_amount || 0), 0) || 0;

      // Fetch products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user.id);

      setStats({
        total_sales: productsCount || 0,
        total_orders: totalOrders,
        pending_orders: pendingOrders,
        total_revenue: totalRevenue,
        commission_earned: commissionEarned,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!user?.id) return;
    
    setOrdersLoading(true);
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(*)
          )
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setOrders(orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchProducts = async () => {
    if (!user?.id) return;
    
    setProductsLoading(true);
    try {
      const { data, error } = await productService.getProductsBySeller(user.id);
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffaa00';
      case 'confirmed': return '#00d4ff';
      case 'shipped': return '#00d4ff';
      case 'delivered': return '#00ff88';
      case 'cancelled': return '#ff3366';
      default: return '#888888';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-EU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const { error } = await productService.deleteProduct(productId);
        if (error) throw error;
        
        // Refresh products list
        fetchProducts();
        fetchDashboardStats();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      <Fade in timeout={600}>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography 
                variant="h3" 
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #ff0080 0%, #00d4ff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Seller Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {user ? `Welcome back, ${user?.profile?.full_name || user?.email}` : 'Welcome to Zetta Med Seller Portal'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <IconButton 
                onClick={fetchDashboardStats}
                sx={{ 
                  bgcolor: 'rgba(0,212,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(0,212,255,0.2)' },
                }}
              >
                <Refresh />
              </IconButton>
              {!user && (
                <Button
                  variant="contained"
                  onClick={() => navigate('/register')}
                  sx={{
                    background: 'linear-gradient(135deg, #ff0080 0%, #cc0066 100%)',
                    boxShadow: '0 4px 20px rgba(255,0,128,0.3)',
                    mr: 2,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 30px rgba(255,0,128,0.4)',
                    },
                  }}
                >
                  Register as Seller
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/admin/products/new')}
                disabled={!user}
                sx={{
                  background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                  boxShadow: '0 4px 20px rgba(0,212,255,0.3)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 30px rgba(0,212,255,0.4)',
                  },
                }}
              >
                Add Product
              </Button>
            </Box>
          </Box>

          {/* Stats Grid using Box */}
          {loading ? (
            <LinearProgress sx={{ mb: 4 }} />
          ) : (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                sm: 'repeat(2, 1fr)', 
                md: 'repeat(4, 1fr)' 
              }, 
              gap: 3, 
              mb: 4 
            }}>
              <StatCard
                title="Total Products"
                value={stats.total_sales}
                icon={<Inventory />}
                color="#00d4ff"
                delay={0}
              />
              <StatCard
                title="Total Orders"
                value={stats.total_orders}
                icon={<ShoppingCart />}
                trend={12}
                color="#ff0080"
                delay={100}
              />
              <StatCard
                title="Pending Orders"
                value={stats.pending_orders}
                icon={<People />}
                color="#ffaa00"
                delay={200}
              />
              <StatCard
                title="Revenue"
                value={`€${stats.total_revenue.toFixed(2)}`}
                icon={<AttachMoney />}
                trend={8}
                color="#00ff88"
                delay={300}
              />
            </Box>
          )}

          {/* Main Content Tabs */}
          <Paper
            sx={{
              bgcolor: 'rgba(15,15,25,0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                '& .MuiTab-root': {
                  fontWeight: 600,
                  '&.Mui-selected': {
                    color: '#00d4ff',
                  },
                },
                '& .MuiTabs-indicator': {
                  bgcolor: '#00d4ff',
                  height: 3,
                },
              }}
            >
              <Tab label="Overview" />
              <Tab label="Recent Orders" />
              <Tab label="Products" />
              <Tab label="Analytics" />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {activeTab === 0 && (
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                    Quick Actions
                  </Typography>
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { 
                      xs: '1fr', 
                      sm: 'repeat(2, 1fr)', 
                      md: 'repeat(3, 1fr)' 
                    }, 
                    gap: 2 
                  }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => navigate('/admin/products')}
                      sx={{
                        py: 2,
                        borderColor: 'rgba(0,212,255,0.5)',
                        color: '#00d4ff',
                        '&:hover': {
                          borderColor: '#00d4ff',
                          bgcolor: 'rgba(0,212,255,0.1)',
                        },
                      }}
                    >
                      Manage Products
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => navigate('/admin/orders')}
                      sx={{
                        py: 2,
                        borderColor: 'rgba(255,0,128,0.5)',
                        color: '#ff0080',
                        '&:hover': {
                          borderColor: '#ff0080',
                          bgcolor: 'rgba(255,0,128,0.1)',
                        },
                      }}
                    >
                      View Orders
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => navigate('/admin/reports')}
                      sx={{
                        py: 2,
                        borderColor: 'rgba(0,255,136,0.5)',
                        color: '#00ff88',
                        '&:hover': {
                          borderColor: '#00ff88',
                          bgcolor: 'rgba(0,255,136,0.1)',
                        },
                      }}
                    >
                      Generate Reports
                    </Button>
                  </Box>

                  <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
                    Commission Summary
                  </Typography>
                  <Card
                    sx={{
                      bgcolor: 'rgba(255,0,128,0.1)',
                      border: '1px solid rgba(255,0,128,0.3)',
                    }}
                  >
                    <CardContent>
                      <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
                        gap: 3, 
                        alignItems: 'center' 
                      }}>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            Total Commission Earned
                          </Typography>
                          <Typography variant="h3" sx={{ color: '#ff0080', fontWeight: 700 }}>
                            €{stats.commission_earned.toFixed(2)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Commission Rate
                          </Typography>
                          <Chip 
                            label="15% on all sales" 
                            sx={{ 
                              bgcolor: 'rgba(255,0,128,0.2)',
                              color: '#ff0080',
                              fontWeight: 600,
                            }} 
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              )}
              
              {activeTab === 1 && (
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                    Recent Orders
                  </Typography>
                  
                  {ordersLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : orders.length === 0 ? (
                    <Alert severity="info">No orders yet</Alert>
                  ) : (
                    <TableContainer component={Paper} sx={{ bgcolor: 'transparent' }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Order ID</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Customer</TableCell>
                            <TableCell>Items</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {orders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell>#{order.id.slice(0, 8)}</TableCell>
                              <TableCell>{formatDate(order.created_at)}</TableCell>
                              <TableCell>{order.shipping_address.full_name}</TableCell>
                              <TableCell>{order.items?.length || 0} items</TableCell>
                              <TableCell>€{order.total_amount.toFixed(2)}</TableCell>
                              <TableCell>
                                <Chip
                                  label={order.status}
                                  size="small"
                                  sx={{
                                    bgcolor: `${getStatusColor(order.status)}30`,
                                    color: getStatusColor(order.status),
                                    fontWeight: 600,
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <IconButton
                                  size="small"
                                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                                  sx={{ color: '#00d4ff' }}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              )}
              
              {activeTab === 2 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5">
                      My Products
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => navigate('/admin/products/new')}
                      sx={{
                        background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                        boxShadow: '0 4px 20px rgba(0,212,255,0.3)',
                      }}
                    >
                      Add Product
                    </Button>
                  </Box>
                  
                  {productsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : products.length === 0 ? (
                    <Alert severity="info">No products yet. Add your first product!</Alert>
                  ) : (
                    <Box sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        md: 'repeat(2, 1fr)',
                        lg: 'repeat(3, 1fr)'
                      },
                      gap: 3
                    }}>
                      {products.map((product) => (
                        <Box key={product.id}>
                          <Card
                            sx={{
                              height: '100%',
                              bgcolor: 'rgba(15,15,25,0.8)',
                              backdropFilter: 'blur(20px)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              transition: 'all 0.3s',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 40px rgba(0,212,255,0.3)',
                              },
                            }}
                          >
                            <CardContent>
                              <Box sx={{ mb: 2, height: 150, overflow: 'hidden', borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)' }}>
                                {product.images && product.images.length > 0 ? (
                                  <img
                                    src={product.images[0]}
                                    alt={product.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                    <Inventory sx={{ fontSize: 48, color: 'rgba(255,255,255,0.2)' }} />
                                  </Box>
                                )}
                              </Box>
                              
                              <Typography variant="h6" gutterBottom noWrap>
                                {product.title}
                              </Typography>
                              
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden' }}>
                                {product.description}
                              </Typography>
                              
                              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                <Chip
                                  label={product.category}
                                  size="small"
                                  sx={{ bgcolor: 'rgba(0,212,255,0.2)', color: '#00d4ff' }}
                                />
                                <Chip
                                  label={product.condition}
                                  size="small"
                                  sx={{ bgcolor: 'rgba(0,255,136,0.2)', color: '#00ff88' }}
                                />
                              </Stack>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ color: '#00d4ff' }}>
                                  €{product.zetta_price?.toFixed(2) || product.price.toFixed(2)}
                                </Typography>
                                <Chip
                                  label={product.status}
                                  size="small"
                                  icon={product.status === 'available' ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
                                  sx={{
                                    bgcolor: product.status === 'available' ? 'rgba(0,255,136,0.2)' : 'rgba(255,51,102,0.2)',
                                    color: product.status === 'available' ? '#00ff88' : '#ff3366',
                                  }}
                                />
                              </Box>
                              
                              <Stack direction="row" spacing={1}>
                                <Button
                                  size="small"
                                  startIcon={<Edit />}
                                  onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                                  sx={{ color: '#00d4ff' }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="small"
                                  startIcon={<Delete />}
                                  onClick={() => handleDeleteProduct(product.id)}
                                  sx={{ color: '#ff3366' }}
                                >
                                  Delete
                                </Button>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
              
              {activeTab === 3 && (
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                    Analytics & Reports
                  </Typography>
                  
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                    gap: 3
                  }}>
                    <Box>
                      <Card
                        sx={{
                          bgcolor: 'rgba(15,15,25,0.8)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Assessment sx={{ color: '#00d4ff', mr: 1 }} />
                            <Typography variant="h6">Sales Overview</Typography>
                          </Box>
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              This Month
                            </Typography>
                            <Typography variant="h4" sx={{ color: '#00ff88' }}>
                              €{stats.total_revenue.toFixed(2)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Orders</Typography>
                            <Typography variant="body2" fontWeight={600}>{stats.total_orders}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Average Order Value</Typography>
                            <Typography variant="body2" fontWeight={600}>
                              €{stats.total_orders > 0 ? (stats.total_revenue / stats.total_orders).toFixed(2) : '0.00'}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                    
                    <Box>
                      <Card
                        sx={{
                          bgcolor: 'rgba(15,15,25,0.8)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <LocalShipping sx={{ color: '#ff0080', mr: 1 }} />
                            <Typography variant="h6">Order Status</Typography>
                          </Box>
                          <Stack spacing={2}>
                            <Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Pending</Typography>
                                <Typography variant="body2" fontWeight={600}>{stats.pending_orders}</Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={stats.total_orders > 0 ? (stats.pending_orders / stats.total_orders) * 100 : 0}
                                sx={{
                                  bgcolor: 'rgba(255,170,0,0.2)',
                                  '& .MuiLinearProgress-bar': { bgcolor: '#ffaa00' }
                                }}
                              />
                            </Box>
                            <Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Completed</Typography>
                                <Typography variant="body2" fontWeight={600}>{stats.total_orders - stats.pending_orders}</Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={stats.total_orders > 0 ? ((stats.total_orders - stats.pending_orders) / stats.total_orders) * 100 : 0}
                                sx={{
                                  bgcolor: 'rgba(0,255,136,0.2)',
                                  '& .MuiLinearProgress-bar': { bgcolor: '#00ff88' }
                                }}
                              />
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Box>
                    
                    <Box sx={{ gridColumn: { xs: '1', md: 'span 2' } }}>
                      <Card
                        sx={{
                          bgcolor: 'rgba(15,15,25,0.8)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <TrendingUp sx={{ color: '#00ff88', mr: 1 }} />
                            <Typography variant="h6">Performance Metrics</Typography>
                          </Box>
                          <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                              xs: '1fr',
                              md: 'repeat(4, 1fr)'
                            },
                            gap: 3
                          }}>
                            <Box>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h3" sx={{ color: '#00d4ff', fontWeight: 700 }}>
                                  {products.length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Active Products
                                </Typography>
                              </Box>
                            </Box>
                            <Box>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h3" sx={{ color: '#ff0080', fontWeight: 700 }}>
                                  {stats.total_orders}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Total Orders
                                </Typography>
                              </Box>
                            </Box>
                            <Box>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h3" sx={{ color: '#ffaa00', fontWeight: 700 }}>
                                  {products.filter(p => p.status === 'available').length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Available Products
                                </Typography>
                              </Box>
                            </Box>
                            <Box>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h3" sx={{ color: '#00ff88', fontWeight: 700 }}>
                                  €{stats.commission_earned.toFixed(0)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Commission Earned
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                    
                    <Box sx={{ gridColumn: { xs: '1', md: 'span 2' } }}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => navigate('/admin/reports')}
                        sx={{
                          py: 2,
                          background: 'linear-gradient(135deg, #00ff88 0%, #00cc6f 100%)',
                          boxShadow: '0 4px 20px rgba(0,255,136,0.3)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 30px rgba(0,255,136,0.4)',
                          },
                        }}
                      >
                        View Detailed Reports
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>
        </Box>
      </Fade>
    </Container>
  );
};

export default AdminDashboard;