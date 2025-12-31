// User types
export interface User {
  id: string;
  email: string;
  role: 'buyer' | 'admin' | 'seller';
  profile?: UserProfile;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  company_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  created_at: string;
  updated_at: string;
}

// Product types
export interface Product {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category: string;
  condition: 'excellent' | 'good' | 'fair';
  price: number;
  zetta_price?: number;
  images: string[];
  status: 'available' | 'sold' | 'pending';
  warranty_duration?: number;
  created_at: string;
  updated_at: string;
}

// Order types
export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  items: OrderItem[];
  total_amount: number;
  commission_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  payment_method?: string;
  shipping_address: ShippingAddress;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product: Product;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface ShippingAddress {
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  country: string;
  postal_code: string;
  phone: string;
}

// Service Request types
export interface ServiceRequest {
  id: string;
  user_id: string;
  type: 'logistics' | 'maintenance';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  details: string;
  created_at: string;
  updated_at: string;
}

export interface LogisticsRequest extends ServiceRequest {
  type: 'logistics';
  service_type: 'delivery' | 'storage' | 'transport';
  pickup_address?: string;
  delivery_address?: string;
  preferred_date?: string;
}

export interface MaintenanceRequest extends ServiceRequest {
  type: 'maintenance';
  product_id?: string;
  issue_description: string;
  urgency: 'low' | 'medium' | 'high';
}

// Cart types
export interface CartItem {
  product: Product;
  quantity: number;
}

// Dashboard statistics
export interface DashboardStats {
  total_sales: number;
  total_orders: number;
  pending_orders: number;
  total_revenue: number;
  commission_earned: number;
}

// Payment types
export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
  payment_method: string;
  stripe_payment_intent_id?: string;
  created_at: string;
}