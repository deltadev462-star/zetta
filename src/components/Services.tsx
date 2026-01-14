import React, { useEffect, useState } from "react";
import { Box, Container, Card, CardContent, Typography, CircularProgress } from "@mui/material";
import * as MuiIcons from "@mui/icons-material";
import { useTranslation } from 'react-i18next';
import { cmsService, CMSService } from '../services/cms';

const Services: React.FC = () => {
  const { t } = useTranslation();
  const [services, setServices] = useState<CMSService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();

    // Subscribe to real-time updates
    const subscription = cmsService.subscribeToChanges('cms_services', () => {
      fetchServices();
    });

    return () => {
      cmsService.unsubscribe(subscription);
    };
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await cmsService.getServices(true); // Only get active services
      if (!error && data) {
        setServices(data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      // Fallback to default services
      setServices([
        {
          icon_name: 'LocalShipping',
          title: t('services.delivery.title'),
          description: t('services.delivery.description'),
          gradient_start: '#667eea',
          gradient_end: '#764ba2',
          shadow_color: 'rgba(102, 126, 234, 0.4)',
        },
        {
          icon_name: 'VerifiedUser',
          title: t('services.warranty.title'),
          description: t('services.warranty.description'),
          gradient_start: '#00d4ff',
          gradient_end: '#0099cc',
          shadow_color: 'rgba(0, 212, 255, 0.4)',
        },
        {
          icon_name: 'AccountBalance',
          title: t('services.flexibleFinancing.title'),
          description: t('services.flexibleFinancing.description'),
          gradient_start: '#f093fb',
          gradient_end: '#f5576c',
          shadow_color: 'rgba(245, 87, 108, 0.4)',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Get Material UI icon component by name
  const getIconComponent = (iconName: string) => {
    const IconComponent = (MuiIcons as any)[iconName] || MuiIcons.Help;
    return <IconComponent />;
  };

  return (
    <Box
      sx={{
        py: 8,
        backgroundColor: "oklch(96.5% 0.026 102.212)",
        backdropFilter: "blur(20px)",
        mt: "auto",
      }}
    >
      <Container maxWidth="xl">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: `repeat(${Math.min(services.length, 3)}, 1fr)`,
              },
              gap: 4,
            }}
          >
            {services.map((service, index) => (
            <Card
              key={index}
              sx={{
                height: "100%",
                // background: 'rgba(255, 255, 255, 0.98)',
                // backdropFilter: 'blur(20px)',
                // border: '1px solid rgba(0, 0, 0, 0.06)',
                // borderRadius: 3,
                overflow: "visible",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                // '&:hover': {
                //   transform: 'translateY(-8px)',
                //   boxShadow: `0 20px 40px ${service.shadowColor}`,
                //   '& .service-icon': {
                //     transform: 'rotate(10deg) scale(1.1)',
                //   },
                // },
                // '&::before': {
                //   content: '""',
                //   position: 'absolute',
                //   inset: -1,
                //   borderRadius: 'inherit',
                //   background: service.gradient,
                //   opacity: 0,
                //   transition: 'opacity 0.4s',
                //   zIndex: -1,
                // },
                // '&:hover::before': {
                //   opacity: 0.08,
                // },
              }}
            >
              <CardContent
                sx={{
                  p: 4,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <Box
                  className="service-icon"
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 1,
                    background: `linear-gradient(135deg, ${service.gradient_start} 0%, ${service.gradient_end} 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 3,
                    boxShadow: `0 10px 30px ${service.shadow_color}`,
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    overflow: "hidden",
                    "& svg": {
                      fontSize: 40,
                      color: "white",
                      position: "relative",
                      zIndex: 1,
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: "-50%",
                      left: "-50%",
                      width: "200%",
                      height: "200%",
                      background:
                        "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
                      animation: "shimmer 3s infinite",
                    },
                    "@keyframes shimmer": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" },
                    },
                  }}
                >
                  {getIconComponent(service.icon_name)}
                </Box>

                <Typography
                  variant="h5"
                  component="h3"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: "#1a1a2e",
                    letterSpacing: "-0.02em",
                    textAlign: "center",
                  }}
                >
                  {service.title}
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: "rgba(0, 0, 0, 0.7)",
                    lineHeight: 1.7,
                    flex: 1,
                    textAlign: "center",
                  }}
                >
                  {service.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Services;
