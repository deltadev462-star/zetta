import React, { useState } from "react";
import { Box, Container, Typography, Paper, Fade, Zoom } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  Search,
  Handshake,
  LocalShipping,
  CheckCircle,
  Support,
  Shield,
  TrendingUp,
} from "@mui/icons-material";

interface ProcessStep {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  highlight: string;
}

const OurProcess: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [selectedStep, setSelectedStep] = useState<number>(0);
  
  const isRTL = i18n.dir() === 'rtl';

  const processSteps: ProcessStep[] = [
    {
      id: 0,
      icon: <Search sx={{ fontSize: 40 }} />,
      title: t('ourProcess.steps.discover.title'),
      description: t('ourProcess.steps.discover.description'),
      color: '#00d4ff',
      highlight: t('ourProcess.steps.discover.highlight'),
    },
    {
      id: 1,
      icon: <Shield sx={{ fontSize: 40 }} />,
      title: t('ourProcess.steps.quality.title'),
      description: t('ourProcess.steps.quality.description'),
      color: '#00ff88',
      highlight: t('ourProcess.steps.quality.highlight'),
    },
    {
      id: 2,
      icon: <Handshake sx={{ fontSize: 40 }} />,
      title: t('ourProcess.steps.connect.title'),
      description: t('ourProcess.steps.connect.description'),
      color: '#ff0080',
      highlight: t('ourProcess.steps.connect.highlight'),
    },
    {
      id: 3,
      icon: <LocalShipping sx={{ fontSize: 40 }} />,
      title: t('ourProcess.steps.logistics.title'),
      description: t('ourProcess.steps.logistics.description'),
      color: '#ffaa00',
      highlight: t('ourProcess.steps.logistics.highlight'),
    },
    {
      id: 4,
      icon: <Support sx={{ fontSize: 40 }} />,
      title: t('ourProcess.steps.support.title'),
      description: t('ourProcess.steps.support.description'),
      color: '#00d4ff',
      highlight: t('ourProcess.steps.support.highlight'),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Fade in timeout={800}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
            {/* <AutoAwesome sx={{ fontSize: 40, color: '#00d4ff' }} /> */}
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1rem', md: '1.75rem' },
                background: 'linear-gradient(135deg, #00d4ff 0%, #ff0080 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('ourProcess.title')}
            </Typography>
          </Box>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(51,51,51,0.7)',
              maxWidth: 800,
              mx: 'auto',
              mb: 4,
            }}
          >
            {t('ourProcess.subtitle')}
          </Typography>
        </Box>
      </Fade>

      {/* Main Process Diagram */}
      <Box sx={{ position: 'relative', mb: 8 }}>
        {/* Single Continuous Connection Line */}
        <Box
          sx={{
            position: 'absolute',
            top: '70px',
            [isRTL ? 'right' : 'left']: { xs: '50%', md: '10%' },
            width: { xs: 0, md: '80%' },
            height: 2,
            background: 'linear-gradient(90deg, #00d4ff 0%, #00ff88 25%, #ff0080 50%, #ffaa00 75%, #00d4ff 100%)',
            opacity: 0.6,
            zIndex: 0,
            display: { xs: 'none', md: 'block' },
            transform: { xs: 'none', md: isRTL ? 'scaleX(-1)' : 'none' },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: 0,
              width: '100%',
              height: '100%',
              background: 'inherit',
              filter: 'blur(8px)',
              transform: 'translateY(-50%)',
            }
          }}
        />

        {/* Process Steps Circle */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(5, 1fr)' },
            gap: { xs: 4, md: 2 },
            position: 'relative',
            zIndex: 1,
          }}
        >
          {processSteps.map((step, index) => (
            <Zoom in timeout={500 + index * 100} key={step.id}>
              <Box
                onMouseEnter={() => setHoveredStep(step.id)}
                onMouseLeave={() => setHoveredStep(null)}
                onClick={() => setSelectedStep(step.id)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                {/* Step Number */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: { xs: -10, md: -15 },
                    [isRTL ? 'left' : 'right']: { xs: '50%', md: '25%' },
                    transform: {
                      xs: `translateX(${isRTL ? '-50%' : '50%'})`,
                      md: 'translateX(0)'
                    },
                    bgcolor: step.color,
                    color: 'white',
                    width: { xs: 24, sm: 28, md: 30 },
                    height: { xs: 24, sm: 28, md: 30 },
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: { xs: '0.75rem', sm: '0.825rem', md: '0.875rem' },
                    boxShadow: `0 4px 20px ${step.color}40`,
                    zIndex: 2,
                  }}
                >
                  {isRTL ? (processSteps.length - index) : (index + 1)}
                </Box>

                {/* Icon Circle */}
                <Paper
                  elevation={hoveredStep === step.id || selectedStep === step.id ? 8 : 3}
                  sx={{
                    width: { xs: 100, sm: 120, md: 140 },
                    height: { xs: 100, sm: 120, md: 140 },
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background:
                      hoveredStep === step.id || selectedStep === step.id
                        ? `linear-gradient(135deg, ${step.color}20, ${step.color}10)`
                        : 'oklch(98.7% 0.026 102.212)',
                    border: `3px solid ${
                      selectedStep === step.id ? step.color : 'transparent'
                    }`,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform:
                      hoveredStep === step.id || selectedStep === step.id
                        ? 'translateY(-10px) scale(1.1)'
                        : 'translateY(0) scale(1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: 0,
                      background: `radial-gradient(circle at center, ${step.color}10, transparent)`,
                      opacity: hoveredStep === step.id || selectedStep === step.id ? 1 : 0,
                      transition: 'opacity 0.3s',
                    },
                  }}
                >
                  <Box
                    sx={{
                      color: step.color,
                      transform:
                        hoveredStep === step.id || selectedStep === step.id
                          ? 'scale(1.2)'
                          : 'scale(1)',
                      transition: 'transform 0.3s',
                      filter: `drop-shadow(0 0 20px ${step.color}40)`,
                      '& svg': {
                        fontSize: { xs: 32, sm: 36, md: 40 },
                      },
                    }}
                  >
                    {step.icon}
                  </Box>
                </Paper>

                {/* Title */}
                <Typography
                  variant="h6"
                  sx={{
                    mt: 2,
                    fontWeight: 600,
                    fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
                    color:
                      hoveredStep === step.id || selectedStep === step.id
                        ? step.color
                        : 'rgba(51,51,51,0.9)',
                    transition: 'color 0.3s',
                    textAlign: 'center',
                    px: 1,
                  }}
                >
                  {step.title}
                </Typography>

              </Box>
            </Zoom>
          ))}
        </Box>
      </Box>

      {/* Selected Step Details */}
      <Fade in key={selectedStep} timeout={600}>
        <Paper
          elevation={6}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            background: 'oklch(98.7% 0.026 102.212)',
            border: `2px solid ${processSteps[selectedStep].color}20`,
            boxShadow: `none`,
            position: 'relative',
            overflow: 'hidden',
              cursor: 'grab',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: { xs: -50, md: -100 },
              [isRTL ? 'left' : 'right']: { xs: -50, md: -100 },
              width: { xs: 200, sm: 250, md: 300 },
              height: { xs: 200, sm: 250, md: 300 },
              borderRadius: '50%',
              background: `radial-gradient(circle, ${processSteps[selectedStep].color}10, transparent)`,
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: 2,
              flexDirection: isRTL ? 'row-reverse' : 'row',
            }}>
              <Box sx={{ color: processSteps[selectedStep].color }}>
                {processSteps[selectedStep].icon}
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: processSteps[selectedStep].color,
                  textAlign: isRTL ? 'right' : 'left',
                  fontSize: { xs: '1.5rem', sm: '1.875rem', md: '2.125rem' },
                }}
              >
                {processSteps[selectedStep].title}
              </Typography>
            </Box>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(51,51,51,0.8)',
                mb: 2,
                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
                lineHeight: 1.8,
                textAlign: isRTL ? 'right' : 'left',
                direction: isRTL ? 'rtl' : 'ltr',
              }}
            >
              {processSteps[selectedStep].description}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: processSteps[selectedStep].color,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              }}
            >
              <CheckCircle sx={{ fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {processSteps[selectedStep].highlight}
              </Typography>
            </Box>
          </Box>

          {/* Decorative Elements */}
          <Box
            sx={{
              position: 'absolute',
              bottom: { xs: -30, md: -50 },
              [isRTL ? 'right' : 'left']: { xs: -30, md: -50 },
              width: { xs: 100, sm: 120, md: 150 },
              height: { xs: 100, sm: 120, md: 150 },
              borderRadius: '50%',
              border: `3px solid ${processSteps[selectedStep].color}20`,
            }}
          />
        </Paper>
      </Fade>

      {/* Bottom CTA */}
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Typography
          variant="h5"
          sx={{
            color: 'rgba(51,51,51,0.8)',
            mb: 2,
            fontWeight: 600,
          }}
        >
          {t('ourProcess.cta.title')}
        </Typography>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          flexDirection: isRTL ? 'row-reverse' : 'row',
        }}>
          <TrendingUp sx={{ color: '#00d4ff' }} />
          <Typography variant="body1" sx={{ color: 'rgba(51,51,51,0.6)' }}>
            {t('ourProcess.cta.subtitle')}
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default OurProcess;