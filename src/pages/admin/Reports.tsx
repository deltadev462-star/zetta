import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  CircularProgress,
  IconButton,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Download,
  CalendarToday,
  AttachMoney,
  ShoppingCart,
  People,
  Inventory,
  Assessment,
  Print,
  Refresh,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface ReportData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  averageOrderValue: number;
  conversionRate: number;
  topProducts: any[];
  revenueByMonth: any[];
  ordersByStatus: any[];
  commissionEarned: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  prefix?: string;
  suffix?: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, prefix = '', suffix = '', color }) => {
  return (
    <Card
      sx={{
        height: '100%',
        bgcolor: 'rgba(15,15,25,0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
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
                <TrendingUp sx={{ fontSize: 16, color: '#00ff88' }} />
              ) : (
                <TrendingDown sx={{ fontSize: 16, color: '#ff3366' }} />
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
          {prefix}{value}{suffix}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    end: new Date(),
  });
  const [reportData, setReportData] = useState<ReportData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    topProducts: [],
    revenueByMonth: [],
    ordersByStatus: [],
    commissionEarned: 0,
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Fetch orders data
      const { data: orders } = await supabase
        .from('orders')
        .select('*, order_items(*, product:products(*))')
        .eq('seller_id', user?.id)
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());

      // Fetch products data
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user?.id);

      // Calculate statistics
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      const totalProducts = productsCount || 0;
      
      // Get unique customers
      const uniqueCustomers = new Set(orders?.map(order => order.buyer_id) || []);
      const totalCustomers = uniqueCustomers.size;

      // Calculate average order value
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Calculate commission
      const commissionEarned = orders?.reduce((sum, order) => sum + (order.commission_amount || 0), 0) || 0;

      // Get top products
      const productSales: Record<string, { product: any; quantity: number; revenue: number }> = {};
      orders?.forEach(order => {
        order.order_items?.forEach((item: any) => {
          const productId = item.product_id;
          if (!productSales[productId]) {
            productSales[productId] = {
              product: item.product,
              quantity: 0,
              revenue: 0,
            };
          }
          productSales[productId].quantity += item.quantity;
          productSales[productId].revenue += item.total_price;
        });
      });

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Calculate revenue by month
      const revenueByMonth: Record<string, number> = {};
      orders?.forEach(order => {
        const month = new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        revenueByMonth[month] = (revenueByMonth[month] || 0) + order.total_amount;
      });

      // Orders by status
      const ordersByStatus = [
        { status: 'Pending', count: orders?.filter(o => o.status === 'pending').length || 0 },
        { status: 'Confirmed', count: orders?.filter(o => o.status === 'confirmed').length || 0 },
        { status: 'Shipped', count: orders?.filter(o => o.status === 'shipped').length || 0 },
        { status: 'Delivered', count: orders?.filter(o => o.status === 'delivered').length || 0 },
        { status: 'Cancelled', count: orders?.filter(o => o.status === 'cancelled').length || 0 },
      ];

      setReportData({
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        averageOrderValue,
        conversionRate: 0, // Would need visitor data to calculate
        topProducts,
        revenueByMonth: Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue })),
        ordersByStatus,
        commissionEarned,
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['Metric', 'Value'];
    const data = [
      ['Total Revenue', `€${reportData.totalRevenue.toFixed(2)}`],
      ['Total Orders', reportData.totalOrders],
      ['Average Order Value', `€${reportData.averageOrderValue.toFixed(2)}`],
      ['Total Products', reportData.totalProducts],
      ['Total Customers', reportData.totalCustomers],
      ['Commission Earned', `€${reportData.commissionEarned.toFixed(2)}`],
    ];

    const csv = [
      headers.join(','),
      ...data.map(row => row.join(',')),
    ].join('\n');

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zetta-med-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography 
            variant="h3" 
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #00d4ff 0%, #ff0080 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Reports & Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your sales performance and business metrics
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton 
            onClick={fetchReportData}
            sx={{ 
              bgcolor: 'rgba(0,212,255,0.1)',
              '&:hover': { bgcolor: 'rgba(0,212,255,0.2)' },
            }}
          >
            <Refresh />
          </IconButton>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExport}
            sx={{
              borderColor: 'rgba(0,212,255,0.5)',
              color: '#00d4ff',
              '&:hover': {
                borderColor: '#00d4ff',
                bgcolor: 'rgba(0,212,255,0.1)',
              },
            }}
          >
            Export Report
          </Button>
          <Button
            variant="contained"
            startIcon={<Print />}
            sx={{
              background: 'linear-gradient(135deg, #ff0080 0%, #cc0066 100%)',
              boxShadow: '0 4px 20px rgba(255,0,128,0.3)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 30px rgba(255,0,128,0.4)',
              },
            }}
          >
            Print
          </Button>
        </Box>
      </Box>

      {/* Date Range Selector */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 4,
          bgcolor: 'rgba(15,15,25,0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          <CalendarToday sx={{ color: '#00d4ff' }} />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={dateRange.start}
              onChange={(newValue) => newValue && setDateRange(prev => ({ ...prev, start: newValue }))}
              slotProps={{
                textField: {
                  size: 'small',
                },
              }}
            />
            <DatePicker
              label="End Date"
              value={dateRange.end}
              onChange={(newValue) => newValue && setDateRange(prev => ({ ...prev, end: newValue }))}
              slotProps={{
                textField: {
                  size: 'small',
                },
              }}
            />
          </LocalizationProvider>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Quick Select</InputLabel>
            <Select
              value=""
              label="Quick Select"
              onChange={(e) => {
                const value = e.target.value as string;
                const today = new Date();
                if (value === 'last7days') {
                  const start = new Date(today);
                  start.setDate(start.getDate() - 7);
                  setDateRange({
                    start,
                    end: new Date(),
                  });
                } else if (value === 'last30days') {
                  const start = new Date(today);
                  start.setDate(start.getDate() - 30);
                  setDateRange({
                    start,
                    end: new Date(),
                  });
                } else if (value === 'last90days') {
                  const start = new Date(today);
                  start.setDate(start.getDate() - 90);
                  setDateRange({
                    start,
                    end: new Date(),
                  });
                }
              }}
            >
              <MenuItem value="last7days">Last 7 Days</MenuItem>
              <MenuItem value="last30days">Last 30 Days</MenuItem>
              <MenuItem value="last90days">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Stats Overview */}
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
              title="Total Revenue"
              value={reportData.totalRevenue.toFixed(2)}
              icon={<AttachMoney />}
              trend={15}
              prefix="€"
              color="#00ff88"
            />
            <StatCard
              title="Total Orders"
              value={reportData.totalOrders}
              icon={<ShoppingCart />}
              trend={8}
              color="#00d4ff"
            />
            <StatCard
              title="Average Order Value"
              value={reportData.averageOrderValue.toFixed(2)}
              icon={<Assessment />}
              trend={-3}
              prefix="€"
              color="#ff0080"
            />
            <StatCard
              title="Commission Earned"
              value={reportData.commissionEarned.toFixed(2)}
              icon={<TrendingUp />}
              trend={12}
              prefix="€"
              color="#ffaa00"
            />
          </Box>

          {/* Detailed Reports */}
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
              <Tab label="Sales Overview" />
              <Tab label="Top Products" />
              <Tab label="Order Analysis" />
              <Tab label="Customer Insights" />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {activeTab === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Revenue Trend
                  </Typography>
                  {reportData.revenueByMonth.length > 0 ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Month</TableCell>
                            <TableCell align="right">Revenue</TableCell>
                            <TableCell align="right">Growth</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {reportData.revenueByMonth.map((item, index) => (
                            <TableRow key={item.month}>
                              <TableCell>{item.month}</TableCell>
                              <TableCell align="right">€{item.revenue.toFixed(2)}</TableCell>
                              <TableCell align="right">
                                {index > 0 && (
                                  <Chip
                                    label={`${((item.revenue / reportData.revenueByMonth[index - 1].revenue - 1) * 100).toFixed(0)}%`}
                                    size="small"
                                    sx={{
                                      bgcolor: item.revenue > reportData.revenueByMonth[index - 1].revenue
                                        ? 'rgba(0,255,136,0.2)'
                                        : 'rgba(255,51,102,0.2)',
                                      color: item.revenue > reportData.revenueByMonth[index - 1].revenue
                                        ? '#00ff88'
                                        : '#ff3366',
                                    }}
                                  />
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert severity="info">No revenue data available for the selected period</Alert>
                  )}
                </Box>
              )}
              
              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Best Performing Products
                  </Typography>
                  {reportData.topProducts.length > 0 ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell align="right">Units Sold</TableCell>
                            <TableCell align="right">Revenue</TableCell>
                            <TableCell align="right">% of Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {reportData.topProducts.map((item) => (
                            <TableRow key={item.product?.id}>
                              <TableCell>
                                <Typography variant="body2" fontWeight={500}>
                                  {item.product?.title || 'Unknown Product'}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">{item.quantity}</TableCell>
                              <TableCell align="right">€{item.revenue.toFixed(2)}</TableCell>
                              <TableCell align="right">
                                <LinearProgress
                                  variant="determinate"
                                  value={(item.revenue / reportData.totalRevenue) * 100}
                                  sx={{
                                    height: 8,
                                    borderRadius: 1,
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    '& .MuiLinearProgress-bar': {
                                      borderRadius: 1,
                                      bgcolor: '#00d4ff',
                                    },
                                  }}
                                />
                                <Typography variant="caption">
                                  {((item.revenue / reportData.totalRevenue) * 100).toFixed(1)}%
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert severity="info">No product sales data available</Alert>
                  )}
                </Box>
              )}
              
              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Orders by Status
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                    {reportData.ordersByStatus.map((item) => (
                      <Card key={item.status} sx={{ bgcolor: 'rgba(255,255,255,0.03)' }}>
                        <CardContent>
                          <Typography variant="h4" fontWeight={700}>
                            {item.count}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.status} Orders
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </Box>
              )}
              
              {activeTab === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Customer Metrics
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                    <Card sx={{ bgcolor: 'rgba(255,255,255,0.03)' }}>
                      <CardContent>
                        <People sx={{ fontSize: 40, color: '#00d4ff', mb: 2 }} />
                        <Typography variant="h4" fontWeight={700}>
                          {reportData.totalCustomers}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Customers
                        </Typography>
                      </CardContent>
                    </Card>
                    <Card sx={{ bgcolor: 'rgba(255,255,255,0.03)' }}>
                      <CardContent>
                        <Inventory sx={{ fontSize: 40, color: '#ff0080', mb: 2 }} />
                        <Typography variant="h4" fontWeight={700}>
                          {reportData.totalProducts}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Active Products
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>
        </>
      )}
    </Container>
  );
};

export default Reports;