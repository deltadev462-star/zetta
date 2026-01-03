import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Pagination,
  Chip,
  Stack,
  IconButton,
  Fade,
  Zoom,
  Skeleton,
  alpha,
} from "@mui/material";
import { useTranslation } from 'react-i18next';
import {
  ShoppingCart,
  CheckCircle,
  Visibility,
  LocalOffer,
  NewReleases,
  TrendingUp,
  AutoAwesome,
  ArrowBackIosNew,
  ArrowForwardIos,
  FiberManualRecord,
} from "@mui/icons-material";
import { productService } from "../services/products";
import { Product } from "../types";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { PageTitle, FeaturedEquipmentSwiper, ExploreSection, RecentlyAddedOffers, BrandSpotlight, OurBrands, OurCustomers, Services } from "../components";

const ITEMS_PER_PAGE = 12;


// Mock data for development/demo
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Ultrasound Machine Pro X5',
    description: 'Advanced 4D ultrasound imaging system with AI-powered diagnostics',
    price: 45000,
    zetta_price: 42000,
    category: 'Imaging Equipment',
    condition: 'excellent',
    status: 'available',
    warranty_duration: 24,
    images: ['https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=1000'],
    seller_id: 'seller1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'MRI Scanner 3T',
    description: 'High-field MRI scanner with advanced neuroimaging capabilities',
    price: 1200000,
    zetta_price: 1150000,
    category: 'Imaging Equipment',
    condition: 'excellent',
    status: 'available',
    warranty_duration: 36,
    images: ['https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1000'],
    seller_id: 'seller1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Surgical Laser System',
    description: 'Precision CO2 laser for minimally invasive surgeries',
    price: 85000,
    zetta_price: 82000,
    category: 'Surgical Equipment',
    condition: 'excellent',
    status: 'available',
    warranty_duration: 18,
    images: ['https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=1000'],
    seller_id: 'seller2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Patient Monitor Multi-Parameter',
    description: '12-lead ECG, SpO2, NIBP, Temperature monitoring system',
    price: 8500,
    zetta_price: 8000,
    category: 'Monitoring Equipment',
    condition: 'good',
    status: 'available',
    warranty_duration: 12,
    images: ['https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=1000'],
    seller_id: 'seller2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Digital X-Ray System',
    description: 'Fully digital radiography system with PACS integration',
    price: 125000,
    zetta_price: 120000,
    category: 'Imaging Equipment',
    condition: 'excellent',
    status: 'available',
    warranty_duration: 24,
    images: ['https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=1000'],
    seller_id: 'seller3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    title: 'Ventilator ICU Grade',
    description: 'Advanced mechanical ventilator with multiple ventilation modes',
    price: 35000,
    zetta_price: 33000,
    category: 'Respiratory Equipment',
    condition: 'excellent',
    status: 'available',
    warranty_duration: 24,
    images: ['https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=1000'],
    seller_id: 'seller3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '7',
    title: 'Laboratory Centrifuge',
    description: 'High-speed refrigerated centrifuge for clinical labs',
    price: 12000,
    zetta_price: 11500,
    category: 'Laboratory Equipment',
    condition: 'good',
    status: 'available',
    warranty_duration: 12,
    images: ['https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1000'],
    seller_id: 'seller4',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '8',
    title: 'Defibrillator AED',
    description: 'Automated external defibrillator with voice guidance',
    price: 2500,
    zetta_price: 2300,
    category: 'Emergency Equipment',
    condition: 'excellent',
    status: 'available',
    warranty_duration: 36,
    images: ['https://images.unsplash.com/photo-1563213126-a4273aed2016?q=80&w=1000'],
    seller_id: 'seller4',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '9',
    title: 'Anesthesia Machine',
    description: 'Complete anesthesia workstation with ventilator and monitoring',
    price: 65000,
    zetta_price: 62000,
    category: 'Surgical Equipment',
    condition: 'excellent',
    status: 'available',
    warranty_duration: 24,
    images: ['https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000'],
    seller_id: 'seller5',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '10',
    title: 'Surgical Microscope',
    description: 'High-precision optical microscope for microsurgery',
    price: 95000,
    zetta_price: 92000,
    category: 'Surgical Equipment',
    condition: 'excellent',
    status: 'available',
    warranty_duration: 18,
    images: ['https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1000'],
    seller_id: 'seller5',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '11',
    title: 'Blood Analyzer Hematology',
    description: 'Automated complete blood count analyzer with 5-part differential',
    price: 28000,
    zetta_price: 27000,
    category: 'Laboratory Equipment',
    condition: 'good',
    status: 'available',
    warranty_duration: 12,
    images: ['https://images.unsplash.com/photo-1579684453423-f84349ef60b0?q=80&w=1000'],
    seller_id: 'seller6',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '12',
    title: 'Dialysis Machine',
    description: 'Hemodialysis system with advanced fluid management',
    price: 48000,
    zetta_price: 46000,
    category: 'Dialysis Equipment',
    condition: 'excellent',
    status: 'available',
    warranty_duration: 24,
    images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1000'],
    seller_id: 'seller6',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '13',
    title: 'ECG Machine 12-Channel',
    description: 'Portable electrocardiograph with interpretation software',
    price: 5500,
    zetta_price: 5200,
    category: 'Diagnostic Equipment',
    condition: 'excellent',
    status: 'available',
    warranty_duration: 18,
    images: ['https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=1000'],
    seller_id: 'seller7',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '14',
    title: 'Infusion Pump Smart',
    description: 'Programmable IV infusion pump with drug library',
    price: 3200,
    zetta_price: 3000,
    category: 'Infusion Equipment',
    condition: 'good',
    status: 'available',
    warranty_duration: 12,
    images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1000'],
    seller_id: 'seller7',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const Products: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, items } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]); // For featured equipment
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [addedToCart, setAddedToCart] = useState<string[]>([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  // Hero swiper state
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Translate hero slides
  const HERO_SLIDES = [
    {
      img: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=2000&auto=format&fit=crop",
      title: t('hero.title'),
      subtitle: t('hero.subtitle'),
      alt: "Modern medical facility with advanced equipment",
      accent: "#00d4ff",
    },
    {
      img: "https://images.unsplash.com/photo-1581594549595-35f6c54d7754?q=80&w=2000&auto=format&fit=crop",
      title: t('hero.slide2Title'),
      subtitle: t('hero.slide2Subtitle'),
      alt: "State-of-the-art MRI scanner in modern facility",
      accent: "#00ff88",
    },
    {
      img: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?q=80&w=2000&auto=format&fit=crop",
      title: t('hero.slide3Title'),
      subtitle: t('hero.slide3Subtitle'),
      alt: "Advanced surgical operating room",
      accent: "#ff0080",
    },
    {
      img: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2000&auto=format&fit=crop",
      title: t('hero.slide4Title'),
      subtitle: t('hero.slide4Subtitle'),
      alt: "Modern laboratory with advanced equipment",
      accent: "#ffaa00",
    },
  ];

  const nextSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
      setTimeout(() => setIsTransitioning(false), 800);
    }
  };

  const prevSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setActiveSlide(
        (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length
      );
      setTimeout(() => setIsTransitioning(false), 800);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isTransitioning]);

  // SEO: set title and meta description
  useEffect(() => {
    document.title = "Medical Equipment | Zetta Med Products";
    const desc =
      "Browse premium medical equipment: imaging, surgical, monitoring and lab devices.";
    let meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", desc);
    } else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = desc;
      document.head.appendChild(m);
    }
  }, []);

  // Preload hero images
  useEffect(() => {
    HERO_SLIDES.forEach((s) => {
      const img = new Image();
      img.src = s.img;
    });
  }, []);

  // Autoplay
  useEffect(() => {
    if (!isPaused && !isTransitioning) {
      const id = window.setTimeout(() => nextSlide(), 5000);
      return () => window.clearTimeout(id);
    }
  }, [activeSlide, isPaused, isTransitioning]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [search, category, condition, priceRange, page]);

  const fetchCategories = async () => {
    const { data, error } = await productService.getCategories();
    if (!error && data) {
      setCategories(data);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError("");

    const filters: any = {
      search: search || undefined,
      category: category || undefined,
      condition: condition || undefined,
    };

    // Parse price range
    if (priceRange) {
      const [min, max] = priceRange.split("-").map((p) => parseInt(p));
      if (min) filters.minPrice = min;
      if (max) filters.maxPrice = max;
    }

    try {
      const { data, error } = await productService.getProducts(filters);
      if (error || !data || data.length === 0) {
        // Use mock data if no products from database
        setAllProducts(MOCK_PRODUCTS);
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        setProducts(MOCK_PRODUCTS.slice(startIndex, endIndex));
        setTotalPages(Math.ceil(MOCK_PRODUCTS.length / ITEMS_PER_PAGE));
        if (error) {
          console.warn("Using mock data due to error:", error);
        }
      } else {
        setAllProducts(data); // Store all products for featured equipment
        // Client-side pagination
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        setProducts(data.slice(startIndex, endIndex));
        setTotalPages(Math.ceil(data.length / ITEMS_PER_PAGE));
      }
    } catch (err) {
      // Use mock data on error
      console.error("Error fetching products, using mock data:", err);
      setAllProducts(MOCK_PRODUCTS);
      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      setProducts(MOCK_PRODUCTS.slice(startIndex, endIndex));
      setTotalPages(Math.ceil(MOCK_PRODUCTS.length / ITEMS_PER_PAGE));
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    switch (filterType) {
      case "category":
        setCategory(value);
        break;
      case "condition":
        setCondition(value);
        break;
      case "priceRange":
        setPriceRange(value);
        break;
    }
    setPage(1);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const handleAddToCart = (product: Product) => {
    if (!user) {
      navigate("/login");
      return;
    }
    addToCart(product);
    setAddedToCart((prev) => [...prev, product.id]);
    setTimeout(() => {
      setAddedToCart((prev) => prev.filter((id) => id !== product.id));
    }, 2000);
  };

  const isInCart = (productId: string) => {
    return items.some((item) => item.product.id === productId);
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "excellent":
        return "#00ff88";
      case "good":
        return "#00d4ff";
      default:
        return "#ffaa00";
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'oklch(98.7% 0.026 102.212)' }}>
      <Container maxWidth="xl" sx={{ pt: 4, pb: 6 }}>
      <Box>{/* hero section  */}</Box>
      <Fade in timeout={800}>
        <Box>
          {/* Hero Swiper */}
          <Box
            role="region"
            aria-roledescription="carousel"
            aria-label="Featured medical equipment"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            sx={{
              position: "relative",
              height: { xs: 320, sm: 300, md: 300, lg: 360 },
              mb: 3,
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid rgba(0,0,0,0.1)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              background: "oklch(98.7% 0.026 102.212)",
              "&::before": {
                content: '""',
                position: "absolute",
                inset: 0,
                background: alpha(HERO_SLIDES[activeSlide].accent, 0.05),
                zIndex: 3,
                pointerEvents: "none",
              },
            }}
          >
            {HERO_SLIDES.map((slide, index) => (
              <Box
                key={index}
                aria-hidden={activeSlide !== index}
                sx={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url(${slide.img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  transform:
                    activeSlide === index
                      ? "scale(1) translateX(0)"
                      : index > activeSlide
                      ? "scale(1.1) translateX(100px)"
                      : "scale(1.1) translateX(-100px)",
                  opacity: activeSlide === index ? 1 : 0,
                  transition: "all 800ms cubic-bezier(0.4, 0, 0.2, 1)",
                  filter: activeSlide === index ? "none" : "blur(4px)",
                  willChange: "transform, opacity, filter",
                }}
              />
            ))}

            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background: "rgba(250, 246, 240, 0.7)",
                zIndex: 1,
              }}
            />

            {/* Animated particles */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                zIndex: 2,
                opacity: 0.4,
                "&::before": {
                  content: '""',
                  position: "absolute",
                  width: "2px",
                  height: "2px",
                  bgcolor: HERO_SLIDES[activeSlide].accent,
                  borderRadius: "50%",
                  boxShadow: `0 0 10px ${HERO_SLIDES[activeSlide].accent}`,
                  animation: "float1 20s infinite linear",
                  top: "20%",
                  left: "10%",
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  width: "3px",
                  height: "3px",
                  bgcolor: HERO_SLIDES[activeSlide].accent,
                  borderRadius: "50%",
                  boxShadow: `0 0 15px ${HERO_SLIDES[activeSlide].accent}`,
                  animation: "float2 25s infinite linear",
                  bottom: "30%",
                  right: "20%",
                },
                "@keyframes float1": {
                  "0%": { transform: "translate(0, 0)" },
                  "25%": { transform: "translate(100px, -50px)" },
                  "50%": { transform: "translate(200px, 50px)" },
                  "75%": { transform: "translate(100px, 100px)" },
                  "100%": { transform: "translate(0, 0)" },
                },
                "@keyframes float2": {
                  "0%": { transform: "translate(0, 0)" },
                  "25%": { transform: "translate(-50px, 100px)" },
                  "50%": { transform: "translate(-100px, -50px)" },
                  "75%": { transform: "translate(-50px, -100px)" },
                  "100%": { transform: "translate(0, 0)" },
                },
              }}
            />

            <Box
              sx={{
                position: "relative",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
                px: { xs: 3, sm: 4, md: 6, lg: 8 },
                zIndex: 4,
              }}
            >
              {/* Animated category badge */}
              {/* <Fade in={!isTransitioning} timeout={600}>
                <Chip
                  label={`0${activeSlide + 1} / 0${HERO_SLIDES.length}`}
                  sx={{
                    mb: 2,
                    bgcolor: "oklch(95% 0.026 102.212)",
                    backdropFilter: "blur(10px)",
                    border: `1px solid rgba(0,0,0,0.1)`,
                    color: HERO_SLIDES[activeSlide].accent,
                    fontWeight: 700,
                    fontSize: "0.75rem",
                  }}
                />
              </Fade> */}

              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 900,
                  fontSize: {
                    xs: "2rem",
                    sm: "2.5rem",
                    md: "3rem",
                    lg: "3.5rem",
                  },
                  color: HERO_SLIDES[activeSlide].accent,
                  mb: 2,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                  transform: isTransitioning
                    ? "translateY(20px)"
                    : "translateY(0)",
                  opacity: isTransitioning ? 0 : 1,
                  transition: "all 600ms cubic-bezier(0.4, 0, 0.2, 1)",
                  transitionDelay: isTransitioning ? "0ms" : "200ms",
                }}
              >
                {HERO_SLIDES[activeSlide].title}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  maxWidth: { xs: "100%", md: 700 },
                  mb: 4,
                  color: "rgba(51,51,51,0.8)",
                  transform: isTransitioning
                    ? "translateY(20px)"
                    : "translateY(0)",
                  opacity: isTransitioning ? 0 : 1,
                  transition: "all 600ms cubic-bezier(0.4, 0, 0.2, 1)",
                  transitionDelay: isTransitioning ? "0ms" : "400ms",
                }}
              >
                {HERO_SLIDES[activeSlide].subtitle}
              </Typography>
              <Button
                variant="contained"
                size="large"
                href="#products-grid"
                startIcon={<AutoAwesome />}
                sx={{
                  background: HERO_SLIDES[activeSlide].accent,
                  boxShadow: `0 4px 16px ${alpha(HERO_SLIDES[activeSlide].accent, 0.3)}`,
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  transform: isTransitioning
                    ? "translateY(20px)"
                    : "translateY(0)",
                  opacity: isTransitioning ? 0 : 1,
                  transition: "all 600ms cubic-bezier(0.4, 0, 0.2, 1)",
                  transitionDelay: isTransitioning ? "0ms" : "600ms",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: `0 8px 24px ${alpha(HERO_SLIDES[activeSlide].accent, 0.4)}`,
                  },
                }}
              >
                {t('hero.exploreProducts')}
              </Button>
              <Box
                component="img"
                src={HERO_SLIDES[activeSlide].img}
                alt={HERO_SLIDES[activeSlide].alt}
                loading="eager"
                sx={{ display: "none" }}
              />
            </Box>

            <IconButton
              aria-label="Previous slide"
              onClick={prevSlide}
              sx={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "oklch(98.7% 0.026 102.212)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(0,0,0,0.1)",
                color: "#333",
                zIndex: 5,
                "&:hover": {
                  bgcolor: "oklch(95% 0.026 102.212)",
                  border: `1px solid ${alpha(HERO_SLIDES[activeSlide].accent, 0.3)}`,
                },
              }}
            >
              <ArrowBackIosNew />
            </IconButton>

            <IconButton
              aria-label="Next slide"
              onClick={nextSlide}
              sx={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "oklch(98.7% 0.026 102.212)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(0,0,0,0.1)",
                color: "#333",
                zIndex: 5,
                "&:hover": {
                  bgcolor: "oklch(95% 0.026 102.212)",
                  border: `1px solid ${alpha(HERO_SLIDES[activeSlide].accent, 0.3)}`,
                },
              }}
            >
              <ArrowForwardIos />
            </IconButton>

            {/* Progress bar */}
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 4,
                bgcolor: "rgba(0,0,0,0.1)",
                zIndex: 5,
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  bgcolor: HERO_SLIDES[activeSlide].accent,
                  width: `${((activeSlide + 1) / HERO_SLIDES.length) * 100}%`,
                  transition: "width 5s linear",
                  boxShadow: `0 0 10px ${HERO_SLIDES[activeSlide].accent}`,
                }}
              />
            </Box>

            {/* Slide indicators */}
            <Box
              sx={{
                position: "absolute",
                bottom: 20,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: 1.5,
                zIndex: 5,
              }}
            >
              {HERO_SLIDES.map((_, i) => (
                <IconButton
                  key={i}
                  size="small"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => {
                    if (!isTransitioning) {
                      setIsTransitioning(true);
                      setActiveSlide(i);
                      setTimeout(() => setIsTransitioning(false), 800);
                    }
                  }}
                  sx={{
                    p: 0.5,
                    transition: "all 300ms",
                    "& svg": {
                      fontSize: i === activeSlide ? "14px" : "10px",
                      color:
                        i === activeSlide
                          ? HERO_SLIDES[activeSlide].accent
                          : "rgba(0,0,0,0.3)",
                      filter:
                        i === activeSlide
                          ? `drop-shadow(0 0 8px ${HERO_SLIDES[activeSlide].accent})`
                          : "none",
                    },
                  }}
                >
                  <FiberManualRecord />
                </IconButton>
              ))}
            </Box>
          </Box>

         
          {/* Featured Equipment Section */}
          {allProducts.length > 0 && (
            <Box  >
              <PageTitle
                text={t('featuredEquipment.title')}
                align="left"
                 size="medium"
                
              />
              <FeaturedEquipmentSwiper
                products={allProducts.slice(0, 14)} // Show first 14 products
                onAddToCart={handleAddToCart}
              />
            </Box>
          )}
         {/* Explore Section */}
         <Box >
           <ExploreSection />
         </Box>
         
         {/* Recently Added Offers Section */}
         {allProducts.length > 0 && (
           <Box  >
             <PageTitle
               text={t('recentOffers.title')}
               align="left"
                size="medium"
              />
             <RecentlyAddedOffers
               products={allProducts.slice(7, 14).map(p => ({
                 ...p,
                 originalPrice: p.price,
                 price: p.zetta_price || p.price * 0.85, // Apply discount if no zetta_price
               }))}
               onAddToCart={handleAddToCart}
             />
           </Box>
         )}
 
         {/* Brand Spotlight Section */}
         {allProducts.length > 0 && (
           <Box  >
             <PageTitle
               text={t('brandSpotlight.title')}
               align="left"
                size="medium"
              />
             <BrandSpotlight
               products={allProducts.filter(p =>
                 // Filter for products that could be from Thermo Fisher (based on category/type)
                 p.category === 'Laboratory Equipment' ||
                 p.category === 'Diagnostic Equipment' ||
                 p.title.toLowerCase().includes('analyzer') ||
                 p.title.toLowerCase().includes('centrifuge')
               ).slice(0, 10)}
               onAddToCart={handleAddToCart}
             />
           </Box>
         )}
         {/* Our Brands Section */}
         <Box  >
           <OurBrands />
         </Box>
         
         {/* Our customer Section */}
         <Box >
           <OurCustomers />
         </Box>
         
         
       
         {/* Products Grid */}
          {/* {loading ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                  lg: "repeat(4, 1fr)",
                },
                gap: 3,
              }}
            >
              {[...Array(8)].map((_, index) => (
                <Card
                  key={index}
                  sx={{
                    height: "100%",
                    bgcolor: "rgba(15,15,25,0.6)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" sx={{ fontSize: "1.5rem" }} />
                    <Skeleton variant="text" />
                    <Skeleton variant="text" width="60%" />
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <>
              <Box
                id="products-grid"
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                    lg: "repeat(4, 1fr)",
                  },
                  gap: 3,
                }}
              >
                {products.map((product, index) => (
                  <Zoom in timeout={300 + index * 50}>
                    <Card
                      onMouseEnter={() => setHoveredCard(product.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                      onClick={() => navigate(`/products/${product.id}`)}
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        overflow: "hidden",
                        bgcolor: "rgba(15,15,25,0.6)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        cursor: "pointer",
                        "&:hover": {
                          transform: "translateY(-8px) scale(1.02)",
                          border: "1px solid rgba(0,212,255,0.5)",
                          boxShadow: "0 20px 40px rgba(0,212,255,0.3)",
                          "& .product-image": {
                            transform: "scale(1.1)",
                          },
                          "& .product-overlay": {
                            opacity: 1,
                          },
                        },
                      }}
                    >
                      
                      <Box sx={{ position: "relative", overflow: "hidden" }}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={
                            product.images[0] || "/placeholder-product.png"
                          }
                          alt={product.title}
                          className="product-image"
                          sx={{
                            objectFit: "cover",
                            transition: "transform 0.6s ease",
                          }}
                        />
                        <Box
                          className="product-overlay"
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            bgcolor: "rgba(0,0,0,0.6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: 0,
                            transition: "opacity 0.3s",
                          }}
                        >
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/products/${product.id}`);
                            }}
                            sx={{
                              bgcolor: "rgba(0,212,255,0.2)",
                              border: "2px solid #00d4ff",
                              color: "#00d4ff",
                              "&:hover": {
                                bgcolor: "rgba(0,212,255,0.3)",
                                transform: "scale(1.1)",
                              },
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </Box>
                      
                        {product.warranty_duration &&
                          product.warranty_duration > 12 && (
                            <Chip
                              icon={<NewReleases />}
                              label="PREMIUM"
                              size="small"
                              sx={{
                                position: "absolute",
                                top: 10,
                                left: 10,
                                bgcolor: "#ff0080",
                                color: "white",
                                fontWeight: 600,
                                boxShadow: "0 4px 20px rgba(255,0,128,0.5)",
                              }}
                            />
                          )}
                      </Box>

                    
                      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                        <Typography
                          variant="h6"
                          component="h2"
                          sx={{
                            fontWeight: 600,
                            mb: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            color:
                              hoveredCard === product.id ? "#00d4ff" : "white",
                            transition: "color 0.3s",
                          }}
                        >
                          {product.title}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 2,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {product.description}
                        </Typography>

                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                          <Chip
                            label={product.category}
                            size="small"
                            icon={<LocalOffer />}
                            sx={{
                              bgcolor: "rgba(0,212,255,0.1)",
                              border: "1px solid rgba(0,212,255,0.3)",
                              color: "#00d4ff",
                              fontWeight: 600,
                            }}
                          />
                          <Chip
                            label={product.condition}
                            size="small"
                            sx={{
                              bgcolor: alpha(
                                getConditionColor(product.condition),
                                0.1
                              ),
                              border: `1px solid ${alpha(
                                getConditionColor(product.condition),
                                0.3
                              )}`,
                              color: getConditionColor(product.condition),
                              fontWeight: 600,
                            }}
                          />
                        </Stack>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 700,
                              background:
                                "linear-gradient(135deg, #00d4ff 0%, #00ff88 100%)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            }}
                          >
                            {formatPrice(product.zetta_price || product.price)}
                          </Typography>
                          {product.zetta_price &&
                            product.price !== product.zetta_price && (
                              <Typography
                                variant="body2"
                                sx={{
                                  textDecoration: "line-through",
                                  color: "text.secondary",
                                }}
                              >
                                {formatPrice(product.price)}
                              </Typography>
                            )}
                        </Box>

                        {product.warranty_duration && (
                          <Box
                            sx={{
                              mt: 1,
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <AutoAwesome
                              sx={{ fontSize: 16, color: "#ffaa00" }}
                            />
                            <Typography variant="body2" color="#ffaa00">
                              {product.warranty_duration} months warranty
                            </Typography>
                          </Box>
                        )}
                      </CardContent>

                    
                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={
                            addedToCart.includes(product.id) ||
                            isInCart(product.id) ? (
                              <CheckCircle />
                            ) : (
                              <ShoppingCart />
                            )
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          disabled={product.status !== "available"}
                          sx={{
                            background: isInCart(product.id)
                              ? "linear-gradient(135deg, #00ff88 0%, #00cc55 100%)"
                              : "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
                            boxShadow: isInCart(product.id)
                              ? "0 4px 20px rgba(0,255,136,0.4)"
                              : "0 4px 20px rgba(0,212,255,0.4)",
                            fontWeight: 600,
                            "&:hover": {
                              transform: "scale(1.05)",
                              boxShadow: isInCart(product.id)
                                ? "0 6px 30px rgba(0,255,136,0.5)"
                                : "0 6px 30px rgba(0,212,255,0.5)",
                            },
                            "&:disabled": {
                              background: "rgba(128,128,128,0.3)",
                            },
                          }}
                        >
                          {addedToCart.includes(product.id)
                            ? "Added!"
                            : isInCart(product.id)
                            ? "In Cart"
                            : "Add to Cart"}
                        </Button>
                      </CardActions>
                    </Card>
                  </Zoom>
                ))}
              </Box>

              {products.length === 0 && (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 8,
                    background: "rgba(15,15,25,0.6)",
                    backdropFilter: "blur(20px)",
                    borderRadius: 1,
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <TrendingUp
                    sx={{ fontSize: 80, color: "rgba(255,255,255,0.1)", mb: 2 }}
                  />
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    {t('products.noProductsFound')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {t('products.adjustFilters')}
                  </Typography>
                </Box>
              )}

               
              {totalPages > 1 && (
                <Box
                  display="flex"
                  justifyContent="center"
                  mt={6}
                  sx={{
                    "& .MuiPagination-root": {
                      "& .MuiPaginationItem-root": {
                        color: "rgba(255,255,255,0.7)",
                        borderColor: "rgba(255,255,255,0.2)",
                        "&:hover": {
                          bgcolor: "rgba(0,212,255,0.1)",
                          borderColor: "#00d4ff",
                        },
                        "&.Mui-selected": {
                          bgcolor: "rgba(0,212,255,0.2)",
                          borderColor: "#00d4ff",
                          color: "#00d4ff",
                          fontWeight: 600,
                          "&:hover": {
                            bgcolor: "rgba(0,212,255,0.3)",
                          },
                        },
                      },
                    },
                  }}
                >
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    size="large"
                    variant="outlined"
                    shape="rounded"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )} */}
        </Box>
      </Fade>
      </Container>
    </Box>
  );
};

export default Products;
