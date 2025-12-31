import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import Logistics from "./pages/Logistics";
import Maintenance from "./pages/Maintenance";
import Checkout from "./pages/Checkout";
import AdminDashboard from "./pages/admin/Dashboard";
import ProductManagement from "./pages/admin/ProductManagement";
import OrderManagement from "./pages/admin/OrderManagement";
import ProductForm from "./pages/admin/ProductForm";
import ServiceRequests from "./pages/admin/ServiceRequests";
import Reports from "./pages/admin/Reports";
import CRM from "./pages/admin/CRM";
import CatalogSync from "./pages/admin/CatalogSync";
import SupplierPayments from "./pages/admin/SupplierPayments";
import WarrantyManagement from "./pages/WarrantyManagement";
import EmailMarketing from "./pages/admin/EmailMarketing";
import UserManagement from "./pages/admin/UserManagement";

// Create Modern Futuristic Theme
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#00d4ff",
      light: "#5dffff",
      dark: "#00a1cc",
    },
    secondary: {
      main: "#ff0080",
      light: "#ff5cac",
      dark: "#c90058",
    },
    background: {
      default: "oklch(98.7% 0.026 102.212)",
      paper: "oklch(98.7% 0.026 102.212)",
    },
    text: {
      primary: "#333",
      secondary: "rgba(51, 51, 51, 0.7)",
    },
    success: {
      main: "#00ff88",
      light: "#5dffaa",
      dark: "#00cc55",
    },
    error: {
      main: "#ff3366",
      light: "#ff6699",
      dark: "#cc0033",
    },
    info: {
      main: "#00d4ff",
      light: "#66e0ff",
      dark: "#0099cc",
    },
    warning: {
      main: "#ffaa00",
      light: "#ffcc66",
      dark: "#cc8800",
    },
  },
  typography: {
    fontFamily:
      '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: "3.5rem",
      letterSpacing: "-0.02em",
      color: "#00a1cc",
    },
    h2: {
      fontWeight: 700,
      fontSize: "2.75rem",
      letterSpacing: "-0.01em",
    },
    h3: {
      fontWeight: 700,
      fontSize: "2.25rem",
      letterSpacing: "-0.01em",
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.75rem",
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.25rem",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1rem",
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 0,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "oklch(98.7% 0.026 102.212)",
          "&::-webkit-scrollbar": {
            width: "10px",
          },
          "&::-webkit-scrollbar-track": {
            background: "rgba(0, 0, 0, 0.05)",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(0, 212, 255, 0.3)",
            borderRadius: 0,
            "&:hover": {
              background: "rgba(0, 212, 255, 0.5)",
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 0,
          padding: "10px 24px",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative",
          overflow: "hidden",
        },
        contained: {
          boxShadow: "0 4px 20px rgba(0, 212, 255, 0.3)",
          "&:hover": {
            boxShadow: "0 6px 30px rgba(0, 212, 255, 0.4)",
            transform: "translateY(-2px)",
          },
        },
        outlined: {
          borderWidth: "2px",
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(0, 0, 0, 0.02)",
          "&:hover": {
            borderWidth: "2px",
            backgroundColor: "rgba(0, 0, 0, 0.05)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "oklch(98.7% 0.026 102.212)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(0, 0, 0, 0.1)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            border: "1px solid rgba(0, 212, 255, 0.2)",
            boxShadow: "0 8px 32px rgba(0, 212, 255, 0.1)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "oklch(98.7% 0.026 102.212)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-4px)",
            border: "1px solid rgba(0, 212, 255, 0.2)",
            boxShadow: "0 12px 40px rgba(0, 212, 255, 0.15)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 0,
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            backdropFilter: "blur(10px)",
            "& fieldset": {
              borderColor: "rgba(0, 0, 0, 0.1)",
              borderWidth: "2px",
            },
            "&:hover fieldset": {
              borderColor: "rgba(0, 212, 255, 0.3)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#00d4ff",
              borderWidth: "2px",
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(0, 212, 255, 0.08)",
          border: "1px solid rgba(0, 212, 255, 0.2)",
          fontWeight: 600,
          color: "#333",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "oklch(98.7% 0.026 102.212)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "oklch(98.7% 0.026 102.212)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(0, 0, 0, 0.1)",
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Main layout routes */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Navigate to="/products" replace />} />
                <Route path="products" element={<Products />} />
                <Route path="products/:id" element={<ProductDetail />} />
                <Route path="cart" element={<Cart />} />

                {/* Protected routes */}
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="orders"
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="logistics"
                  element={
                    <ProtectedRoute>
                      <Logistics />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="maintenance"
                  element={
                    <ProtectedRoute>
                      <Maintenance />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="warranties"
                  element={
                    <ProtectedRoute>
                      <WarrantyManagement />
                    </ProtectedRoute>
                  }
                />

                {/* Seller routes */}
                <Route path="admin/dashboard" element={<AdminDashboard />} />
                <Route
                  path="admin/products"
                  element={
                    <ProtectedRoute adminOnly>
                      <ProductManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/orders"
                  element={
                    <ProtectedRoute adminOnly>
                      <OrderManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/products/new"
                  element={
                    <ProtectedRoute adminOnly>
                      <ProductForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/products/:id/edit"
                  element={
                    <ProtectedRoute adminOnly>
                      <ProductForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/service-requests"
                  element={
                    <ProtectedRoute adminOnly>
                      <ServiceRequests />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/reports"
                  element={
                    <ProtectedRoute adminOnly>
                      <Reports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/crm"
                  element={
                    <ProtectedRoute adminOnly>
                      <CRM />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/catalog-sync"
                  element={
                    <ProtectedRoute adminOnly>
                      <CatalogSync />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/payments"
                  element={
                    <ProtectedRoute adminOnly>
                      <SupplierPayments />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/email-marketing"
                  element={
                    <ProtectedRoute adminOnly>
                      <EmailMarketing />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/users"
                  element={
                    <ProtectedRoute adminOnly>
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/products" replace />} />
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
