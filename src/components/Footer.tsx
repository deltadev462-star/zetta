import React from 'react';
import { Box, Container, Typography, Grid, Link, Divider, Stack, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { 
  AutoAwesome,
  Email,
  Phone,
  LinkedIn,
  Twitter,
  Facebook,
  Instagram
} from '@mui/icons-material';
import Services from './Services';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        backgroundColor: 'oklch(96.5% 0.026 102.212)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0, 0, 0, 0.1)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent)',
          animation: 'shimmer 3s infinite',
        },
        '@keyframes shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      }}
    >
       {/* Services Section */}
         <Box >
           <Services />
         </Box>
      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Logo and About Section */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography
            variant="h4"
            component={RouterLink}
            to="/"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              textDecoration: 'none',
              fontWeight: 800,
              mb: 2,
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'scale(1.05)',
                textShadow: '0 0 30px rgba(0,212,255,0.8)',
              },
            }}
          >
            <AutoAwesome sx={{ fontSize: 36, color: '#00d4ff' }} />
            <span
              style={{
                background: 'linear-gradient(135deg, #00d4ff 0%, #ff0080 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Zetta Med
            </span>
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(0,0,0,0.7)',
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.8,
            }}
          >
            Your trusted partner in medical equipment. Providing high-quality refurbished medical devices
            with comprehensive warranties and exceptional service.
          </Typography>
        </Box>

        {/* Main Footer Content - 4 Columns */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Catalog Column */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 3,
                color: '#00d4ff',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: 0,
                  width: 40,
                  height: 3,
                  bgcolor: '#00d4ff',
                  borderRadius: 1.5,
                },
              }}
            >
              Catalog
            </Typography>
            <Stack spacing={1.5}>
              <Link
                component={RouterLink}
                to="/products"
                sx={{
                  color: 'rgba(0,0,0,0.7)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  transition: 'all 0.3s',
                  '&:hover': {
                    color: '#00d4ff',
                    transform: 'translateX(5px)',
                  },
                }}
              >
                Search
              </Link>
              <Link
                component={RouterLink}
                to="/brands"
                sx={{
                  color: 'rgba(0,0,0,0.7)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  transition: 'all 0.3s',
                  '&:hover': {
                    color: '#00d4ff',
                    transform: 'translateX(5px)',
                  },
                }}
              >
                Our Brands
              </Link>
              <Link
                component={RouterLink}
                to="/offers"
                sx={{
                  color: 'rgba(0,0,0,0.7)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  transition: 'all 0.3s',
                  '&:hover': {
                    color: '#00d4ff',
                    transform: 'translateX(5px)',
                  },
                }}
              >
                Our Offers Without Product Sheet
              </Link>
            </Stack>
          </Grid>

          {/* About Column */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 3,
                color: '#00d4ff',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: 0,
                  width: 40,
                  height: 3,
                  bgcolor: '#00d4ff',
                  borderRadius: 1.5,
                },
              }}
            >
              About
            </Typography>
            <Stack spacing={1.5}>
              <Link
                component={RouterLink}
                to="/about"
                sx={{
                  color: 'rgba(0,0,0,0.7)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  transition: 'all 0.3s',
                  '&:hover': {
                    color: '#00d4ff',
                    transform: 'translateX(5px)',
                  },
                }}
              >
                About Us
              </Link>
              <Link
                component={RouterLink}
                to="/services"
                sx={{
                  color: 'rgba(0,0,0,0.7)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  transition: 'all 0.3s',
                  '&:hover': {
                    color: '#00d4ff',
                    transform: 'translateX(5px)',
                  },
                }}
              >
                Zetta Med's Services and Benefits
              </Link>
              <Link
                component={RouterLink}
                to="/sell"
                sx={{
                  color: 'rgba(0,0,0,0.7)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  transition: 'all 0.3s',
                  '&:hover': {
                    color: '#00d4ff',
                    transform: 'translateX(5px)',
                  },
                }}
              >
                Sell Your Equipment
              </Link>
            </Stack>
          </Grid>

          {/* Help Column */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 3,
                color: '#00d4ff',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: 0,
                  width: 40,
                  height: 3,
                  bgcolor: '#00d4ff',
                  borderRadius: 1.5,
                },
              }}
            >
              Help
            </Typography>
            <Stack spacing={1.5}>
              <Link
                component={RouterLink}
                to="/terms"
                sx={{
                  color: 'rgba(0,0,0,0.7)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  transition: 'all 0.3s',
                  '&:hover': {
                    color: '#00d4ff',
                    transform: 'translateX(5px)',
                  },
                }}
              >
                Terms and Conditions of Use
              </Link>
              <Link
                component={RouterLink}
                to="/sales-terms"
                sx={{
                  color: 'rgba(0,0,0,0.7)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  transition: 'all 0.3s',
                  '&:hover': {
                    color: '#00d4ff',
                    transform: 'translateX(5px)',
                  },
                }}
              >
                General Terms and Conditions of Sale
              </Link>
              <Link
                component={RouterLink}
                to="/privacy"
                sx={{
                  color: 'rgba(0,0,0,0.7)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  transition: 'all 0.3s',
                  '&:hover': {
                    color: '#00d4ff',
                    transform: 'translateX(5px)',
                  },
                }}
              >
                Legal Notices and Privacy Policy
              </Link>
              <Link
                component={RouterLink}
                to="/contact"
                sx={{
                  color: 'rgba(0,0,0,0.7)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  transition: 'all 0.3s',
                  '&:hover': {
                    color: '#00d4ff',
                    transform: 'translateX(5px)',
                  },
                }}
              >
                Contact Us
              </Link>
            </Stack>
          </Grid>

          {/* Contact Column */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 3,
                color: '#00d4ff',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: 0,
                  width: 40,
                  height: 3,
                  bgcolor: '#00d4ff',
                  borderRadius: 1.5,
                },
              }}
            >
              Contact
            </Typography>
            <Stack spacing={2}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 2,
                  bgcolor: 'rgba(0,212,255,0.08)',
                  borderRadius: 2,
                  border: '1px solid rgba(0,212,255,0.2)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    borderColor: '#00d4ff',
                    boxShadow: '0 0 20px rgba(0,212,255,0.2)',
                  },
                }}
              >
                <Email sx={{ color: '#00d4ff' }} />
                <Link
                  href="mailto:contact@zettamed.fr"
                  sx={{
                    color: 'rgba(0,0,0,0.8)',
                    textDecoration: 'none',
                    fontWeight: 500,
                    transition: 'color 0.3s',
                    '&:hover': {
                      color: '#00d4ff',
                    },
                  }}
                >
                  contact@zettamed.fr
                </Link>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 2,
                  bgcolor: 'rgba(0,212,255,0.08)',
                  borderRadius: 2,
                  border: '1px solid rgba(0,212,255,0.2)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    borderColor: '#00d4ff',
                    boxShadow: '0 0 20px rgba(0,212,255,0.2)',
                  },
                }}
              >
                <Phone sx={{ color: '#00d4ff' }} />
                <Link
                  href="tel:+33769609964"
                  sx={{
                    color: 'rgba(0,0,0,0.8)',
                    textDecoration: 'none',
                    fontWeight: 500,
                    transition: 'color 0.3s',
                    '&:hover': {
                      color: '#00d4ff',
                    },
                  }}
                >
                 +565 946 23 232
                </Link>
              </Box>

              {/* Social Media Icons */}
              <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                <IconButton
                  size="small"
                  sx={{
                    bgcolor: 'rgba(0,119,181,0.1)',
                    border: '1px solid rgba(0,119,181,0.2)',
                    color: '#0077B5',
                    transition: 'all 0.3s',
                    '&:hover': {
                      bgcolor: '#0077B5',
                      color: 'white',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 6px 20px rgba(0,119,181,0.4)',
                    },
                  }}
                >
                  <LinkedIn fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{
                    bgcolor: 'rgba(29,161,242,0.1)',
                    border: '1px solid rgba(29,161,242,0.2)',
                    color: '#1DA1F2',
                    transition: 'all 0.3s',
                    '&:hover': {
                      bgcolor: '#1DA1F2',
                      color: 'white',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 6px 20px rgba(29,161,242,0.4)',
                    },
                  }}
                >
                  <Twitter fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{
                    bgcolor: 'rgba(24,119,242,0.1)',
                    border: '1px solid rgba(24,119,242,0.2)',
                    color: '#1877F2',
                    transition: 'all 0.3s',
                    '&:hover': {
                      bgcolor: '#1877F2',
                      color: 'white',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 6px 20px rgba(24,119,242,0.4)',
                    },
                  }}
                >
                  <Facebook fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{
                    bgcolor: 'rgba(228,64,95,0.1)',
                    border: '1px solid rgba(228,64,95,0.2)',
                    color: '#E4405F',
                    transition: 'all 0.3s',
                    '&:hover': {
                      bgcolor: '#E4405F',
                      color: 'white',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 6px 20px rgba(228,64,95,0.4)',
                    },
                  }}
                >
                  <Instagram fontSize="small" />
                </IconButton>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Divider 
          sx={{ 
            borderColor: 'rgba(0,0,0,0.1)',
            mb: 4,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 100,
              height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent)',
            },
          }} 
        />

        {/* Bottom Footer */}
        <Box
          sx={{
            pt: 3,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(0,0,0,0.6)',
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            © {new Date().getFullYear()} Zetta Med Platform. All rights reserved.
          </Typography>
          
          <Stack
            direction="row"
            spacing={3}
            sx={{
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', md: 'flex-end' },
              gap: { xs: 1, sm: 3 },
            }}
          >
            <Link
              component={RouterLink}
              to="/privacy"
              sx={{
                color: 'rgba(0,0,0,0.6)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                transition: 'color 0.3s',
                '&:hover': {
                  color: '#00d4ff',
                },
              }}
            >
              Privacy Policy
            </Link>
            <Link
              component={RouterLink}
              to="/terms"
              sx={{
                color: 'rgba(0,0,0,0.6)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                transition: 'color 0.3s',
                '&:hover': {
                  color: '#00d4ff',
                },
              }}
            >
              Terms of Service
            </Link>
            <Link
              component={RouterLink}
              to="/cookies"
              sx={{
                color: 'rgba(0,0,0,0.6)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                transition: 'color 0.3s',
                '&:hover': {
                  color: '#00d4ff',
                },
              }}
            >
              Cookie Policy
            </Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;