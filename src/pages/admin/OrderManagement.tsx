import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Collapse,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  InputAdornment,
  TablePagination,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  LocalShipping,
  CheckCircle,
  Cancel,
  AccessTime,
  Search,
  FilterList,
  Print,
  Email,
  Phone,
  LocationOn,
  ShoppingCart,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { Order, OrderItem } from '../../types';

// Date formatting helper
const formatDate = (dateString: string, format: string) => {
  const date = new Date(dateString);
  if (format === 'MMM dd, yyyy') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}, ${date.getFullYear()}`;
  } else if (format === 'HH:mm') {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  return dateString;
};

const OrderManagement: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          )
        `)
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      setError('Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExpandClick = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedOrder) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', selectedOrder.id);

      if (error) throw error;

      setOrders(orders.map(order =>
        order.id === selectedOrder.id
          ? { ...order, status: newStatus as Order['status'] }
          : order
      ));
      setSuccess('Order status updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Failed to update order status');
    }

    setStatusDialogOpen(false);
    setSelectedOrder(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AccessTime fontSize="small" />;
      case 'confirmed':
        return <CheckCircle fontSize="small" />;
      case 'shipped':
        return <LocalShipping fontSize="small" />;
      case 'delivered':
        return <CheckCircle fontSize="small" />;
      case 'cancelled':
        return <Cancel fontSize="small" />;
      default:
        return null;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return '#00ff88';
      case 'pending':
        return '#ffaa00';
      case 'failed':
        return '#ff3366';
      default:
        return '#666';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipping_address.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipping_address.phone?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !filterStatus || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const paginatedOrders = filteredOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
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
          Order Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track and manage customer orders
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Filters */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 3,
          bgcolor: 'rgba(15,15,25,0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search by order ID, customer name, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1, minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value as string)}
              startAdornment={<FilterList sx={{ mr: 1, color: 'text.secondary' }} />}
            >
              <MenuItem value="">All Orders</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Print />}
            sx={{
              borderColor: 'rgba(0,212,255,0.5)',
              color: '#00d4ff',
              '&:hover': {
                borderColor: '#00d4ff',
                bgcolor: 'rgba(0,212,255,0.1)',
              },
            }}
          >
            Export
          </Button>
        </Box>
      </Paper>

      {/* Orders Table */}
      <Paper 
        sx={{ 
          bgcolor: 'rgba(15,15,25,0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width={50} />
                    <TableCell>Order ID</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell>Payment</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedOrders.map((order) => (
                    <React.Fragment key={order.id}>
                      <TableRow hover>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleExpandClick(order.id)}
                          >
                            {expandedOrders.has(order.id) ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            #{order.id.slice(0, 8)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(order.created_at, 'MMM dd, yyyy')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(order.created_at, 'HH:mm')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {order.shipping_address.full_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {order.shipping_address.city}, {order.shipping_address.country}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={`${order.items?.length || 0} items`}
                            size="small"
                            icon={<ShoppingCart fontSize="small" />}
                            sx={{
                              bgcolor: 'rgba(0,212,255,0.1)',
                              color: '#00d4ff',
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" fontWeight={700}>
                            €{order.total_amount.toFixed(2)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Commission: €{order.commission_amount.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={order.payment_status}
                            size="small"
                            sx={{
                              bgcolor: `${getPaymentStatusColor(order.payment_status)}20`,
                              color: getPaymentStatusColor(order.payment_status),
                              border: `1px solid ${getPaymentStatusColor(order.payment_status)}50`,
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={order.status}
                            size="small"
                            color={getStatusColor(order.status) as any}
                            icon={getStatusIcon(order.status) || undefined}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setSelectedOrder(order);
                              setStatusDialogOpen(true);
                            }}
                            sx={{
                              borderColor: 'rgba(0,212,255,0.5)',
                              color: '#00d4ff',
                              '&:hover': {
                                borderColor: '#00d4ff',
                                bgcolor: 'rgba(0,212,255,0.1)',
                              },
                            }}
                          >
                            Update
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={9} sx={{ py: 0 }}>
                          <Collapse in={expandedOrders.has(order.id)} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 3 }}>
                              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                                {/* Order Items */}
                                <Box>
                                  <Typography variant="h6" gutterBottom>
                                    Order Items
                                  </Typography>
                                  <List>
                                    {order.items?.map((item: OrderItem) => (
                                      <ListItem key={item.id} sx={{ px: 0 }}>
                                        <ListItemAvatar>
                                          <Avatar
                                            variant="rounded"
                                            src={item.product?.images?.[0]}
                                            sx={{ bgcolor: 'rgba(0,212,255,0.1)' }}
                                          />
                                        </ListItemAvatar>
                                        <ListItemText
                                          primary={item.product?.title}
                                          secondary={`Quantity: ${item.quantity} × €${item.unit_price.toFixed(2)}`}
                                        />
                                        <Typography variant="body1" fontWeight={600}>
                                          €{item.total_price.toFixed(2)}
                                        </Typography>
                                      </ListItem>
                                    ))}
                                  </List>
                                </Box>

                                {/* Shipping Details */}
                                <Box>
                                  <Typography variant="h6" gutterBottom>
                                    Shipping Details
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <LocationOn sx={{ fontSize: 20, color: 'text.secondary' }} />
                                      <Typography variant="body2">
                                        {order.shipping_address.address_line1}
                                        {order.shipping_address.address_line2 && `, ${order.shipping_address.address_line2}`}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 3.5 }}>
                                      <Typography variant="body2">
                                        {order.shipping_address.city}, {order.shipping_address.postal_code}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 3.5 }}>
                                      <Typography variant="body2">
                                        {order.shipping_address.country}
                                      </Typography>
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Phone sx={{ fontSize: 20, color: 'text.secondary' }} />
                                      <Typography variant="body2">
                                        {order.shipping_address.phone}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Email sx={{ fontSize: 20, color: 'text.secondary' }} />
                                      <Typography variant="body2">
                                        {order.buyer_id}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Box>
                              </Box>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredOrders.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                borderTop: '1px solid rgba(255,255,255,0.1)',
              }}
            />
          </>
        )}
      </Paper>

      {/* Status Update Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: 'rgba(15,15,25,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={selectedOrder?.status || ''}
              label="New Status"
              onChange={(e) => setSelectedOrder(prev => prev ? { ...prev, status: e.target.value } : null)}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => handleStatusUpdate(selectedOrder?.status || '')} 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #00a1cc 0%, #007799 100%)',
              },
            }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderManagement;