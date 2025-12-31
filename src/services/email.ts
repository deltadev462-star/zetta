import { supabase } from './supabase';

export interface EmailTemplate {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

export interface EmailNotification {
  id: string;
  user_id: string;
  type: string;
  subject: string;
  content: string;
  sent_at: string;
  status: 'pending' | 'sent' | 'failed';
}

export const emailService = {
  // Email templates
  templates: {
    orderConfirmation: (orderData: any) => ({
      subject: `Order Confirmation - #${orderData.id.slice(0, 8)}`,
      html: `
        <h2>Thank you for your order!</h2>
        <p>Your order has been confirmed and will be processed shortly.</p>
        <h3>Order Details:</h3>
        <p>Order ID: #${orderData.id.slice(0, 8)}</p>
        <p>Total: €${orderData.total_amount.toFixed(2)}</p>
        <p>Status: ${orderData.status}</p>
        <h3>Items:</h3>
        ${orderData.items.map((item: any) => `
          <div>
            <p>${item.product.title} x ${item.quantity} - €${item.total_price.toFixed(2)}</p>
          </div>
        `).join('')}
      `,
    }),

    orderStatusUpdate: (orderData: any) => ({
      subject: `Order Status Update - #${orderData.id.slice(0, 8)}`,
      html: `
        <h2>Order Status Update</h2>
        <p>Your order status has been updated to: <strong>${orderData.status}</strong></p>
        <p>Order ID: #${orderData.id.slice(0, 8)}</p>
        ${orderData.status === 'shipped' ? '<p>You will receive tracking information shortly.</p>' : ''}
      `,
    }),

    serviceRequestConfirmation: (requestData: any) => ({
      subject: `Service Request Received - #${requestData.id.slice(0, 8)}`,
      html: `
        <h2>Service Request Confirmation</h2>
        <p>We have received your ${requestData.type} service request.</p>
        <p>Request ID: #${requestData.id.slice(0, 8)}</p>
        <p>Our team will review your request and contact you within 24-48 hours.</p>
      `,
    }),

    sellerOrderNotification: (orderData: any) => ({
      subject: `New Order Received - #${orderData.id.slice(0, 8)}`,
      html: `
        <h2>New Order Notification</h2>
        <p>You have received a new order!</p>
        <h3>Order Details:</h3>
        <p>Order ID: #${orderData.id.slice(0, 8)}</p>
        <p>Total: €${orderData.total_amount.toFixed(2)}</p>
        <p>Commission (15%): €${orderData.commission_amount.toFixed(2)}</p>
        <p>Your Earnings: €${(orderData.total_amount - orderData.commission_amount).toFixed(2)}</p>
        <p>Please log in to your dashboard to process this order.</p>
      `,
    }),

    paymentConfirmation: (paymentData: any) => ({
      subject: `Payment Confirmation - €${paymentData.amount.toFixed(2)}`,
      html: `
        <h2>Payment Successful</h2>
        <p>Your payment of €${paymentData.amount.toFixed(2)} has been processed successfully.</p>
        <p>Transaction ID: ${paymentData.id}</p>
        <p>Thank you for your purchase!</p>
      `,
    }),

    welcomeEmail: (userData: any) => ({
      subject: 'Welcome to Zetta Med Platform',
      html: `
        <h2>Welcome to Zetta Med!</h2>
        <p>Thank you for joining our platform for refurbished medical equipment.</p>
        <p>Your account has been created successfully.</p>
        <h3>What's Next?</h3>
        <ul>
          <li>Browse our catalog of quality medical equipment</li>
          <li>Request logistics and maintenance services</li>
          <li>Track your orders in real-time</li>
        </ul>
        <p>If you have any questions, feel free to contact our support team.</p>
      `,
    }),
  },

  // Send email using Supabase Edge Function
  async sendEmail(template: EmailTemplate): Promise<{ error: any }> {
    try {
      // In production, this would call a Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: template,
      });

      if (error) throw error;

      // Log email notification
      await this.logEmailNotification({
        user_id: template.data.user_id,
        type: template.template,
        subject: template.subject,
        content: JSON.stringify(template.data),
        status: 'sent',
      });

      return { error: null };
    } catch (error) {
      console.error('Error sending email:', error);
      return { error };
    }
  },

  // Mock email sending for development
  async sendMockEmail(to: string, subject: string, html: string): Promise<{ error: any }> {
    console.log('📧 Mock Email Sent:');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Content:', html);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { error: null };
  },

  // Log email notification to database
  async logEmailNotification(notification: Omit<EmailNotification, 'id' | 'sent_at'>): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('email_notifications')
        .insert({
          ...notification,
          sent_at: new Date().toISOString(),
        });

      return { error };
    } catch (error) {
      console.error('Error logging email notification:', error);
      return { error };
    }
  },

  // Get email notifications for a user
  async getUserNotifications(userId: string): Promise<{ data: EmailNotification[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('email_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('sent_at', { ascending: false });

      return { data: data as EmailNotification[] | null, error };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { data: null, error };
    }
  },

  // Send order confirmation email
  async sendOrderConfirmation(orderData: any, buyerEmail: string): Promise<{ error: any }> {
    const template = this.templates.orderConfirmation(orderData);
    return this.sendMockEmail(buyerEmail, template.subject, template.html);
  },

  // Send order status update
  async sendOrderStatusUpdate(orderData: any, buyerEmail: string): Promise<{ error: any }> {
    const template = this.templates.orderStatusUpdate(orderData);
    return this.sendMockEmail(buyerEmail, template.subject, template.html);
  },

  // Send service request confirmation
  async sendServiceRequestConfirmation(requestData: any, userEmail: string): Promise<{ error: any }> {
    const template = this.templates.serviceRequestConfirmation(requestData);
    return this.sendMockEmail(userEmail, template.subject, template.html);
  },

  // Send new order notification to seller
  async sendSellerOrderNotification(orderData: any, sellerEmail: string): Promise<{ error: any }> {
    const template = this.templates.sellerOrderNotification(orderData);
    return this.sendMockEmail(sellerEmail, template.subject, template.html);
  },

  // Send payment confirmation
  async sendPaymentConfirmation(paymentData: any, userEmail: string): Promise<{ error: any }> {
    const template = this.templates.paymentConfirmation(paymentData);
    return this.sendMockEmail(userEmail, template.subject, template.html);
  },

  // Send welcome email
  async sendWelcomeEmail(userData: any, userEmail: string): Promise<{ error: any }> {
    const template = this.templates.welcomeEmail(userData);
    return this.sendMockEmail(userEmail, template.subject, template.html);
  },

  // Batch send emails
  async sendBatchEmails(recipients: string[], subject: string, html: string): Promise<{ error: any }> {
    try {
      const promises = recipients.map(email => 
        this.sendMockEmail(email, subject, html)
      );
      
      await Promise.all(promises);
      return { error: null };
    } catch (error) {
      return { error };
    }
  },
};