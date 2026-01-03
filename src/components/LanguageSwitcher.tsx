import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Typography,
  Fade,
  alpha,
  Divider,
  Chip
} from '@mui/material';
import { Language, Check } from '@mui/icons-material';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  
  const languages = [
    {
      code: 'en',
      name: t('languages.en'),
      nativeName: 'English',
      shortName: 'EN',
      flag: '🇺🇸',
      color: '#1976d2'
    },
    {
      code: 'ar',
      name: t('languages.ar'),
      nativeName: 'العربية',
      shortName: 'AR',
      flag: '🇸🇦',
      dir: 'rtl',
      color: '#2e7d32'
    },
    {
      code: 'fr',
      name: t('languages.fr'),
      nativeName: 'Français',
      shortName: 'FR',
      flag: '🇫🇷',
      color: '#ed6c02'
    }
  ];
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    const selectedLang = languages.find(lang => lang.code === langCode);
    
    // Set document direction for RTL languages
    if (selectedLang?.dir === 'rtl') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
    
    handleClose();
  };

  React.useEffect(() => {
    // Set initial direction based on current language
    if (currentLanguage.dir === 'rtl') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
  }, [currentLanguage]);

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleClick}
        size="small"
        startIcon={<Language sx={{ fontSize: 18 }} />}
        endIcon={
          <Box
            component="span"
            sx={{
              display: 'inline-block',
              width: 0,
              height: 0,
              ml: 0.5,
              verticalAlign: 'middle',
              borderTop: '4px solid',
              borderRight: '4px solid transparent',
              borderLeft: '4px solid transparent',
              transition: 'transform 0.3s',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        }
        aria-label={t('ariaLabels.selectLanguage')}
        aria-controls={open ? 'language-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        sx={{
          ml: 1,
          px: 2,
          py: 0.75,
          borderRadius: '24px',
          textTransform: 'none',
          fontSize: '0.875rem',
          fontWeight: 600,
          letterSpacing: '0.02em',
          color: '#1e293b',
          borderColor: 'rgba(30, 41, 59, 0.2)',
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: currentLanguage.color || '#00d4ff',
            bgcolor: 'rgba(255, 255, 255, 1)',
            transform: 'translateY(-1px)',
            boxShadow: `0 4px 20px ${alpha(currentLanguage.color || '#00d4ff', 0.2)}`,
          },
          '& .MuiButton-startIcon': {
            color: currentLanguage.color || '#00d4ff',
            mr: 0.5,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          {/* <Typography
            component="span"
            sx={{
              fontSize: '1rem',
              lineHeight: 1,
            }}
          >
            {currentLanguage.flag}
          </Typography> */}
          <Typography
            component="span"
            sx={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#1e293b',
            }}
          >
            {currentLanguage.shortName}
          </Typography>
        </Box>
      </Button>

      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'language-button',
          sx: { py: 0.5 }
        }}
        TransitionComponent={Fade}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'hidden',
            filter: 'drop-shadow(0 8px 32px rgba(0, 0, 0, 0.08))',
            mt: 1,
            minWidth: 220,
            bgcolor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '16px',
            '& .MuiMenu-list': {
              p: 0.5,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, mb: 0.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {t('ariaLabels.selectLanguage')}
          </Typography>
        </Box>
        
        <Divider sx={{ mx: 1, borderColor: 'rgba(0, 0, 0, 0.06)' }} />
        
        {languages.map((lang, index) => (
          <MenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            selected={currentLanguage.code === lang.code}
            sx={{
              py: 1.5,
              px: 2,
              mx: 0.5,
              my: 0.25,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              transition: 'all 0.2s ease',
              position: 'relative',
              '&:hover': {
                bgcolor: alpha(lang.color, 0.08),
              },
              '&.Mui-selected': {
                bgcolor: alpha(lang.color, 0.12),
                '&:hover': {
                  bgcolor: alpha(lang.color, 0.16),
                },
              },
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                bgcolor: currentLanguage.code === lang.code
                  ? alpha(lang.color, 0.15)
                  : alpha(lang.color, 0.08),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                transition: 'all 0.2s ease',
              }}
            >
              {lang.flag}
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: '0.9375rem',
                  fontWeight: currentLanguage.code === lang.code ? 600 : 500,
                  color: '#1e293b',
                  lineHeight: 1.2,
                  mb: 0.25,
                }}
              >
                {lang.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.75rem',
                  color: '#64748b',
                  display: 'block',
                }}
              >
                {lang.nativeName}
              </Typography>
            </Box>
            
            {currentLanguage.code === lang.code && (
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: alpha(lang.color, 0.15),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'fadeIn 0.3s ease',
                  '@keyframes fadeIn': {
                    '0%': {
                      opacity: 0,
                      transform: 'scale(0.8)',
                    },
                    '100%': {
                      opacity: 1,
                      transform: 'scale(1)',
                    },
                  },
                }}
              >
                <Check
                  sx={{
                    fontSize: 16,
                    color: lang.color,
                    fontWeight: 700,
                  }}
                />
              </Box>
            )}
          </MenuItem>
        ))}
        
       
      </Menu>
    </>
  );
};

export default LanguageSwitcher;