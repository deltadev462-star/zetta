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
} from '@mui/material';
import {
  LocalShipping,
  Build,
  AccessTime,
  CheckCircle,
  Cancel,
  Search,
  FilterList,
  Assignment,
  Person,
  Phone,
  Email,
 
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { ServiceRequest } from '../../types';
import { useTranslation } from 'react-i18next';

interface ServiceRequestDetails extends ServiceRequest {
  user_profile?: any;
  details_parsed?: any;
}

const ServiceRequests: React.FC = () => {
  
  const { t } = useTranslation();
  const [requests, setRequests] = useState<ServiceRequestDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequestDetails | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchServiceRequests();
  }, []);

  const fetchServiceRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          *,
          user_profile:user_profiles!user_id (
            full_name,
            email,
            phone,
            company_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Parse JSON details
      const parsedRequests = (data || []).map(request => ({
        ...request,
        details_parsed: typeof request.details === 'string' 
          ? JSON.parse(request.details) 
          : request.details,
      }));

      setRequests(parsedRequests);
    } catch (err: any) {
      setError(t('common.error'));
      console.error('Error fetching service requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;

      setRequests(requests.map(request => 
        request.id === requestId 
          ? { ...request, status: newStatus as any } 
          : request
      ));
      setSuccess(t('common.success'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(t('common.error'));
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'completed':
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
      case 'in_progress':
        return <Assignment fontSize="small" />;
      case 'completed':
        return <CheckCircle fontSize="small" />;
      case 'cancelled':
        return <Cancel fontSize="small" />;
      default:
        return null;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low':
        return '#00ff88';
      case 'medium':
        return '#ffaa00';
      case 'high':
        return '#ff3366';
      default:
        return '#666';
    }
  };

  // Filter requests based on tab, search, and status
  const filteredRequests = requests.filter(request => {
    const matchesTab = activeTab === 0 || 
      (activeTab === 1 && request.type === 'logistics') ||
      (activeTab === 2 && request.type === 'maintenance');
    
    const matchesSearch = !searchQuery || 
      request.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.user_profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.user_profile?.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !filterStatus || request.status === filterStatus;
    
    return matchesTab && matchesSearch && matchesStatus;
  });

  const paginatedRequests = filteredRequests.slice(
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderRequestDetails = (request: ServiceRequestDetails) => {
    const details = request.details_parsed || {};
    
    if (request.type === 'logistics') {
      return (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalShipping /> {t('logistics.title')}
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('logistics.serviceType')}
              </Typography>
              <Chip
                label={(request as any).service_type || 'N/A'}
                sx={{ mb: 2 }}
                color="primary"
              />

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('logistics.preferredDate')}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {(request as any).preferred_date
                  ? formatDate((request as any).preferred_date)
                  : t('admin.notSpecified')}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('logistics.specialInstructions')}
              </Typography>
              <Typography variant="body1">
                {details.specialInstructions || t('admin.notSpecified')}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('admin.addresses')}
              </Typography>
              <Card sx={{ mb: 2, bgcolor: 'rgba(0,212,255,0.05)' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">{t('admin.pickup')}</Typography>
                  <Typography variant="body2">
                    {(request as any).pickup_address || t('admin.notSpecified')}
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{ bgcolor: 'rgba(255,0,128,0.05)' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">{t('admin.delivery')}</Typography>
                  <Typography variant="body2">
                    {(request as any).delivery_address || t('admin.notSpecified')}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>
      );
    } else {
      return (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Build /> {t('maintenance.title')}
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('admin.urgency')}
            </Typography>
            <Chip
              label={t(`maintenance.${(request as any).urgency || 'medium'}`)}
              sx={{
                bgcolor: `${getUrgencyColor((request as any).urgency || 'medium')}20`,
                color: getUrgencyColor((request as any).urgency || 'medium'),
                border: `1px solid ${getUrgencyColor((request as any).urgency || 'medium')}50`,
                fontWeight: 600,
              }}
            />
          </Box>

          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {t('maintenance.productDescription')}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {details.productDescription || t('admin.notSpecified')}
          </Typography>

          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {t('maintenance.issueDescription')}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {(request as any).issue_description || t('admin.notSpecified')}
          </Typography>

          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {t('maintenance.preferredContactMethod')}
          </Typography>
          <Typography variant="body1">
            {t(`maintenance.${(details.preferredContact || 'email').toLowerCase()}`)}
          </Typography>
        </Box>
      );
    }
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
            background: 'linear-gradient(135deg, #00d4ff 0%, #ff0080 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {t('admin.serviceRequests')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('admin.manageServiceRequests')}
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
            placeholder={t('common.search')}
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
            <InputLabel>{t('common.status')}</InputLabel>
            <Select
              value={filterStatus}
              label={t('common.status')}
              onChange={(e) => setFilterStatus(e.target.value as string)}
              startAdornment={<FilterList sx={{ mr: 1, color: 'text.secondary' }} />}
            >
              <MenuItem value="">{t('common.all')}</MenuItem>
              <MenuItem value="pending">{t('warranty.pending')}</MenuItem>
              <MenuItem value="in_progress">{t('admin.inProgress')}</MenuItem>
              <MenuItem value="completed">{t('admin.completed')}</MenuItem>
              <MenuItem value="cancelled">{t('admin.cancelled')}</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper 
        sx={{ 
          bgcolor: 'rgba(15,15,25,0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          overflow: 'hidden',
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
          <Tab label={`${t('admin.allRequests')} (${requests.length})`} />
          <Tab label={`${t('nav.logistics')} (${requests.filter(r => r.type === 'logistics').length})`} icon={<LocalShipping />} iconPosition="start" />
          <Tab label={`${t('nav.maintenance')} (${requests.filter(r => r.type === 'maintenance').length})`} icon={<Build />} iconPosition="start" />
        </Tabs>

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
                    <TableCell>{t('admin.requestId')}</TableCell>
                    <TableCell>{t('admin.type')}</TableCell>
                    <TableCell>{t('admin.customer')}</TableCell>
                    <TableCell>{t('admin.contact')}</TableCell>
                    <TableCell>{t('admin.created')}</TableCell>
                    <TableCell>{t('common.status')}</TableCell>
                    <TableCell align="center">{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRequests.map((request) => (
                    <TableRow key={request.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          #{request.id.slice(0, 8)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={request.type}
                          size="small"
                          icon={request.type === 'logistics' ? <LocalShipping /> : <Build />}
                          sx={{
                            bgcolor: request.type === 'logistics' 
                              ? 'rgba(0,212,255,0.1)' 
                              : 'rgba(255,0,128,0.1)',
                            color: request.type === 'logistics' 
                              ? '#00d4ff' 
                              : '#ff0080',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {request.user_profile?.full_name || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {request.user_profile?.company_name || t('admin.individual')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Phone sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption">
                              {request.details_parsed?.contactPhone || request.user_profile?.phone || 'N/A'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Email sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption">
                              {request.details_parsed?.contactEmail || request.user_profile?.email || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(request.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={request.status.replace('_', ' ')}
                          size="small"
                          color={getStatusColor(request.status) as any}
                          icon={getStatusIcon(request.status) || undefined}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setSelectedRequest(request);
                              setDetailsDialogOpen(true);
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
                            {t('common.details')}
                          </Button>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={request.status}
                              onChange={(e) => handleStatusUpdate(request.id, e.target.value)}
                              sx={{ height: 32 }}
                            >
                              <MenuItem value="pending">{t('warranty.pending')}</MenuItem>
                              <MenuItem value="in_progress">{t('admin.inProgress')}</MenuItem>
                              <MenuItem value="completed">{t('admin.completed')}</MenuItem>
                              <MenuItem value="cancelled">{t('admin.cancelled')}</MenuItem>
                            </Select>
                          </FormControl>
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
              count={filteredRequests.length}
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

      {/* Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(15,15,25,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              {t('admin.serviceRequestDetails')}
            </Typography>
            <Chip
              label={t(`admin.${selectedRequest?.status || ''}`)}
              color={getStatusColor(selectedRequest?.status || '') as any}
              icon={getStatusIcon(selectedRequest?.status || '') || undefined}
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {t('admin.requestInformation')}
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">{t('admin.requestId')}</Typography>
                    <Typography variant="body2">#{selectedRequest.id.slice(0, 8)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">{t('admin.created')}</Typography>
                    <Typography variant="body2">{formatDate(selectedRequest.created_at)}</Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {t('admin.customerInformation')}
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'rgba(0,212,255,0.2)' }}>
                        <Person />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={selectedRequest.user_profile?.full_name || 'N/A'}
                      secondary={selectedRequest.user_profile?.company_name || t('admin.individual')}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'rgba(0,212,255,0.2)' }}>
                        <Phone />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={selectedRequest.details_parsed?.contactPhone || selectedRequest.user_profile?.phone || 'N/A'}
                      secondary={t('maintenance.phone')}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'rgba(0,212,255,0.2)' }}>
                        <Email />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={selectedRequest.details_parsed?.contactEmail || selectedRequest.user_profile?.email || 'N/A'}
                      secondary={t('maintenance.email')}
                    />
                  </ListItem>
                </List>
              </Box>

              <Divider sx={{ my: 3 }} />

              {renderRequestDetails(selectedRequest)}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ServiceRequests;