import React, { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PageTitle } from './';
import { cmsService, CMSBrand } from '../services/cms';

const OurBrands: React.FC = () => {
  const { t } = useTranslation();
  const [brands, setBrands] = useState<CMSBrand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrands();

    // Subscribe to real-time updates
    const subscription = cmsService.subscribeToChanges('cms_brands', () => {
      fetchBrands();
    });

    return () => {
      cmsService.unsubscribe(subscription);
    };
  }, []);

  const fetchBrands = async () => {
    try {
      const { data, error } = await cmsService.getBrands(true); // Only get active brands
      if (!error && data) {
        setBrands(data);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      // Fallback to default brands
      setBrands([
        { id: '1', name: 'Brand 1', logo_url: '/brands/1 (1).png', is_active: true, display_order: 0 },
        { id: '2', name: 'Brand 2', logo_url: '/brands/1 (2).png', is_active: true, display_order: 1 },
        { id: '3', name: 'Brand 3', logo_url: '/brands/1 (3).png', is_active: true, display_order: 2 },
        { id: '4', name: 'Brand 4', logo_url: '/brands/1 (1).png', is_active: true, display_order: 3 },
        { id: '5', name: 'Brand 5', logo_url: '/brands/1 (2).png', is_active: true, display_order: 4 },
        { id: '6', name: 'Brand 6', logo_url: '/brands/1 (3).png', is_active: true, display_order: 5 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Double the brands array for seamless loop
  const doubledBrands = [...brands, ...brands];

  return (
    <Box sx={{
      my: { xs: 4, sm: 6, md: 8 },
      position: 'relative',
      overflow: 'hidden'
    }}>
      <PageTitle
        text={t('ourBrands.title')}
        align="center"
        size="medium"
      />
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : brands.length > 0 ? (
        <Box
          sx={{
            position: 'relative',
            mt: 1,
            py: { xs: 0.5, sm: 1 },
            background: 'oklch(98.7% 0.026 102.212)',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: { xs: '40px', sm: '60px', md: '100px' },
              height: '100%',
              background: 'oklch(98.7% 0.026 102.212 / 0.9)',
              zIndex: 3,
              pointerEvents: 'none',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: { xs: '40px', sm: '60px', md: '100px' },
              height: '100%',
              background: 'oklch(98.7% 0.026 102.212 / 0.9)',
              zIndex: 3,
              pointerEvents: 'none',
            },
          }}
        >
          <Box
            className="brands-track"
            sx={{
              display: 'flex',
              width: 'max-content',
              animation: {
                xs: 'brandsSlideLoop 25s linear infinite',
                sm: 'brandsSlideLoop 35s linear infinite',
                md: 'brandsSlideLoop 45s linear infinite'
              },
              '@keyframes brandsSlideLoop': {
                '0%': {
                  transform: 'translateX(0)',
                },
                '100%': {
                  transform: 'translateX(calc(-100% / 2))',
                },
              },
            }}
          >
            {doubledBrands.map((brand, index) => (
              <Box
                key={`${brand.id || index}-${index}`}
                sx={{
                  flex: '0 0 auto',
                  mx: { xs: 2, sm: 3, md: 4 },
                  px: { xs: 1.5, sm: 2, md: 3 },
                  py: { xs: 1, sm: 1.5, md: 2 },
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: { xs: 'none', sm: 'translateY(-4px)' },
                    '& .brand-logo': {
                      transform: { xs: 'none', sm: 'scale(1.05)' },
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <Box
                    className="brand-logo"
                    sx={{
                      width: { xs: 100, sm: 120, md: 150 },
                      height: { xs: 40, sm: 50, md: 60 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Box
                      component="img"
                      src={brand.logo_url}
                      alt={brand.name}
                      sx={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-product.png';
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      ) : null}
    </Box>
  );
};

export default OurBrands;
