import React from "react";
import { Box, Container, Card, CardContent, Typography } from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { useTranslation } from 'react-i18next';

const Services: React.FC = () => {
  const { t } = useTranslation();
  
  const services = [
    {
      icon: <LocalShippingIcon />,
      title: t('services.delivery.title'),
      description: t('services.delivery.description'),
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      shadowColor: "rgba(102, 126, 234, 0.4)",
    },
    {
      icon: <VerifiedUserIcon />,
      title: t('services.warranty.title'),
      description: t('services.warranty.description'),
      gradient: "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
      shadowColor: "rgba(0, 212, 255, 0.4)",
    },
    {
      icon: <AccountBalanceIcon />,
      title: t('services.flexibleFinancing.title'),
      description: t('services.flexibleFinancing.description'),
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      shadowColor: "rgba(245, 87, 108, 0.4)",
    },
  ];

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
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(3, 1fr)",
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
                    background: service.gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 3,
                    boxShadow: `0 10px 30px ${service.shadowColor}`,
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
                  {service.icon}
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
      </Container>
    </Box>
  );
};

export default Services;
