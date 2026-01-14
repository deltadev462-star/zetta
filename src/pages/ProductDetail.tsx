import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  Stack,
  IconButton,
  Fade,
  Zoom,
  alpha,
  useTheme,
  Tooltip,
  Rating,
  useMediaQuery,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Link,
  Breadcrumbs,
} from "@mui/material";
import {
  ShoppingCart,
  ArrowBack,
  LocalShipping,
  VerifiedUser,
  Category,
  CheckCircle,
  ZoomIn,
  AutoAwesome,
  Shield,
  Speed,
  WorkspacePremium,
  Inventory,
  ContactSupport,
  Share,
  Favorite,
  FavoriteBorder,
  ExpandMore,
  BusinessCenter,
  LocationOn,
  CalendarMonth,
  Verified,
  Info,
  Home,
  NavigateNext,
  HelpOutline,
  ArrowDropDown,
} from "@mui/icons-material";
import { productService } from "../services/products";
import { Product } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useTranslation } from "react-i18next";

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const { addToCart, items } = useCart();
  const { t } = useTranslation();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageZoom, setImageZoom] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    if (!id) return;

    setLoading(true);
    setError("");

    try {
      const { data, error } = await productService.getProductById(id);
      if (error) {
        setError(t("products.failedToLoad"));
      } else if (data) {
        setProduct(data);
      }
    } catch (err) {
      setError(t("products.unexpectedError"));
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  const isInCart = () => {
    return items.some((item) => item.product.id === product?.id);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "excellent":
        return "#4caf50";
      case "good":
        return "#2196f3";
      case "fair":
        return "#ff9800";
      default:
        return "#757575";
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || t("products.productNotFound")}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/products")}
          variant="outlined"
        >
          {t("products.backToProducts")}
        </Button>
      </Container>
    );
  }

  const discountPercentage =
    product.zetta_price && product.price !== product.zetta_price
      ? Math.round(
          ((product.price - product.zetta_price) / product.price) * 100
        )
      : 0;

  // Mock data for specialties and categories based on the image
  const medicalSpecialties = [
    t("products.specialties.intensiveCriticalCare"),
    t("products.specialties.cardiology"),
    t("products.specialties.emergencyMedicine"),
    t("products.specialties.anesthesiaPerioperative"),
    t("products.specialties.laboratoryMedicalBiology"),
    t("products.specialties.gynecologyObstetrics"),
    t("products.specialties.pediatricsNeonatology"),
    t("products.specialties.radiology"),
  ];

  const productCategories = [
    t("products.productCategoriesList.medicalDiagnosticEquipment"),
    t("products.productCategoriesList.medicalMonitoringEquipment"),
    t("products.productCategoriesList.vitalSignsMonitor"),
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
       <Box sx={{ minHeight: "100vh"  }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNext fontSize="small" sx={{ color: "#999" }} />}
        sx={{ mb: 2, fontSize: "0.875rem" }}
      >
        <Link
          underline="hover"
          sx={{
            display: "flex",
            alignItems: "center",
            color: "#666",
            cursor: "pointer",
            fontSize: "0.875rem",
            "&:hover": { color: "#0066cc" },
          }}
          onClick={() => navigate("/")}
        >
          <Home sx={{ mr: 0.5, fontSize: 16 }} />
          {t("nav.home")}
        </Link>
        {product.category && (
          <Link
            underline="hover"
            color="#666"
            sx={{
              cursor: "pointer",
              fontSize: "0.875rem",
              "&:hover": { color: "#0066cc" },
            }}
            onClick={() => navigate(`/products?category=${product.category}`)}
          >
            {product.category}
          </Link>
        )}
        <Typography color="text.primary" sx={{ fontSize: "0.875rem" }}>
          {product.title}
        </Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 0, border: "none", boxShadow: 0 , "&:hover": {
                         border: "none",
                        boxShadow: 0 ,
                      }, }}>
    

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
          }}
        >
          {/* Left Side - Product Image */}
          <Box sx={{ flex: { xs: "1 1 100%", md: "0 0 40%" }, pl: 3, pr: 2 }}>
            <Box
              sx={{
                position: "sticky",
                top: 20,
                // bgcolor: "white",
                // border: "1px solid #e0e0e0",
                borderRadius: 2,
                overflow: "hidden",
                // cursor: "zoom-in",
                mb: { xs: 3, md: 0 },
              }}
              onClick={() => setImageZoom(true)}
            >
              <Box
                component="img"
                src={
                  product.images[selectedImage] || "/placeholder-product.png"
                }
                alt={product.title}
                sx={{
                  width: "100%",
                  height: { xs: 250, sm: 350, md: 400 },
                  objectFit: "contain",
                }}
              />
            </Box>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  mt: 2,
                  overflowX: "auto",
                  pb: 1,
                  "&::-webkit-scrollbar": {
                    height: "4px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    // background: '#ccc',
                    borderRadius: "4px",
                  },
                }}
              >
                {product.images.map((image, index) => (
                  <Box
                    key={index}
                    component="img"
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    onClick={() => setSelectedImage(index)}
                    sx={{
                      width: 80,
                      height: 80,
                      objectFit: "cover",
                      borderRadius: 1,
                      border:
                        selectedImage === index
                          ? "2px solid #0066cc"
                          : "2px solid #e0e0e0",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      "&:hover": {
                        borderColor: "#0066cc",
                        transform: "scale(1.05)",
                      },
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* Right Side - Product Details */}
          <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 60%" }, pl: 2, pr: 3 }}>
            {/* Product Reference */}
                {/* Product Title */}
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 500,
            mb: 1,
            fontSize: "1.75rem",
            color: "#333",
            // px: 3,
            // pt: 3,
          }}
        >
          {product.title}
        </Typography>

        {/* Brand/Manufacturer Link */}
        <Link
          href="#"
          underline="always"
          sx={{
            color: "#0066cc",
            fontSize: "0.875rem",
            display: "inline-block",
            mb: 3,
            // px: 3,
            "&:hover": { color: "#004499" },
          }}
        >
          {t("products.manufacturers.generalElectricHealthcare")}
        </Link>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="body2"
                sx={{ color: "#666", fontSize: "0.813rem" }}
              >
                {t("products.reference")}: {t("products.productReference.geB8502014")}
              </Typography>
            </Box>

            {/* Categories */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  color: "#333",
                  fontSize: "0.875rem",
                }}
              >
                {t("products.categories")}:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {productCategories.map((category, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: "#ccc",
                      color: "#333",
                      textTransform: "none",
                      fontSize: "0.75rem",
                      py: 0.3,
                      px: 1.2,
                      mb: 0.5,
                      borderRadius: 0.5,
                      minHeight: 28,
                      "&:hover": {
                        borderColor: "#999",
                        bgcolor: "#f5f5f5",
                      },
                    }}
                  >
                    {category}
                  </Button>
                ))}
              </Stack>
            </Box>

            {/* Medical Specialties */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  color: "#333",
                  fontSize: "0.875rem",
                }}
              >
                {t("products.medicalSpecialties")}:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {medicalSpecialties.map((specialty, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: "#ccc",
                      color: "#333",
                      textTransform: "none",
                      fontSize: "0.75rem",
                      py: 0.3,
                      px: 1.2,
                      mb: 0.5,
                      borderRadius: 0.5,
                      minHeight: 28,
                      "&:hover": {
                        borderColor: "#999",
                        bgcolor: "#f5f5f5",
                      },
                    }}
                  >
                    {specialty}
                  </Button>
                ))}
              </Stack>
            </Box>

            {/* Description */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="body2"
                sx={{ lineHeight: 1.6, color: "#666" }}
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html: t("products.productDescriptions.carescapeB850")
                  }}
                />
              </Typography>
            </Box>

         
          </Box>
             {/* Product Info Grid */}
            <Box
              sx={{
                bgcolor: '#f2f2f2',
                p: 3,
                borderRadius: 0,
                border: "none",
              }}
            >
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 3 }}>
                {/* Price Section */}
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Chip
                      label={t("products.ourBestPrice")}
                      size="small"
                      sx={{
                        bgcolor: "#4a5568",
                        color: "white",
                        fontWeight: 500,
                        height: 28,
                      }}
                    />
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: "#0066cc",
                      mt: 1,
                      fontSize: { xs: "2rem", md: "2.5rem" },
                    }}
                  >
                    €
                    {new Intl.NumberFormat("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(product.zetta_price || product.price)}{" "}
                    {t("products.exclVAT")}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <LocalShipping fontSize="small" />
                    {t("products.shippingIncluded")} ({t("regions.europe")})
                  </Typography>
                </Box>

                {/* Product Details */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                    gap: 3,
                    gridColumn: "1 / -1",
                  }}
                >
                  <Box>
                    <Stack spacing={2}>
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          {t("products.condition")}
                          <Tooltip title={t("products.conditionTooltip")}>
                            <HelpOutline
                              sx={{ fontSize: 16, cursor: "pointer" }}
                            />
                          </Tooltip>
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 500,
                            color: getConditionColor(
                              product.condition || "good"
                            ),
                          }}
                        >
                          {t(`products.${product.condition || "good"}`)}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {t("products.year")}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {"2014"}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {t("products.stock")}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {1}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Box>
                    <Stack spacing={2}>
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          {t("products.typeOfSeller")}
                          <Tooltip title={t("products.certifiedSellerTooltip")}>
                            <HelpOutline
                              sx={{ fontSize: 16, cursor: "pointer" }}
                            />
                          </Tooltip>
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Verified sx={{ color: "#ff9800", fontSize: 20 }} />
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {t("products.certifiedProfessionalSeller")}
                          </Typography>
                        </Box>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {t("products.originOfSeller")}
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box component="span" sx={{ fontSize: "1.2rem" }}>
                            🇫🇷
                          </Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {t("countries.france")}
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </Box>
                </Box>
              </Box>

              {/* Offer Details Section */}
              <Box sx={{ borderTop: "1px solid #e0e0e0", pt: 2, mt: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: "#333",
                    fontSize: "1rem",
                  }}
                >
                  {t("products.offerDetails")}
                </Typography>

                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <Typography
                    variant="body1"
                    sx={{ color: "#333", fontSize: "0.875rem" }}
                  >
                    {t("products.quantity")}:
                  </Typography>
                  <Select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    size="small"
                    IconComponent={ArrowDropDown}
                    sx={{
                      minWidth: 60,
                      height: 32,
                      "& .MuiSelect-select": {
                        py: 0.5,
                        fontSize: "0.875rem",
                      },
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <MenuItem key={num} value={num}>
                        {num}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                {/* Add to Cart Button */}
                <Box
                  sx={{ mt: 3, display: "flex", gap: 2, alignItems: "center" }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleAddToCart}
                    disabled={justAdded}
                    startIcon={justAdded ? <CheckCircle  /> : <ShoppingCart    />}
                    sx={{
                      bgcolor: justAdded ? "#4caf50" : "#0066cc",
                      color: "white",
                      px: 1,
                      width: isSmallScreen ? "100%" : "auto",
                      py: 0.5,
                      fontSize: "1rem",
                      fontWeight: 600,
                      textTransform: "none",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      "&:hover": {
                        bgcolor: justAdded ? "#45a049" : "#0052cc",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                      },
                      "&:disabled": {
                        bgcolor: "#4caf50",
                        color: "white",
                      },
                    }}
                  >
                    {justAdded
                      ? t("products.addedToCart")
                      : t("products.addToCart")}
                  </Button>

                  <IconButton
                    onClick={() => setIsFavorite(!isFavorite)}
                    sx={{
                      border: "1px solid #ddd",
                      "&:hover": {
                        borderColor: "#ff4444",
                        bgcolor: "rgba(255,68,68,0.04)",
                      },
                    }}
                  >
                    {isFavorite ? (
                      <Favorite sx={{ color: "#ff4444", fontSize: 15 }} />
                    ) : (
                      <FavoriteBorder sx={{ color: "#666", fontSize: 15 }} />
                    )}
                  </IconButton>

                  <IconButton
                    sx={{
                      border: "1px solid #ddd",
                      "&:hover": {
                        borderColor: "#0066cc",
                        bgcolor: "rgba(0,102,204,0.04)",
                      },
                    }}
                  >
                    <Share sx={{ color: "#666", fontSize: 15 }} />
                  </IconButton>
                </Box>
              </Box>
            </Box>









        </Box>

        {/* Additional Information Tabs */}
        <Box sx={{ mt: 6, px: 3, pb: 3 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              mb: 4,
              pb: 2,
              borderBottom: "2px solid #e0e0e0",
              color: "text.primary",
            }}
          >
            {t("products.additionalInformation")}
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 3,
            }}
          >
            <Box>
              <Card
                sx={{
                  height: "100%",
                  border: "1px solid #e0e0e0",
                  boxShadow: "none",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <Shield sx={{ color: "#0066cc", fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {t("warrantySupport.title")}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {product.warranty_duration
                      ? t("warrantySupport.comprehensiveWarranty", {
                          months: product.warranty_duration,
                        })
                      : t("warrantySupport.standardWarranty")}
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box>
              <Card
                sx={{
                  height: "100%",
                  border: "1px solid #e0e0e0",
                  boxShadow: "none",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <LocalShipping sx={{ color: "#4caf50", fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {t("products.delivery")}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t("products.freeDeliveryEurope")}
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box>
              <Card
                sx={{
                  height: "100%",
                  border: "1px solid #e0e0e0",
                  boxShadow: "none",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <VerifiedUser sx={{ color: "#ff9800", fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {t("qualityAssurance.title")}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t("qualityAssurance.rigorousTesting")}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>
        {/* <SectionHeader /> */}
      </Paper>
      {/* </Container> */}
    </Box>
      </Container>
   
  );
};

export default ProductDetail;
