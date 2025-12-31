import { supabase } from './supabase';
import { Product } from '../types';

export interface CatalogSyncConfig {
  id: string;
  seller_id: string;
  sync_type: 'api' | 'csv' | 'xml' | 'webhook';
  source_url?: string;
  api_key?: string;
  webhook_secret?: string;
  mapping_rules: Record<string, string>;
  schedule: 'realtime' | 'hourly' | 'daily' | 'weekly';
  auto_approve: boolean;
  last_sync?: string;
  next_sync?: string;
  status: 'active' | 'paused' | 'error';
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface WebhookEvent {
  id: string;
  config_id: string;
  event_type: string;
  payload: any;
  processed: boolean;
  processed_at?: string;
  error?: string;
  created_at: string;
}

export interface SyncLog {
  id: string;
  config_id: string;
  started_at: string;
  completed_at?: string;
  status: 'running' | 'success' | 'failed';
  products_added: number;
  products_updated: number;
  products_removed: number;
  error_message?: string;
  sync_data?: any;
}

export const enhancedCatalogSyncService = {
  // Create sync configuration
  async createSyncConfig(config: Omit<CatalogSyncConfig, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: CatalogSyncConfig | null; error: any }> {
    try {
      // Calculate next sync time based on schedule
      const nextSync = this.calculateNextSync(config.schedule);
      
      const { data, error } = await supabase
        .from('catalog_sync_configs')
        .insert({
          ...config,
          next_sync: nextSync.toISOString(),
        })
        .select()
        .single();

      if (data && config.sync_type === 'webhook') {
        // Generate webhook URL for this config
        const webhookUrl = await this.createWebhookEndpoint(data.id);
        console.log('Webhook URL generated:', webhookUrl);
      }

      return { data: data as CatalogSyncConfig | null, error };
    } catch (error) {
      console.error('Error creating sync config:', error);
      return { data: null, error };
    }
  },

  // Create webhook endpoint for real-time sync
  async createWebhookEndpoint(configId: string): Promise<string> {
    // Generate unique webhook URL
    const webhookUrl = `${process.env.REACT_APP_API_URL || window.location.origin}/api/webhooks/catalog-sync/${configId}`;
    return webhookUrl;
  },

  // Verify webhook signature
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // In production, use crypto to verify HMAC signature
    // For now, simple comparison
    return true; // Placeholder implementation
  },

  // Process webhook event
  async processWebhookEvent(event: WebhookEvent): Promise<{ error: any }> {
    try {
      const { data: config, error: configError } = await supabase
        .from('catalog_sync_configs')
        .select('*')
        .eq('id', event.config_id)
        .single();

      if (configError || !config) {
        throw new Error('Sync configuration not found');
      }

      // Start sync log
      const syncLog: Omit<SyncLog, 'id'> = {
        config_id: event.config_id,
        started_at: new Date().toISOString(),
        status: 'running',
        products_added: 0,
        products_updated: 0,
        products_removed: 0,
      };

      // Process based on event type
      switch (event.event_type) {
        case 'product.created':
        case 'product.updated':
          await this.syncProduct(config, event.payload, syncLog);
          break;
        case 'product.deleted':
          await this.removeProduct(config, event.payload.id, syncLog);
          break;
        case 'catalog.full_sync':
          await this.fullCatalogSync(config, event.payload, syncLog);
          break;
      }

      // Mark event as processed
      await supabase
        .from('webhook_events')
        .update({ 
          processed: true, 
          processed_at: new Date().toISOString() 
        })
        .eq('id', event.id);

      // Complete sync log
      syncLog.completed_at = new Date().toISOString();
      syncLog.status = 'success';
      
      await this.saveSyncLog(syncLog);
      return { error: null };
    } catch (error: any) {
      // Mark event as failed
      await supabase
        .from('webhook_events')
        .update({ 
          processed: true, 
          processed_at: new Date().toISOString(),
          error: error.message 
        })
        .eq('id', event.id);
      
      return { error };
    }
  },

  // Sync single product
  async syncProduct(
    config: CatalogSyncConfig, 
    externalProduct: any, 
    syncLog: Omit<SyncLog, 'id'>
  ): Promise<void> {
    const mappedProduct = this.mapExternalProduct(externalProduct, config.mapping_rules);
    mappedProduct.seller_id = config.seller_id;

    // Calculate Zetta price automatically (6% discount)
    if (mappedProduct.price) {
      mappedProduct.zetta_price = Number((mappedProduct.price * 0.94).toFixed(2));
    }

    // Set approval status based on config
    mappedProduct.status = config.auto_approve ? 'available' : 'pending';

    // Check if product exists
    const externalId = externalProduct[config.mapping_rules.external_id || 'id'];
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('seller_id', config.seller_id)
      .eq('external_id', externalId)
      .single();

    if (existingProduct) {
      // Update existing product
      await supabase
        .from('products')
        .update(mappedProduct)
        .eq('id', existingProduct.id);
      syncLog.products_updated++;
    } else {
      // Create new product
      await supabase
        .from('products')
        .insert({ ...mappedProduct, external_id: externalId });
      syncLog.products_added++;
    }
  },

  // Remove product
  async removeProduct(
    config: CatalogSyncConfig, 
    externalId: string, 
    syncLog: Omit<SyncLog, 'id'>
  ): Promise<void> {
    const { error } = await supabase
      .from('products')
      .update({ status: 'sold' }) // Mark as sold instead of deleting
      .eq('seller_id', config.seller_id)
      .eq('external_id', externalId);

    if (!error) {
      syncLog.products_removed++;
    }
  },

  // Full catalog sync
  async fullCatalogSync(
    config: CatalogSyncConfig, 
    catalog: any[], 
    syncLog: Omit<SyncLog, 'id'>
  ): Promise<void> {
    // Get all current products
    const { data: currentProducts } = await supabase
      .from('products')
      .select('id, external_id')
      .eq('seller_id', config.seller_id);

    const currentProductIds = new Set(
      currentProducts?.map(p => p.external_id) || []
    );
    const newProductIds = new Set();

    // Sync all products from catalog
    for (const externalProduct of catalog) {
      const externalId = externalProduct[config.mapping_rules.external_id || 'id'];
      newProductIds.add(externalId);
      await this.syncProduct(config, externalProduct, syncLog);
    }

    // Mark products not in new catalog as sold
    for (const product of currentProducts || []) {
      if (!newProductIds.has(product.external_id)) {
        await this.removeProduct(config, product.external_id, syncLog);
      }
    }
  },

  // Map external product to internal format
  mapExternalProduct(
    externalProduct: any, 
    mappingRules: Record<string, string>
  ): Partial<Product> {
    const mapped: Partial<Product> = {};

    Object.entries(mappingRules).forEach(([internalField, externalField]) => {
      if (externalField === 'external_id') return; // Skip external_id mapping
      
      const value = this.getNestedValue(externalProduct, externalField);
      
      switch (internalField) {
        case 'title':
          mapped.title = String(value || '');
          break;
        case 'description':
          mapped.description = String(value || '');
          break;
        case 'category':
          mapped.category = String(value || 'Other');
          break;
        case 'condition':
          mapped.condition = this.mapCondition(value);
          break;
        case 'price':
          mapped.price = parseFloat(String(value)) || 0;
          break;
        case 'images':
          mapped.images = this.mapImages(value);
          break;
        case 'warranty_duration':
          mapped.warranty_duration = parseInt(String(value)) || undefined;
          break;
      }
    });

    return mapped;
  },

  // Get nested value from object using dot notation
  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  },

  // Map condition values
  mapCondition(value: any): Product['condition'] {
    const condition = String(value).toLowerCase();
    if (condition.includes('excellent') || condition.includes('new')) return 'excellent';
    if (condition.includes('good')) return 'good';
    return 'fair';
  },

  // Map images
  mapImages(value: any): string[] {
    if (Array.isArray(value)) return value.map(v => String(v));
    if (typeof value === 'string') return value.split(',').map(v => v.trim());
    return [];
  },

  // Save sync log
  async saveSyncLog(syncLog: Omit<SyncLog, 'id'>): Promise<void> {
    await supabase.from('sync_logs').insert(syncLog);
  },

  // Schedule next sync based on schedule type
  calculateNextSync(schedule: CatalogSyncConfig['schedule']): Date {
    const now = new Date();
    switch (schedule) {
      case 'hourly':
        return new Date(now.getTime() + 60 * 60 * 1000);
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      default:
        return now;
    }
  },

  // Auto-sync runner (to be called by a cron job or background worker)
  async runScheduledSyncs(): Promise<void> {
    const now = new Date().toISOString();
    
    // Get all configs due for sync
    const { data: configs } = await supabase
      .from('catalog_sync_configs')
      .select('*')
      .eq('status', 'active')
      .lte('next_sync', now);

    for (const config of configs || []) {
      try {
        await this.performSync(config);
        
        // Update next sync time
        await supabase
          .from('catalog_sync_configs')
          .update({
            last_sync: now,
            next_sync: this.calculateNextSync(config.schedule).toISOString(),
            status: 'active',
            error_message: null,
          })
          .eq('id', config.id);
      } catch (error: any) {
        // Update error status
        await supabase
          .from('catalog_sync_configs')
          .update({
            status: 'error',
            error_message: error.message,
          })
          .eq('id', config.id);
      }
    }
  },

  // Perform sync based on sync type
  async performSync(config: CatalogSyncConfig): Promise<void> {
    const syncLog: Omit<SyncLog, 'id'> = {
      config_id: config.id,
      started_at: new Date().toISOString(),
      status: 'running',
      products_added: 0,
      products_updated: 0,
      products_removed: 0,
    };

    try {
      switch (config.sync_type) {
        case 'api':
          await this.syncFromAPI(config, syncLog);
          break;
        case 'csv':
          await this.syncFromCSV(config, syncLog);
          break;
        case 'xml':
          await this.syncFromXML(config, syncLog);
          break;
        case 'webhook':
          // Webhook syncs are event-driven, not scheduled
          break;
      }

      syncLog.completed_at = new Date().toISOString();
      syncLog.status = 'success';
    } catch (error: any) {
      syncLog.completed_at = new Date().toISOString();
      syncLog.status = 'failed';
      syncLog.error_message = error.message;
      throw error;
    } finally {
      await this.saveSyncLog(syncLog);
    }
  },

  // Sync from API
  async syncFromAPI(config: CatalogSyncConfig, syncLog: Omit<SyncLog, 'id'>): Promise<void> {
    if (!config.source_url) throw new Error('Source URL is required for API sync');

    const response = await fetch(config.source_url, {
      headers: config.api_key ? {
        'Authorization': `Bearer ${config.api_key}`,
      } : {},
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const products = Array.isArray(data) ? data : (data.products || data.items || []);

    await this.fullCatalogSync(config, products, syncLog);
  },

  // Sync from CSV URL
  async syncFromCSV(config: CatalogSyncConfig, syncLog: Omit<SyncLog, 'id'>): Promise<void> {
    if (!config.source_url) throw new Error('Source URL is required for CSV sync');

    const response = await fetch(config.source_url);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status}`);
    }

    const csvContent = await response.text();
    const products = this.parseCSV(csvContent);
    await this.fullCatalogSync(config, products, syncLog);
  },

  // Sync from XML URL
  async syncFromXML(config: CatalogSyncConfig, syncLog: Omit<SyncLog, 'id'>): Promise<void> {
    if (!config.source_url) throw new Error('Source URL is required for XML sync');

    const response = await fetch(config.source_url);
    if (!response.ok) {
      throw new Error(`Failed to fetch XML: ${response.status}`);
    }

    const xmlContent = await response.text();
    const products = this.parseXML(xmlContent);
    await this.fullCatalogSync(config, products, syncLog);
  },

  // Parse CSV content
  parseCSV(content: string): any[] {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const products = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const product: any = {};
      
      headers.forEach((header, index) => {
        product[header] = values[index];
      });
      
      products.push(product);
    }

    return products;
  },

  // Parse XML content (simplified)
  parseXML(content: string): any[] {
    const products: any[] = [];
    
    // Simple regex-based XML parsing (in production, use proper XML parser)
    const productMatches = content.match(/<product>[\s\S]*?<\/product>/gi) || [];
    
    productMatches.forEach(productXml => {
      const product: any = {};
      
      // Extract common fields
      const fields = ['id', 'title', 'description', 'price', 'category', 'condition', 'images'];
      fields.forEach(field => {
        const regex = new RegExp(`<${field}>([\\s\\S]*?)<\\/${field}>`, 'i');
        const match = productXml.match(regex);
        if (match) {
          product[field] = match[1].trim();
        }
      });
      
      products.push(product);
    });

    return products;
  },

  // Get sync status for seller
  async getSellerSyncStatus(sellerId: string): Promise<{
    configs: CatalogSyncConfig[];
    recentLogs: SyncLog[];
    pendingWebhooks: number;
  }> {
    // Get all sync configs
    const { data: configs } = await supabase
      .from('catalog_sync_configs')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    // Get recent sync logs
    const configIds = configs?.map(c => c.id) || [];
    const { data: logs } = await supabase
      .from('sync_logs')
      .select('*')
      .in('config_id', configIds)
      .order('started_at', { ascending: false })
      .limit(20);

    // Count pending webhooks
    const { count: pendingWebhooks } = await supabase
      .from('webhook_events')
      .select('*', { count: 'exact', head: true })
      .in('config_id', configIds)
      .eq('processed', false);

    return {
      configs: configs || [],
      recentLogs: logs || [],
      pendingWebhooks: pendingWebhooks || 0,
    };
  },
};

// Export original service methods for backward compatibility
export const catalogSyncService = {
  ...enhancedCatalogSyncService,
  
  // Include original methods from catalogSync.ts
  createSyncConfig: enhancedCatalogSyncService.createWebhookEndpoint,
  getSellerSyncConfigs: async (sellerId: string) => {
    const status = await enhancedCatalogSyncService.getSellerSyncStatus(sellerId);
    return { data: status.configs, error: null };
  },
};