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
  Chip,
  IconButton,
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
  Tabs,
  Tab,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  InputAdornment,
  TablePagination,
  ToggleButtonGroup,
  ToggleButton,
  Badge,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  ShoppingCart,
  TrendingUp,
  Search,
  FilterList,
  Edit,
  Send,
  Campaign,
  Groups,
  PersonAdd,
  Star,
  StarBorder,
  CheckCircle,
  Cancel,
  ViewList,
  ViewModule,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { emailService } from '../../services/email';
import { useTranslation } from 'react-i18next';

interface Customer {
  id: string;
  email: string;
  profile: any;
  orders: any[];
  totalSpent: number;
  lastOrderDate?: string;
  tags: string[];
  notes?: string;
  isVip: boolean;
  created_at: string;
}

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  recipients: string[];
  status: 'draft' | 'scheduled' | 'sent';
  sent_at?: string;
  open_rate?: number;
  click_rate?: number;
}

const CRM: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    subject: '',
    content: '',
    recipients: [] as string[],
  });

  useEffect(() => {
    fetchCustomers();
    fetchCampaigns();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // Fetch all orders with buyer information
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          buyer_profile:user_profiles!buyer_id (*),
          order_items (*)
        `)
        .eq('seller_id', user?.id);

      if (ordersError) throw ordersError;

      // Group by customer
      const customerMap = new Map<string, Customer>();

      orders?.forEach(order => {
        const customerId = order.buyer_id;
        const existing: Customer = customerMap.get(customerId) || {
          id: customerId,
          email: order.buyer_profile?.email || '',
          profile: order.buyer_profile,
          orders: [] as any[],
          totalSpent: 0,
          tags: [] as string[],
          isVip: false,
          created_at: order.created_at,
          lastOrderDate: undefined,
          notes: undefined,
        };

        existing.orders.push(order);
        existing.totalSpent += order.total_amount;
        existing.lastOrderDate = order.created_at;

        // Auto-tag based on spending
        if (existing.totalSpent > 10000 && !existing.tags.includes('VIP')) {
          existing.tags.push('VIP');
          existing.isVip = true;
        }
        if (existing.orders.length > 5 && !existing.tags.includes('Frequent Buyer')) {
          existing.tags.push('Frequent Buyer');
        }

        customerMap.set(customerId, existing);
      });

      setCustomers(Array.from(customerMap.values()));
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      // Mock campaigns data
      const mockCampaigns: EmailCampaign[] = [
        {
          id: '1',
          name: 'Spring Sale Campaign',
          subject: '30% Off Medical Equipment - Spring Sale',
          content: 'Check out our latest deals on refurbished medical equipment...',
          recipients: ['customer1@example.com', 'customer2@example.com'],
          status: 'sent',
          sent_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          open_rate: 45.5,
          click_rate: 12.3,
        },
        {
          id: '2',
          name: 'New Product Launch',
          subject: 'Introducing Our Latest Medical Equipment',
          content: 'We are excited to announce our new line of products...',
          recipients: [],
          status: 'draft',
        },
      ];
      setCampaigns(mockCampaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toggleCustomerVip = async (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const newVipStatus = !customer.isVip;
    const newTags = newVipStatus 
      ? [...customer.tags, 'VIP'].filter((tag, index, self) => self.indexOf(tag) === index)
      : customer.tags.filter(tag => tag !== 'VIP');

    setCustomers(customers.map(c => 
      c.id === customerId 
        ? { ...c, isVip: newVipStatus, tags: newTags }
        : c
    ));
  };

  const sendCampaign = async () => {
    try {
      // Send to selected recipients
      await emailService.sendBatchEmails(
        campaignForm.recipients,
        campaignForm.subject,
        campaignForm.content
      );

      // Update campaign status
      const newCampaign: EmailCampaign = {
        id: Date.now().toString(),
        ...campaignForm,
        status: 'sent',
        sent_at: new Date().toISOString(),
        open_rate: 0,
        click_rate: 0,
      };

      setCampaigns([...campaigns, newCampaign]);
      setCampaignDialogOpen(false);
      setCampaignForm({ name: '', subject: '', content: '', recipients: [] });
    } catch (error) {
      console.error('Error sending campaign:', error);
    }
  };

  const getCustomerSegments = () => {
    const segments = [
      {
        name: 'All Customers',
        count: customers.length,
        icon: <Groups />,
        color: '#00d4ff',
      },
      {
        name: 'VIP Customers',
        count: customers.filter(c => c.isVip).length,
        icon: <Star />,
        color: '#ff0080',
      },
      {
        name: 'Frequent Buyers',
        count: customers.filter(c => c.tags.includes('Frequent Buyer')).length,
        icon: <TrendingUp />,
        color: '#00ff88',
      },
      {
        name: 'New Customers',
        count: customers.filter(c => {
          const daysSinceCreated = (Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceCreated <= 30;
        }).length,
        icon: <PersonAdd />,
        color: '#ffaa00',
      },
    ];
    return segments;
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = !searchQuery || 
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.profile?.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = !filterTag || customer.tags.includes(filterTag);
    
    return matchesSearch && matchesTag;
  });

  const paginatedCustomers = filteredCustomers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      {/* Header */}
      <Box sx={{
        mb: 4,
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 2, md: 0 },
        justifyContent: { xs: 'flex-start', md: 'space-between' },
        alignItems: { xs: 'stretch', md: 'center' }
      }}>
        <Box>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 800,
              background: 'linear-gradient(135deg, #ff0080 0%, #00d4ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('admin.crmAndMarketing')}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            {t('admin.manageCustomersAndMarketingCampaigns')}
          </Typography>
        </Box>
        <Box sx={{
          display: 'flex',
          gap: { xs: 1, sm: 2 },
          flexDirection: { xs: 'column', sm: 'row' },
          width: { xs: '100%', sm: 'auto' }
        }}>
          <Button
            variant="outlined"
            startIcon={<PersonAdd />}
            fullWidth
            sx={{
              borderColor: 'rgba(0,212,255,0.5)',
              color: '#00d4ff',
              '&:hover': {
                borderColor: '#00d4ff',
                bgcolor: 'rgba(0,212,255,0.1)',
              },
            }}
          >
            {t('admin.addCustomer')}
          </Button>
          <Button
            variant="contained"
            startIcon={<Campaign />}
            onClick={() => setCampaignDialogOpen(true)}
            fullWidth
            sx={{
              background: 'linear-gradient(135deg, #ff0080 0%, #cc0066 100%)',
              boxShadow: '0 2px 8px rgba(255,0,128,0.2)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 3px 12px rgba(255,0,128,0.25)',
              },
            }}
          >
            {t('admin.newCampaign')}
          </Button>
        </Box>
      </Box>

      {/* Customer Segments */}
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
        {getCustomerSegments().map((segment) => (
          <Card
            key={segment.name}
            sx={{
              bgcolor: 'oklch(98.5% 0.001 106.423)',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: 'divider',
              cursor: 'pointer',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                borderColor: `${segment.color}50`,
                boxShadow: `0 4px 12px ${segment.color}15`,
              },
            }}
            onClick={() => setFilterTag(segment.name === 'All Customers' ? '' : segment.name)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: `${segment.color}20`,
                    display: 'inline-flex',
                  }}
                >
                  <Box sx={{ fontSize: 28, color: segment.color }}>
                    {segment.icon}
                  </Box>
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  {segment.count}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {segment.name}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Main Content */}
      <Paper
        sx={{
          bgcolor: 'oklch(98.5% 0.001 106.423)',
          borderRadius: '8px',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            '& .MuiTab-root': {
              fontWeight: 600,
              minWidth: { xs: 'auto', sm: 120 },
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
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
          <Tab label={`Customers (${customers.length})`} />
          <Tab label={`Campaigns (${campaigns.length})`} />
          <Tab label="Analytics" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Box>
              {/* Filters */}
              <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                mb: 3,
                alignItems: { xs: 'stretch', sm: 'center' }
              }}>
                <TextField
                  placeholder={t('admin.searchCustomers')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ flex: 1 }}
                  fullWidth
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <Box sx={{
                  display: 'flex',
                  gap: 1,
                  flexDirection: { xs: 'row', sm: 'row' },
                  width: { xs: '100%', sm: 'auto' }
                }}>
                  <FormControl sx={{
                    minWidth: { xs: '160px', sm: 200 },
                    flex: { xs: 1, sm: 0 }
                  }}>
                    <InputLabel>{t('admin.filterByTag')}</InputLabel>
                    <Select
                      value={filterTag}
                      label="Filter by Tag"
                      onChange={(e) => setFilterTag(e.target.value as string)}
                      startAdornment={<FilterList sx={{ mr: 1, color: 'text.secondary' }} />}
                    >
                      <MenuItem value="">{t('admin.allCustomers')}</MenuItem>
                      <MenuItem value="VIP">{t('admin.vip')}</MenuItem>
                      <MenuItem value="Frequent Buyer">{t('admin.frequentBuyer')}</MenuItem>
                    </Select>
                  </FormControl>
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(_e, newMode) => newMode && setViewMode(newMode)}
                    size="small"
                    sx={{ display: { xs: 'none', sm: 'flex' } }}
                  >
                    <ToggleButton value="list">
                      <ViewList />
                    </ToggleButton>
                    <ToggleButton value="grid">
                      <ViewModule />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Box>

              {/* Customer List/Grid */}
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : viewMode === 'list' ? (
                <>
                  <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table sx={{ minWidth: { xs: 600, sm: 750 } }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('admin.customer')}</TableCell>
                          <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{t('admin.contact')}</TableCell>
                          <TableCell align="right">{t('admin.totalSpent')}</TableCell>
                          <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>{t('nav.orders')}</TableCell>
                          <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{t('admin.tags')}</TableCell>
                          <TableCell align="center">{t('common.actions')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedCustomers.map((customer) => (
                          <TableRow key={customer.id} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                                <Avatar sx={{
                                  bgcolor: customer.isVip ? '#ff0080' : 'rgba(0,212,255,0.2)',
                                  width: { xs: 32, sm: 40 },
                                  height: { xs: 32, sm: 40 }
                                }}>
                                  <Person fontSize="small" />
                                </Avatar>
                                <Box>
                                  <Typography
                                    variant="body2"
                                    fontWeight={600}
                                    sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                                  >
                                    {customer.profile?.full_name || 'Customer'}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                      display: { xs: 'none', sm: 'block' }
                                    }}
                                  >
                                    {customer.profile?.company_name || 'Individual'}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Email sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="caption">
                                    {customer.email || 'N/A'}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Phone sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="caption">
                                    {customer.profile?.phone || 'N/A'}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body1"
                                fontWeight={700}
                                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                              >
                                €{customer.totalSpent.toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                              <Badge badgeContent={customer.orders.length} color="primary">
                                <ShoppingCart fontSize="small" />
                              </Badge>
                            </TableCell>
                            <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {customer.tags.map((tag) => (
                                  <Chip
                                    key={tag}
                                    label={tag}
                                    size="small"
                                    sx={{
                                      bgcolor: tag === 'VIP' ? 'rgba(255,0,128,0.2)' : 'rgba(0,212,255,0.2)',
                                      color: tag === 'VIP' ? '#ff0080' : '#00d4ff',
                                      border: tag === 'VIP' ? '1px solid rgba(255,0,128,0.3)' : '1px solid rgba(0,212,255,0.3)',
                                      fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                    }}
                                  />
                                ))}
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                onClick={() => toggleCustomerVip(customer.id)}
                                sx={{ color: customer.isVip ? '#ff0080' : 'text.secondary' }}
                              >
                                {customer.isVip ? <Star /> : <StarBorder />}
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setCustomerDialogOpen(true);
                                }}
                                sx={{ color: '#00d4ff' }}
                              >
                                <Edit />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredCustomers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{
                      borderTop: '1px solid rgba(255,255,255,0.1)',
                    }}
                  />
                </>
              ) : (
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { 
                    xs: '1fr', 
                    sm: 'repeat(2, 1fr)', 
                    md: 'repeat(3, 1fr)',
                    lg: 'repeat(4, 1fr)',
                  }, 
                  gap: 3 
                }}>
                  {paginatedCustomers.map((customer) => (
                    <Card
                      key={customer.id}
                      sx={{
                        bgcolor: 'oklch(98.5% 0.001 106.423)',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 4px 12px rgba(0,212,255,0.1)',
                        },
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Avatar sx={{ bgcolor: customer.isVip ? '#ff0080' : 'rgba(0,212,255,0.2)' }}>
                            <Person />
                          </Avatar>
                          <IconButton
                            size="small"
                            onClick={() => toggleCustomerVip(customer.id)}
                            sx={{ color: customer.isVip ? '#ff0080' : 'text.secondary' }}
                          >
                            {customer.isVip ? <Star /> : <StarBorder />}
                          </IconButton>
                        </Box>
                        <Typography variant="h6" gutterBottom>
                          {customer.profile?.full_name || 'Customer'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {customer.email}
                        </Typography>
                        <Box sx={{ mt: 2, mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            {t('admin.totalSpent')}
                          </Typography>
                          <Typography variant="h5" fontWeight={700}>
                            €{customer.totalSpent.toFixed(2)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {customer.tags.map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              sx={{
                                bgcolor: tag === 'VIP' ? 'rgba(255,0,128,0.2)' : 'rgba(0,212,255,0.2)',
                                color: tag === 'VIP' ? '#ff0080' : '#00d4ff',
                                border: tag === 'VIP' ? '1px solid rgba(255,0,128,0.3)' : '1px solid rgba(0,212,255,0.3)',
                              }}
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
              >
                {t('admin.emailCampaigns')}
              </Typography>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: { xs: 500, sm: 650 } }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('admin.campaignName')}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{t('admin.subject')}</TableCell>
                      <TableCell>{t('admin.recipients')}</TableCell>
                      <TableCell>{t('common.status')}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{t('admin.performance')}</TableCell>
                      <TableCell align="center">{t('common.actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                          >
                            {campaign.name}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>{campaign.subject}</TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>{campaign.recipients.length}</TableCell>
                        <TableCell>
                          <Chip
                            label={campaign.status}
                            size="small"
                            color={campaign.status === 'sent' ? 'success' : 'default'}
                            icon={campaign.status === 'sent' ? <CheckCircle /> : undefined}
                            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                          />
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                          {campaign.status === 'sent' && (
                            <Box>
                              <Typography variant="caption" display="block">
                                Open Rate: {campaign.open_rate}%
                              </Typography>
                              <Typography variant="caption" display="block">
                                Click Rate: {campaign.click_rate}%
                              </Typography>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Edit />}
                            sx={{
                              borderColor: 'rgba(0,212,255,0.5)',
                              color: '#00d4ff',
                              '&:hover': {
                                borderColor: '#00d4ff',
                                bgcolor: 'rgba(0,212,255,0.1)',
                              },
                            }}
                          >
                            {t('common.edit')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {t('admin.customerAnalytics')}
              </Typography>
              <Alert severity="info" sx={{ mb: 3, borderRadius: '8px' }}>
                {t('admin.detailedAnalyticsComingSoon')}
              </Alert>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Card sx={{
                  bgcolor: 'oklch(98.5% 0.001 106.423)',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: 'divider',
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('admin.customerLifetimeValue')}
                    </Typography>
                    <Typography variant="h3" fontWeight={700} color="primary">
                      €{(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length || 0).toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('admin.averagePerCustomer')}
                    </Typography>
                  </CardContent>
                </Card>
                <Card sx={{
                  bgcolor: 'oklch(98.5% 0.001 106.423)',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: 'divider',
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('admin.repeatPurchaseRate')}
                    </Typography>
                    <Typography variant="h3" fontWeight={700} color="secondary.main">
                      {((customers.filter(c => c.orders.length > 1).length / customers.length) * 100 || 0).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('admin.customersWithMultipleOrders')}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Campaign Dialog */}
      <Dialog
        open={campaignDialogOpen}
        onClose={() => setCampaignDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '8px',
            bgcolor: 'oklch(98.5% 0.001 106.423)',
          },
        }}
      >
        <DialogTitle>{t('admin.createEmailCampaign')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label={t('admin.campaignName')}
              value={campaignForm.name}
              onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label={t('admin.subjectLine')}
              value={campaignForm.subject}
              onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              multiline
              rows={6}
              label={t('admin.emailContent')}
              value={campaignForm.content}
              onChange={(e) => setCampaignForm({ ...campaignForm, content: e.target.value })}
              sx={{ mb: 3 }}
            />
            <FormControl fullWidth>
              <InputLabel>{t('admin.selectRecipients')}</InputLabel>
              <Select
                multiple
                value={campaignForm.recipients}
                onChange={(e) => setCampaignForm({ ...campaignForm, recipients: e.target.value as string[] })}
                renderValue={(selected) => t('admin.recipientsSelected', { count: selected.length })}
              >
                {customers.map((customer) => (
                  <MenuItem key={customer.id} value={customer.email}>
                    {customer.profile?.full_name || customer.email} 
                    {customer.isVip && ' (VIP)'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCampaignDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button 
            onClick={sendCampaign} 
            variant="contained"
            startIcon={<Send />}
            sx={{
              background: 'linear-gradient(135deg, #00ff88 0%, #00cc55 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #00cc55 0%, #009944 100%)',
              },
            }}
          >
            {t('admin.sendCampaign')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CRM;