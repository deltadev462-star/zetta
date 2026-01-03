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
  CardActions,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Shield,
  Add,
  CheckCircle,
  Warning,
  Report,
  Schedule,
  ExpandMore,
  Payment,
  Description,
  LocalOffer,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { warrantyService } from '../services/warranty';
import { format, differenceInDays } from 'date-fns';
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
      id={`warranty-tabpanel-${index}`}
      aria-labelledby={`warranty-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const WarrantyManagement: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [warranties, setWarranties] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedWarranty, setSelectedWarranty] = useState<any>(null);
  
  // Dialog states
  const [extensionDialog, setExtensionDialog] = useState(false);
  const [claimDialog, setClaimDialog] = useState(false);
  const [extensionMonths, setExtensionMonths] = useState(12);
  const [issueDescription, setIssueDescription] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch warranties
      const { data: warrantiesData } = await warrantyService.getBuyerWarranties(user.id);
      setWarranties(warrantiesData || []);

      // Fetch claims
      const { data: claimsData } = await warrantyService.getWarrantyClaims();
      setClaims(claimsData?.filter(c => 
        warrantiesData?.some(w => w.id === c.warranty_id)
      ) || []);

      // Fetch stats
      const statsData = await warrantyService.getWarrantyStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching warranty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExtendWarranty = (warranty: any) => {
    setSelectedWarranty(warranty);
    setExtensionDialog(true);
  };

  const handleFileClaimClick = (warranty: any) => {
    setSelectedWarranty(warranty);
    setClaimDialog(true);
  };

  const processExtension = async () => {
    if (!selectedWarranty) return;
    
    setProcessing(true);
    try {
      const { data: extension, error } = await warrantyService.purchaseWarrantyExtension(
        selectedWarranty.id,
        extensionMonths
      );

      if (extension && !error) {
        // In a real app, this would redirect to payment
        // For now, we'll simulate payment confirmation
        await warrantyService.confirmExtensionPayment(
          extension.id,
          `MOCK-PAY-${Date.now()}`
        );
        
        setExtensionDialog(false);
        setExtensionMonths(12);
        fetchData();
      }
    } catch (error) {
      console.error('Error extending warranty:', error);
    } finally {
      setProcessing(false);
    }
  };

  const fileClaim = async () => {
    if (!selectedWarranty || !issueDescription) return;
    
    setProcessing(true);
    try {
      const { data: claim, error } = await warrantyService.fileWarrantyClaim(
        selectedWarranty.id,
        issueDescription
      );

      if (claim && !error) {
        setClaimDialog(false);
        setIssueDescription('');
        fetchData();
      }
    } catch (error) {
      console.error('Error filing claim:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getWarrantyStatus = (warranty: any) => {
    const now = new Date();
    const endDate = new Date(warranty.end_date);
    const daysRemaining = differenceInDays(endDate, now);

    if (warranty.status === 'expired') {
      return <Chip label={t('warranty.expired')} color="error" size="small" icon={<Warning />} />;
    } else if (warranty.status === 'claimed') {
      return <Chip label={t('warranty.claimFiled')} color="warning" size="small" icon={<Report />} />;
    } else if (daysRemaining < 30) {
      return <Chip label={t('warranty.expiresInDays', { days: daysRemaining })} color="warning" size="small" icon={<Schedule />} />;
    } else {
      return <Chip label={t('warranty.active')} color="success" size="small" icon={<CheckCircle />} />;
    }
  };

  const getClaimStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return <Chip label={t('warranty.pending')} color="warning" size="small" />;
      case 'approved':
        return <Chip label={t('warranty.approved')} color="success" size="small" />;
      case 'rejected':
        return <Chip label={t('warranty.rejected')} color="error" size="small" />;
      case 'resolved':
        return <Chip label={t('warranty.resolved')} color="info" size="small" />;
      default:
        return <Chip label={status} size="small" />;
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
        <Typography variant="h4" component="h1" gutterBottom>
          {t('warranty.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('warranty.subtitle')}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Card sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(33.333% - 16px)' } }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Shield sx={{ color: '#00d4ff', mr: 1 }} />
              <Typography variant="h6">{t('warranty.activeWarranties')}</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {warranties.filter(w => w.status === 'active').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('warranty.productsProtected')}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(33.333% - 16px)' } }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Report sx={{ color: '#ff0080', mr: 1 }} />
              <Typography variant="h6">{t('warranty.activeClaims')}</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {claims.filter(c => c.status === 'pending').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('warranty.beingProcessed')}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(33.333% - 16px)' } }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocalOffer sx={{ color: '#00ff88', mr: 1 }} />
              <Typography variant="h6">{t('warranty.extendedWarranties')}</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {warranties.filter(w => w.warranty_type === 'extended').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('warranty.additionalCoverage')}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={t('warranty.myWarranties')} />
          <Tab label={t('warranty.claimsHistory')} />
          <Tab label={t('warranty.extensionOptions')} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2 }}>
            <Alert severity="info">
              {t('warranty.allProductsWarranty')}
            </Alert>
          </Box>

          {warranties.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
              {t('warranty.noWarrantiesFound')}
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {warranties.map((warranty) => (
                <Accordion key={warranty.id}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6">
                          {warranty.product?.title || t('warranty.product')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('warranty.orderNumber')}{warranty.order_id.substring(0, 8)}...
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {getWarrantyStatus(warranty)}
                        <Chip
                          label={warranty.warranty_type === 'extended' ? t('warranty.extended') : t('warranty.standard')}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            {t('warranty.coveragePeriod')}
                          </Typography>
                          <Typography>
                            {format(new Date(warranty.start_date), 'MMM dd, yyyy')} -
                            {format(new Date(warranty.end_date), 'MMM dd, yyyy')}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            {t('warranty.duration')}
                          </Typography>
                          <Typography>
                            {warranty.duration_months} {t('warranty.months')}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        {warranty.status === 'active' && (
                          <>
                            <Button
                              variant="outlined"
                              startIcon={<Add />}
                              onClick={() => handleExtendWarranty(warranty)}
                            >
                              {t('warranty.extendWarranty')}
                            </Button>
                            <Button
                              variant="outlined"
                              color="warning"
                              startIcon={<Report />}
                              onClick={() => handleFileClaimClick(warranty)}
                            >
                              {t('warranty.fileClaim')}
                            </Button>
                          </>
                        )}
                        <Button
                          variant="text"
                          startIcon={<Description />}
                        >
                          {t('warranty.viewDetails')}
                        </Button>
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('warranty.claimNumber')}</TableCell>
                  <TableCell>{t('warranty.product')}</TableCell>
                  <TableCell>{t('warranty.issue')}</TableCell>
                  <TableCell>{t('warranty.filedDate')}</TableCell>
                  <TableCell>{t('common.status')}</TableCell>
                  <TableCell>{t('warranty.resolution')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {claims.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        {t('warranty.noClaimsYet')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  claims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell>{claim.claim_number}</TableCell>
                      <TableCell>{claim.warranty?.product?.title || t('warranty.product')}</TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography variant="body2" noWrap>
                          {claim.issue_description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {format(new Date(claim.claimed_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>{getClaimStatus(claim.status)}</TableCell>
                      <TableCell>
                        {claim.resolution || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 3 }}>
            <Alert severity="success">
              {t('warranty.extendPeaceOfMind')} {t('warranty.extensionStartsAt', { price: warrantyService.EXTENSION_PRICE_PER_MONTH })}
            </Alert>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('warranty.monthExtension', { months: 6 })}
                </Typography>
                <Typography variant="h3" sx={{ color: '#00d4ff', mb: 2 }}>
                  €{warrantyService.calculateExtensionPrice(6).toFixed(2)}
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary={`✓ ${t('warranty.fullCoverage')}`} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={`✓ ${t('warranty.prioritySupport')}`} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={`✓ ${t('warranty.noServiceFees')}`} />
                  </ListItem>
                </List>
              </CardContent>
              <CardActions>
                <Button fullWidth variant="outlined">
                  {t('common.select')}
                </Button>
              </CardActions>
            </Card>

            <Card sx={{ border: '2px solid #00d4ff' }}>
              <CardContent>
                <Chip label={t('warranty.mostPopular')} color="primary" size="small" sx={{ mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  {t('warranty.monthExtension', { months: 12 })}
                </Typography>
                <Typography variant="h3" sx={{ color: '#00d4ff', mb: 2 }}>
                  €{warrantyService.calculateExtensionPrice(12).toFixed(2)}
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary={`✓ ${t('warranty.fullCoverage')}`} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={`✓ ${t('warranty.prioritySupport')}`} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={`✓ ${t('warranty.noServiceFees')}`} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={`✓ ${t('warranty.discountIncluded', { discount: 10 })}`} />
                  </ListItem>
                </List>
              </CardContent>
              <CardActions>
                <Button fullWidth variant="contained">
                  {t('common.select')}
                </Button>
              </CardActions>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('warranty.monthExtension', { months: 24 })}
                </Typography>
                <Typography variant="h3" sx={{ color: '#00d4ff', mb: 2 }}>
                  €{warrantyService.calculateExtensionPrice(24).toFixed(2)}
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary={`✓ ${t('warranty.fullCoverage')}`} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={`✓ ${t('warranty.prioritySupport')}`} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={`✓ ${t('warranty.noServiceFees')}`} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={`✓ ${t('warranty.discountIncluded', { discount: 15 })}`} />
                  </ListItem>
                </List>
              </CardContent>
              <CardActions>
                <Button fullWidth variant="outlined">
                  {t('common.select')}
                </Button>
              </CardActions>
            </Card>
          </Box>
        </TabPanel>
      </Paper>

      {/* Extension Dialog */}
      <Dialog open={extensionDialog} onClose={() => setExtensionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('warranty.extendWarranty')}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              {t('warranty.extendingWarranty', { product: selectedWarranty?.product?.title })}
            </Alert>
            
            <FormControl fullWidth>
              <InputLabel>{t('warranty.extensionDuration')}</InputLabel>
              <Select
                value={extensionMonths}
                onChange={(e) => setExtensionMonths(Number(e.target.value))}
                label={t('warranty.extensionDuration')}
              >
                <MenuItem value={6}>6 {t('warranty.months')} - €{warrantyService.calculateExtensionPrice(6).toFixed(2)}</MenuItem>
                <MenuItem value={12}>12 {t('warranty.months')} - €{warrantyService.calculateExtensionPrice(12).toFixed(2)}</MenuItem>
                <MenuItem value={24}>24 {t('warranty.months')} - €{warrantyService.calculateExtensionPrice(24).toFixed(2)}</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 0.5 }}>
              <Typography variant="subtitle2" gutterBottom>
                {t('warranty.extensionSummary')}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>{t('warranty.duration')}:</Typography>
                <Typography>{extensionMonths} {t('warranty.months')}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>{t('products.price')}:</Typography>
                <Typography sx={{ fontWeight: 'bold', color: '#00d4ff' }}>
                  €{warrantyService.calculateExtensionPrice(extensionMonths).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExtensionDialog(false)}>{t('common.cancel')}</Button>
          <Button
            onClick={processExtension}
            variant="contained"
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} /> : <Payment />}
          >
            {processing ? t('warranty.processing') : t('warranty.proceedToPayment')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Claim Dialog */}
      <Dialog open={claimDialog} onClose={() => setClaimDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('warranty.fileWarrantyClaim')}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              {t('warranty.filingClaim', { product: selectedWarranty?.product?.title })}
            </Alert>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label={t('warranty.describeIssue')}
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder={t('warranty.issuePlaceholder')}
              helperText={t('warranty.issueHelperText')}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClaimDialog(false)}>{t('common.cancel')}</Button>
          <Button
            onClick={fileClaim}
            variant="contained"
            color="warning"
            disabled={!issueDescription || processing}
            startIcon={processing ? <CircularProgress size={20} /> : <Report />}
          >
            {processing ? t('warranty.filing') : t('warranty.fileClaim')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WarrantyManagement;