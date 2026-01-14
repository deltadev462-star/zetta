import React, { useState, useEffect } from "react";
import {
  Box,
  Breadcrumbs,
  Typography,
  Slider,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  CardMedia,
  Link,
  Container,
  useTheme,
  useMediaQuery,
  Pagination,
  Stack,
} from "@mui/material";
import { Home, NavigateNext, ExpandMore } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { productService } from "../services/products";
import { Product } from "../types";

/* ================== DATA ================== */
const conditions = [
  "Brand New",
  "Perfect Condition",
  "Good Condition",
  "Fair Condition",
];
const years = Array.from({ length: 21 }, (_, i) => 2025 - i);
const brands = [
  "3M",
  "Abbott",
  "Accutome",
  "AEONMED",
  "Aesculap",
  "AGFA",
  "Alcon",
  "Ambu",
  "Canon Medical System",
  "Carestream",
  "Covidien",
  "Dräger",
  "Esaote",
  "Fujifilm",
  "General Electric HealthCare",
];
const specialties = [
  "Cardiology",
  "Dentistry",
  "Dermatology",
  "Emergency Medicine",
  "ENT",
  "Gastroenterology",
  "General Medicine",
  "Gynecology and Obstetrics",
  "Neurology",
  "Oncology",
  "Radiology",
  "Surgery",
  "Veterinary Medicine",
];
const products = [
  {
    title: "Ultrasound system VOLUSON E8",
    brand: "General Electric HealthCare",
    price: "€10,075.00",
    image: "/aplio-i800-small.png",
    condition: "Good Condition",
    year: 2020,
    specialty: "Radiology",
  },
  {
    title: "Ultrasound VOLUSON E10",
    brand: "General Electric HealthCare",
    price: "€29,195.00",
    image: "/aplio-i800-small.png",
    condition: "Perfect Condition",
    year: 2021,
    specialty: "Gynecology and Obstetrics",
  },
  {
    title: "Endoscopy system EPK-1000",
    brand: "Pentax",
    price: "€800.00",
    image: "/aplio-i800-small.png",
    condition: "Brand New",
    year: 2019,
    specialty: "Surgery",
  },
  // النسخ الإضافية
  {
    title: "Ultrasound system VOLUSON E8 - Copy 1",
    brand: "General Electric HealthCare",
    price: "€10,075.00",
    image: "/aplio-i800-small.png",
    condition: "Good Condition",
    year: 2020,
    specialty: "Radiology",
  },
  {
    title: "Ultrasound system VOLUSON E8 - Copy 2",
    brand: "General Electric HealthCare",
    price: "€10,075.00",
    image: "/aplio-i800-small.png",
    condition: "Good Condition",
    year: 2025,
    specialty: "Radiology",
  },
  {
    title: "Ultrasound system VOLUSON E8 - Copy 3",
    brand: "General Electric HealthCare",
    price: "€10,075.00",
    image: "/aplio-i800-small.png",
    condition: "Good Condition",
    year: 2025,
    specialty: "Radiology",
  },
  {
    title: "Ultrasound VOLUSON E10 - Copy 1",
    brand: "General Electric HealthCare",
    price: "€29,195.00",
    image: "/aplio-i800-small.png",
    condition: "Perfect Condition",
    year: 2021,
    specialty: "Gynecology and Obstetrics",
  },
  {
    title: "Ultrasound VOLUSON E10 - Copy 2",
    brand: "General Electric HealthCare",
    price: "€29,195.00",
    image: "/aplio-i800-small.png",
    condition: "Perfect Condition",
    year: 2022,
    specialty: "Gynecology and Obstetrics",
  },
  {
    title: "Ultrasound VOLUSON E10 - Copy 3",
    brand: "General Electric HealthCare",
    price: "€29,195.00",
    image: "/aplio-i800-small.png",
    condition: "Perfect Condition",
    year: 2023,
    specialty: "Gynecology and Obstetrics",
  },
  {
    title: "Endoscopy system EPK-1000 - Copy 1",
    brand: "Pentax",
    price: "€800.00",
    image: "/aplio-i800-small.png",
    condition: "Brand New",
    year: 2019,
    specialty: "Surgery",
  },
  {
    title: "Endoscopy system EPK-1000 - Copy 2",
    brand: "Pentax",
    price: "€800.00",
    image: "/aplio-i800-small.png",
    condition: "Brand New",
    year: 2024,
    specialty: "Surgery",
  },
  {
    title: "Endoscopy system EPK-1000 - Copy 3",
    brand: "Pentax",
    price: "€800.00",
    image: "/aplio-i800-small.png",
    condition: "Brand New",
    year: 2019,
    specialty: "Surgery",
  },
  {
    title: "Endoscopy system EPK-1000 - Copy 4",
    brand: "Pentax",
    price: "€800.00",
    image: "/aplio-i800-small.png",
    condition: "Brand New",
    year: 2019,
    specialty: "Surgery",
  },
  {
    title: "Ultrasound system VOLUSON E8 - Copy 4",
    brand: "General Electric HealthCare",
    price: "€10,075.00",
    image: "/aplio-i800-small.png",
    condition: "Good Condition",
    year: 2020,
    specialty: "Radiology",
  },
  {
    title: "Ultrasound VOLUSON E10 - Copy 4",
    brand: "General Electric HealthCare",
    price: "€29,195.00",
    image: "/aplio-i800-small.png",
    condition: "Perfect Condition",
    year: 2021,
    specialty: "Gynecology and Obstetrics",
  },
  {
    title: "Ultrasound system VOLUSON E8 - Copy 5",
    brand: "General Electric HealthCare",
    price: "€10,075.00",
    image: "/aplio-i800-small.png",
    condition: "Good Condition",
    year: 2020,
    specialty: "Radiology",
  } ];

function CategoryDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [page, setPage] = useState(1);
  const productsPerPage =10;
  const pageCount = Math.ceil(products.length / productsPerPage);

  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  /* ================== STATE FOR FILTERS ================== */
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([10, 608590]);

  /* ================== FILTERED PRODUCTS ================== */
  const filteredProducts = products.filter((product) => {
    const productPrice = parseFloat(product.price.replace(/[^0-9.-]+/g, ""));
    if (productPrice < priceRange[0] || productPrice > priceRange[1])
      return false;
    if (
      selectedConditions.length &&
      !selectedConditions.includes(product.condition || "Good Condition")
    )
      return false;
    if (selectedYears.length && !selectedYears.includes(product.year || 2023))
      return false;
    if (selectedBrands.length && !selectedBrands.includes(product.brand))
      return false;
    if (
      selectedSpecialties.length &&
      !selectedSpecialties.includes(product.specialty || "General Medicine")
    )
      return false;
    return true;
  });

  return (
    <>
      <Container maxWidth="xl">
        <Box sx={{ minHeight: "100vh", p: { xs: 2, sm: 4, md: 6 } }}>
          {/* Breadcrumbs */}
          <Breadcrumbs
            separator={<NavigateNext fontSize="small" />}
            sx={{ mb: 4 }}
          >
            <Link
              sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
              color="inherit"
              onClick={() => navigate("/")}
            >
              <Home sx={{ mr: 0.5 }} fontSize="small" /> Home
            </Link>
            <Typography color="text.primary">
              Medical Diagnostic Equipment
            </Typography>
          </Breadcrumbs>

          {/* Layout: Sidebar + Products */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
              alignItems: "flex-start",
            }}
          >
            {/* Sidebar / Filter */}
            <Box sx={{ width: { xs: "100%", md: 300 }, flexShrink: 0 }}>
              {/* PRICE */}
              <Box sx={{ pb: 2, mb: 2, borderBottom: "1px solid #e0e0e0" }}>
                <Typography fontWeight={600} mb={1}>
                  Price
                </Typography>
                <Typography variant="body2">
                  {priceRange[0]} € – {priceRange[1]} €
                </Typography>
                <Slider
                  min={10}
                  max={608590}
                  value={priceRange}
                  onChange={(_, newValue) =>
                    setPriceRange(newValue as [number, number])
                  }
                  valueLabelDisplay="auto"
                  sx={{ mt: 1, width: "100%" }}
                />
              </Box>

              {/* CONDITION */}
              <Box sx={{ pb: 2, mb: 2, borderBottom: "1px solid #e0e0e0" }}>
                <Typography fontWeight={600} mb={1}>
                  Product Condition
                </Typography>
                {conditions.map((item) => (
                  <FormControlLabel
                    key={item}
                    control={
                      <Checkbox
                        size="small"
                        checked={selectedConditions.includes(item)}
                        onChange={(e) =>
                          e.target.checked
                            ? setSelectedConditions([
                                ...selectedConditions,
                                item,
                              ])
                            : setSelectedConditions(
                                selectedConditions.filter((c) => c !== item)
                              )
                        }
                      />
                    }
                    label={item}
                    sx={{ display: "block" }}
                  />
                ))}
              </Box>

              {/* YEAR */}
              <Box sx={{ pb: 2, mb: 2, borderBottom: "1px solid #e0e0e0" }}>
                <Typography fontWeight={600} mb={1}>
                  Year
                </Typography>
                <Box sx={{ maxHeight: 180, overflowY: "auto", pr: 1, scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" }, }}>
                  {years.map((year) => (
                    <FormControlLabel
                      key={year}
                      control={
                        <Checkbox
                          size="small"
                          checked={selectedYears.includes(year)}
                          onChange={(e) =>
                            e.target.checked
                              ? setSelectedYears([...selectedYears, year])
                              : setSelectedYears(
                                  selectedYears.filter((y) => y !== year)
                                )
                          }
                        />
                      }
                      label={year}
                      sx={{ display: "block" }}
                    />
                  ))}
                </Box>
              </Box>

              {/* BRANDS */}
              <Box sx={{ pb: 2, mb: 2, borderBottom: "1px solid #e0e0e0" }}>
                <Typography fontWeight={600} mb={1}>
                  Brands
                </Typography>
                <Box sx={{ maxHeight: 180, overflowY: "auto", pr: 1 , scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" },}}>
                  {brands.map((brand) => (
                    <FormControlLabel
                      key={brand}
                      control={
                        <Checkbox
                          size="small"
                          checked={selectedBrands.includes(brand)}
                          onChange={(e) =>
                            e.target.checked
                              ? setSelectedBrands([...selectedBrands, brand])
                              : setSelectedBrands(
                                  selectedBrands.filter((b) => b !== brand)
                                )
                          }
                        />
                      }
                      label={brand}
                      sx={{ display: "block" }}
                    />
                  ))}
                </Box>
              </Box>

              {/* SPECIALTY */}
              <Box sx={{ pb: 2, mb: 2 }}>
                <Typography fontWeight={600} mb={1}>
                  Specialty
                </Typography>
                <Box sx={{ maxHeight: 180, overflowY: "auto", pr: 1 , scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" },}}>
                  {specialties.map((item) => (
                    <FormControlLabel
                      key={item}
                      control={
                        <Checkbox
                          size="small"
                          checked={selectedSpecialties.includes(item)}
                          onChange={(e) =>
                            e.target.checked
                              ? setSelectedSpecialties([
                                  ...selectedSpecialties,
                                  item,
                                ])
                              : setSelectedSpecialties(
                                  selectedSpecialties.filter((s) => s !== item)
                                )
                          }
                        />
                      }
                      label={item}
                      sx={{ display: "block" }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>

            {/* Products + Pagination */}
            <Box sx={{ flexGrow: 1 }}>
              {/* Products Grid */}

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(5, 1fr)",
                    lg: "repeat(4, 1fr)",
                  },
                  gap: 3,
                }}
              >
                {filteredProducts
                  .slice((page - 1) * productsPerPage, page * productsPerPage)
                  .map((product, index) => (
                    <Box key={index} sx={{ width: "100%" }}>
                      {" "}
                      <Card
                        sx={{
                          cursor: "pointer",
                          boxShadow: 0,
                          borderRadius: 2,
                          bgcolor: "oklch(98.5% 0.001 106.423)",
                          "&:hover": { boxShadow: 2 },
                          width: "100%",
                          height: "100%",
                        }}
                        onClick={() => navigate(`/products/${product.title}`)}
                      >
                        <CardMedia
                          component="img"
                          image={product.image}
                          alt={product.title}
                          sx={{
                            width: "100%",
                            height: 200,
                            objectFit: "contain",
                            borderRadius: 1,
                            backgroundColor: "#ffffff",
                          }}
                        />
                        <CardContent>
                          <Typography sx={{fontSize:"16px",}}   fontWeight={600}>
                            {product.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {product.brand}
                          </Typography>
                          <Typography
                            sx={{
                              mt: 1,
                              color: "primary.main",
                              fontWeight: 600,
                            }}
                          >
                            From: {product.price}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                  ))}
              </Box>

              {/* Pagination */}
              <Stack spacing={2} alignItems="center" sx={{ mt: 4 }}>
                <Pagination
                  count={pageCount}
                  page={page}
                  onChange={handleChangePage}
                  color="primary"
                  shape="rounded"
                />
              </Stack>
            </Box>
          </Box>
        </Box>
      </Container>

      <Box
        sx={{
          backgroundColor: "#f7f9fc", // subtle light background similar to image
        }}
      >
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Typography variant="h5" fontWeight={700} mb={3}>
            Buy Second-Hand Medical Diagnostic Devices on Zetta
          </Typography>

          <Typography variant="body1" mb={3} color="text.secondary">
            At Zetta, we take pride in offering high-quality second-hand
            diagnostic instruments and machines designed to meet the needs of
            healthcare professionals. Whether you manage a large hospital, a
            growing clinic, or a private practice, we provide a wide range of
            second-hand diagnostic tools tailored to your budget.
          </Typography>

          <Typography variant="subtitle1" fontWeight={700} mb={1}>
            Why Choose Second-Hand Diagnostic Equipment?
          </Typography>
          <Typography variant="body2" mb={3} color="text.secondary">
            Opting for second-hand medical diagnostic equipment is a smart and
            cost-effective choice for professionals demanding reliability and
            performance. From multidisciplinary ultrasound systems and their
            specialty accessories to portable devices for mobile use, monitoring
            solutions for emergency care, radiography or endoscopy systems, and
            ophthalmic diagnostic tools such as slit lamps, OCT devices, or
            lensmeters, our catalog offers a broad selection at a fraction of
            the cost of new models. This makes diagnostic devices accessible to
            facilities with limited budgets.
          </Typography>

          <Typography variant="subtitle1" fontWeight={700} mb={1}>
            Biomedical Testing Technologies
          </Typography>
          <Typography variant="body2" mb={3} color="text.secondary">
            At Zetta, we work closely with trusted partners to provide reliable
            medical diagnostic devices. Many of our sellers utilize advanced
            biomedical testing technologies, including electrical safety
            analyzers, patient simulators, and precision calibration equipment,
            ensuring the devices they offer are properly calibrated and tested.
          </Typography>

          <Typography variant="subtitle1" fontWeight={700} mb={1}>
            A Personalized and Trustworthy Buying Experience
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Zetta is more than just a marketplace for medical equipment. We are
            committed to providing a collaborative and human-centered buying
            experience. Our team works hand-in-hand with sellers to ensure clear
            communication, smooth transactions, and tailored support. This
            dedication to quality and human connection makes us the go-to
            platform for healthcare professionals seeking reliable and
            affordable medical diagnostic tools.
          </Typography>
        </Container>
      </Box>
    </>
  );
}

export default CategoryDetails;
