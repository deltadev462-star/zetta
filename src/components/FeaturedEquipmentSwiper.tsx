import React, { useRef } from "react";
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
} from "@mui/material";
import { ArrowForwardIos, ArrowBackIosNew } from "@mui/icons-material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import { Product } from "../types";
import type { Swiper as SwiperType } from "swiper";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
interface FeaturedEquipmentSwiperProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const FeaturedEquipmentSwiper: React.FC<FeaturedEquipmentSwiperProps> = ({
  products,
  onAddToCart,
}) => {
  const navigate = useNavigate();
  const swiperRef = useRef<SwiperType | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(price);
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
          delay: 5000,
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
        className="featured-equipment-swiper"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <Card
              onClick={() => navigate(`/products/${product.id}`)}
              sx={{
                height: "100%",
                borderRadius: 0,

                boxShadow: "none",
                cursor: "pointer",
                border: "1px solid transparent",
                bgcolor: "oklch(98.5% 0.001 106.423)",
              }}
            >
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
                {product.warranty_duration &&
                  product.warranty_duration > 12 && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        bgcolor: "#ff0080",
                        color: "white",
                        px: 1,
                        py: 0.5,
                        borderRadius: 0,
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        boxShadow: "0 2px 10px rgba(255, 0, 128, 0.5)",
                      }}
                    >
                      PREMIUM
                    </Box>
                  )}
              </Box>
              <CardContent sx={{ p: 2, border: "none" }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    fontSize: "1rem",
                    mb: 0.5,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: "#333",
                  }}
                >
                  {product.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 1,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    height: "2.5rem",
                  }}
                >
                  {product.description}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#00a1cc",
                  }}
                >
                  {formatPrice(product.zetta_price || product.price)}
                </Typography>
              </CardContent>
            </Card>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};

export default FeaturedEquipmentSwiper;
