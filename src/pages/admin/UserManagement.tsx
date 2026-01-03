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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Tabs,
  Tab,
  Menu,
  ListItemIcon,
  ListItemText,
  Checkbox,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import {
  Person,
  Block,
  CheckCircle,
  Warning,
  MoreVert,
  History,
  Lock,
  LockOpen,
  Delete,
  TrendingUp,
  People,
  PersonAdd,
  Search,
  Download,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { userManagementService } from '../../services/userManagement';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState<any[]>([]);
  const [suspensionLogs, setSuspensionLogs] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Dialog states
  const [suspendDialog, setSuspendDialog] = useState(false);
  const [activityDialog, setActivityDialog] = useState(false);
  const [bulkActionDialog, setBulkActionDialog] = useState(false);
  
  // Form data
  const [suspendForm, setSuspendForm] = useState({
    reason: '',
    duration: 'permanent',
    customDays: 30,
  });
  
  // Filters
  const [filters, setFilters] = useState<{
    role: 'buyer' | 'admin' | '';
    status: 'active' | 'suspended' | 'deactivated' | '';
    search: string;
  }>({
    role: '',
    status: '',
    search: '',
  });

  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const { data: usersData, error: usersError } = await userManagementService.getAllUsers({
        role: filters.role || undefined,
        status: filters.status || undefined,
        search: filters.search || undefined,
      });
      if (!usersError) {
        setUsers(usersData || []);
      }

      // Fetch suspension logs
      const { data: logsData } = await userManagementService.getSuspensionLogs();
      setSuspensionLogs(logsData || []);

      // Fetch statistics
      const stats = await userManagementService.getUserStatistics();
      setUserStats(stats);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSuspendUser = async () => {
    if (!selectedUser || !currentUser) return;
    
    setProcessing(true);
    try {
      let suspendedUntil: Date | undefined;
      
      if (suspendForm.duration !== 'permanent') {
        suspendedUntil = new Date();
        suspendedUntil.setDate(suspendedUntil.getDate() + suspendForm.customDays);
      }

      const { error } = await userManagementService.suspendUser(
        selectedUser.id,
        currentUser.id,
        suspendForm.reason,
        suspendedUntil
      );

      if (!error) {
        setSuspendDialog(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error suspending user:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleUnsuspendUser = async (userId: string) => {
    if (!currentUser) return;
    
    setProcessing(true);
    try {
      const { error } = await userManagementService.unsuspendUser(userId, currentUser.id);
      if (!error) {
        fetchData();
      }
    } catch (error) {
      console.error('Error unsuspending user:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeactivateUser = async (userId: string, reason: string) => {
    if (!currentUser) return;
    
    if (window.confirm(t('admin.deactivateUser') + '?')) {
      setProcessing(true);
      try {
        const { error } = await userManagementService.deactivateUser(userId, currentUser.id, reason);
        if (!error) {
          fetchData();
        }
      } catch (error) {
        console.error('Error deactivating user:', error);
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleBulkSuspend = async () => {
    if (!currentUser || selectedUsers.length === 0) return;
    
    setProcessing(true);
    try {
      const result = await userManagementService.bulkSuspendUsers(
        selectedUsers,
        currentUser.id,
        suspendForm.reason,
        suspendForm.duration !== 'permanent' ? new Date(Date.now() + suspendForm.customDays * 24 * 60 * 60 * 1000) : undefined
      );
      
      alert(`${t('warranty.pending')}: ${result.success}, ${t('warranty.failed')}: ${result.failed}`);
      setBulkActionDialog(false);
      setSelectedUsers([]);
      fetchData();
    } catch (error) {
      console.error('Error in bulk suspend:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleViewActivity = async (user: any) => {
    setSelectedUser(user);
    setActivityDialog(true);
  };

  const handleExportUserData = async (userId: string) => {
    const { data, error } = await userManagementService.exportUserData(userId);
    if (!error && data) {
      // Download as JSON
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-${userId}.json`;
      a.click();
    }
  };

  const getUserStatus = (user: any) => {
    switch (user.status) {
      case 'active':
        return <Chip label={t('warranty.active')} color="success" size="small" icon={<CheckCircle />} />;
      case 'suspended':
        return <Chip label={t('warranty.pending')} color="warning" size="small" icon={<Warning />} />;
      case 'deactivated':
        return <Chip label={t('admin.deactivated')} color="error" size="small" icon={<Block />} />;
      default:
        return <Chip label={user.status} size="small" />;
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('admin.userManagement')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('admin.userManagement')}
        </Typography>
      </Box>

      {/* Stats Cards */}
      {userStats && (
        <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
          <Card sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(20% - 24px)' } }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <People sx={{ color: '#00d4ff', mr: 1 }} />
                <Typography variant="h6">{t('admin.totalUsers')}</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {userStats.totalUsers}
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(20% - 24px)' } }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle sx={{ color: '#00ff88', mr: 1 }} />
                <Typography variant="h6">{t('warranty.active')}</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {userStats.activeUsers}
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(20% - 24px)' } }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Warning sx={{ color: '#ffaa00', mr: 1 }} />
                <Typography variant="h6">{t('warranty.pending')}</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {userStats.suspendedUsers}
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(20% - 24px)' } }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Block sx={{ color: '#ff0080', mr: 1 }} />
                <Typography variant="h6">{t('admin.deactivated')}</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {userStats.deactivatedUsers}
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(20% - 24px)' } }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonAdd sx={{ color: '#00d4ff', mr: 1 }} />
                <Typography variant="h6">{t('admin.newThisMonth')}</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {userStats.newUsersThisMonth}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder={t('admin.searchUsers')}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ minWidth: 300 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{t('auth.role')}</InputLabel>
            <Select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value as any })}
              label={t('auth.role')}
            >
              <MenuItem value="">{t('common.all')}</MenuItem>
              <MenuItem value="buyer">{t('auth.buyer')}</MenuItem>
              <MenuItem value="admin">{t('auth.admin')}</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{t('common.status')}</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
              label={t('common.status')}
            >
              <MenuItem value="">{t('common.all')}</MenuItem>
              <MenuItem value="active">{t('warranty.active')}</MenuItem>
              <MenuItem value="suspended">{t('warranty.pending')}</MenuItem>
              <MenuItem value="deactivated">{t('admin.deactivated')}</MenuItem>
            </Select>
          </FormControl>

          {selectedUsers.length > 0 && (
            <Button
              variant="outlined"
              color="warning"
              onClick={() => setBulkActionDialog(true)}
            >
              {t('admin.bulkSuspend')} ({selectedUsers.length})
            </Button>
          )}
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={t('admin.allUsers')} />
          <Tab label={t('admin.suspensionHistory')} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedUsers.length === users.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(users.map(u => u.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>{t('admin.user')}</TableCell>
                  <TableCell>{t('common.email')}</TableCell>
                  <TableCell>{t('auth.role')}</TableCell>
                  <TableCell>{t('common.status')}</TableCell>
                  <TableCell>{t('nav.orders')}</TableCell>
                  <TableCell>{t('cart.total')}</TableCell>
                  <TableCell>{t('orders.created')}</TableCell>
                  <TableCell>{t('admin.lastLogin')}</TableCell>
                  <TableCell align="right">{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {user.profile?.full_name || 'N/A'}
                        </Typography>
                        {user.profile?.company_name && (
                          <Typography variant="caption" color="text.secondary">
                            {user.profile.company_name}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role} 
                        size="small" 
                        color={user.role === 'admin' ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{getUserStatus(user)}</TableCell>
                    <TableCell>{user.activity_summary?.total_orders || 0}</TableCell>
                    <TableCell>
                      €{user.activity_summary?.total_spent?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {user.last_sign_in
                        ? format(new Date(user.last_sign_in), 'MMM dd, yyyy')
                        : t('admin.never')}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, user)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('logistics.preferredDate')}</TableCell>
                  <TableCell>{t('admin.user')}</TableCell>
                  <TableCell>{t('common.actions')}</TableCell>
                  <TableCell>{t('admin.reasonForSuspension')}</TableCell>
                  <TableCell>{t('auth.admin')}</TableCell>
                  <TableCell>{t('admin.suspensionDuration')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {suspensionLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>{log.user?.full_name || log.user_id}</TableCell>
                    <TableCell>
                      <Chip 
                        label={log.action} 
                        size="small"
                        color={log.action.includes('suspend') ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{log.reason}</TableCell>
                    <TableCell>{log.admin?.full_name || log.admin_id}</TableCell>
                    <TableCell>
                      {log.suspended_until 
                        ? format(new Date(log.suspended_until), 'MMM dd, yyyy')
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* User Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleViewActivity(selectedUser)}>
          <ListItemIcon><History /></ListItemIcon>
          <ListItemText>{t('admin.viewActivity')}</ListItemText>
        </MenuItem>
        
        {selectedUser?.status === 'active' && (
          <MenuItem onClick={() => {
            handleMenuClose();
            setSuspendDialog(true);
          }}>
            <ListItemIcon><Lock /></ListItemIcon>
            <ListItemText>{t('admin.suspendUser')}</ListItemText>
          </MenuItem>
        )}
        
        {selectedUser?.status === 'suspended' && (
          <MenuItem onClick={() => {
            handleMenuClose();
            handleUnsuspendUser(selectedUser.id);
          }}>
            <ListItemIcon><LockOpen /></ListItemIcon>
            <ListItemText>{t('admin.unsuspendUser')}</ListItemText>
          </MenuItem>
        )}
        
        <MenuItem onClick={() => {
          handleMenuClose();
          handleExportUserData(selectedUser.id);
        }}>
          <ListItemIcon><Download /></ListItemIcon>
          <ListItemText>{t('admin.exportUserData')}</ListItemText>
        </MenuItem>
        
        {selectedUser?.status !== 'deactivated' && (
          <MenuItem onClick={() => {
            handleMenuClose();
            handleDeactivateUser(selectedUser.id, 'Admin action');
          }} sx={{ color: 'error.main' }}>
            <ListItemIcon><Delete /></ListItemIcon>
            <ListItemText>{t('admin.deactivateUser')}</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Suspend Dialog */}
      <Dialog open={suspendDialog} onClose={() => setSuspendDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('admin.suspendUser')}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              {t('admin.suspendUser')}: {selectedUser?.email}
            </Alert>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label={t('admin.reasonForSuspension')}
              value={suspendForm.reason}
              onChange={(e) => setSuspendForm({ ...suspendForm, reason: e.target.value })}
              placeholder={t('admin.reasonForSuspension')}
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth>
              <InputLabel>{t('admin.suspensionDuration')}</InputLabel>
              <Select
                value={suspendForm.duration}
                onChange={(e) => setSuspendForm({ ...suspendForm, duration: e.target.value })}
                label={t('admin.suspensionDuration')}
              >
                <MenuItem value="permanent">{t('admin.permanent')}</MenuItem>
                <MenuItem value="custom">{t('admin.customDuration')}</MenuItem>
              </Select>
            </FormControl>
            
            {suspendForm.duration === 'custom' && (
              <TextField
                fullWidth
                type="number"
                label={t('admin.days')}
                value={suspendForm.customDays}
                onChange={(e) => setSuspendForm({ ...suspendForm, customDays: parseInt(e.target.value) || 1 })}
                sx={{ mt: 2 }}
                inputProps={{ min: 1 }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuspendDialog(false)}>{t('common.cancel')}</Button>
          <Button
            onClick={handleSuspendUser}
            variant="contained"
            color="warning"
            disabled={!suspendForm.reason || processing}
          >
            {processing ? <CircularProgress size={20} /> : t('admin.suspendUser')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog open={bulkActionDialog} onClose={() => setBulkActionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('admin.bulkSuspend')}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              {t('admin.youAreAboutToSuspend', { count: selectedUsers.length })}
            </Alert>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label={t('admin.reasonForSuspension')}
              value={suspendForm.reason}
              onChange={(e) => setSuspendForm({ ...suspendForm, reason: e.target.value })}
              placeholder={t('admin.reasonForSuspension')}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkActionDialog(false)}>{t('common.cancel')}</Button>
          <Button
            onClick={handleBulkSuspend}
            variant="contained"
            color="warning"
            disabled={!suspendForm.reason || processing}
          >
            {processing ? <CircularProgress size={20} /> : `${t('admin.bulkSuspend')} ${selectedUsers.length} ${t('admin.totalUsers')}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagement;