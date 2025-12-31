import React from 'react';
import { Box, Typography } from '@mui/material';
import { PageTitle } from './';

const CUSTOMERS = [
  {
    id: 1,
    logo: '/brands/1 (1).png',
  },
  {
    id: 2,
    logo: '/brands/1 (2).png',
  },
  {
    id: 3,
    logo: '/brands/1 (3).png',
  },
  
  {
    id: 5,
    logo: '/brands/1 (1).png',
  },
  {
    id: 6,
    logo: '/brands/1 (2).png',
  },
  {
    id: 7,
    logo: '/brands/1 (3).png',
  },
  
];

const OurCustomers: React.FC = () => {
  // Double the customers array for seamless loop
  const doubledCustomers = [...CUSTOMERS, ...CUSTOMERS];

  return (
    <Box sx={{
      my: { xs: 4, sm: 6, md: 8 },
      position: 'relative',
      overflow: 'hidden'
    }}>
      <PageTitle
        text="Our Customers"
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
            width: { xs: '40px', sm: '70px', md: '120px' },
            height: '100%',
            background: 'oklch(98.7% 0.026 102.212 / 0.95)',
            zIndex: 3,
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: { xs: '40px', sm: '70px', md: '120px' },
            height: '100%',
            background: 'oklch(98.7% 0.026 102.212 / 0.95)',
            zIndex: 3,
            pointerEvents: 'none',
          },
        }}
      >
        <Box
          className="customers-track"
          sx={{
            display: 'flex',
            animation: {
              xs: 'scrollReverse 20s linear infinite',
              sm: 'scrollReverse 28s linear infinite',
              md: 'scrollReverse 35s linear infinite'
            },
            '&:hover': {
              animationPlayState: 'paused',
            },
            '@keyframes scrollReverse': {
              '0%': {
                transform: 'translateX(0)',
              },
              '100%': {
                transform: 'translateX(50%)',
              },
            },
          }}
        >
          {doubledCustomers.map((customer, index) => (
            <Box
              key={`${customer.id}-${index}`}
              sx={{
                flex: '0 0 auto',
                mx: { xs: 2, sm: 3, md: 4 },
                px: { xs: 1.5, sm: 2, md: 3 },
                py: { xs: 1, sm: 1.5, md: 2 },
                // borderRadius: 3,
                // background: 'oklch(95% 0.026 102.212)',
                // border: '1px solid rgba(0,0,0,0.06)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                minWidth: { xs: 140, sm: 180, md: 240 },
                '&:hover': {
                  transform: { xs: 'none', sm: 'translateY(-6px)' },
                  // background: 'oklch(93% 0.026 102.212)',
                  // borderColor: 'rgba(0,0,0,0.12)',
                  // boxShadow: '0 15px 40px rgba(0,0,0,0.12)',
                  '& .customer-logo': {
                    transform: { xs: 'none', sm: 'scale(1.05)' },
                  },
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <Box
                  className="customer-logo"
                  sx={{
                    width: { xs: 110, sm: 140, md: 180 },
                    height: { xs: 45, sm: 55, md: 70 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    mb: { xs: 0.5, sm: 0.75, md: 1 },
                  }}
                >
                  <Box
                    component="img"
                    src={customer.logo}
                    alt={`Customer ${customer.id}`}
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

export default OurCustomers;