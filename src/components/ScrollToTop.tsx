import React, { useState, useEffect } from 'react';
import { Fab, Zoom } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useTranslation } from 'react-i18next';

export const ScrollToTop: React.FC = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <Zoom in={isVisible}>
      <Fab
        onClick={scrollToTop}
        size="medium"
        aria-label={t('ariaLabels.scrollToTop')}
        sx={{
          position: 'fixed',
          bottom: 32,
          left: 32,
          bgcolor: '#00d4ff',
          color: 'white',
          boxShadow: '0 4px 20px rgba(0, 212, 255, 0.3)',
          '&:hover': {
            bgcolor: '#00a1cc',
            transform: 'scale(1.1)',
            boxShadow: '0 6px 30px rgba(0, 212, 255, 0.5)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        <KeyboardArrowUpIcon />
      </Fab>
    </Zoom>
  );
};