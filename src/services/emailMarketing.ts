import { supabase } from './supabase';
import { emailService } from './email';
import { User } from '../types';

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  template_id: string;
  segment_id?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  scheduled_at?: string;
  sent_at?: string;
  sent_count: number;
  open_count: number;
  click_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[]; // e.g., ['{{customer_name}}', '{{product_name}}']
  category: 'promotional' | 'transactional' | 'newsletter' | 'welcome' | 'abandoned_cart';
  created_at: string;
  updated_at: string;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    type: 'all_customers' | 'new_customers' | 'returning_customers' | 'high_value' | 'inactive';
    filters?: {
      last_purchase_days?: number;
      total_spent_min?: number;
      order_count_min?: number;
      product_categories?: string[];
    };
  };
  customer_count: number;
  created_at: string;
  updated_at: string;
}

export interface EmailAnalytics {
  campaign_id: string;
  recipient_id: string;
  email: string;
  status: 'sent' | 'bounced' | 'opened' | 'clicked' | 'unsubscribed';
  sent_at: string;
  opened_at?: string;
  clicked_at?: string;
  unsubscribed_at?: string;
}

export const emailMarketingService = {
  // Default email templates
  DEFAULT_TEMPLATES: {
    WELCOME: {
      name: 'Welcome Email',
      subject: 'Welcome to Zetta Med - Your Journey to Quality Medical Equipment Starts Here',
      content: `
        <h1>Welcome {{customer_name}}!</h1>
        <p>Thank you for joining Zetta Med. We're excited to have you as part of our community.</p>
        <p>As a trusted platform for refurbished medical equipment, we're committed to providing you with:</p>
        <ul>
          <li>✓ High-quality, certified medical equipment</li>
          <li>✓ Comprehensive warranties on all products</li>
          <li>✓ Expert support and maintenance services</li>
          <li>✓ Competitive prices with transparent pricing</li>
        </ul>
        <p><a href="{{browse_products_url}}" style="background: #00d4ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Browse Products</a></p>
      `,
      variables: ['{{customer_name}}', '{{browse_products_url}}'],
      category: 'welcome' as const,
    },
    ORDER_CONFIRMATION: {
      name: 'Order Confirmation',
      subject: 'Order Confirmed - {{order_number}}',
      content: `
        <h1>Thank you for your order, {{customer_name}}!</h1>
        <p>Your order #{{order_number}} has been confirmed and is being processed.</p>
        <h2>Order Details:</h2>
        {{order_items}}
        <p><strong>Total: {{order_total}}</strong></p>
        <p>You'll receive another email when your order ships.</p>
        <p><a href="{{track_order_url}}">Track Your Order</a></p>
      `,
      variables: ['{{customer_name}}', '{{order_number}}', '{{order_items}}', '{{order_total}}', '{{track_order_url}}'],
      category: 'transactional' as const,
    },
    ABANDONED_CART: {
      name: 'Abandoned Cart Reminder',
      subject: 'You left something behind...',
      content: `
        <h1>Hi {{customer_name}},</h1>
        <p>We noticed you left some items in your cart. These quality medical equipment items are still available:</p>
        {{cart_items}}
        <p>Complete your purchase now and enjoy:</p>
        <ul>
          <li>Free warranty on all products</li>
          <li>Expert support</li>
          <li>Secure payment options</li>
        </ul>
        <p><a href="{{cart_url}}" style="background: #ff0080; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Complete Your Order</a></p>
      `,
      variables: ['{{customer_name}}', '{{cart_items}}', '{{cart_url}}'],
      category: 'abandoned_cart' as const,
    },
  },

  // Create email campaign
  async createCampaign(campaign: Omit<EmailCampaign, 'id' | 'created_at' | 'updated_at' | 'sent_count' | 'open_count' | 'click_count'>): Promise<{ data: EmailCampaign | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .insert({
          ...campaign,
          sent_count: 0,
          open_count: 0,
          click_count: 0,
        })
        .select()
        .single();

      return { data: data as EmailCampaign | null, error };
    } catch (error) {
      console.error('Error creating campaign:', error);
      return { data: null, error };
    }
  },

  // Create email template
  async createTemplate(template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: EmailTemplate | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .insert(template)
        .select()
        .single();

      return { data: data as EmailTemplate | null, error };
    } catch (error) {
      console.error('Error creating template:', error);
      return { data: null, error };
    }
  },

  // Create customer segment
  async createSegment(segment: Omit<CustomerSegment, 'id' | 'created_at' | 'updated_at' | 'customer_count'>): Promise<{ data: CustomerSegment | null; error: any }> {
    try {
      // Calculate customer count based on criteria
      const customerCount = await this.calculateSegmentSize(segment.criteria);

      const { data, error } = await supabase
        .from('customer_segments')
        .insert({
          ...segment,
          customer_count: customerCount,
        })
        .select()
        .single();

      return { data: data as CustomerSegment | null, error };
    } catch (error) {
      console.error('Error creating segment:', error);
      return { data: null, error };
    }
  },

  // Calculate segment size
  async calculateSegmentSize(criteria: CustomerSegment['criteria']): Promise<number> {
    try {
      let query = supabase
        .from('user_profiles')
        .select('*, orders:orders(count)', { count: 'exact' })
        .eq('role', 'buyer');

      // Apply filters based on criteria type
      switch (criteria.type) {
        case 'new_customers':
          // Customers with only 1 order
          query = query.eq('orders.count', 1);
          break;
        case 'returning_customers':
          // Customers with more than 1 order
          query = query.gt('orders.count', 1);
          break;
        case 'high_value':
          // This would need a join with orders to sum total_amount
          // For now, use order count as proxy
          query = query.gte('orders.count', criteria.filters?.order_count_min || 5);
          break;
        case 'inactive':
          // Customers who haven't ordered in X days
          const inactiveDays = criteria.filters?.last_purchase_days || 90;
          const inactiveDate = new Date();
          inactiveDate.setDate(inactiveDate.getDate() - inactiveDays);
          // This would need a more complex query
          break;
      }

      const { count } = await query;
      return count || 0;
    } catch (error) {
      console.error('Error calculating segment size:', error);
      return 0;
    }
  },

  // Get customers in segment
  async getSegmentCustomers(segmentId: string): Promise<{ data: User[] | null; error: any }> {
    try {
      const { data: segment, error: segmentError } = await supabase
        .from('customer_segments')
        .select('*')
        .eq('id', segmentId)
        .single();

      if (segmentError || !segment) {
        throw new Error('Segment not found');
      }

      // Get customers based on segment criteria
      let query = supabase
        .from('user_profiles')
        .select('*, user:auth.users(*)')
        .eq('role', 'buyer');

      // Apply segment filters
      // This is simplified - in production, you'd have more complex filtering
      const { data, error } = await query;

      return { data: data as any[] | null, error };
    } catch (error) {
      console.error('Error fetching segment customers:', error);
      return { data: null, error };
    }
  },

  // Send campaign
  async sendCampaign(campaignId: string): Promise<{ error: any }> {
    try {
      // Get campaign details
      const { data: campaign, error: campaignError } = await supabase
        .from('email_campaigns')
        .select(`
          *,
          template:email_templates(*),
          segment:customer_segments(*)
        `)
        .eq('id', campaignId)
        .single();

      if (campaignError || !campaign) {
        throw new Error('Campaign not found');
      }

      // Update campaign status
      await supabase
        .from('email_campaigns')
        .update({ status: 'sending' })
        .eq('id', campaignId);

      // Get recipients
      const recipients = campaign.segment_id
        ? await this.getSegmentCustomers(campaign.segment_id)
        : await this.getAllCustomers();

      if (!recipients.data || recipients.data.length === 0) {
        throw new Error('No recipients found');
      }

      let sentCount = 0;
      const errors: string[] = [];

      // Send emails to each recipient
      for (const recipient of recipients.data) {
        try {
          // Replace template variables
          const personalizedContent = this.personalizeTemplate(
            campaign.template.content,
            {
              customer_name: recipient.full_name || 'Customer',
              email: recipient.user?.email || '',
              // Add more variables as needed
            }
          );

          // Send email using mock email service
          await emailService.sendMockEmail(
            recipient.user?.email || '',
            campaign.subject,
            personalizedContent
          );

          // Track analytics
          await this.trackEmailSent(campaignId, recipient.user_id, recipient.user?.email || '');
          sentCount++;
        } catch (error: any) {
          errors.push(`Failed to send to ${recipient.user?.email}: ${error.message}`);
        }
      }

      // Update campaign status
      await supabase
        .from('email_campaigns')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          sent_count: sentCount,
        })
        .eq('id', campaignId);

      return { error: errors.length > 0 ? errors.join(', ') : null };
    } catch (error) {
      console.error('Error sending campaign:', error);
      return { error };
    }
  },

  // Personalize template
  personalizeTemplate(template: string, variables: Record<string, string>): string {
    let content = template;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, value);
    });
    return content;
  },

  // Track email sent
  async trackEmailSent(campaignId: string, recipientId: string, email: string): Promise<void> {
    try {
      await supabase
        .from('email_analytics')
        .insert({
          campaign_id: campaignId,
          recipient_id: recipientId,
          email,
          status: 'sent',
          sent_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error tracking email sent:', error);
    }
  },

  // Track email opened
  async trackEmailOpened(campaignId: string, recipientId: string): Promise<void> {
    try {
      await supabase
        .from('email_analytics')
        .update({
          status: 'opened',
          opened_at: new Date().toISOString(),
        })
        .eq('campaign_id', campaignId)
        .eq('recipient_id', recipientId);

      // Increment open count
      await supabase.rpc('increment_campaign_opens', { campaign_id: campaignId });
    } catch (error) {
      console.error('Error tracking email opened:', error);
    }
  },

  // Track email clicked
  async trackEmailClicked(campaignId: string, recipientId: string): Promise<void> {
    try {
      await supabase
        .from('email_analytics')
        .update({
          status: 'clicked',
          clicked_at: new Date().toISOString(),
        })
        .eq('campaign_id', campaignId)
        .eq('recipient_id', recipientId);

      // Increment click count
      await supabase.rpc('increment_campaign_clicks', { campaign_id: campaignId });
    } catch (error) {
      console.error('Error tracking email clicked:', error);
    }
  },

  // Get all customers
  async getAllCustomers(): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*, user:auth.users(*)')
        .eq('role', 'buyer');

      return { data, error };
    } catch (error) {
      console.error('Error fetching customers:', error);
      return { data: null, error };
    }
  },

  // Get campaign analytics
  async getCampaignAnalytics(campaignId: string): Promise<{
    sent: number;
    opened: number;
    clicked: number;
    openRate: number;
    clickRate: number;
  }> {
    try {
      const { data: campaign } = await supabase
        .from('email_campaigns')
        .select('sent_count, open_count, click_count')
        .eq('id', campaignId)
        .single();

      if (!campaign) {
        return { sent: 0, opened: 0, clicked: 0, openRate: 0, clickRate: 0 };
      }

      const openRate = campaign.sent_count > 0 
        ? (campaign.open_count / campaign.sent_count) * 100 
        : 0;
      
      const clickRate = campaign.open_count > 0 
        ? (campaign.click_count / campaign.open_count) * 100 
        : 0;

      return {
        sent: campaign.sent_count,
        opened: campaign.open_count,
        clicked: campaign.click_count,
        openRate: Math.round(openRate * 10) / 10,
        clickRate: Math.round(clickRate * 10) / 10,
      };
    } catch (error) {
      console.error('Error fetching campaign analytics:', error);
      return { sent: 0, opened: 0, clicked: 0, openRate: 0, clickRate: 0 };
    }
  },

  // Automated email triggers
  async sendWelcomeEmail(userId: string, email: string, name: string): Promise<void> {
    try {
      const template = this.DEFAULT_TEMPLATES.WELCOME;
      const personalizedContent = this.personalizeTemplate(template.content, {
        customer_name: name || 'Customer',
        browse_products_url: `${window.location.origin}/products`,
      });

      await emailService.sendMockEmail(email, template.subject, personalizedContent);
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  },

  async sendOrderConfirmation(order: any): Promise<void> {
    try {
      const template = this.DEFAULT_TEMPLATES.ORDER_CONFIRMATION;
      
      // Format order items
      const orderItemsHtml = order.order_items?.map((item: any) => `
        <p>${item.product?.title} - Quantity: ${item.quantity} - €${item.total_price.toFixed(2)}</p>
      `).join('') || '';

      const personalizedContent = this.personalizeTemplate(template.content, {
        customer_name: order.buyer_profile?.full_name || 'Customer',
        order_number: order.id.substring(0, 8).toUpperCase(),
        order_items: orderItemsHtml,
        order_total: `€${order.total_amount.toFixed(2)}`,
        track_order_url: `${window.location.origin}/orders/${order.id}`,
      });

      const personalizedSubject = this.personalizeTemplate(template.subject, {
        order_number: order.id.substring(0, 8).toUpperCase(),
      });

      await emailService.sendMockEmail(
        order.buyer_profile?.user?.email || '',
        personalizedSubject,
        personalizedContent
      );
    } catch (error) {
      console.error('Error sending order confirmation:', error);
    }
  },

  async sendAbandonedCartReminder(userId: string, cartItems: any[]): Promise<void> {
    try {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!userProfile) return;

      // Get user email from auth
      const { data: { user } } = await supabase.auth.admin.getUserById(userId);
      if (!user?.email) return;

      const template = this.DEFAULT_TEMPLATES.ABANDONED_CART;
      
      // Format cart items
      const cartItemsHtml = cartItems.map(item => `
        <p>${item.product.title} - Quantity: ${item.quantity} - €${(item.product.zetta_price * item.quantity).toFixed(2)}</p>
      `).join('');

      const personalizedContent = this.personalizeTemplate(template.content, {
        customer_name: userProfile.full_name || 'Customer',
        cart_items: cartItemsHtml,
        cart_url: `${window.location.origin}/cart`,
      });

      await emailService.sendMockEmail(user.email, template.subject, personalizedContent);
    } catch (error) {
      console.error('Error sending abandoned cart reminder:', error);
    }
  },

  // Initialize default templates
  async initializeDefaultTemplates(): Promise<void> {
    try {
      for (const template of Object.values(this.DEFAULT_TEMPLATES)) {
        const { error } = await this.createTemplate(template);
        if (error && !error.message.includes('duplicate')) {
          console.error('Error creating template:', error);
        }
      }
    } catch (error) {
      console.error('Error initializing templates:', error);
    }
  },
};