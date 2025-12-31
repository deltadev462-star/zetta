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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import {
  Email,
  Send,
  Edit,
  Delete,
  Schedule,
  Analytics,
  People,
  TrendingUp,
  Campaign,
  Add,
  Pause,
  PlayArrow,
  Visibility,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { emailMarketingService } from '../../services/emailMarketing';
import { format } from 'date-fns';

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
      id={`email-tabpanel-${index}`}
      aria-labelledby={`email-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const EmailMarketing: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  
  // Dialog states
  const [campaignDialog, setCampaignDialog] = useState(false);
  const [templateDialog, setTemplateDialog] = useState(false);
  const [segmentDialog, setSegmentDialog] = useState(false);
  const [analyticsDialog, setAnalyticsDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  
  // Form data
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    subject: '',
    template_id: '',
    segment_id: '',
    scheduled_at: '',
  });
  
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    content: '',
    category: 'promotional',
  });
  
  const [segmentForm, setSegmentForm] = useState({
    name: '',
    description: '',
    type: 'all_customers',
    filters: {},
  });

  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
    // Initialize default templates
    emailMarketingService.initializeDefaultTemplates();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // In a real app, these would fetch from the database
      // For now, we'll use mock data
      setCampaigns([
        {
          id: '1',
          name: 'Welcome Campaign',
          subject: 'Welcome to Zetta Med',
          status: 'sent',
          sent_count: 150,
          open_count: 120,
          click_count: 45,
          sent_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'New Products Launch',
          subject: 'Check out our latest medical equipment',
          status: 'scheduled',
          scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          sent_count: 0,
          open_count: 0,
          click_count: 0,
        },
      ]);

      setTemplates(Object.entries(emailMarketingService.DEFAULT_TEMPLATES).map(([key, template]) => ({
        id: key,
        ...template,
      })));

      setSegments([
        { id: '1', name: 'All Customers', customer_count: 500, criteria: { type: 'all_customers' } },
        { id: '2', name: 'New Customers', customer_count: 150, criteria: { type: 'new_customers' } },
        { id: '3', name: 'High Value Customers', customer_count: 50, criteria: { type: 'high_value' } },
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    setProcessing(true);
    try {
      const { data, error } = await emailMarketingService.createCampaign({
        ...campaignForm,
        created_by: user!.id,
        status: campaignForm.scheduled_at ? 'scheduled' : 'draft',
      });

      if (!error) {
        setCampaignDialog(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    if (window.confirm('Are you sure you want to send this campaign now?')) {
      setProcessing(true);
      try {
        await emailMarketingService.sendCampaign(campaignId);
        fetchData();
      } catch (error) {
        console.error('Error sending campaign:', error);
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleViewAnalytics = async (campaign: any) => {
    setSelectedCampaign(campaign);
    const analytics = await emailMarketingService.getCampaignAnalytics(campaign.id);
    setSelectedCampaign({ ...campaign, analytics });
    setAnalyticsDialog(true);
  };

  const getCampaignStatus = (status: string) => {
    switch (status) {
      case 'draft':
        return <Chip label="Draft" size="small" />;
      case 'scheduled':
        return <Chip label="Scheduled" color="info" size="small" icon={<Schedule />} />;
      case 'sending':
        return <Chip label="Sending" color="warning" size="small" />;
      case 'sent':
        return <Chip label="Sent" color="success" size="small" icon={<Send />} />;
      case 'paused':
        return <Chip label="Paused" color="error" size="small" icon={<Pause />} />;
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
          Email Marketing
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create and manage email campaigns, templates, and customer segments
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Card sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(25% - 24px)' } }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Campaign sx={{ color: '#00d4ff', mr: 1 }} />
              <Typography variant="h6">Total Campaigns</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {campaigns.length}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(25% - 24px)' } }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Email sx={{ color: '#ff0080', mr: 1 }} />
              <Typography variant="h6">Emails Sent</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {campaigns.reduce((sum, c) => sum + c.sent_count, 0)}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(25% - 24px)' } }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUp sx={{ color: '#00ff88', mr: 1 }} />
              <Typography variant="h6">Avg Open Rate</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {campaigns.length > 0 
                ? Math.round(campaigns.reduce((sum, c) => 
                    sum + (c.sent_count > 0 ? (c.open_count / c.sent_count) * 100 : 0), 0
                  ) / campaigns.filter(c => c.sent_count > 0).length) 
                : 0}%
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(25% - 24px)' } }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <People sx={{ color: '#ffaa00', mr: 1 }} />
              <Typography variant="h6">Total Subscribers</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {segments.find(s => s.criteria.type === 'all_customers')?.customer_count || 0}
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
          <Tab label="Campaigns" />
          <Tab label="Templates" />
          <Tab label="Segments" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6">Email Campaigns</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCampaignDialog(true)}
            >
              Create Campaign
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Campaign Name</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Sent</TableCell>
                  <TableCell>Opened</TableCell>
                  <TableCell>Clicked</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>{campaign.name}</TableCell>
                    <TableCell>{campaign.subject}</TableCell>
                    <TableCell>{getCampaignStatus(campaign.status)}</TableCell>
                    <TableCell>{campaign.sent_count}</TableCell>
                    <TableCell>
                      {campaign.sent_count > 0 
                        ? `${campaign.open_count} (${Math.round((campaign.open_count / campaign.sent_count) * 100)}%)`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {campaign.open_count > 0 
                        ? `${campaign.click_count} (${Math.round((campaign.click_count / campaign.open_count) * 100)}%)`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {campaign.sent_at 
                        ? format(new Date(campaign.sent_at), 'MMM dd, yyyy')
                        : campaign.scheduled_at
                        ? `Scheduled: ${format(new Date(campaign.scheduled_at), 'MMM dd, yyyy')}`
                        : '-'}
                    </TableCell>
                    <TableCell align="right">
                      {campaign.status === 'draft' && (
                        <IconButton
                          size="small"
                          onClick={() => handleSendCampaign(campaign.id)}
                          color="primary"
                        >
                          <Send />
                        </IconButton>
                      )}
                      {campaign.status === 'sent' && (
                        <IconButton
                          size="small"
                          onClick={() => handleViewAnalytics(campaign)}
                          color="info"
                        >
                          <Analytics />
                        </IconButton>
                      )}
                      <IconButton size="small" color="default">
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6">Email Templates</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setTemplateDialog(true)}
            >
              Create Template
            </Button>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
            {templates.map((template) => (
              <Card key={template.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{template.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {template.subject}
                      </Typography>
                    </Box>
                    <Chip label={template.category} size="small" />
                  </Box>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Variables: {template.variables.join(', ')}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<Visibility />}>
                      Preview
                    </Button>
                    <Button size="small" startIcon={<Edit />}>
                      Edit
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6">Customer Segments</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setSegmentDialog(true)}
            >
              Create Segment
            </Button>
          </Box>

          <List>
            {segments.map((segment) => (
              <React.Fragment key={segment.id}>
                <ListItem>
                  <ListItemText
                    primary={segment.name}
                    secondary={`${segment.customer_count} customers • Type: ${segment.criteria.type}`}
                  />
                  <ListItemSecondaryAction>
                    <Button size="small" startIcon={<People />}>
                      View Customers
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </TabPanel>
      </Paper>

      {/* Campaign Dialog */}
      <Dialog open={campaignDialog} onClose={() => setCampaignDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Email Campaign</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Campaign Name"
              value={campaignForm.name}
              onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
            />
            
            <TextField
              fullWidth
              label="Subject Line"
              value={campaignForm.subject}
              onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
            />
            
            <FormControl fullWidth>
              <InputLabel>Template</InputLabel>
              <Select
                value={campaignForm.template_id}
                onChange={(e) => setCampaignForm({ ...campaignForm, template_id: e.target.value })}
                label="Template"
              >
                {templates.map((template) => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Target Segment</InputLabel>
              <Select
                value={campaignForm.segment_id}
                onChange={(e) => setCampaignForm({ ...campaignForm, segment_id: e.target.value })}
                label="Target Segment"
              >
                {segments.map((segment) => (
                  <MenuItem key={segment.id} value={segment.id}>
                    {segment.name} ({segment.customer_count} customers)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              type="datetime-local"
              label="Schedule For"
              value={campaignForm.scheduled_at}
              onChange={(e) => setCampaignForm({ ...campaignForm, scheduled_at: e.target.value })}
              InputLabelProps={{ shrink: true }}
              helperText="Leave empty to save as draft"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCampaignDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateCampaign} 
            variant="contained"
            disabled={processing || !campaignForm.name || !campaignForm.subject || !campaignForm.template_id}
          >
            {processing ? <CircularProgress size={20} /> : 'Create Campaign'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={analyticsDialog} onClose={() => setAnalyticsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Campaign Analytics</DialogTitle>
        <DialogContent>
          {selectedCampaign && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedCampaign.name}
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 3 }}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="h4" sx={{ color: '#00d4ff' }}>
                    {selectedCampaign.sent_count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Emails Sent
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="h4" sx={{ color: '#ff0080' }}>
                    {selectedCampaign.analytics?.openRate || 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Open Rate
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="h4" sx={{ color: '#00ff88' }}>
                    {selectedCampaign.analytics?.clickRate || 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click Rate
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="h4" sx={{ color: '#ffaa00' }}>
                    {selectedCampaign.click_count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Clicks
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnalyticsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EmailMarketing;