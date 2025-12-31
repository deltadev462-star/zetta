import React, { useState } from "react";
import {
  Outlet,
  useNavigate,
  Link as RouterLink,
  useLocation,
} from "react-router-dom";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Container,
  Button,
  Tooltip,
  Avatar,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  alpha,
  useTheme,
  Fade,
  Slide,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ShoppingCart,
  AccountCircle,
  Dashboard,
  Store,
  LocalShipping,
  Build,
  ExitToApp,
  Home,
  Person,
  Close,
  AutoAwesome,
  Search,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import LiveChat from "../components/LiveChat";
import Footer from "../components/Footer";
import { ScrollToTop } from "../components";

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user, signOut } = useAuth();
  const { getItemCount } = useCart();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Top bar search and filters state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [priceRange, setPriceRange] = useState("");

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  // Search and filter handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(e.target.value);
  const handleFilterChange = (
    key: "category" | "condition" | "priceRange",
    value: string
  ) => {
    if (key === "category") setCategory(value);
    if (key === "condition") setCondition(value);
    if (key === "priceRange") setPriceRange(value);
  };

  const navItems = [
    { path: "/", label: "Products", icon: <Store />, public: true },
    {
      path: "/logistics",
      label: "Logistics",
      icon: <LocalShipping />,
      public: false,
    },
    {
      path: "/maintenance",
      label: "Maintenance",
      icon: <Build />,
      public: false,
    },
  ];

  const categories = [
    "Imaging",
    "Surgical",
    "Monitoring",
    "Laboratory",
    "Dental",
  ];

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        background: "oklch(98.7% 0.026 102.212)",
      }}
    >
      <Box
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            background: "linear-gradient(135deg, #00d4ff 0%, #ff0080 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <AutoAwesome /> Zetta Med
        </Typography>
        <IconButton onClick={handleDrawerToggle} sx={{ color: "#333" }}>
          <Close />
        </IconButton>
      </Box>
      <Divider sx={{ borderColor: "rgba(0,0,0,0.1)" }} />
      <List sx={{ p: 2 }}>
        {navItems.map((item) => {
          if (!item.public && !user) return null;
          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                onClick={handleDrawerToggle}
                sx={{
                  borderRadius: 2,
                  transition: "all 0.3s",
                  position: "relative",
                  overflow: "hidden",
                  bgcolor: isActive ? "rgba(0,212,255,0.1)" : "transparent",
                  borderLeft: isActive
                    ? "4px solid #00d4ff"
                    : "4px solid transparent",
                  "&:hover": {
                    bgcolor: "rgba(0,212,255,0.15)",
                    "& .MuiListItemIcon-root": {
                      color: "#00d4ff",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? "#00d4ff" : "rgba(0,0,0,0.7)",
                    transition: "color 0.3s",
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? "#00d4ff" : "#333",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
        {user?.role === "admin" && (
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              component={RouterLink}
              to="/admin/dashboard"
              onClick={handleDrawerToggle}
              sx={{
                borderRadius: 2,
                transition: "all 0.3s",
                bgcolor: "rgba(255,0,128,0.1)",
                borderLeft: "4px solid #ff0080",
                "&:hover": {
                  bgcolor: "rgba(255,0,128,0.2)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "#ff0080", minWidth: 40 }}>
                <Dashboard />
              </ListItemIcon>
              <ListItemText
                primary="Admin Dashboard"
                sx={{
                  "& .MuiListItemText-primary": {
                    fontWeight: 600,
                    color: "#ff0080",
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        // bgcolor: "oklch(98.7% 0.026 102.212)",
      }}
    >
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer - 1,
          // background: "oklch(96.2% 0.059 95.617)",
           backgroundColor: 'oklch(96.5% 0.026 102.212)',
          borderBottom: "1px solid rgba(148, 145, 145, 0.47)",
          // boxShadow: "0 2px 4px rgba(243, 26, 26, 0.05)",
        }}
      >
        <Container maxWidth="xl">
          {/* Top line: Logo + search/filters + user actions */}
          <Toolbar
            disableGutters
            sx={{
              py: 1,
              alignItems: "center",
              gap: { xs: 1, sm: 2 },
              flexDirection: "row",
              minHeight: { xs: 56, sm: 64 },
            }}
          >
            {/* Logo - Always on left */}
            <Typography
              variant="h5"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                flexGrow: { xs: 1, sm: 0 },
                mr: { xs: "auto", sm: 2 },
                display: "flex",
                fontWeight: 800,
                color: "inherit",
                textDecoration: "none",
                alignItems: "center",
                gap: 1,
                transition: "all 0.3s",
                fontSize: { xs: "1.2rem", sm: "1.5rem" },
                "&:hover": {
                  textShadow: "0 0 20px rgba(0,212,255,0.8)",
                },
              }}
            >
              <AutoAwesome
                sx={{ fontSize: { xs: 20, sm: 28 }, color: "#00d4ff" }}
              />
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #00d4ff 0%, #ff0080 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Zetta Med
              </span>
            </Typography>

            {/* Search/Filters - Hidden on mobile */}
            <Box
              sx={{
                flexGrow: 1,
                minWidth: 0,
                display: { xs: "none", md: "block" },
              }}
            >
              <Box>
                <Stack direction="row" spacing={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search for equipment..."
                    value={search}
                    onChange={handleSearchChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ color: "#00d4ff" }} />
                        </InputAdornment>
                      ),
                      sx: {
                        "& input": {
                          color: "#333",
                          py: 1,
                        },
                      },
                    }}
                    sx={{ flex: 2 }}
                  />

                  <FormControl
                    size="small"
                    margin="dense"
                    sx={{ minWidth: 180 }}
                  >
                    <InputLabel sx={{ color: "rgba(0,0,0,0.7)" }}>
                      Category
                    </InputLabel>
                    <Select
                      value={category}
                      label="Category"
                      onChange={(e) =>
                        handleFilterChange("category", e.target.value as string)
                      }
                      sx={{ color: "#333" }}
                    >
                      <MenuItem value="">
                        <em>All Categories</em>
                      </MenuItem>
                      {categories.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          {cat}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl
                    size="small"
                    margin="dense"
                    sx={{ minWidth: 150 }}
                  >
                    <InputLabel sx={{ color: "rgba(0,0,0,0.7)" }}>
                      Condition
                    </InputLabel>
                    <Select
                      value={condition}
                      label="Condition"
                      onChange={(e) =>
                        handleFilterChange(
                          "condition",
                          e.target.value as string
                        )
                      }
                      sx={{ color: "#333" }}
                    >
                      <MenuItem value="">
                        <em>All Conditions</em>
                      </MenuItem>
                      <MenuItem value="excellent">Excellent</MenuItem>
                      <MenuItem value="good">Good</MenuItem>
                      <MenuItem value="fair">Fair</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl
                    size="small"
                    margin="dense"
                    sx={{ minWidth: 180 }}
                  >
                    <InputLabel sx={{ color: "rgba(0,0,0,0.7)" }}>
                      Price Range
                    </InputLabel>
                    <Select
                      value={priceRange}
                      label="Price Range"
                      onChange={(e) =>
                        handleFilterChange(
                          "priceRange",
                          e.target.value as string
                        )
                      }
                      sx={{ color: "#333" }}
                    >
                      <MenuItem value="">
                        <em>All Prices</em>
                      </MenuItem>
                      <MenuItem value="0-1000">€0 - €1,000</MenuItem>
                      <MenuItem value="1000-5000">€1,000 - €5,000</MenuItem>
                      <MenuItem value="5000-10000">€5,000 - €10,000</MenuItem>
                      <MenuItem value="10000-">€10,000+</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Box>
            </Box>

            {/* User Actions - Right side on all screens */}
            <Box
              sx={{
                flexGrow: 0,
                display: "flex",
                gap: { xs: 0.5, sm: 2 },
                alignItems: "center",
              }}
            >
              {user ? (
                <>
                  <Tooltip title="Account" arrow>
                    <IconButton
                      onClick={handleOpenUserMenu}
                      sx={{
                        p: 0,
                        border: "2px solid rgba(0,212,255,0.3)",
                        "&:hover": {
                          borderColor: "#00d4ff",
                          boxShadow: "0 0 20px rgba(0,212,255,0.5)",
                        },
                        width: { xs: 36, sm: 40 },
                        height: { xs: 36, sm: 40 },
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: "rgba(0,212,255,0.2)",
                          border: "1px solid rgba(0,212,255,0.3)",
                          width: { xs: 36, sm: 40 },
                          height: { xs: 36, sm: 40 },
                        }}
                      >
                        <AccountCircle
                          sx={{
                            color: "#00d4ff",
                            fontSize: { xs: 20, sm: 24 },
                          }}
                        />
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ mt: "45px" }}
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                    TransitionComponent={Fade}
                    PaperProps={{
                      sx: {
                        bgcolor: "oklch(98.7% 0.026 102.212)",
                        border: "1px solid rgba(0,0,0,0.1)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        mt: 1,
                        "& .MuiMenuItem-root": {
                          transition: "all 0.3s",
                          "&:hover": {
                            bgcolor: "rgba(0,212,255,0.1)",
                            pl: 3,
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem
                      component={RouterLink}
                      to="/profile"
                      onClick={handleCloseUserMenu}
                    >
                      <Person sx={{ mr: 2, color: "#00d4ff" }} />
                      <Typography>Profile</Typography>
                    </MenuItem>
                    <MenuItem
                      component={RouterLink}
                      to="/orders"
                      onClick={handleCloseUserMenu}
                    >
                      <Store sx={{ mr: 2, color: "#00d4ff" }} />
                      <Typography>My Orders</Typography>
                    </MenuItem>
                    <Divider sx={{ my: 1, borderColor: "rgba(0,0,0,0.1)" }} />
                    <MenuItem onClick={handleSignOut}>
                      <ExitToApp sx={{ mr: 2, color: "#ff0080" }} />
                      <Typography color="#ff0080">Sign Out</Typography>
                    </MenuItem>
                  </Menu>
                  <Tooltip title="Shopping Cart" arrow>
                    <IconButton
                      component={RouterLink}
                      to="/cart"
                      sx={{
                        position: "relative",
                        color: "#333",
                        "&:hover": {
                          bgcolor: "rgba(0,212,255,0.1)",
                        },
                        width: { xs: 36, sm: 40 },
                        height: { xs: 36, sm: 40 },
                      }}
                    >
                      <Badge
                        badgeContent={getItemCount()}
                        sx={{
                          "& .MuiBadge-badge": {
                            bgcolor: "#ff0080",
                            color: "white",
                            fontWeight: 600,
                            boxShadow: "0 0 10px rgba(255,0,128,0.8)",
                          },
                        }}
                      >
                        <ShoppingCart />
                      </Badge>
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="outlined"
                    size={theme.breakpoints.down("sm") ? "small" : "medium"}
                    sx={{
                      borderColor: "rgba(0,212,255,0.5)",
                      color: "#00d4ff",
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      px: { xs: 1.5, sm: 2 },
                      "&:hover": {
                        borderColor: "#00d4ff",
                        bgcolor: "rgba(0,212,255,0.1)",
                      },
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    size={theme.breakpoints.down("sm") ? "small" : "medium"}
                    sx={{
                      background:
                        "linear-gradient(135deg, #00d4ff 0%, #ff0080 100%)",
                      boxShadow: "0 4px 20px rgba(0,212,255,0.4)",
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      px: { xs: 1.5, sm: 2 },
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #00a1cc 0%, #cc0066 100%)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 6px 30px rgba(0,212,255,0.5)",
                      },
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              )}

              {/* Mobile Menu Button - Only on mobile */}
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
                sx={{
                  display: { xs: "flex", md: "none" },
                  ml: 0.5,
                  "&:hover": {
                    bgcolor: "rgba(0,212,255,0.1)",
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>

          {/* Middle line: Navigation */}
          <Toolbar
            disableGutters
            sx={{
              display: { xs: "none", md: "flex" },
              minHeight: 56,
              gap: 1,
              justifyContent: "center",
              borderTop: "1px solid rgba(129, 128, 128, 0.1)",
              borderBottom: "1px solid rgba(156, 151, 151, 0.1)",
            }}
          >
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                gap: 1,
                mx: "auto",
                textAlign: "center",
              }}
            >
              {navItems.map((item) => {
                if (!item.public && !user) return null;
                const isActive = location.pathname === item.path;

                return (
                  <Button
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    startIcon={item.icon}
                    sx={{
                      color: isActive ? "#00d4ff" : "rgba(0,0,0,0.8)",
                      position: "relative",
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      transition: "all 0.3s",
                      fontWeight: isActive ? 600 : 400,
                      "&:after": {
                        content: '""',
                        position: "absolute",
                        bottom: 0,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: isActive ? "80%" : "0%",
                        height: "3px",
                        bgcolor: "#00d4ff",
                        transition: "width 0.3s",
                        borderRadius: "3px 3px 0 0",
                        boxShadow: isActive
                          ? "0 0 10px rgba(0,212,255,0.8)"
                          : "none",
                      },
                      "&:hover": {
                        bgcolor: "rgba(0,212,255,0.1)",
                        color: "#00d4ff",
                        "&:after": {
                          width: "80%",
                        },
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
              {user?.role === "admin" && (
                <Button
                  component={RouterLink}
                  to="/admin/dashboard"
                  startIcon={<Dashboard />}
                  sx={{
                    color: "#ff0080",
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    border: "1px solid rgba(255,0,128,0.3)",
                    bgcolor: "rgba(255,0,128,0.1)",
                    transition: "all 0.3s",
                    fontWeight: 600,
                    "&:hover": {
                      bgcolor: "rgba(255,0,128,0.2)",
                      borderColor: "#ff0080",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 20px rgba(255,0,128,0.4)",
                    },
                  }}
                >
                  Admin
                </Button>
              )}
            </Box>
          </Toolbar>

          {/* Mobile Search Bar */}
          <Box
            sx={{
              display: { xs: "block", md: "none" },
              px: 2,
              py: 1,
              borderBottom: "1px solid rgba(0,0,0,0.1)",
            }}
          >
            <Stack spacing={1}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search for equipment..."
                value={search}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "#00d4ff" }} />
                    </InputAdornment>
                  ),
                  sx: {
                    "& input": {
                      color: "#333",
                      py: 0.5,
                      fontSize: "0.875rem",
                    },
                  },
                }}
              />
              <Stack direction="row" spacing={1}>
                <FormControl size="small" sx={{ flex: 1 }}>
                  <Select
                    value={category}
                    displayEmpty
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value as string)
                    }
                    sx={{
                      color: "#333",
                      fontSize: "0.75rem",
                      "& .MuiSelect-select": { py: 0.5 },
                    }}
                  >
                    <MenuItem value="">
                      <em>Category</em>
                    </MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ flex: 1 }}>
                  <Select
                    value={condition}
                    displayEmpty
                    onChange={(e) =>
                      handleFilterChange("condition", e.target.value as string)
                    }
                    sx={{
                      color: "#333",
                      fontSize: "0.75rem",
                      "& .MuiSelect-select": { py: 0.5 },
                    }}
                  >
                    <MenuItem value="">
                      <em>Condition</em>
                    </MenuItem>
                    <MenuItem value="excellent">Excellent</MenuItem>
                    <MenuItem value="good">Good</MenuItem>
                    <MenuItem value="fair">Fair</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ flex: 1 }}>
                  <Select
                    value={priceRange}
                    displayEmpty
                    onChange={(e) =>
                      handleFilterChange("priceRange", e.target.value as string)
                    }
                    sx={{
                      color: "#333",
                      fontSize: "0.75rem",
                      "& .MuiSelect-select": { py: 0.5 },
                    }}
                  >
                    <MenuItem value="">
                      <em>Price</em>
                    </MenuItem>
                    <MenuItem value="0-1000">€0-1K</MenuItem>
                    <MenuItem value="1000-5000">€1K-5K</MenuItem>
                    <MenuItem value="5000-10000">€5K-10K</MenuItem>
                    <MenuItem value="10000-">€10K+</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Stack>
          </Box>

          {/* Bottom line: Categories */}
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                py: 1,
                px: { xs: 1.5, sm: 2 },
                overflowX: "auto",
                justifyContent: { xs: "flex-start", md: "center" },
                "&::-webkit-scrollbar": {
                  height: 3,
                  display: { xs: "block", md: "none" },
                },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "rgba(255,255,255,0.2)",
                  borderRadius: 3,
                },
                "&::-webkit-scrollbar-track": {
                  bgcolor: "rgba(255,255,255,0.05)",
                },
              }}
            >
              <Button
                size="small"
                onClick={() => {
                  handleFilterChange("category", "");
                  if (location.pathname !== "/") navigate("/");
                }}
                sx={{
                  color: category === "" ? "#00d4ff" : "rgba(0,0,0,0.8)",
                  px: { xs: 1.5, sm: 2 },
                  py: { xs: 0.25, sm: 0.5 },
                  minHeight: { xs: 28, sm: 32 },
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  borderRadius: 999,
                  border:
                    category === ""
                      ? "1px solid rgba(0,212,255,0.5)"
                      : "1px solid transparent",
                  bgcolor:
                    category === "" ? "rgba(0,212,255,0.12)" : "transparent",
                  "&:hover": {
                    bgcolor: "rgba(0,212,255,0.15)",
                    color: "#00d4ff",
                  },
                  whiteSpace: "nowrap",
                }}
              >
                All
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  size="small"
                  onClick={() => {
                    handleFilterChange("category", cat);
                    if (location.pathname !== "/") navigate("/");
                  }}
                  sx={{
                    color: category === cat ? "#00d4ff" : "rgba(0,0,0,0.8)",
                    px: { xs: 1.5, sm: 2 },
                    py: { xs: 0.25, sm: 0.5 },
                    minHeight: { xs: 28, sm: 32 },
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    borderRadius: 999,
                    border:
                      category === cat
                        ? "1px solid rgba(0,212,255,0.5)"
                        : "1px solid transparent",
                    bgcolor:
                      category === cat ? "rgba(0,212,255,0.12)" : "transparent",
                    "&:hover": {
                      bgcolor: "rgba(0,212,255,0.15)",
                      color: "#00d4ff",
                    },
                    whiteSpace: "nowrap",
                  }}
                >
                  {cat}
                </Button>
              ))}
            </Box>
          </Box>
        </Container>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
          sx: {
            zIndex: (theme) => theme.zIndex.drawer + 10,
          },
        }}
        sx={{
          display: { xs: "block", md: "none" },
          zIndex: (theme) => theme.zIndex.drawer + 10,
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 280,
            border: "none",
            boxShadow: "0 0 40px rgba(0,0,0,0.8)",
            zIndex: (theme) => theme.zIndex.drawer + 10,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            pt: { xs: 20, sm: 22, md: 24 },
            px: { xs: 2, sm: 3, md: 4 },
            pb: 4,
          }}
        >
          <Fade in timeout={600}>
            <Box>
              <Outlet />
            </Box>
          </Fade>
        </Box>

        {/* Footer */}
        <Footer />
      </Box>

      {/* Live Chat */}
      {user && <LiveChat />}

      {/* Scroll to Top Button */}
      <ScrollToTop />

      {/* Backdrop for mobile drawer */}
      {mobileOpen && (
        <Box
          onClick={handleDrawerToggle}
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.5)",
            zIndex: (theme) => theme.zIndex.drawer + 9,
            display: { xs: "block", md: "none" },
          }}
        />
      )}
    </Box>
  );
};

export default MainLayout;
