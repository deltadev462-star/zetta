import { supabase } from './supabase';
import { Order, OrderItem } from '../types';
import { emailService } from './email';
import jsPDF from 'jspdf';

export interface Invoice {
  id: string;
  order_id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  pdf_url?: string;
  created_at: string;
}

export const invoiceService = {
  // Generate invoice number
  generateInvoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}-${random}`;
  },

  // Calculate invoice details
  calculateInvoiceTotals(order: Order) {
    const subtotal = order.total_amount;
    const taxRate = 0.19; // 19% VAT
    const taxAmount = Number((subtotal * taxRate).toFixed(2));
    const total = Number((subtotal + taxAmount).toFixed(2));

    return {
      subtotal,
      taxAmount,
      total,
    };
  },

  // Create invoice record
  async createInvoice(orderId: string): Promise<{ data: Invoice | null; error: any }> {
    try {
      // Fetch order details
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          ),
          buyer_profile:user_profiles!buyer_id (*),
          seller_profile:user_profiles!seller_id (*)
        `)
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;
      if (!order) throw new Error('Order not found');

      const { subtotal, taxAmount, total } = this.calculateInvoiceTotals(order);
      const invoiceNumber = this.generateInvoiceNumber();

      // Create invoice record
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          order_id: orderId,
          invoice_number: invoiceNumber,
          issue_date: new Date().toISOString(),
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          subtotal,
          tax_amount: taxAmount,
          total_amount: total,
          status: 'draft',
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Generate and upload PDF
      const pdfUrl = await this.generateInvoicePDF(invoice, order);

      // Update invoice with PDF URL
      if (pdfUrl) {
        const { error: updateError } = await supabase
          .from('invoices')
          .update({ pdf_url: pdfUrl })
          .eq('id', invoice.id);

        if (updateError) console.error('Error updating invoice PDF URL:', updateError);
      }

      return { data: invoice, error: null };
    } catch (error) {
      console.error('Error creating invoice:', error);
      return { data: null, error };
    }
  },

  // Generate invoice PDF with jsPDF and upload to Supabase Storage
  async generateInvoicePDF(invoice: Invoice, order: any): Promise<string> {
    // Render a simple but robust PDF layout
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    let y = margin;

    const text = (t: string, x: number, yy: number, size = 11, bold = false) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(size);
      doc.text(t, x, yy);
    };

    // Header
    text('Zetta Med Platform', margin, y, 18, true);
    y += 20;
    text('Refurbished Medical Equipment', margin, y);
    y += 16;
    text('123 Medical Street', margin, y);
    y += 14;
    text('Berlin, Germany  |  VAT: DE123456789', margin, y);
    y += 30;

    // Invoice meta
    text('INVOICE', 450, margin, 20, true);
    text(`Invoice #: ${invoice.invoice_number}`, 450, margin + 20);
    text(`Date: ${new Date(invoice.issue_date).toLocaleDateString()}`, 450, margin + 36);
    text(`Due: ${new Date(invoice.due_date).toLocaleDateString()}`, 450, margin + 52);

    // Bill To
    y += 10;
    text('Bill To:', margin, y, 12, true);
    y += 16;
    const billTo = [
      order.shipping_address?.full_name || order.buyer_profile?.full_name || 'Customer',
      order.shipping_address?.company_name || '',
      order.shipping_address?.address_line1 || '',
      `${order.shipping_address?.city || ''} ${order.shipping_address?.postal_code || ''}`.trim(),
      order.shipping_address?.country || '',
    ].filter(Boolean);
    billTo.forEach((line: string) => {
      text(line, margin, y);
      y += 14;
    });

    // Items header
    y += 10;
    doc.setDrawColor(220);
    doc.line(margin, y, 555, y);
    y += 16;
    text('Description', margin, y, 12, true);
    text('Qty', 360, y, 12, true);
    text('Unit Price', 420, y, 12, true);
    text('Total', 510, y, 12, true);
    y += 10;
    doc.line(margin, y, 555, y);
    y += 14;

    const fmt = (n: number) => `€${Number(n || 0).toFixed(2)}`;

    // Items
    (order.order_items || []).forEach((item: OrderItem) => {
      text(item.product?.title || 'Product', margin, y);
      text(String(item.quantity), 360, y);
      text(fmt(item.unit_price), 420, y);
      text(fmt(item.total_price), 510, y);
      y += 16;
      if (y > 720) {
        doc.addPage();
        y = margin;
      }
    });

    // Totals
    y += 10;
    doc.line(margin, y, 555, y);
    y += 18;
    text(`Subtotal: ${fmt(invoice.subtotal)}`, 420, y);
    y += 16;
    text(`VAT (19%): ${fmt(invoice.tax_amount)}`, 420, y);
    y += 16;
    text(`Total: ${fmt(invoice.total_amount)}`, 420, y, 12, true);

    // Footer
    y = 780;
    doc.setFontSize(9);
    text('Payment Terms: Net 30 days', margin, y);
    text('Bank: Deutsche Bank | IBAN: DE89 3704 0044 0532 0130 00 | SWIFT: DEUTDEBBXXX', margin, y + 12);

    // Create Blob
    const blob = doc.output('blob');

    // Upload to Supabase Storage
    const filePath = `${invoice.invoice_number}.pdf`;
    const bucket = 'invoices';
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, blob, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'application/pdf',
      });

    if (uploadError) {
      console.error('Failed to upload invoice PDF:', uploadError);
      return '';
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return publicUrlData?.publicUrl || '';
  },

  // Get invoice by ID
  async getInvoiceById(invoiceId: string): Promise<{ data: Invoice | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      return { data: data as Invoice | null, error };
    } catch (error) {
      console.error('Error fetching invoice:', error);
      return { data: null, error };
    }
  },

  // Get invoices for an order
  async getOrderInvoices(orderId: string): Promise<{ data: Invoice[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      return { data: data as Invoice[] | null, error };
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return { data: null, error };
    }
  },

  // Update invoice status
  async updateInvoiceStatus(invoiceId: string, status: Invoice['status']): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status })
        .eq('id', invoiceId);

      return { error };
    } catch (error) {
      console.error('Error updating invoice status:', error);
      return { error };
    }
  },

  // Send invoice email (Edge Function with fallback to mock)
  async sendInvoiceEmail(invoiceId: string, recipientEmail: string): Promise<{ error: any }> {
    try {
      const { data: invoice, error: invoiceError } = await this.getInvoiceById(invoiceId);
      if (invoiceError) throw invoiceError;
      if (!invoice) throw new Error('Invoice not found');

      // Fetch order for HTML rendering (safe minimal fetch)
      const { data: order } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          )
        `)
        .eq('id', invoice.order_id)
        .single();

      const html = this.generateInvoiceHTML(invoice, order || { shipping_address: {}, order_items: [] });

      // Try real function first
      const sendRes = await emailService.sendEmail({
        to: recipientEmail,
        subject: `Invoice ${invoice.invoice_number} from Zetta Med`,
        template: 'invoice',
        data: {
          invoice_id: invoice.id,
          invoice_number: invoice.invoice_number,
          invoice_url: invoice.pdf_url,
          html,
        },
      });

      if (sendRes.error) {
        // Fallback to mock email
        await emailService.sendMockEmail(recipientEmail, `Invoice ${invoice.invoice_number} from Zetta Med`, `
          <p>Please find your invoice attached:</p>
          <p><a href="${invoice.pdf_url}" target="_blank" rel="noopener">Download Invoice PDF</a></p>
          ${html}
        `);
      }

      // Update status to sent
      await this.updateInvoiceStatus(invoiceId, 'sent');
      return { error: null };
    } catch (error) {
      console.error('Error sending invoice:', error);
      return { error };
    }
  },

  // Generate invoice HTML template
  generateInvoiceHTML(invoice: any, order: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .invoice-header { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .company-info h1 { color: #00d4ff; margin: 0; }
          .invoice-details { text-align: right; }
          .invoice-details h2 { margin: 0; color: #333; }
          .addresses { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .address-box { width: 45%; }
          .address-box h3 { color: #666; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .totals { text-align: right; }
          .totals table { width: 300px; margin-left: auto; }
          .totals td { border: none; }
          .total-row { font-weight: bold; font-size: 18px; color: #00d4ff; }
          .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <div class="company-info">
            <h1>Zetta Med Platform</h1>
            <p>Refurbished Medical Equipment</p>
            <p>123 Medical Street<br>Berlin, Germany<br>VAT: DE123456789</p>
          </div>
          <div class="invoice-details">
            <h2>INVOICE</h2>
            <p><strong>Invoice #:</strong> ${invoice.invoice_number}</p>
            <p><strong>Date:</strong> ${new Date(invoice.issue_date).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div class="addresses">
          <div class="address-box">
            <h3>Bill To:</h3>
            <p>${order?.shipping_address?.full_name || ''}<br>
            ${order?.shipping_address?.company_name || ''}<br>
            ${order?.shipping_address?.address_line1 || ''}<br>
            ${order?.shipping_address?.city || ''}, ${order?.shipping_address?.postal_code || ''}<br>
            ${order?.shipping_address?.country || ''}</p>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${(order?.order_items || []).map((item: any) => `
              <tr>
                <td>${item.product?.title || 'Product'}</td>
                <td>${item.quantity}</td>
                <td>€${Number(item.unit_price || 0).toFixed(2)}</td>
                <td>€${Number(item.total_price || 0).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <table>
            <tr>
              <td>Subtotal:</td>
              <td>€${Number(invoice.subtotal || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td>VAT (19%):</td>
              <td>€${Number(invoice.tax_amount || 0).toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td>Total:</td>
              <td>€${Number(invoice.total_amount || 0).toFixed(2)}</td>
            </tr>
          </table>
        </div>
        
        <div class="footer">
          <p>Payment Terms: Net 30 days</p>
          <p>Bank: Deutsche Bank | IBAN: DE89 3704 0044 0532 0130 00 | SWIFT: DEUTDEBBXXX</p>
          <p>Thank you for your business!</p>
        </div>
      </body>
      </html>
    `;
  },

  // Download invoice as PDF
  async downloadInvoice(invoiceId: string): Promise<{ error: any }> {
    try {
      const { data: invoice, error } = await this.getInvoiceById(invoiceId);
      if (error) throw error;
      if (!invoice) throw new Error('Invoice not found');

      if (!invoice.pdf_url) throw new Error('Invoice PDF not available');
      window.open(invoice.pdf_url, '_blank');
      return { error: null };
    } catch (error) {
      console.error('Error downloading invoice:', error);
      return { error };
    }
  },
};