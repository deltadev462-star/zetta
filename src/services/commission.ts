import { supabase } from './supabase';
import { Order } from '../types';

export interface Commission {
  id: string;
  order_id: string;
  seller_id: string;
  order_amount: number;
  commission_rate: number;
  commission_amount: number;
  seller_payout: number;
  status: 'pending' | 'calculated' | 'paid' | 'failed';
  calculated_at?: string;
  paid_at?: string;
  payment_reference?: string;
  created_at: string;
  updated_at: string;
}

export interface SupplierPayment {
  id: string;
  seller_id: string;
  payment_period_start: string;
  payment_period_end: string;
  total_sales: number;
  total_commission: number;
  payout_amount: number;
  order_count: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  payment_method?: string;
  payment_reference?: string;
  paid_at?: string;
  created_at: string;
}

export const commissionService = {
  // Default commission rate (15% as per requirements)
  DEFAULT_COMMISSION_RATE: 0.15,

  // Calculate commission for an order
  calculateCommission(orderAmount: number, commissionRate?: number): {
    commissionAmount: number;
    sellerPayout: number;
  } {
    const rate = commissionRate || this.DEFAULT_COMMISSION_RATE;
    const commissionAmount = Number((orderAmount * rate).toFixed(2));
    const sellerPayout = Number((orderAmount - commissionAmount).toFixed(2));

    return {
      commissionAmount,
      sellerPayout,
    };
  },

  // Create commission record for an order
  async createCommissionRecord(order: Order): Promise<{ data: Commission | null; error: any }> {
    try {
      const { commissionAmount, sellerPayout } = this.calculateCommission(order.total_amount);

      const { data, error } = await supabase
        .from('commissions')
        .insert({
          order_id: order.id,
          seller_id: order.seller_id,
          order_amount: order.total_amount,
          commission_rate: this.DEFAULT_COMMISSION_RATE,
          commission_amount: commissionAmount,
          seller_payout: sellerPayout,
          status: 'calculated',
          calculated_at: new Date().toISOString(),
        })
        .select()
        .single();

      // Update order with commission amount
      if (data && !error) {
        await supabase
          .from('orders')
          .update({ commission_amount: commissionAmount })
          .eq('id', order.id);
      }

      return { data: data as Commission | null, error };
    } catch (error) {
      console.error('Error creating commission record:', error);
      return { data: null, error };
    }
  },

  // Get commission details for an order
  async getOrderCommission(orderId: string): Promise<{ data: Commission | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('commissions')
        .select('*')
        .eq('order_id', orderId)
        .single();

      return { data: data as Commission | null, error };
    } catch (error) {
      console.error('Error fetching order commission:', error);
      return { data: null, error };
    }
  },

  // Get all commissions for a seller
  async getSellerCommissions(
    sellerId: string,
    filters?: {
      status?: Commission['status'];
      startDate?: string;
      endDate?: string;
    }
  ): Promise<{ data: Commission[] | null; error: any }> {
    try {
      let query = supabase
        .from('commissions')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error } = await query;
      return { data: data as Commission[] | null, error };
    } catch (error) {
      console.error('Error fetching seller commissions:', error);
      return { data: null, error };
    }
  },

  // Calculate seller payout for a period
  async calculateSellerPayout(
    sellerId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    totalSales: number;
    totalCommission: number;
    payoutAmount: number;
    orderCount: number;
    commissions: Commission[];
  }> {
    const { data: commissions } = await this.getSellerCommissions(sellerId, {
      status: 'calculated',
      startDate,
      endDate,
    });

    if (!commissions || commissions.length === 0) {
      return {
        totalSales: 0,
        totalCommission: 0,
        payoutAmount: 0,
        orderCount: 0,
        commissions: [],
      };
    }

    const totalSales = commissions.reduce((sum, c) => sum + c.order_amount, 0);
    const totalCommission = commissions.reduce((sum, c) => sum + c.commission_amount, 0);
    const payoutAmount = commissions.reduce((sum, c) => sum + c.seller_payout, 0);

    return {
      totalSales: Number(totalSales.toFixed(2)),
      totalCommission: Number(totalCommission.toFixed(2)),
      payoutAmount: Number(payoutAmount.toFixed(2)),
      orderCount: commissions.length,
      commissions,
    };
  },

  // Create supplier payment record
  async createSupplierPayment(
    sellerId: string,
    periodStart: string,
    periodEnd: string
  ): Promise<{ data: SupplierPayment | null; error: any }> {
    try {
      const payoutData = await this.calculateSellerPayout(sellerId, periodStart, periodEnd);

      if (payoutData.orderCount === 0) {
        return { 
          data: null, 
          error: new Error('No orders found for the specified period') 
        };
      }

      const { data, error } = await supabase
        .from('supplier_payments')
        .insert({
          seller_id: sellerId,
          payment_period_start: periodStart,
          payment_period_end: periodEnd,
          total_sales: payoutData.totalSales,
          total_commission: payoutData.totalCommission,
          payout_amount: payoutData.payoutAmount,
          order_count: payoutData.orderCount,
          status: 'pending',
        })
        .select()
        .single();

      return { data: data as SupplierPayment | null, error };
    } catch (error) {
      console.error('Error creating supplier payment:', error);
      return { data: null, error };
    }
  },

  // Process supplier payment
  async processSupplierPayment(
    paymentId: string,
    paymentMethod: string,
    paymentReference: string
  ): Promise<{ error: any }> {
    try {
      const { data: payment, error: fetchError } = await supabase
        .from('supplier_payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (fetchError || !payment) {
        throw new Error('Payment record not found');
      }

      // Update payment status
      const { error: updateError } = await supabase
        .from('supplier_payments')
        .update({
          status: 'completed',
          payment_method: paymentMethod,
          payment_reference: paymentReference,
          paid_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (updateError) throw updateError;

      // Mark related commissions as paid
      const { data: commissions } = await this.getSellerCommissions(
        payment.seller_id,
        {
          status: 'calculated',
          startDate: payment.payment_period_start,
          endDate: payment.payment_period_end,
        }
      );

      if (commissions && commissions.length > 0) {
        const commissionIds = commissions.map(c => c.id);
        await supabase
          .from('commissions')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            payment_reference: paymentReference,
          })
          .in('id', commissionIds);
      }

      return { error: null };
    } catch (error) {
      console.error('Error processing supplier payment:', error);
      return { error };
    }
  },

  // Get supplier payment history
  async getSupplierPayments(
    sellerId: string,
    filters?: {
      status?: SupplierPayment['status'];
      startDate?: string;
      endDate?: string;
    }
  ): Promise<{ data: SupplierPayment[] | null; error: any }> {
    try {
      let query = supabase
        .from('supplier_payments')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error } = await query;
      return { data: data as SupplierPayment[] | null, error };
    } catch (error) {
      console.error('Error fetching supplier payments:', error);
      return { data: null, error };
    }
  },

  // Get commission summary for admin dashboard
  async getCommissionSummary(filters?: {
    sellerId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalSales: number;
    totalCommission: number;
    averageCommissionRate: number;
    orderCount: number;
    pendingPayouts: number;
  }> {
    try {
      let query = supabase
        .from('commissions')
        .select('*');

      if (filters?.sellerId) {
        query = query.eq('seller_id', filters.sellerId);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data: commissions } = await query;

      if (!commissions || commissions.length === 0) {
        return {
          totalSales: 0,
          totalCommission: 0,
          averageCommissionRate: this.DEFAULT_COMMISSION_RATE,
          orderCount: 0,
          pendingPayouts: 0,
        };
      }

      const totalSales = commissions.reduce((sum, c) => sum + c.order_amount, 0);
      const totalCommission = commissions.reduce((sum, c) => sum + c.commission_amount, 0);
      const pendingPayouts = commissions
        .filter(c => c.status === 'calculated')
        .reduce((sum, c) => sum + c.seller_payout, 0);

      return {
        totalSales: Number(totalSales.toFixed(2)),
        totalCommission: Number(totalCommission.toFixed(2)),
        averageCommissionRate: this.DEFAULT_COMMISSION_RATE,
        orderCount: commissions.length,
        pendingPayouts: Number(pendingPayouts.toFixed(2)),
      };
    } catch (error) {
      console.error('Error getting commission summary:', error);
      return {
        totalSales: 0,
        totalCommission: 0,
        averageCommissionRate: this.DEFAULT_COMMISSION_RATE,
        orderCount: 0,
        pendingPayouts: 0,
      };
    }
  },

  // Bulk process payments for multiple sellers
  async bulkProcessPayments(
    periodStart: string,
    periodEnd: string
  ): Promise<{
    processed: number;
    failed: number;
    errors: Array<{ sellerId: string; error: string }>;
  }> {
    try {
      // Get all sellers with orders in the period
      const { data: orders } = await supabase
        .from('orders')
        .select('seller_id')
        .gte('created_at', periodStart)
        .lte('created_at', periodEnd)
        .eq('payment_status', 'paid');

      if (!orders || orders.length === 0) {
        return { processed: 0, failed: 0, errors: [] };
      }

      // Get unique seller IDs
      const sellerIds = Array.from(new Set(orders.map(o => o.seller_id)));
      
      let processed = 0;
      let failed = 0;
      const errors: Array<{ sellerId: string; error: string }> = [];

      // Process payment for each seller
      for (const sellerId of sellerIds) {
        const { error } = await this.createSupplierPayment(
          sellerId,
          periodStart,
          periodEnd
        );

        if (error) {
          failed++;
          errors.push({ sellerId, error: error.message });
        } else {
          processed++;
        }
      }

      return { processed, failed, errors };
    } catch (error) {
      console.error('Error in bulk payment processing:', error);
      return { 
        processed: 0, 
        failed: 0, 
        errors: [{ sellerId: 'system', error: String(error) }] 
      };
    }
  },
};