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
import { useTranslation } from 'react-i18next';

const ProductManagement: React.FC = () => {
  const { t } = useTranslation();
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
      setError(t('common.error'));
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
      
      setSuccess(t('admin.productDeleted'));
      setProducts(products.filter(p => p.id !== selectedProduct.id));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(t('common.error'));
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
      setSuccess(t('admin.productMarkedAs', { status: newStatus }));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(t('admin.failedToUpdateStatus'));
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
      <Box sx={{
        mb: 4,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 2, md: 0 }
      }}>
        <Box>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' },
              fontWeight: 800,
              background: 'linear-gradient(135deg, #00d4ff 0%, #ff0080 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('admin.productManagement')}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            {t('admin.manageCatalogDescription')}
          </Typography>
        </Box>
        <Box sx={{
          display: 'flex',
          gap: { xs: 1, sm: 2 },
          width: { xs: '100%', sm: 'auto' },
          flexWrap: 'wrap'
        }}>
          <Button
            variant="outlined"
            startIcon={<CloudUpload />}
            size="small"
            sx={{
              flex: { xs: 1, sm: 'none' },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              borderColor: 'rgba(0,212,255,0.5)',
              color: '#00d4ff',
              '&:hover': {
                borderColor: '#00d4ff',
                bgcolor: 'rgba(0,212,255,0.1)',
              },
            }}
          >
            {t('admin.import')}
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/admin/products/new')}
            size="small"
            sx={{
              flex: { xs: 1, sm: 'none' },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
              boxShadow: '0 2px 8px rgba(0,212,255,0.2)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 3px 12px rgba(0,212,255,0.25)',
              },
            }}
          >
            {t('admin.addProduct')}
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
          bgcolor: 'oklch(98.5% 0.001 106.423)',
          borderRadius: '8px',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <TextField
            placeholder={t('admin.searchProducts')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{
              flex: { xs: 'none', sm: 1 },
              minWidth: { xs: '100%', sm: 300 }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }} size="small">
            <InputLabel>{t('products.category')}</InputLabel>
            <Select
              value={filterCategory}
              label={t('products.category')}
              onChange={(e) => setFilterCategory(e.target.value as string)}
              startAdornment={<FilterList sx={{ mr: 1, color: 'text.secondary' }} />}
            >
              <MenuItem value="">{t('products.allCategories')}</MenuItem>
              <MenuItem value="imaging">{t('productCategories.imagingEquipment')}</MenuItem>
              <MenuItem value="surgical">{t('productCategories.surgicalEquipment')}</MenuItem>
              <MenuItem value="diagnostic">{t('productCategories.diagnosticEquipment')}</MenuItem>
              <MenuItem value="monitoring">{t('productCategories.monitoringEquipment')}</MenuItem>
              <MenuItem value="laboratory">{t('productCategories.laboratoryEquipment')}</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Products Table */}
      <Paper
        sx={{
          bgcolor: 'oklch(98.5% 0.001 106.423)',
          borderRadius: '8px',
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: 80 }}>{t('admin.image')}</TableCell>
                    <TableCell sx={{ minWidth: 200 }}>{t('admin.product')}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, minWidth: 100 }}>{t('products.category')}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, minWidth: 100 }}>{t('products.condition')}</TableCell>
                    <TableCell align="right" sx={{ display: { xs: 'none', lg: 'table-cell' }, minWidth: 100 }}>{t('products.price')}</TableCell>
                    <TableCell align="right" sx={{ minWidth: 100 }}>{t('admin.zettaPrice')}</TableCell>
                    <TableCell sx={{ minWidth: 100 }}>{t('common.status')}</TableCell>
                    <TableCell align="center" sx={{ minWidth: 120 }}>{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedProducts.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell>
                        <Box
                          sx={{
                            width: { xs: 40, sm: 60 },
                            height: { xs: 40, sm: 60 },
                            borderRadius: '8px',
                            overflow: 'hidden',
                            bgcolor: 'rgba(255,255,255,0.02)',
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
                        <Typography
                          variant="body1"
                          fontWeight={600}
                          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        >
                          {product.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            maxWidth: { xs: 200, sm: 300 },
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: { xs: 'none', sm: 'block' },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}
                        >
                          {product.description}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
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
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
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
                      <TableCell align="right" sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                        <Typography variant="body2" color="text.secondary">
                          €{product.price.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body1"
                          fontWeight={600}
                          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        >
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
                          <Tooltip title={t('common.edit')}>
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                              sx={{ color: '#00d4ff' }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('admin.toggleStatus')}>
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
                borderTop: '1px solid',
                borderTopColor: 'divider',
                '.MuiTablePagination-toolbar': {
                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                  justifyContent: { xs: 'center', sm: 'flex-end' },
                  gap: { xs: 1, sm: 0 },
                },
                '.MuiTablePagination-selectLabel': {
                  display: { xs: 'none', sm: 'block' },
                },
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
            bgcolor: 'oklch(98.5% 0.001 106.423)',
            borderRadius: '8px',
          },
        }}
      >
        <MenuItem onClick={() => {
          navigate(`/admin/products/${selectedProduct?.id}/edit`);
          handleMenuClose();
        }}>
          <Edit sx={{ mr: 1, fontSize: 18 }} /> {t('admin.editProductAction')}
        </MenuItem>
        <MenuItem onClick={() => {
          navigate(`/admin/products/${selectedProduct?.id}/duplicate`);
          handleMenuClose();
        }}>
          <Upload sx={{ mr: 1, fontSize: 18 }} /> {t('admin.duplicate')}
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: '#ff3366' }}>
          <Delete sx={{ mr: 1, fontSize: 18 }} /> {t('admin.deleteAction')}
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: 'oklch(98.5% 0.001 106.423)',
            borderRadius: '8px',
          },
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          {t('admin.confirmDelete')}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            {t('admin.areYouSureDelete')} "{selectedProduct?.title}"? {t('admin.cannotBeUndone')}.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            sx={{
              bgcolor: '#ff3366',
              '&:hover': { bgcolor: '#cc0033' },
            }}
          >
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductManagement;