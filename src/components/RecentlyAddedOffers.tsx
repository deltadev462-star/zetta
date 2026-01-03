import React, { useRef } from "react";
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Chip,
} from "@mui/material";
import { useTranslation } from 'react-i18next';
import {
  ArrowForwardIos,
  ArrowBackIosNew,
  LocalOffer,
  Timer,
} from "@mui/icons-material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import { Product } from "../types";
import type { Swiper as SwiperType } from "swiper";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface RecentlyAddedOffersProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const RecentlyAddedOffers: React.FC<RecentlyAddedOffersProps> = ({
  products,
  onAddToCart,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const swiperRef = useRef<SwiperType | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  // Calculate discount percentage
  const getDiscountPercentage = (
    originalPrice: number,
    discountedPrice: number
  ) => {
    return Math.round(
      ((originalPrice - discountedPrice) / originalPrice) * 100
    );
  };

  // Get time since added (mock data - in real app this would come from created_at)
  const getTimeAgo = (createdAt: string) => {
    const hours = Math.floor(Math.random() * 48) + 1;
    return hours < 24
      ? t('recentOffers.hoursAgo', { count: hours, defaultValue: `${hours} hours ago` })
      : t('recentOffers.daysAgo', { count: Math.floor(hours / 24), defaultValue: `${Math.floor(hours / 24)} days ago` });
  };

  return (
    <Box sx={{ position: "relative", px: { xs: 2, md: 0 } }}>
      {/* Custom Navigation Buttons */}
      <IconButton
        onClick={() => swiperRef.current?.slidePrev()}
        sx={{
          position: "absolute",
          left: { xs: -10, md: -20 },
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          bgcolor: "oklch(98.7% 0.026 102.212)",
          border: "1px solid rgba(0, 0, 0, 0.1)",
          color: "#333",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          "&:hover": {
            bgcolor: "oklch(95% 0.026 102.212)",
            border: "1px solid rgba(0, 0, 0, 0.2)",
          },
        }}
      >
        <ArrowBackIosNew />
      </IconButton>

      <IconButton
        onClick={() => swiperRef.current?.slideNext()}
        sx={{
          position: "absolute",
          right: { xs: -10, md: -20 },
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          bgcolor: "oklch(98.7% 0.026 102.212)",
          border: "1px solid rgba(0, 0, 0, 0.1)",
          color: "#333",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          "&:hover": {
            bgcolor: "oklch(95% 0.026 102.212)",
            border: "1px solid rgba(0, 0, 0, 0.2)",
          },
        }}
      >
        <ArrowForwardIos />
      </IconButton>

      <Swiper
        onSwiper={(swiper: SwiperType) => {
          swiperRef.current = swiper;
        }}
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={24}
        slidesPerView={7}
        slidesPerGroup={1}
        loop={products.length > 7}
        autoplay={{
          delay: 6000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        breakpoints={{
          320: {
            slidesPerView: 1.5,
            spaceBetween: 16,
          },
          480: {
            slidesPerView: 2,
            spaceBetween: 16,
          },
          640: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 4,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 5,
            spaceBetween: 24,
          },
          1280: {
            slidesPerView: 6,
            spaceBetween: 24,
          },
          1536: {
            slidesPerView: 7,
            spaceBetween: 24,
          },
        }}
        className="recently-added-offers-swiper"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <Card
              onClick={() => navigate(`/products/${product.id}`)}
              sx={{
                height: "100%",
                cursor: "pointer",
                bgcolor: "oklch(98.5% 0.001 106.423)",
                borderRadius: 1,
                border: "1px solid transparent",
                boxShadow: "none",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Special Offer Badge */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  bgcolor: "#ff0080",
                  color: "white",
                  px: 2,
                  py: 0.5,
                  borderBottomLeftRadius: 0,
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  zIndex: 2,
                  boxShadow: "0 4px 20px rgba(255, 0, 128, 0.5)",
                }}
              >
                -
                {getDiscountPercentage(
                  product.price,
                  product.zetta_price || product.price
                )}
                %
              </Box>

              <Box
                sx={{ position: "relative", overflow: "hidden", height: 160 }}
              >
                <CardMedia
                  component="img"
                  height="160"
                  image={product.images[0] || "/placeholder-product.png"}
                  alt={product.title}
                  className="product-image"
                  sx={{
                    objectFit: "cover",
                    transition: "transform 0.3s ease",
                  }}
                />
                {/* New Badge */}
                <Chip
                  label={t('recentOffers.new', { defaultValue: 'NEW' })}
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    bgcolor: "#00ff88",
                    color: "#000",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    height: 20,
                  }}
                />
              </Box>
              <CardContent sx={{ p: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    mb: 0.5,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: "#333",
                  }}
                >
                  {product.title}
                </Typography>

                {/* Time Added */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    mb: 1,
                  }}
                >
                  <Timer
                    sx={{ fontSize: 14, color: "rgba(51, 51, 51, 0.5)" }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {getTimeAgo(product.created_at)}
                  </Typography>
                </Box>

                {/* Price Section */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "#ff0080",
                    }}
                  >
                    {formatPrice(product.zetta_price || product.price)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      textDecoration: "line-through",
                      color: "rgba(51, 51, 51, 0.4)",
                    }}
                  >
                    {formatPrice(product.price)}
                  </Typography>
                </Box>

                {/* Special Offer Tag */}
                <Chip
                  icon={<LocalOffer sx={{ fontSize: 14 }} />}
                  label={t('recentOffers.limitedOffer', { defaultValue: 'Limited Offer' })}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255, 0, 128, 0.2)",
                    border: "1px solid rgba(255, 0, 128, 0.4)",
                    color: "#ff0080",
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    height: 24,
                  }}
                />
              </CardContent>
            </Card>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};

export default RecentlyAddedOffers;
