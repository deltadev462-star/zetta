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
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Sync,
  Schedule,
  WebhookOutlined,
  CloudDownload,
  ExpandMore,
  CheckCircle,
  Error as ErrorIcon,
  AccessTime,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { enhancedCatalogSyncService } from '../../services/catalogSyncEnhanced';
import { useTranslation } from 'react-i18next';

interface MappingRule {
  internalField: string;
  externalField: string;
}

const CatalogSync: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState<any[]>([]);
  const [syncLogs, setSyncLogs] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any>(null);
  const [formData, setFormData] = useState({
    sync_type: 'api',
    source_url: '',
    api_key: '',
    webhook_secret: '',
    schedule: 'daily',
    auto_approve: false,
    mapping_rules: {} as Record<string, string>,
  });
  const [mappingRules, setMappingRules] = useState<MappingRule[]>([
    { internalField: 'title', externalField: 'name' },
    { internalField: 'description', externalField: 'description' },
    { internalField: 'price', externalField: 'price' },
    { internalField: 'category', externalField: 'category' },
    { internalField: 'condition', externalField: 'condition' },
    { internalField: 'images', externalField: 'images' },
    { internalField: 'external_id', externalField: 'id' },
  ]);

  useEffect(() => {
    fetchSyncStatus();
  }, [user]);

  const fetchSyncStatus = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const status = await enhancedCatalogSyncService.getSellerSyncStatus(user.id);
      setConfigs(status.configs);
      setSyncLogs(status.recentLogs);
    } catch (error) {
      console.error('Error fetching sync status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConfig = () => {
    setEditingConfig(null);
    setFormData({
      sync_type: 'api',
      source_url: '',
      api_key: '',
      webhook_secret: '',
      schedule: 'daily',
      auto_approve: false,
      mapping_rules: {},
    });
    setMappingRules([
      { internalField: 'title', externalField: 'name' },
      { internalField: 'description', externalField: 'description' },
      { internalField: 'price', externalField: 'price' },
      { internalField: 'category', externalField: 'category' },
      { internalField: 'condition', externalField: 'condition' },
      { internalField: 'images', externalField: 'images' },
      { internalField: 'external_id', externalField: 'id' },
    ]);
    setDialogOpen(true);
  };

  const handleEditConfig = (config: any) => {
    setEditingConfig(config);
    setFormData({
      sync_type: config.sync_type,
      source_url: config.source_url || '',
      api_key: config.api_key || '',
      webhook_secret: config.webhook_secret || '',
      schedule: config.schedule,
      auto_approve: config.auto_approve,
      mapping_rules: config.mapping_rules,
    });
    
    // Convert mapping rules to array format
    const rules: MappingRule[] = Object.entries(config.mapping_rules).map(([internal, external]) => ({
      internalField: internal,
      externalField: external as string,
    }));
    setMappingRules(rules);
    setDialogOpen(true);
  };

  const handleSaveConfig = async () => {
    try {
      // Convert mapping rules array to object
      const mappingRulesObj: Record<string, string> = {};
      mappingRules.forEach(rule => {
        if (rule.internalField && rule.externalField) {
          mappingRulesObj[rule.internalField] = rule.externalField;
        }
      });

      const configData = {
        ...formData,
        mapping_rules: mappingRulesObj,
        seller_id: user!.id,
      };

      if (editingConfig) {
        // Update existing config - for now we'll need to implement this
        console.log('Update config:', editingConfig.id, configData);
        // TODO: Add updateSyncConfig method to service
      } else {
        // Create new config - need to fix the method signature
        const { data, error } = await enhancedCatalogSyncService.createSyncConfig(configData as any);
        if (error) {
          console.error('Error creating config:', error);
        }
      }

      setDialogOpen(false);
      fetchSyncStatus();
    } catch (error) {
      console.error('Error saving config:', error);
    }
  };

  const handleManualSync = async (configId: string) => {
    try {
      // TODO: Implement manual sync trigger
      console.log('Manual sync triggered for:', configId);
      await enhancedCatalogSyncService.performSync({ id: configId } as any);
      fetchSyncStatus();
    } catch (error) {
      console.error('Error triggering sync:', error);
    }
  };

  const handleAddMappingRule = () => {
    setMappingRules([...mappingRules, { internalField: '', externalField: '' }]);
  };

  const handleRemoveMappingRule = (index: number) => {
    setMappingRules(mappingRules.filter((_, i) => i !== index));
  };

  const handleMappingRuleChange = (index: number, field: 'internalField' | 'externalField', value: string) => {
    const newRules = [...mappingRules];
    newRules[index][field] = value;
    setMappingRules(newRules);
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'active':
        return <Chip label="Active" color="success" size="small" icon={<CheckCircle />} />;
      case 'error':
        return <Chip label="Error" color="error" size="small" icon={<ErrorIcon />} />;
      case 'paused':
        return <Chip label="Paused" color="warning" size="small" icon={<AccessTime />} />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const getSyncTypeIcon = (type: string) => {
    switch (type) {
      case 'api':
        return <CloudDownload />;
      case 'webhook':
        return <WebhookOutlined />;
      default:
        return <Sync />;
    }
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
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}
        >
          {t('admin.catalogSyncManagement')}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          {t('admin.configureSyncDescription')}
        </Typography>
      </Box>

      {/* Create New Config Button */}
      <Box sx={{
        mb: 3,
        display: 'flex',
        justifyContent: { xs: 'stretch', sm: 'flex-end' }
      }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateConfig}
          fullWidth
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          {t('admin.newSyncConfiguration')}
        </Button>
      </Box>

      {/* Sync Configurations */}
      <Paper sx={{
        mb: 4,
        bgcolor: 'oklch(98.5% 0.001 106.423)',
        borderRadius: '8px',
        border: '1px solid',
        borderColor: 'divider',
      }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: { xs: 600, sm: 750 } }}>
            <TableHead>
              <TableRow>
                <TableCell>{t('admin.type')}</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{t('admin.source')}</TableCell>
                <TableCell>{t('admin.schedule')}</TableCell>
                <TableCell>{t('common.status')}</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{t('admin.lastSync')}</TableCell>
                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{t('admin.autoApprove')}</TableCell>
                <TableCell align="right">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {configs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      {t('admin.noSyncConfigurationsFound')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                configs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getSyncTypeIcon(config.sync_type)}
                        <Typography
                          variant="body2"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          {config.sync_type.toUpperCase()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{
                          maxWidth: { sm: 150, md: 200 },
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        {config.source_url || t('admin.webhookEndpoint')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={config.schedule}
                        size="small"
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      />
                    </TableCell>
                    <TableCell>{getStatusChip(config.status)}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      {config.last_sync
                        ? new Date(config.last_sync).toLocaleString()
                        : 'Never'}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                      <Chip
                        label={config.auto_approve ? 'Yes' : 'No'}
                        color={config.auto_approve ? 'success' : 'default'}
                        size="small"
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: { xs: 0, sm: 1 }, justifyContent: 'flex-end' }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditConfig(config)}
                          color="primary"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleManualSync(config.id)}
                          color="info"
                        >
                          <Sync fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Recent Sync Logs */}
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          mt: 4,
          mb: 2,
          fontSize: { xs: '1.25rem', sm: '1.5rem' }
        }}
      >
        {t('admin.recentSyncHistory')}
      </Typography>
      
      <Paper sx={{
        bgcolor: 'oklch(98.5% 0.001 106.423)',
        borderRadius: '8px',
        border: '1px solid',
        borderColor: 'divider',
        overflowX: 'auto',
      }}>
        <TableContainer>
          <Table size="small" sx={{ minWidth: { xs: 500, sm: 650 } }}>
            <TableHead>
              <TableRow>
                <TableCell>{t('admin.date')}</TableCell>
                <TableCell>{t('common.status')}</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{t('admin.added')}</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{t('admin.updated')}</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{t('admin.removed')}</TableCell>
                <TableCell>{t('admin.duration')}</TableCell>
                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{t('common.error')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {syncLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      {t('admin.noSyncHistoryAvailable')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                syncLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {new Date(log.started_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {log.status === 'success' ? (
                        <CheckCircle color="success" fontSize="small" />
                      ) : log.status === 'failed' ? (
                        <ErrorIcon color="error" fontSize="small" />
                      ) : (
                        <CircularProgress size={16} />
                      )}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{log.products_added}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{log.products_updated}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{log.products_removed}</TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {log.completed_at
                        ? `${Math.round(
                            (new Date(log.completed_at).getTime() -
                              new Date(log.started_at).getTime()) /
                              1000
                          )}s`
                        : '-'}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                      {log.error_message && (
                        <Typography variant="caption" color="error">
                          {log.error_message}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Configuration Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '8px',
            bgcolor: 'oklch(98.5% 0.001 106.423)',
          }
        }}
      >
        <DialogTitle>
          {editingConfig ? t('admin.editSyncConfiguration') : t('admin.newSyncConfiguration')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>{t('admin.syncType')}</InputLabel>
                  <Select
                    value={formData.sync_type}
                    onChange={(e) => setFormData({ ...formData, sync_type: e.target.value })}
                    label="Sync Type"
                  >
                    <MenuItem value="api">API</MenuItem>
                    <MenuItem value="csv">CSV</MenuItem>
                    <MenuItem value="xml">XML</MenuItem>
                    <MenuItem value="webhook">Webhook</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>{t('admin.schedule')}</InputLabel>
                  <Select
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    label="Schedule"
                  >
                    <MenuItem value="realtime">Real-time</MenuItem>
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {formData.sync_type !== 'webhook' && (
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label={t('admin.sourceUrl')}
                    value={formData.source_url}
                    onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                    placeholder="https://api.example.com/products"
                  />
                </Grid>
              )}

              {formData.sync_type === 'api' && (
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label={t('admin.apiKey')}
                    value={formData.api_key}
                    onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                    type="password"
                  />
                </Grid>
              )}

              {formData.sync_type === 'webhook' && (
                <Grid size={12}>
                  <Alert severity="info" sx={{ borderRadius: '8px' }}>
                    {t('admin.webhookUrlGenerated')}
                  </Alert>
                </Grid>
              )}

              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.auto_approve}
                      onChange={(e) => setFormData({ ...formData, auto_approve: e.target.checked })}
                    />
                  }
                  label={t('admin.autoApproveSyncedProducts')}
                />
              </Grid>

              {/* Mapping Rules */}
              <Grid size={12}>
                <Accordion defaultExpanded sx={{
                  borderRadius: '8px',
                  '&:before': {
                    display: 'none',
                  },
                  bgcolor: 'oklch(98.5% 0.001 106.423)',
                  border: '1px solid',
                  borderColor: 'divider',
                }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography>{t('admin.fieldMappingRules')}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      {mappingRules.map((rule, index) => (
                        <Box key={index} sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          gap: { xs: 1, sm: 2 },
                          mb: 2
                        }}>
                          <TextField
                            label={t('admin.zettaField')}
                            value={rule.internalField}
                            onChange={(e) => handleMappingRuleChange(index, 'internalField', e.target.value)}
                            size="small"
                            sx={{ flex: 1 }}
                            fullWidth
                          />
                          <TextField
                            label={t('admin.externalField')}
                            value={rule.externalField}
                            onChange={(e) => handleMappingRuleChange(index, 'externalField', e.target.value)}
                            size="small"
                            sx={{ flex: 1 }}
                            fullWidth
                          />
                          <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-end', sm: 'center' } }}>
                            <IconButton
                              onClick={() => handleRemoveMappingRule(index)}
                              color="error"
                              size="small"
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </Box>
                      ))}
                      <Button
                        startIcon={<Add />}
                        onClick={handleAddMappingRule}
                        size="small"
                      >
                        {t('admin.addMappingRule')}
                      </Button>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleSaveConfig} variant="contained">
            {editingConfig ? t('common.update') : t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CatalogSync;