import { supabase } from './supabase';
import { loadStripe } from '@stripe/stripe-js';
import { invoiceService } from './invoice';
import { commissionService } from './commission';

// Initialize Stripe (you'll need to add your publishable key to .env)
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '');

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
}

export interface CheckoutSession {
  id: string;
  payment_intent: string;
  amount_total: number;
  currency: string;
  status: string;
  success_url: string;
  cancel_url: string;
}

export const paymentService = {
  // Create a payment intent for direct payment
  async createPaymentIntent(orderId: string, amount: number, currency: string = 'EUR') {
    try {
      // In a real app, this would call your backend API that uses Stripe's secret key
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          orderId,
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency.toLowerCase(),
        },
      });

      if (error) throw error;
      return { data: data as PaymentIntent, error: null };
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      return { data: null, error };
    }
  },

  // Create a checkout session for redirecting to Stripe Checkout
  async createCheckoutSession(orderId: string, items: any[], successUrl: string, cancelUrl: string) {
    try {
      // In a real app, this would call your backend API
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          orderId,
          items,
          successUrl,
          cancelUrl,
        },
      });

      if (error) throw error;
      return { data: data as CheckoutSession, error: null };
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      return { data: null, error };
    }
  },

  // Confirm payment (update order status)
  async confirmPayment(orderId: string, paymentIntentId: string) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          order_id: orderId,
          stripe_payment_intent_id: paymentIntentId,
          status: 'succeeded',
        });

      if (error) throw error;

      // Update order payment status and get the updated order
      const { data: updatedOrder, error: orderError } = await supabase
        .from('orders')
        .update({ payment_status: 'paid' })
        .eq('id', orderId)
        .select()
        .single();

      if (orderError) throw orderError;

      // Automatically generate invoice
      if (updatedOrder) {
        try {
          const { data: invoice, error: invoiceError } = await invoiceService.createInvoice(orderId);
          if (invoiceError) {
            console.error('Error creating invoice:', invoiceError);
          } else {
            console.log('Invoice generated automatically:', invoice?.invoice_number);
          }
        } catch (error) {
          console.error('Failed to generate invoice:', error);
        }

        // Automatically calculate commission
        try {
          const { data: commission, error: commissionError } = await commissionService.createCommissionRecord(updatedOrder);
          if (commissionError) {
            console.error('Error creating commission record:', commissionError);
          } else {
            console.log('Commission calculated automatically:', commission);
          }
        } catch (error) {
          console.error('Failed to calculate commission:', error);
        }
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      return { data: null, error };
    }
  },

  // Get payment history for an order
  async getOrderPayments(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      return { data: null, error };
    }
  },

  // Process seller payout (after deducting commission)
  async processSellerPayout(orderId: string, sellerId: string, amount: number, commission: number) {
    try {
      const payoutAmount = amount - commission;
      
      // In a real app, this would call your backend API to process the payout via Stripe Connect
      const { data, error } = await supabase.functions.invoke('process-seller-payout', {
        body: {
          orderId,
          sellerId,
          amount: Math.round(payoutAmount * 100), // Convert to cents
          commission: Math.round(commission * 100),
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Error processing payout:', error);
      return { data: null, error };
    }
  },

  // Get Stripe instance
  async getStripe() {
    return await stripePromise;
  },

  // Redirect to Stripe Checkout
  async redirectToCheckout(sessionId: string) {
    const stripe = await this.getStripe();
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) {
      throw error;
    }
  },

  // Calculate commission for an order
  calculateCommission(amount: number, commissionRate: number = 0.15) {
    return Math.round(amount * commissionRate * 100) / 100;
  },

  // Format price for display
  formatPrice(amount: number, currency: string = 'EUR') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  },
};

// Mock payment functions for development/testing
export const mockPaymentService = {
  async createPaymentIntent(orderId: string, amount: number, currency: string = 'EUR') {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      data: {
        id: `pi_mock_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        status: 'requires_payment_method',
        client_secret: `pi_mock_${Date.now()}_secret`,
      },
      error: null,
    };
  },

  async confirmPayment(orderId: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update order to paid status and get updated order
    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update({ payment_status: 'paid' })
      .eq('id', orderId)
      .select()
      .single();

    // Automatically generate invoice and calculate commission for mock payments
    if (updatedOrder && !error) {
      try {
        await invoiceService.createInvoice(orderId);
        await commissionService.createCommissionRecord(updatedOrder);
      } catch (error) {
        console.error('Error in post-payment processing:', error);
      }
    }

    return { data: { success: true }, error };
  },
};