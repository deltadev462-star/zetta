import React from 'react';
import { Box } from '@mui/material';
import { PageTitle } from './';

const BRANDS = [
  {
    id: 1,
    logo: '/brands/1 (1).png',
    alt: 'Brand 1',
  },
  {
    id: 2,
    logo: '/brands/1 (2).png',
    alt: 'Brand 2',
  },
  {
    id: 3,
    logo: '/brands/1 (3).png',
    alt: 'Brand 3',
  },
  
  {
    id: 5,
    logo: '/brands/1 (1).png',
    alt: 'Brand 5',
  },
  {
    id: 6,
    logo: '/brands/1 (2).png',
    alt: 'Brand 6',
  },
  {
    id: 7,
    logo: '/brands/1 (3).png',
    alt: 'Brand 7',
  },
 
];

const OurBrands: React.FC = () => {
  // Double the brands array for seamless loop
  const doubledBrands = [...BRANDS, ...BRANDS];

  return (
    <Box sx={{
      my: { xs: 4, sm: 6, md: 8 },
      position: 'relative',
      overflow: 'hidden'
    }}>
      <PageTitle
        text="Our Brands"
        align="center"
        size="medium"
         
      />
      
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
            animation: {
              xs: 'scroll 20s linear infinite',
              sm: 'scroll 25s linear infinite',
              md: 'scroll 30s linear infinite'
            },
            '&:hover': {
              animationPlayState: 'paused',
            },
            '@keyframes scroll': {
              '0%': {
                transform: 'translateX(0)',
              },
              '100%': {
                transform: 'translateX(-50%)',
              },
            },
          }}
        >
          {doubledBrands.map((brand, index) => (
            <Box
              key={`${brand.id}-${index}`}
              sx={{
                flex: '0 0 auto',
                mx: { xs: 2, sm: 3, md: 4 },
                px: { xs: 1.5, sm: 2, md: 3 },
                py: { xs: 1, sm: 1.5, md: 2 },
                // borderRadius: 2,
                // background: 'oklch(95% 0.026 102.212)',
                // border: '1px solid rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: { xs: 'none', sm: 'translateY(-4px)' },
                  // background: 'oklch(93% 0.026 102.212)',
                  // borderColor: 'rgba(0,0,0,0.15)',
                  // boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
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
                    src={brand.logo}
                    alt={brand.alt}
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
    </Box>
  );
};

export default OurBrands;
