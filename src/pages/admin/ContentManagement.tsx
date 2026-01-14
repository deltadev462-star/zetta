import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  IconButton,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Stack,
  Fade,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Dashboard,
  ViewCarousel,
  Build,
  Storefront,
  Timeline,
  Inventory,
  Reviews,
  Settings,
  WebAsset,
  Code,
  Add,
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  DragIndicator,
  Save,
  Cancel,
  Image as ImageIcon,
  Refresh,
  Storage,
  CheckCircle,
  Warning,
  ContentCopy,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { cmsService, CMSHeroSection, CMSService, CMSBrand, CMSProcessStep, CMSFeaturedEquipment, CMSTestimonial, CMSSiteSetting } from '../../services/cms';
import ImageUpload from '../../components/ImageUpload';
import { checkAndCreateMediaBucket, CREATE_MEDIA_BUCKET_SQL } from '../../utils/checkStorage';
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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
      id={`cms-tabpanel-${index}`}
      aria-labelledby={`cms-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Fade in timeout={300}>
          <Box sx={{ py: 3 }}>{children}</Box>
        </Fade>
      )}
    </div>
  );
}

const ContentManagement: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [storageCheckDialog, setStorageCheckDialog] = useState(false);
  const [storageCheckResult, setStorageCheckResult] = useState<{ success?: boolean; error?: string; message?: string } | null>(null);
  const [checkingStorage, setCheckingStorage] = useState(false);

  // State for different content types
  const [heroSections, setHeroSections] = useState<CMSHeroSection[]>([]);
  const [services, setServices] = useState<CMSService[]>([]);
  const [brands, setBrands] = useState<CMSBrand[]>([]);
  const [processSteps, setProcessSteps] = useState<CMSProcessStep[]>([]);
  const [featuredEquipment, setFeaturedEquipment] = useState<CMSFeaturedEquipment[]>([]);
  const [testimonials, setTestimonials] = useState<CMSTestimonial[]>([]);
  const [siteSettings, setSiteSettings] = useState<CMSSiteSetting[]>([]);

  // Dialog states
  const [openHeroDialog, setOpenHeroDialog] = useState(false);
  const [openServiceDialog, setOpenServiceDialog] = useState(false);
  const [openBrandDialog, setOpenBrandDialog] = useState(false);
  const [openProcessDialog, setOpenProcessDialog] = useState(false);
  const [openFeaturedDialog, setOpenFeaturedDialog] = useState(false);
  const [openTestimonialDialog, setOpenTestimonialDialog] = useState(false);

  // Form data states
  const [editingHero, setEditingHero] = useState<CMSHeroSection | null>(null);
  const [editingService, setEditingService] = useState<CMSService | null>(null);
  const [editingBrand, setEditingBrand] = useState<CMSBrand | null>(null);
  const [editingProcess, setEditingProcess] = useState<CMSProcessStep | null>(null);
  const [editingFeatured, setEditingFeatured] = useState<CMSFeaturedEquipment | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<CMSTestimonial | null>(null);

  useEffect(() => {
    fetchContentByTab(activeTab);
  }, [activeTab]);

  const fetchContentByTab = async (tabIndex: number) => {
    setLoading(true);
    try {
      switch (tabIndex) {
        case 0:
          // Dashboard - fetch all counts
          await Promise.all([
            fetchHeroSections(),
            fetchServices(),
            fetchBrands(),
            fetchProcessSteps(),
            fetchFeaturedEquipment(),
            fetchTestimonials(),
            fetchSiteSettings(),
          ]);
          break;
        case 1:
          await fetchHeroSections();
          break;
        case 2:
          await fetchServices();
          break;
        case 3:
          await fetchBrands();
          break;
        case 4:
          await fetchProcessSteps();
          break;
        case 5:
          await fetchFeaturedEquipment();
          break;
        case 6:
          await fetchTestimonials();
          break;
        case 7:
          await fetchSiteSettings();
          break;
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshContent = async () => {
    setRefreshing(true);
    await fetchContentByTab(activeTab);
    setRefreshing(false);
  };

  const handleCheckStorage = async () => {
    setCheckingStorage(true);
    setStorageCheckResult(null);
    const result = await checkAndCreateMediaBucket();
    setStorageCheckResult(result);
    setCheckingStorage(false);
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(CREATE_MEDIA_BUCKET_SQL);
    alert(t('admin.contentManagement.sqlCopied'));
  };

  // Fetch functions
  const fetchHeroSections = async () => {
    const { data, error } = await cmsService.getHeroSections();
    if (!error && data) {
      setHeroSections(data);
    }
  };

  const fetchServices = async () => {
    const { data, error } = await cmsService.getServices();
    if (!error && data) {
      setServices(data);
    }
  };

  const fetchBrands = async () => {
    const { data, error } = await cmsService.getBrands();
    if (!error && data) {
      setBrands(data);
    }
  };

  const fetchProcessSteps = async () => {
    const { data, error } = await cmsService.getProcessSteps();
    if (!error && data) {
      setProcessSteps(data);
    }
  };

  const fetchFeaturedEquipment = async () => {
    const { data, error } = await cmsService.getFeaturedEquipment();
    if (!error && data) {
      setFeaturedEquipment(data);
    }
  };

  const fetchTestimonials = async () => {
    const { data, error } = await cmsService.getTestimonials();
    if (!error && data) {
      setTestimonials(data);
    }
  };

  const fetchSiteSettings = async () => {
    const { data, error } = await cmsService.getSiteSettings();
    if (!error && data) {
      setSiteSettings(data);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Hero Section handlers
  const handleEditHero = (hero?: CMSHeroSection) => {
    setEditingHero(hero || {
      title: '',
      subtitle: '',
      cta_text: '',
      cta_link: '',
      background_image: '',
      gradient_start: '#00d4ff',
      gradient_end: '#ff0080',
      is_active: true,
      display_order: 0,
    });
    setOpenHeroDialog(true);
  };

  const handleSaveHero = async () => {
    if (!editingHero) return;
    
    try {
      if (editingHero.id) {
        await cmsService.updateHeroSection(editingHero.id, editingHero);
      } else {
        await cmsService.createHeroSection(editingHero);
      }
      
      setOpenHeroDialog(false);
      setEditingHero(null);
      await fetchHeroSections();
    } catch (error) {
      console.error('Error saving hero section:', error);
    }
  };

  const handleDeleteHero = async (id: string) => {
    if (window.confirm(t('admin.contentManagement.confirmDelete.heroSection'))) {
      try {
        await cmsService.deleteHeroSection(id);
        await fetchHeroSections();
      } catch (error) {
        console.error('Error deleting hero section:', error);
      }
    }
  };

  // Service handlers
  const handleEditService = (service?: CMSService) => {
    setEditingService(service || {
      icon_name: 'LocalShipping',
      title: '',
      description: '',
      gradient_start: '#00d4ff',
      gradient_end: '#0099cc',
      shadow_color: 'rgba(0, 212, 255, 0.4)',
      is_active: true,
      display_order: 0,
    });
    setOpenServiceDialog(true);
  };

  const handleSaveService = async () => {
    if (!editingService) return;
    
    try {
      if (editingService.id) {
        await cmsService.updateService(editingService.id, editingService);
      } else {
        await cmsService.createService(editingService);
      }
      
      setOpenServiceDialog(false);
      setEditingService(null);
      await fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (window.confirm(t('admin.contentManagement.confirmDelete.service'))) {
      try {
        await cmsService.deleteService(id);
        await fetchServices();
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  // Brand handlers
  const handleEditBrand = (brand?: CMSBrand) => {
    setEditingBrand(brand || {
      name: '',
      logo_url: '',
      website_url: '',
      description: '',
      is_active: true,
      display_order: 0,
    });
    setOpenBrandDialog(true);
  };

  const handleSaveBrand = async () => {
    if (!editingBrand) return;
    
    try {
      if (editingBrand.id) {
        await cmsService.updateBrand(editingBrand.id, editingBrand);
      } else {
        await cmsService.createBrand(editingBrand);
      }
      
      setOpenBrandDialog(false);
      setEditingBrand(null);
      await fetchBrands();
    } catch (error) {
      console.error('Error saving brand:', error);
    }
  };

  const handleDeleteBrand = async (id: string) => {
    if (window.confirm(t('admin.contentManagement.confirmDelete.brand'))) {
      try {
        await cmsService.deleteBrand(id);
        await fetchBrands();
      } catch (error) {
        console.error('Error deleting brand:', error);
      }
    }
  };

  // Dashboard overview cards
  const renderDashboard = () => (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        {t('admin.contentManagement.contentOverview')}
      </Typography>
      
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            xl: 'repeat(4, 1fr)',
          },
          gap: { xs: 2, sm: 2.5, md: 3 },
        }}
      >
        {[
          { title: t('admin.contentManagement.heroSections'), count: heroSections.length, icon: <ViewCarousel />, color: '#00d4ff', tab: 1 },
          { title: t('admin.contentManagement.services'), count: services.length, icon: <Build />, color: '#ff0080', tab: 2 },
          { title: t('admin.contentManagement.brands'), count: brands.length, icon: <Storefront />, color: '#00ff88', tab: 3 },
          { title: t('admin.contentManagement.processSteps'), count: processSteps.length, icon: <Timeline />, color: '#ffaa00', tab: 4 },
          { title: t('admin.contentManagement.featuredEquipment'), count: featuredEquipment.length, icon: <Inventory />, color: '#00d4ff', tab: 5 },
          { title: t('admin.contentManagement.testimonials'), count: testimonials.length, icon: <Reviews />, color: '#ff0080', tab: 6 },
          { title: t('admin.contentManagement.siteSettings'), count: siteSettings.length, icon: <Settings />, color: '#00ff88', tab: 7 },
        ].map((item, index) => (
          <Card
            key={index}
            sx={{
              cursor: 'pointer',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 24px ${item.color}20`,
              },
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={() => setActiveTab(item.tab)}
          >
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    p: { xs: 1, sm: 1.5 },
                    borderRadius: 1,
                    bgcolor: `${item.color}20`,
                    color: item.color,
                    mr: 2,
                  }}
                >
                  {item.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
                    {item.count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {item.title}
                  </Typography>
                </Box>
              </Box>
              <Button
                size="small"
                sx={{ color: item.color, mt: 'auto' }}
                endIcon={<Edit />}
              >
                {t('admin.contentManagement.manage')}
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );

  // Hero sections tab
  const renderHeroSections = () => (
    <Box>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          {t('admin.contentManagement.heroSections')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleEditHero()}
          sx={{
            background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
            boxShadow: '0 2px 8px rgba(0,212,255,0.2)',
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          {t('admin.contentManagement.addHeroSection')}
        </Button>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(auto-fill, minmax(320px, 1fr))',
            md: 'repeat(2, 1fr)',
            xl: 'repeat(3, 1fr)',
          },
          gap: { xs: 2, sm: 2.5, md: 3 },
        }}
      >
        {heroSections.map((hero) => (
          <Card key={hero.id} sx={{ position: 'relative' }}>
            {hero.background_image && (
              <Box
                sx={{
                  height: 150,
                  backgroundImage: `url(${hero.background_image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%)',
                  },
                }}
              />
            )}
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    {hero.title}
                  </Typography>
                  {hero.subtitle && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {hero.subtitle}
                    </Typography>
                  )}
                </Box>
                <Chip
                  label={hero.is_active ? t('admin.contentManagement.active') : t('admin.contentManagement.inactive')}
                  color={hero.is_active ? 'success' : 'default'}
                  size="small"
                />
              </Box>
              
              {hero.cta_text && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('admin.contentManagement.cta')}: {hero.cta_text}
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title={t('admin.contentManagement.edit')}>
                  <IconButton
                    size="small"
                    onClick={() => handleEditHero(hero)}
                    sx={{ color: '#00d4ff' }}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('admin.contentManagement.delete')}>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteHero(hero.id!)}
                    sx={{ color: '#ff3366' }}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );

  // Services tab
  const renderServices = () => (
    <Box>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          {t('admin.contentManagement.services')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleEditService()}
          sx={{
            background: 'linear-gradient(135deg, #ff0080 0%, #cc0066 100%)',
            boxShadow: '0 2px 8px rgba(255,0,128,0.2)',
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          {t('admin.contentManagement.addService')}
        </Button>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(auto-fill, minmax(250px, 1fr))',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: { xs: 2, sm: 2.5, md: 3 },
        }}
      >
        {services.map((service) => (
          <Card key={service.id} sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 1,
                    background: `linear-gradient(135deg, ${service.gradient_start}, ${service.gradient_end})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}
                >
                  <Typography sx={{ color: 'white', fontSize: 24 }}>
                    {service.icon_name.charAt(0)}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    {service.title}
                  </Typography>
                  <Chip
                    label={service.is_active ? t('admin.contentManagement.active') : t('admin.contentManagement.inactive')}
                    color={service.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                {service.description}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                <Tooltip title={t('admin.contentManagement.edit')}>
                  <IconButton
                    size="small"
                    onClick={() => handleEditService(service)}
                    sx={{ color: '#00d4ff' }}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('admin.contentManagement.delete')}>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteService(service.id!)}
                    sx={{ color: '#ff3366' }}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );

  // Brands tab
  const renderBrands = () => (
    <Box>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          {t('admin.contentManagement.brandPartners')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleEditBrand()}
          sx={{
            background: 'linear-gradient(135deg, #00ff88 0%, #00cc6f 100%)',
            boxShadow: '0 2px 8px rgba(0,255,136,0.2)',
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          {t('admin.contentManagement.addBrand')}
        </Button>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(auto-fill, minmax(140px, 1fr))',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(4, 1fr)',
            lg: 'repeat(6, 1fr)',
          },
          gap: { xs: 2, sm: 2.5, md: 3 },
        }}
      >
        {brands.map((brand) => (
          <Card key={brand.id} sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent>
              <Box
                sx={{
                  height: 100,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                {brand.logo_url ? (
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <ImageIcon sx={{ fontSize: 48, color: 'rgba(0,0,0,0.2)' }} />
                )}
              </Box>
              
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' } }}>
                {brand.name}
              </Typography>
              
              <Chip
                label={brand.is_active ? t('admin.contentManagement.active') : t('admin.contentManagement.inactive')}
                color={brand.is_active ? 'success' : 'default'}
                size="small"
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                <Tooltip title={t('admin.contentManagement.edit')}>
                  <IconButton
                    size="small"
                    onClick={() => handleEditBrand(brand)}
                    sx={{ color: '#00d4ff' }}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('admin.contentManagement.delete')}>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteBrand(brand.id!)}
                    sx={{ color: '#ff3366' }}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );

  // Hero Dialog
  const renderHeroDialog = () => (
    <Dialog
      open={openHeroDialog}
      onClose={() => setOpenHeroDialog(false)}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          width: { xs: '95%', sm: '90%', md: '80%' },
          maxWidth: { xs: '100%', sm: '600px', md: '800px' },
        }
      }}
    >
      <DialogTitle sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
        {editingHero?.id ? t('admin.contentManagement.editHeroSection') : t('admin.contentManagement.addHeroSection')}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label={t('admin.contentManagement.fields.title')}
            fullWidth
            value={editingHero?.title || ''}
            onChange={(e) => setEditingHero({ ...editingHero!, title: e.target.value })}
          />
          <TextField
            label={t('admin.contentManagement.fields.subtitle')}
            fullWidth
            multiline
            rows={2}
            value={editingHero?.subtitle || ''}
            onChange={(e) => setEditingHero({ ...editingHero!, subtitle: e.target.value })}
          />
          <TextField
            label={t('admin.contentManagement.fields.ctaText')}
            fullWidth
            value={editingHero?.cta_text || ''}
            onChange={(e) => setEditingHero({ ...editingHero!, cta_text: e.target.value })}
          />
          <TextField
            label={t('admin.contentManagement.fields.ctaLink')}
            fullWidth
            value={editingHero?.cta_link || ''}
            onChange={(e) => setEditingHero({ ...editingHero!, cta_link: e.target.value })}
          />
          <ImageUpload
            currentImage={editingHero?.background_image}
            onImageChange={(url) => setEditingHero({ ...editingHero!, background_image: url })}
            folder="hero"
            label={t('admin.contentManagement.fields.backgroundImage')}
          />
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2
          }}>
            <TextField
              label={t('admin.contentManagement.fields.gradientStartColor')}
              fullWidth
              type="color"
              value={editingHero?.gradient_start || '#00d4ff'}
              onChange={(e) => setEditingHero({ ...editingHero!, gradient_start: e.target.value })}
            />
            <TextField
              label={t('admin.contentManagement.fields.gradientEndColor')}
              fullWidth
              type="color"
              value={editingHero?.gradient_end || '#ff0080'}
              onChange={(e) => setEditingHero({ ...editingHero!, gradient_end: e.target.value })}
            />
          </Box>
          <TextField
            label={t('admin.contentManagement.fields.displayOrder')}
            fullWidth
            type="number"
            value={editingHero?.display_order || 0}
            onChange={(e) => setEditingHero({ ...editingHero!, display_order: parseInt(e.target.value) })}
          />
          <FormControlLabel
            control={
              <Switch
                checked={editingHero?.is_active || false}
                onChange={(e) => setEditingHero({ ...editingHero!, is_active: e.target.checked })}
              />
            }
            label={t('admin.contentManagement.active')}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
        <Button onClick={() => setOpenHeroDialog(false)}>
          {t('admin.contentManagement.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSaveHero}
          sx={{
            background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
          }}
        >
          {t('admin.contentManagement.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Service Dialog
  const renderServiceDialog = () => (
    <Dialog
      open={openServiceDialog}
      onClose={() => setOpenServiceDialog(false)}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          width: { xs: '95%', sm: '90%', md: '80%' },
          maxWidth: { xs: '100%', sm: '600px', md: '800px' },
        }
      }}
    >
      <DialogTitle sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
        {editingService?.id ? t('admin.contentManagement.editService') : t('admin.contentManagement.addService')}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label={t('admin.contentManagement.fields.iconName')}
            fullWidth
            value={editingService?.icon_name || ''}
            onChange={(e) => setEditingService({ ...editingService!, icon_name: e.target.value })}
            helperText={t('admin.contentManagement.fields.iconHelperText')}
          />
          <TextField
            label={t('admin.contentManagement.fields.title')}
            fullWidth
            value={editingService?.title || ''}
            onChange={(e) => setEditingService({ ...editingService!, title: e.target.value })}
          />
          <TextField
            label={t('admin.contentManagement.fields.description')}
            fullWidth
            multiline
            rows={3}
            value={editingService?.description || ''}
            onChange={(e) => setEditingService({ ...editingService!, description: e.target.value })}
          />
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2
          }}>
            <TextField
              label={t('admin.contentManagement.fields.gradientStartColor')}
              fullWidth
              type="color"
              value={editingService?.gradient_start || '#00d4ff'}
              onChange={(e) => setEditingService({ ...editingService!, gradient_start: e.target.value })}
            />
            <TextField
              label={t('admin.contentManagement.fields.gradientEndColor')}
              fullWidth
              type="color"
              value={editingService?.gradient_end || '#0099cc'}
              onChange={(e) => setEditingService({ ...editingService!, gradient_end: e.target.value })}
            />
          </Box>
          <TextField
            label={t('admin.contentManagement.fields.shadowColor')}
            fullWidth
            value={editingService?.shadow_color || ''}
            onChange={(e) => setEditingService({ ...editingService!, shadow_color: e.target.value })}
            helperText={t('admin.contentManagement.fields.shadowColorHelperText')}
          />
          <TextField
            label={t('admin.contentManagement.fields.displayOrder')}
            fullWidth
            type="number"
            value={editingService?.display_order || 0}
            onChange={(e) => setEditingService({ ...editingService!, display_order: parseInt(e.target.value) })}
          />
          <FormControlLabel
            control={
              <Switch
                checked={editingService?.is_active || false}
                onChange={(e) => setEditingService({ ...editingService!, is_active: e.target.checked })}
              />
            }
            label={t('admin.contentManagement.active')}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
        <Button onClick={() => setOpenServiceDialog(false)}>
          {t('admin.contentManagement.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSaveService}
          sx={{
            background: 'linear-gradient(135deg, #ff0080 0%, #cc0066 100%)',
          }}
        >
          {t('admin.contentManagement.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Brand Dialog
  const renderBrandDialog = () => (
    <Dialog
      open={openBrandDialog}
      onClose={() => setOpenBrandDialog(false)}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          width: { xs: '95%', sm: '90%', md: '80%' },
          maxWidth: { xs: '100%', sm: '600px', md: '800px' },
        }
      }}
    >
      <DialogTitle sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
        {editingBrand?.id ? t('admin.contentManagement.editBrand') : t('admin.contentManagement.addBrand')}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label={t('admin.contentManagement.fields.brandName')}
            fullWidth
            value={editingBrand?.name || ''}
            onChange={(e) => setEditingBrand({ ...editingBrand!, name: e.target.value })}
          />
          <ImageUpload
            currentImage={editingBrand?.logo_url}
            onImageChange={(url) => setEditingBrand({ ...editingBrand!, logo_url: url })}
            folder="brands"
            label={t('admin.contentManagement.fields.brandLogo')}
          />
          <TextField
            label={t('admin.contentManagement.fields.websiteUrl')}
            fullWidth
            value={editingBrand?.website_url || ''}
            onChange={(e) => setEditingBrand({ ...editingBrand!, website_url: e.target.value })}
          />
          <TextField
            label={t('admin.contentManagement.fields.description')}
            fullWidth
            multiline
            rows={3}
            value={editingBrand?.description || ''}
            onChange={(e) => setEditingBrand({ ...editingBrand!, description: e.target.value })}
          />
          <TextField
            label={t('admin.contentManagement.fields.displayOrder')}
            fullWidth
            type="number"
            value={editingBrand?.display_order || 0}
            onChange={(e) => setEditingBrand({ ...editingBrand!, display_order: parseInt(e.target.value) })}
          />
          <FormControlLabel
            control={
              <Switch
                checked={editingBrand?.is_active || false}
                onChange={(e) => setEditingBrand({ ...editingBrand!, is_active: e.target.checked })}
              />
            }
            label={t('admin.contentManagement.active')}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
        <Button onClick={() => setOpenBrandDialog(false)}>
          {t('admin.contentManagement.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSaveBrand}
          sx={{
            background: 'linear-gradient(135deg, #00ff88 0%, #00cc6f 100%)',
          }}
        >
          {t('admin.contentManagement.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 3, md: 4 }, mb: { xs: 4, sm: 5, md: 6 } }}>
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 }
        }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #ff0080 0%, #00d4ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' },
              textAlign: { xs: 'center', sm: 'left' }
            }}
          >
            {t('admin.contentManagement.title')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={refreshContent}
              disabled={refreshing}
              sx={{
                bgcolor: 'rgba(0,212,255,0.1)',
                '&:hover': { bgcolor: 'rgba(0,212,255,0.2)' },
              }}
            >
              {refreshing ? <CircularProgress size={24} /> : <Refresh />}
            </IconButton>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Storage />}
              onClick={() => setStorageCheckDialog(true)}
              sx={{
                borderColor: '#00d4ff',
                color: '#00d4ff',
                '&:hover': {
                  borderColor: '#0099cc',
                  bgcolor: 'rgba(0,212,255,0.1)',
                },
              }}
            >
              Check Storage
            </Button>
          </Box>
        </Box>

        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: '1px solid rgba(0,0,0,0.1)',
              '& .MuiTab-root': {
                fontWeight: 600,
                minHeight: { xs: 56, sm: 64 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
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
            <Tab icon={<Dashboard />} label={t('admin.contentManagement.overview')} />
            <Tab icon={<ViewCarousel />} label={t('admin.contentManagement.heroSections')} />
            <Tab icon={<Build />} label={t('admin.contentManagement.services')} />
            <Tab icon={<Storefront />} label={t('admin.contentManagement.brands')} />
            <Tab icon={<Timeline />} label={t('admin.contentManagement.processSteps')} />
            <Tab icon={<Inventory />} label={t('admin.contentManagement.featuredEquipment')} />
            <Tab icon={<Reviews />} label={t('admin.contentManagement.testimonials')} />
            <Tab icon={<Settings />} label={t('admin.contentManagement.siteSettings')} />
            <Tab icon={<WebAsset />} label={t('admin.contentManagement.footer')} />
            <Tab icon={<Code />} label={t('admin.contentManagement.pageMeta')} />
          </Tabs>

          <Box sx={{ p: 3, minHeight: '60vh' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TabPanel value={activeTab} index={0}>
                  {renderDashboard()}
                </TabPanel>
                <TabPanel value={activeTab} index={1}>
                  {renderHeroSections()}
                </TabPanel>
                <TabPanel value={activeTab} index={2}>
                  {renderServices()}
                </TabPanel>
                <TabPanel value={activeTab} index={3}>
                  {renderBrands()}
                </TabPanel>
                <TabPanel value={activeTab} index={4}>
                  <Alert severity="info">{t('admin.contentManagement.comingSoon', { feature: t('admin.contentManagement.processSteps') })}</Alert>
                </TabPanel>
                <TabPanel value={activeTab} index={5}>
                  <Alert severity="info">{t('admin.contentManagement.comingSoon', { feature: t('admin.contentManagement.featuredEquipment') })}</Alert>
                </TabPanel>
                <TabPanel value={activeTab} index={6}>
                  <Alert severity="info">{t('admin.contentManagement.comingSoon', { feature: t('admin.contentManagement.testimonials') })}</Alert>
                </TabPanel>
                <TabPanel value={activeTab} index={7}>
                  <Alert severity="info">{t('admin.contentManagement.comingSoon', { feature: t('admin.contentManagement.siteSettings') })}</Alert>
                </TabPanel>
                <TabPanel value={activeTab} index={8}>
                  <Alert severity="info">{t('admin.contentManagement.comingSoon', { feature: t('admin.contentManagement.footer') })}</Alert>
                </TabPanel>
                <TabPanel value={activeTab} index={9}>
                  <Alert severity="info">{t('admin.contentManagement.comingSoon', { feature: t('admin.contentManagement.pageMeta') })}</Alert>
                </TabPanel>
              </>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Dialogs */}
      {renderHeroDialog()}
      {renderServiceDialog()}
      {renderBrandDialog()}

      {/* Storage Check Dialog */}
      <Dialog
        open={storageCheckDialog}
        onClose={() => setStorageCheckDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Storage />
            Storage Configuration Check
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            {checkingStorage ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Checking storage configuration...</Typography>
              </Box>
            ) : storageCheckResult ? (
              <Box>
                {storageCheckResult.success ? (
                  <Alert
                    severity="success"
                    icon={<CheckCircle />}
                    sx={{ mb: 2 }}
                  >
                    {storageCheckResult.message}
                  </Alert>
                ) : (
                  <>
                    <Alert
                      severity="error"
                      icon={<Warning />}
                      sx={{ mb: 2 }}
                    >
                      {storageCheckResult.error}
                    </Alert>
                    <Paper sx={{ p: 2, bgcolor: 'grey.100', mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        To fix this issue, run the following SQL in your Supabase dashboard:
                      </Typography>
                      <Box sx={{
                        mt: 1,
                        p: 2,
                        bgcolor: 'grey.900',
                        borderRadius: 1,
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        color: 'common.white',
                        overflow: 'auto',
                        maxHeight: 300
                      }}>
                        <pre style={{ margin: 0 }}>
                          {CREATE_MEDIA_BUCKET_SQL}
                        </pre>
                      </Box>
                      <Button
                        startIcon={<ContentCopy />}
                        onClick={handleCopySQL}
                        sx={{ mt: 1 }}
                      >
                        Copy SQL
                      </Button>
                    </Paper>
                    <Typography variant="body2" color="text.secondary">
                      1. Go to your Supabase Dashboard<br />
                      2. Navigate to SQL Editor<br />
                      3. Paste and run the SQL above<br />
                      4. Click "Check Storage" again to verify
                    </Typography>
                  </>
                )}
              </Box>
            ) : (
              <Typography color="text.secondary">
                Click "Check Storage" to verify your storage configuration.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStorageCheckDialog(false)}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={handleCheckStorage}
            disabled={checkingStorage}
            sx={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
            }}
          >
            Check Storage
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ContentManagement;