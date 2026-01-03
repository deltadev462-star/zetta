import React from 'react';
import { Box, Card, CardMedia, Typography, IconButton, Grid } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageTitle from './PageTitle';

interface ExploreSectionProps {
  onNavigate?: (category: string) => void;
}


const ExploreSection: React.FC<ExploreSectionProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const exploreCategories = [
    {
      id: 1,
      title: t('productCategories.imagingEquipment'),
      image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1200',
      link: '/products?category=Imaging Equipment',
      categoryKey: 'imaging',
    },
    {
      id: 2,
      title: t('productCategories.surgicalEquipment'),
      image: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?q=80&w=1200',
      link: '/products?category=Surgical Equipment',
      categoryKey: 'surgical',
    },
    {
      id: 3,
      title: t('productCategories.laboratoryEquipment'),
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1200',
      link: '/products?category=Laboratory Equipment',
      categoryKey: 'laboratory',
    },
    {
      id: 4,
      title: t('productCategories.monitoringEquipment'),
      image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=1200',
      link: '/products?category=Monitoring Equipment',
      categoryKey: 'monitoring',
    },
    {
      id: 5,
      title: t('productCategories.respiratoryEquipment'),
      image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=1200',
      link: '/products?category=Respiratory Equipment',
      categoryKey: 'respiratory',
    },
    {
      id: 6,
      title: t('productCategories.emergencyEquipment'),
      image: 'https://images.unsplash.com/photo-1563213126-a4273aed2016?q=80&w=1200',
      link: '/products?category=Emergency Equipment',
      categoryKey: 'emergency',
    },
    {
      id: 7,
      title: t('productCategories.diagnosticEquipment'),
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=1200',
      link: '/products?category=Diagnostic Equipment',
      categoryKey: 'diagnostic',
    },
    {
      id: 8,
      title: t('productCategories.infusionEquipment'),
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1200',
      link: '/products?category=Infusion Equipment',
      categoryKey: 'infusion',
    },
  ];

  const handleCategoryClick = (category: typeof exploreCategories[0]) => {
    if (onNavigate) {
      onNavigate(category.categoryKey);
    } else {
      navigate(category.link);
    }
  };

  return (
    <Box sx={{ py: 6 }}>
      <PageTitle
        text={t('exploreSection.exploreTitle')}
        align="left"
        subtitle={t('exploreSection.exploreSubtitle')}
        size="large"
        glowEffect
      />
      
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)'
        },
        gap: 3,
        mt: 4
      }}>
        {exploreCategories.map((category) => (
            <Card
              onClick={() => handleCategoryClick(category)}
              sx={{
                position: 'relative',
                height: 280,
                cursor: 'pointer',
                overflow: 'hidden',
                bgcolor: 'oklch(98.7% 0.026 102.212)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  border: '1px solid rgba(0, 0, 0, 0.2)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                  '& .category-image': {
                    transform: 'scale(1.1)',
                  },
                  '& .category-overlay': {
                    opacity: 1,
                  },
                  '& .category-info': {
                    transform: 'translateY(0)',
                    opacity: 1,
                  },
                },
              }}
            >
              <CardMedia
                component="img"
                image={category.image}
                alt={category.title}
                className="category-image"
                sx={{
                  height: '100%',
                  width: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
              
              {/* Dark Overlay */}
              <Box
                className="category-overlay"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.6)',
                  opacity: 0.7,
                  transition: 'opacity 0.4s ease',
                }}
              />
              
              {/* Category Info */}
              <Box
                className="category-info"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  p: 3,
                  transform: 'translateY(20px)',
                  opacity: 0.9,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'white',
                      fontWeight: 700,
                      letterSpacing: '-0.01em',
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    {category.title}
                  </Typography>
                  <IconButton
                    size="small"
                    sx={{
                      bgcolor: 'oklch(95% 0.026 102.212)',
                      border: '1px solid rgba(0, 0, 0, 0.15)',
                      color: '#333',
                      '&:hover': {
                        bgcolor: 'oklch(93% 0.026 102.212)',
                        transform: 'scale(1.1)',
                        border: '1px solid rgba(0, 0, 0, 0.2)',
                      },
                    }}
                  >
                    <ArrowForward fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Card>
        ))}
      </Box>
    </Box>
  );
};

export default ExploreSection;