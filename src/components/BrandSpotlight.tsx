import React from "react";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
  Chip,
  alpha,
  IconButton,
} from "@mui/material";
import { useTranslation } from 'react-i18next';
import {
  ShoppingCart,
  Science,
  Verified,
  
  Star,
  LocalShipping,
  Security,
  EmojiEvents,
  Public,
  Groups,
  Biotech,
  ArrowBackIos,
  ArrowForwardIos,
} from "@mui/icons-material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import type { Product } from "../types";

interface BrandSpotlightProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}


const BrandSpotlight: React.FC<BrandSpotlightProps> = ({
  products,
  onAddToCart,
}) => {
  const { t } = useTranslation();
  const brandColor = "#0066CC";
  const accentColor = "#00A6FB";

  // Brand data constants
  const BRAND_INFO = {
    name: t('brandSpotlight.brandName'),
    tagline: t('brandSpotlight.brandTagline'),
    color: brandColor,
    accentColor: accentColor,
    stats: [
      {
        value: "100K+",
        label: t('brandSpotlight.stats.products'),
        color: "#00A6FB",
      },
      {
        value: "4.8",
        label: t('brandSpotlight.stats.rating'),
        color: "#00A6FB",
        hasStars: true,
      },
      {
        value: "600K+",
        label: t('brandSpotlight.stats.customers'),
        color: "#4CAF50",
      },
    ],
    badges: [
      {
        icon: Public,
        label: t('brandSpotlight.globalLeader'),
        color: "#4CAF50",
      },
      {
        icon: Groups,
        label: t('brandSpotlight.employees'),
        color: "#FF6B35",
      },
      {
        icon: Biotech,
        label: t('brandSpotlight.iso9001'),
        color: "#9C27B0",
      },
    ],
  };

  // Key highlights data
  const KEY_HIGHLIGHTS = [
    {
      icon: LocalShipping,
      title: t('brandSpotlight.highlights.fastshipping'),
      description: t('brandSpotlight.highlights.fastshippingDesc'),
      color: "#4CAF50",
    },
    {
      icon: Security,
      title: t('brandSpotlight.highlights.qualityassured'),
      description: t('brandSpotlight.highlights.qualityassuredDesc'),
      color: "#FF6B35",
    },
    {
      icon: EmojiEvents,
      title: t('brandSpotlight.highlights.awardwinning'),
      description: t('brandSpotlight.highlights.awardwinningDesc'),
      color: "#9C27B0",
    },
    {
      icon: Science,
      title: t('brandSpotlight.highlights.innovationleader'),
      description: t('brandSpotlight.highlights.innovationleaderDesc'),
      color: "#0066CC",
    },
  ];

  // Bottom CTA features
  const CTA_FEATURES = [
    {
      icon: Verified,
      text: t('brandSpotlight.features.certifiedquality'),
      color: "#4CAF50",
    },
    {
      icon: LocalShipping,
      text: t('brandSpotlight.features.globaldistribution'),
      color: "#FF6B35",
    },
    {
      icon: Groups,
      text: t('brandSpotlight.features.expertsupport'),
      color: "#9C27B0",
    },
  ];

  return (
    <Box sx={{ position: "relative" }}>
      {/* Brand Header Section */}
      <Box
        sx={{
          mb: 4,
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 1, // Subtle radius 4px
          background: alpha(brandColor, 0.08),
          border: `1px solid ${alpha(brandColor, 0.2)}`,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: { xs: -30, md: -50 },
            right: { xs: -30, md: -50 },
            width: { xs: 100, sm: 150, md: 200 },
            height: { xs: 100, sm: 150, md: 200 },
            background: alpha(brandColor, 0.05),
            borderRadius: 1,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            gap: { xs: 2, md: 3 },
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Logo and Title Section */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              width: "100%",
            }}
          >
            <Box
              sx={{
                width: { xs: 60, sm: 70, md: 80 },
                height: { xs: 60, sm: 70, md: 80 },
                borderRadius: 1,
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 10px 30px ${alpha(brandColor, 0.3)}`,
                border: `2px solid ${brandColor}`,
                flexShrink: 0,
              }}
            >
              <Science
                sx={{ fontSize: { xs: 32, sm: 40, md: 48 }, color: brandColor }}
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "flex-start", sm: "center" },
                  gap: { xs: 1, sm: 2 },
                  mb: 1,
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: brandColor,
                    fontSize: { xs: "1.3rem", sm: "1.8rem", md: "2.125rem" },
                    lineHeight: 1.2,
                  }}
                >
                  {BRAND_INFO.name}
                </Typography>
                <Chip
                  icon={<Verified />}
                  label={t('brandSpotlight.officialPartner', { defaultValue: 'Official Partner' })}
                  size="small"
                  sx={{
                    bgcolor: alpha(brandColor, 0.1),
                    color: brandColor,
                    fontWeight: 600,
                    fontSize: { xs: "0.65rem", sm: "0.75rem" },
                    height: { xs: 22, sm: 24 },
                    "& .MuiChip-icon": {
                      color: brandColor,
                      fontSize: { xs: 14, sm: 16 },
                    },
                  }}
                />
              </Box>
              <Typography
                variant="body1"
                sx={{
                  color: "rgba(51,51,51,0.7)",
                  mb: 1,
                  fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
                  display: { xs: "none", sm: "block" },
                }}
              >
                {BRAND_INFO.tagline}
              </Typography>
            </Box>
          </Box>

          {/* Badges Section - Mobile */}
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              gap: 1,
              flexWrap: "wrap",
              width: "100%",
              mt: 1,
            }}
          >
            {BRAND_INFO.badges.map((badge, index) => {
              const IconComponent = badge.icon;
              return (
                <Chip
                  key={index}
                  icon={<IconComponent />}
                  label={badge.label}
                  size="small"
                  sx={{
                    bgcolor: alpha(badge.color, 0.1),
                    color: badge.color,
                    fontSize: "0.65rem",
                    height: 20,
                    "& .MuiChip-icon": {
                      fontSize: 12,
                    },
                    "& .MuiChip-label": {
                      px: 0.5,
                    },
                  }}
                />
              );
            })}
          </Box>

          {/* Badges Section - Desktop */}
          <Box
            sx={{
              flex: 1,
              display: { xs: "none", md: "block" },
            }}
          >
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {BRAND_INFO.badges.map((badge, index) => {
                const IconComponent = badge.icon;
                return (
                  <Chip
                    key={index}
                    icon={<IconComponent />}
                    label={badge.label}
                    size="small"
                    sx={{
                      bgcolor: alpha(badge.color, 0.1),
                      color: badge.color,
                      fontSize: "0.7rem",
                    }}
                  />
                );
              })}
            </Box>
          </Box>

          {/* Brand Stats */}
          <Box
            sx={{
              display: "flex",
              gap: { xs: 2, sm: 3 },
              width: { xs: "100%", md: "auto" },
              justifyContent: { xs: "space-around", md: "flex-end" },
              borderTop: {
                xs: `1px solid ${alpha(brandColor, 0.1)}`,
                md: "none",
              },
              pt: { xs: 2, md: 0 },
              mt: { xs: 2, md: 0 },
            }}
          >
            {BRAND_INFO.stats.map((stat, index) => (
              <Box
                key={index}
                sx={{
                  textAlign: "center",
                  flex: { xs: 1, md: "none" },
                  minWidth: { md: 80 },
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: stat.color,
                    fontSize: { xs: "1rem", sm: "1.2rem", md: "1.5rem" },
                  }}
                >
                  {stat.value}
                </Typography>
                {stat.hasStars ? (
                  <Box
                    sx={{ display: "flex", gap: 0.3, justifyContent: "center" }}
                  >
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        sx={{
                          fontSize: { xs: 12, sm: 14, md: 16 },
                          color: i < 4 ? "#FFD700" : "rgba(51,51,51,0.3)",
                        }}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(51,51,51,0.6)",
                      fontSize: {
                        xs: "0.65rem",
                        sm: "0.75rem",
                        md: "0.875rem",
                      },
                      mt: 0.5,
                    }}
                  >
                    {stat.label}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Key Highlights */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 2,
          }}
        >
          {KEY_HIGHLIGHTS.map((highlight, index) => {
            const IconComponent = highlight.icon;
            return (
              <Box
                key={index}
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: alpha(highlight.color, 0.05),
                  border: `1px solid ${alpha(highlight.color, 0.2)}`,
                  textAlign: "center",
                  transition: "all 0.3s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: `0 8px 24px ${alpha(highlight.color, 0.15)}`,
                  },
                }}
              >
                <IconComponent
                  sx={{ fontSize: 36, color: highlight.color, mb: 1 }}
                />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {highlight.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(51,51,51,0.7)" }}
                >
                  {highlight.description}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Swiper Container */}
      <Box sx={{ position: "relative" }}>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          navigation={{
            prevEl: ".brand-swiper-button-prev",
            nextEl: ".brand-swiper-button-next",
            enabled: true,
          }}
          pagination={{
            el: ".brand-swiper-pagination",
            clickable: true,
          }}
          autoplay={{
            delay: 4500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
            1280: { slidesPerView: 5 },
          }}
          className="brand-spotlight-swiper"
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <Card
                sx={{
                  height: 480,
                  display: "flex",
                  flexDirection: "column",
                  background: "white",
                  border: "1px solid transparent",
                  borderRadius: 1,
                  overflow: "hidden",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                  position: "relative",
                  boxShadow: "none",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(135deg, ${alpha(
                      brandColor,
                      0.05
                    )} 0%, transparent 50%)`,
                    opacity: 0,
                    transition: "opacity 0.4s ease",
                    pointerEvents: "none",
                  },
                  "&:hover": {
                    boxShadow: "0 24px 48px rgba(0,102,204,0.2)",
                    borderColor: alpha(brandColor, 0.4),
                    "&::before": {
                      opacity: 1,
                    },
                    "& .product-image": {
                      transform: "scale(1.05) rotate(2deg)",
                    },
                    "& .product-overlay": {
                      opacity: 1,
                    },
                    "& .add-to-cart-btn": {
                      transform: "translateY(0)",
                      opacity: 1,
                    },
                  },
                }}
              >
                {/* Brand Badge */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    zIndex: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 0.5,
                    bgcolor: "oklch(95% 0.026 102.212)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                  }}
                >
                  <Science sx={{ fontSize: 18, color: brandColor }} />
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: brandColor }}
                  >
                    {t('brandSpotlight.thermoFisher')}
                  </Typography>
                </Box>

                {/* Stock Status Badge */}
                {product.status === "available" && (
                  <Chip
                    label={t('products.inStock')}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      zIndex: 2,
                      bgcolor: alpha("#4CAF50", 0.9),
                      color: "white",
                      fontWeight: 600,
                      fontSize: "0.7rem",
                    }}
                  />
                )}

                {/* Product Image */}
                <Box
                  sx={{
                    position: "relative",
                    height: 220,
                    overflow: "hidden",
                    background: `linear-gradient(135deg, ${alpha(
                      brandColor,
                      0.1
                    )}, ${alpha(accentColor, 0.05)})`,
                  }}
                >
                  <CardMedia
                    component="img"
                    height="220"
                    image={product.images[0] || "/placeholder-product.png"}
                    alt={product.title}
                    className="product-image"
                    sx={{
                      objectFit: "cover",
                      transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  />
                  {/* Overlay gradient */}
                  <Box
                    className="product-overlay"
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background:
                        "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)",
                      opacity: 0,
                      transition: "opacity 0.4s ease",
                    }}
                  />

                  {/* Quick view button */}
                </Box>

                <CardContent
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    p: 2.5,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      color: "#1a1a1a",
                      lineHeight: 1.3,
                    }}
                  >
                    {product.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(51,51,51,0.7)",
                      mb: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      lineHeight: 1.5,
                    }}
                  >
                    {product.description}
                  </Typography>

                  <Box
                    sx={{
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <Chip
                      label={product.category}
                      size="small"
                      sx={{
                        bgcolor: alpha(brandColor, 0.1),
                        color: brandColor,
                        fontWeight: 600,
                        fontSize: "0.7rem",
                        border: `1px solid ${alpha(brandColor, 0.2)}`,
                        height: 24,
                      }}
                    />
                    {product.condition && (
                      <Chip
                        label={
                          product.condition.charAt(0).toUpperCase() +
                          product.condition.slice(1)
                        }
                        size="small"
                        sx={{
                          bgcolor: alpha("#4CAF50", 0.1),
                          color: "#4CAF50",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                          border: `1px solid ${alpha("#4CAF50", 0.2)}`,
                          height: 24,
                        }}
                      />
                    )}
                  </Box>

                  <Box sx={{ mt: "auto" }}>
                    {/* Price section */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 800,
                          color: brandColor,
                        }}
                      >
                        €
                        {(
                          product.zetta_price || product.price
                        ).toLocaleString()}
                      </Typography>
                      {product.zetta_price &&
                        product.price > product.zetta_price && (
                          <Typography
                            variant="body2"
                            sx={{
                              textDecoration: "line-through",
                              color: "rgba(51,51,51,0.5)",
                            }}
                          >
                            €{product.price.toLocaleString()}
                          </Typography>
                        )}
                    </Box>

                    {/* Features */}
                    <Box sx={{ mb: 1.5 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          mb: 0.5,
                        }}
                      >
                        <LocalShipping
                          sx={{ fontSize: 14, color: "#4CAF50" }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ color: "rgba(51,51,51,0.7)" }}
                        >
                          {t('brandSpotlight.shipsWithin', { defaultValue: 'Ships within 24-48 hours' })}
                        </Typography>
                      </Box>
                      {product.warranty_duration && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            mb: 0.5,
                          }}
                        >
                          <Security sx={{ fontSize: 14, color: "#FF6B35" }} />
                          <Typography
                            variant="caption"
                            sx={{ color: "rgba(51,51,51,0.7)" }}
                          >
                            {product.warranty_duration} {t('brandSpotlight.monthWarranty', { defaultValue: 'Month Warranty' })}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Quality Guarantee */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 2,
                      }}
                    >
                      <Verified sx={{ fontSize: 16, color: "#4CAF50" }} />
                      <Typography variant="caption" sx={{ color: "#4CAF50" }}>
                        {t('brandSpotlight.qualityGuarantee', { defaultValue: 'Thermo Fisher Quality Guarantee' })}
                      </Typography>
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<ShoppingCart />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product);
                      }}
                      sx={{
                        bgcolor: "oklch(98.5% 0.001 106.423)",
                        // background: `linear-gradient(135deg, ${brandColor} 0%, ${accentColor} 100%)`,
                        boxShadow: `none`,
                        fontWeight: 400,
                        borderRadius: 1,
                        position: "relative",
                        overflow: "hidden",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: "-100%",
                          width: "100%",
                          height: "100%",
                          background:
                            "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                          transition: "left 0.5s ease",
                        },
                        "&:hover": {
                          transform: "scale(1.02)",
                          boxShadow: `0 8px 32px oklch(98.5% 0.001 106.423)`,
                          "&::before": {
                            left: "100%",
                          },
                        },
                      }}
                    >
                      {t('products.addToCart')}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation */}
        <IconButton
          className="brand-swiper-button-prev"
          sx={{
            position: "absolute",
            left: { xs: 0, md: -20 },
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            width: 48,
            height: 48,
            bgcolor: "white",
            backdropFilter: "blur(10px)",
            border: `2px solid ${alpha(brandColor, 0.2)}`,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            transition: "all 0.3s",
            "&:hover": {
              bgcolor: alpha(brandColor, 0.1),
              borderColor: brandColor,
              transform: "translateY(-50%) scale(1.1)",
              boxShadow: "0 8px 32px rgba(0,102,204,0.3)",
            },
            "&.swiper-button-disabled": {
              opacity: 0.5,
              cursor: "not-allowed",
            },
          }}
        >
          <ArrowBackIos sx={{ color: brandColor, ml: 0.5, fontSize: 20 }} />
        </IconButton>

        <IconButton
          className="brand-swiper-button-next"
          sx={{
            position: "absolute",
            right: { xs: 0, md: -20 },
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            width: 48,
            height: 48,
            bgcolor: "white",
            backdropFilter: "blur(10px)",
            border: `2px solid ${alpha(brandColor, 0.2)}`,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            transition: "all 0.3s",
            "&:hover": {
              bgcolor: alpha(brandColor, 0.1),
              borderColor: brandColor,
              transform: "translateY(-50%) scale(1.1)",
              boxShadow: "0 8px 32px rgba(0,102,204,0.3)",
            },
            "&.swiper-button-disabled": {
              opacity: 0.5,
              cursor: "not-allowed",
            },
          }}
        >
          <ArrowForwardIos sx={{ color: brandColor, fontSize: 20 }} />
        </IconButton>

        {/* Pagination */}
        <Box
          className="brand-swiper-pagination"
          sx={{ mt: 3, textAlign: "center" }}
        />
      </Box>

      {/* Bottom CTA */}
      <Box
        sx={{
          mt: 4,
          p: 4,
          borderRadius: 1,
          background: `linear-gradient(135deg, ${alpha(
            brandColor,
            0.05
          )} 0%, ${alpha(accentColor, 0.05)} 100%)`,
          border: `1px solid ${alpha(brandColor, 0.2)}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: 1,
            background: alpha(brandColor, 0.05),
          }}
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
            gap: 4,
            alignItems: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              {t('brandSpotlight.discoverPortfolio', { defaultValue: 'Discover the Complete Thermo Fisher Portfolio' })}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "rgba(51,51,51,0.7)", mb: 2 }}
            >
              {t('brandSpotlight.accessProducts', { defaultValue: 'Access over 100,000 products spanning life sciences, diagnostics, and applied markets' })}
            </Typography>
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              {CTA_FEATURES.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Box
                    key={index}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <IconComponent sx={{ color: feature.color }} />
                    <Typography variant="body2">{feature.text}</Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
          <Box sx={{ textAlign: { xs: "center", md: "center" } }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                bgcolor: brandColor,
                color: "white",
                fontWeight: 700,
                fontSize: "1rem",
                boxShadow: `0 8px 32px ${alpha(brandColor, 0.3)}`,
                "&:hover": {
                  bgcolor: accentColor,
                  transform: "scale(1.05)",
                  boxShadow: `0 12px 40px ${alpha(brandColor, 0.4)}`,
                },
              }}
            >
              {t('brandSpotlight.exploreCatalog', { defaultValue: 'Explore Full Catalog' })}
            </Button>
            <Typography
              variant="caption"
              sx={{ display: "block", mt: 1, color: "rgba(51,51,51,0.6)" }}
            >
              {t('brandSpotlight.specialPricing', { defaultValue: 'Special pricing for bulk orders' })}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default BrandSpotlight;
