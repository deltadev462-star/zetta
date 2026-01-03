import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Tooltip,
  TablePagination,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  Search,
  FilterList,
  Image,
  CheckCircle,
  Cancel,
  Upload,
  CloudUpload,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { productService } from '../../services/products';
import { Product } from '../../types';
import { useNavigate } from 'react-router-dom';

const ProductManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await productService.getProductsBySeller(user?.id || '');
      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, product: Product) => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    
    try {
      const { error } = await productService.deleteProduct(selectedProduct.id);
      if (error) throw error;
      
      setSuccess('Product deleted successfully');
      setProducts(products.filter(p => p.id !== selectedProduct.id));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Failed to delete product');
    }
    
    setDeleteDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleStatusToggle = async (product: Product) => {
    const newStatus = product.status === 'available' ? 'sold' : 'available';
    try {
      const { error } = await productService.updateProduct(product.id, { status: newStatus });
      if (error) throw error;
      
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, status: newStatus } : p
      ));
      setSuccess(`Product marked as ${newStatus}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Failed to update product status');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const paginatedProducts = filteredProducts.slice(
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'sold':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return '#00ff88';
      case 'good':
        return '#00d4ff';
      case 'fair':
        return '#ffaa00';
      default:
        return '#666';
    }
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
            Product Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your medical equipment catalog
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<CloudUpload />}
            sx={{
              borderColor: 'rgba(0,212,255,0.5)',
              color: '#00d4ff',
              '&:hover': {
                borderColor: '#00d4ff',
                bgcolor: 'rgba(0,212,255,0.1)',
              },
            }}
          >
            Import Catalog
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/admin/products/new')}
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
            placeholder="Search products..."
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
            <InputLabel>Category</InputLabel>
            <Select
              value={filterCategory}
              label="Category"
              onChange={(e) => setFilterCategory(e.target.value as string)}
              startAdornment={<FilterList sx={{ mr: 1, color: 'text.secondary' }} />}
            >
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="imaging">Imaging Equipment</MenuItem>
              <MenuItem value="surgical">Surgical Equipment</MenuItem>
              <MenuItem value="diagnostic">Diagnostic Equipment</MenuItem>
              <MenuItem value="monitoring">Monitoring Equipment</MenuItem>
              <MenuItem value="laboratory">Laboratory Equipment</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Products Table */}
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
                    <TableCell>Image</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Condition</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Zetta Price</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedProducts.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell>
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: 1,
                            overflow: 'hidden',
                            bgcolor: 'rgba(255,255,255,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {product.images && product.images[0] ? (
                            <img 
                              src={product.images[0]} 
                              alt={product.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <Image sx={{ color: 'text.secondary' }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" fontWeight={600}>
                          {product.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ 
                          maxWidth: 300,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {product.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={product.category} 
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(0,212,255,0.1)',
                            color: '#00d4ff',
                            border: '1px solid rgba(0,212,255,0.3)',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={product.condition} 
                          size="small"
                          sx={{ 
                            bgcolor: `${getConditionColor(product.condition)}20`,
                            color: getConditionColor(product.condition),
                            border: `1px solid ${getConditionColor(product.condition)}50`,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="text.secondary">
                          €{product.price.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body1" fontWeight={600}>
                          €{(product.zetta_price || product.price).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={product.status} 
                          size="small"
                          color={getStatusColor(product.status) as any}
                          icon={product.status === 'available' ? <CheckCircle /> : <Cancel />}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                              sx={{ color: '#00d4ff' }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Toggle Status">
                            <IconButton
                              size="small"
                              onClick={() => handleStatusToggle(product)}
                              sx={{ color: '#ffaa00' }}
                            >
                              {product.status === 'available' ? <Cancel fontSize="small" /> : <CheckCircle fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuClick(e, product)}
                          >
                            <MoreVert fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredProducts.length}
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

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            bgcolor: 'rgba(15,15,25,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        <MenuItem onClick={() => {
          navigate(`/admin/products/${selectedProduct?.id}/edit`);
          handleMenuClose();
        }}>
          <Edit sx={{ mr: 1, fontSize: 18 }} /> Edit Product
        </MenuItem>
        <MenuItem onClick={() => {
          navigate(`/admin/products/${selectedProduct?.id}/duplicate`);
          handleMenuClose();
        }}>
          <Upload sx={{ mr: 1, fontSize: 18 }} /> Duplicate
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: '#ff3366' }}>
          <Delete sx={{ mr: 1, fontSize: 18 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: 'rgba(15,15,25,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedProduct?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            sx={{
              bgcolor: '#ff3366',
              '&:hover': { bgcolor: '#cc0033' },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductManagement;