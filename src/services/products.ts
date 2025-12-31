import { supabase } from './supabase';
import { Product } from '../types';

export const productService = {
  // Get all products with optional filters
  async getProducts(filters?: {
    category?: string;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    status?: string;
  }) {
    let query = supabase
      .from('products')
      .select('*')
      .eq('status', filters?.status || 'available')
      .order('created_at', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.condition) {
      query = query.eq('condition', filters.condition);
    }

    if (filters?.minPrice) {
      query = query.gte('zetta_price', filters.minPrice);
    }

    if (filters?.maxPrice) {
      query = query.lte('zetta_price', filters.maxPrice);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    return { data: data as Product[] | null, error };
  },

  // Get single product by ID
  async getProductById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    return { data: data as Product | null, error };
  },

  // Get products by seller ID (for admin dashboard)
  async getProductsBySeller(sellerId: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    return { data: data as Product[] | null, error };
  },

  // Create new product (admin only)
  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    return { data: data as Product | null, error };
  },

  // Update product (admin only)
  async updateProduct(id: string, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data: data as Product | null, error };
  },

  // Delete product (admin only)
  async deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    return { error };
  },

  // Get product categories
  async getCategories() {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .eq('status', 'available');

    if (error) return { data: null, error };

    // Extract unique categories
    const categories = Array.from(new Set(data?.map(item => item.category) || []));
    return { data: categories, error: null };
  },
};