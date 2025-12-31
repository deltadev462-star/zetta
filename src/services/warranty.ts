import { supabase } from './supabase';
import { Product } from '../types';

export interface Warranty {
  id: string;
  product_id: string;
  order_id: string;
  buyer_id: string;
  warranty_type: 'standard' | 'extended';
  duration_months: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'claimed' | 'void';
  price?: number;
  created_at: string;
  updated_at: string;
}

export interface WarrantyExtension {
  id: string;
  warranty_id: string;
  duration_months: number;
  price: number;
  payment_status: 'pending' | 'paid' | 'failed';
  payment_reference?: string;
  extended_from: string;
  extended_to: string;
  created_at: string;
}

export interface WarrantyClaim {
  id: string;
  warranty_id: string;
  claim_number: string;
  issue_description: string;
  status: 'pending' | 'approved' | 'rejected' | 'resolved';
  resolution?: string;
  claimed_at: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export const warrantyService = {
  // Warranty extension pricing (per month)
  EXTENSION_PRICE_PER_MONTH: 19.99,
  
  // Standard warranty durations by product condition
  STANDARD_WARRANTY_DURATION: {
    excellent: 24, // 24 months for excellent condition
    good: 12,      // 12 months for good condition
    fair: 6,       // 6 months for fair condition
  },

  // Create warranty for a purchased product
  async createWarranty(
    orderId: string,
    productId: string,
    buyerId: string,
    condition: Product['condition']
  ): Promise<{ data: Warranty | null; error: any }> {
    try {
      const startDate = new Date();
      const durationMonths = this.STANDARD_WARRANTY_DURATION[condition];
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + durationMonths);

      const { data, error } = await supabase
        .from('warranties')
        .insert({
          product_id: productId,
          order_id: orderId,
          buyer_id: buyerId,
          warranty_type: 'standard',
          duration_months: durationMonths,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: 'active',
          price: 0, // Standard warranty is free
        })
        .select()
        .single();

      return { data: data as Warranty | null, error };
    } catch (error) {
      console.error('Error creating warranty:', error);
      return { data: null, error };
    }
  },

  // Get warranty by ID
  async getWarrantyById(warrantyId: string): Promise<{ data: Warranty | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('warranties')
        .select('*')
        .eq('id', warrantyId)
        .single();

      return { data: data as Warranty | null, error };
    } catch (error) {
      console.error('Error fetching warranty:', error);
      return { data: null, error };
    }
  },

  // Get warranties for a buyer
  async getBuyerWarranties(
    buyerId: string,
    status?: Warranty['status']
  ): Promise<{ data: Warranty[] | null; error: any }> {
    try {
      let query = supabase
        .from('warranties')
        .select(`
          *,
          product:products (*),
          order:orders (*)
        `)
        .eq('buyer_id', buyerId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      return { data: data as any[] | null, error };
    } catch (error) {
      console.error('Error fetching warranties:', error);
      return { data: null, error };
    }
  },

  // Check warranty status and update if expired
  async checkWarrantyStatus(warrantyId: string): Promise<{ isActive: boolean; warranty: Warranty | null }> {
    try {
      const { data: warranty, error } = await this.getWarrantyById(warrantyId);
      
      if (error || !warranty) {
        return { isActive: false, warranty: null };
      }

      const now = new Date();
      const endDate = new Date(warranty.end_date);
      
      // Update status if warranty has expired
      if (now > endDate && warranty.status === 'active') {
        await supabase
          .from('warranties')
          .update({ status: 'expired' })
          .eq('id', warrantyId);
        
        warranty.status = 'expired';
      }

      return { 
        isActive: warranty.status === 'active' && now <= endDate,
        warranty 
      };
    } catch (error) {
      console.error('Error checking warranty status:', error);
      return { isActive: false, warranty: null };
    }
  },

  // Purchase warranty extension
  async purchaseWarrantyExtension(
    warrantyId: string,
    extensionMonths: number
  ): Promise<{ data: WarrantyExtension | null; error: any }> {
    try {
      const { warranty } = await this.checkWarrantyStatus(warrantyId);
      
      if (!warranty) {
        throw new Error('Warranty not found');
      }

      if (warranty.status !== 'active') {
        throw new Error('Can only extend active warranties');
      }

      const extensionPrice = extensionMonths * this.EXTENSION_PRICE_PER_MONTH;
      const currentEndDate = new Date(warranty.end_date);
      const newEndDate = new Date(currentEndDate);
      newEndDate.setMonth(newEndDate.getMonth() + extensionMonths);

      // Create extension record
      const { data: extension, error } = await supabase
        .from('warranty_extensions')
        .insert({
          warranty_id: warrantyId,
          duration_months: extensionMonths,
          price: extensionPrice,
          payment_status: 'pending',
          extended_from: currentEndDate.toISOString(),
          extended_to: newEndDate.toISOString(),
        })
        .select()
        .single();

      return { data: extension as WarrantyExtension | null, error };
    } catch (error: any) {
      console.error('Error purchasing warranty extension:', error);
      return { data: null, error };
    }
  },

  // Confirm warranty extension payment
  async confirmExtensionPayment(
    extensionId: string,
    paymentReference: string
  ): Promise<{ error: any }> {
    try {
      // Get extension details
      const { data: extension, error: fetchError } = await supabase
        .from('warranty_extensions')
        .select('*')
        .eq('id', extensionId)
        .single();

      if (fetchError || !extension) {
        throw new Error('Extension not found');
      }

      // Update extension payment status
      const { error: updateError } = await supabase
        .from('warranty_extensions')
        .update({
          payment_status: 'paid',
          payment_reference: paymentReference,
        })
        .eq('id', extensionId);

      if (updateError) throw updateError;

      // Get current warranty to update duration
      const { data: currentWarranty } = await supabase
        .from('warranties')
        .select('duration_months')
        .eq('id', extension.warranty_id)
        .single();

      // Update warranty end date and type
      const { error: warrantyError } = await supabase
        .from('warranties')
        .update({
          end_date: extension.extended_to,
          warranty_type: 'extended',
          duration_months: (currentWarranty?.duration_months || 0) + extension.duration_months,
        })
        .eq('id', extension.warranty_id);

      if (warrantyError) throw warrantyError;

      return { error: null };
    } catch (error) {
      console.error('Error confirming extension payment:', error);
      return { error };
    }
  },

  // File warranty claim
  async fileWarrantyClaim(
    warrantyId: string,
    issueDescription: string
  ): Promise<{ data: WarrantyClaim | null; error: any }> {
    try {
      const { isActive, warranty } = await this.checkWarrantyStatus(warrantyId);
      
      if (!isActive) {
        throw new Error('Warranty is not active');
      }

      // Generate claim number
      const claimNumber = `CLM-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      const { data: claim, error } = await supabase
        .from('warranty_claims')
        .insert({
          warranty_id: warrantyId,
          claim_number: claimNumber,
          issue_description: issueDescription,
          status: 'pending',
          claimed_at: new Date().toISOString(),
        })
        .select()
        .single();

      return { data: claim as WarrantyClaim | null, error };
    } catch (error: any) {
      console.error('Error filing warranty claim:', error);
      return { data: null, error };
    }
  },

  // Update warranty claim status
  async updateClaimStatus(
    claimId: string,
    status: WarrantyClaim['status'],
    resolution?: string
  ): Promise<{ error: any }> {
    try {
      const updates: any = { status };
      
      if (resolution) {
        updates.resolution = resolution;
      }
      
      if (status === 'resolved') {
        updates.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('warranty_claims')
        .update(updates)
        .eq('id', claimId);

      return { error };
    } catch (error) {
      console.error('Error updating claim status:', error);
      return { error };
    }
  },

  // Get warranty claims
  async getWarrantyClaims(
    warrantyId?: string,
    status?: WarrantyClaim['status']
  ): Promise<{ data: WarrantyClaim[] | null; error: any }> {
    try {
      let query = supabase
        .from('warranty_claims')
        .select(`
          *,
          warranty:warranties (
            *,
            product:products (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (warrantyId) {
        query = query.eq('warranty_id', warrantyId);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      return { data: data as any[] | null, error };
    } catch (error) {
      console.error('Error fetching warranty claims:', error);
      return { data: null, error };
    }
  },

  // Get warranty extensions
  async getWarrantyExtensions(warrantyId: string): Promise<{ data: WarrantyExtension[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('warranty_extensions')
        .select('*')
        .eq('warranty_id', warrantyId)
        .order('created_at', { ascending: false });

      return { data: data as WarrantyExtension[] | null, error };
    } catch (error) {
      console.error('Error fetching warranty extensions:', error);
      return { data: null, error };
    }
  },

  // Calculate extension price
  calculateExtensionPrice(months: number): number {
    return months * this.EXTENSION_PRICE_PER_MONTH;
  },

  // Get warranty statistics
  async getWarrantyStats(sellerId?: string): Promise<{
    totalWarranties: number;
    activeWarranties: number;
    totalClaims: number;
    pendingClaims: number;
    extensionRevenue: number;
  }> {
    try {
      let warrantyQuery = supabase
        .from('warranties')
        .select('id, status', { count: 'exact' });

      let claimQuery = supabase
        .from('warranty_claims')
        .select('id, status', { count: 'exact' });

      let extensionQuery = supabase
        .from('warranty_extensions')
        .select('price')
        .eq('payment_status', 'paid');

      if (sellerId) {
        // First get product IDs for this seller
        const { data: products } = await supabase
          .from('products')
          .select('id')
          .eq('seller_id', sellerId);
        
        const productIds = products?.map(p => p.id) || [];
        
        // Filter by seller's products
        warrantyQuery = warrantyQuery.in('product_id', productIds);
      }

      const [warranties, claims, extensions] = await Promise.all([
        warrantyQuery,
        claimQuery,
        extensionQuery,
      ]);

      const activeWarranties = warranties.data?.filter(w => w.status === 'active').length || 0;
      const pendingClaims = claims.data?.filter(c => c.status === 'pending').length || 0;
      const extensionRevenue = extensions.data?.reduce((sum, ext) => sum + ext.price, 0) || 0;

      return {
        totalWarranties: warranties.count || 0,
        activeWarranties,
        totalClaims: claims.count || 0,
        pendingClaims,
        extensionRevenue,
      };
    } catch (error) {
      console.error('Error getting warranty stats:', error);
      return {
        totalWarranties: 0,
        activeWarranties: 0,
        totalClaims: 0,
        pendingClaims: 0,
        extensionRevenue: 0,
      };
    }
  },
};