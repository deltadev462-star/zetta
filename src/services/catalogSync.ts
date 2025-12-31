import { supabase } from './supabase';
import { Product } from '../types';

export interface CatalogSyncConfig {
  id: string;
  seller_id: string;
  sync_type: 'api' | 'csv' | 'xml' | 'manual';
  source_url?: string;
  api_key?: string;
  mapping_rules: Record<string, string>;
  schedule: 'daily' | 'weekly' | 'monthly' | 'manual';
  last_sync?: string;
  status: 'active' | 'paused' | 'error';
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
}

export const catalogSyncService = {
  // Create sync configuration
  async createSyncConfig(config: Omit<CatalogSyncConfig, 'id' | 'created_at'>): Promise<{ data: CatalogSyncConfig | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('catalog_sync_configs')
        .insert(config)
        .select()
        .single();

      return { data: data as CatalogSyncConfig | null, error };
    } catch (error) {
      console.error('Error creating sync config:', error);
      return { data: null, error };
    }
  },

  // Get sync configurations for a seller
  async getSellerSyncConfigs(sellerId: string): Promise<{ data: CatalogSyncConfig[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('catalog_sync_configs')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      return { data: data as CatalogSyncConfig[] | null, error };
    } catch (error) {
      console.error('Error fetching sync configs:', error);
      return { data: null, error };
    }
  },

  // Update sync configuration
  async updateSyncConfig(configId: string, updates: Partial<CatalogSyncConfig>): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('catalog_sync_configs')
        .update(updates)
        .eq('id', configId);

      return { error };
    } catch (error) {
      console.error('Error updating sync config:', error);
      return { error };
    }
  },

  // Parse CSV catalog
  async parseCSVCatalog(csvContent: string, mappingRules: Record<string, string>): Promise<Partial<Product>[]> {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const products: Partial<Product>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) continue;

      const rawProduct: Record<string, string> = {};
      headers.forEach((header, index) => {
        rawProduct[header] = values[index];
      });

      // Apply mapping rules
      const product: Partial<Product> = {};
      Object.entries(mappingRules).forEach(([zettaField, sourceField]) => {
        const value = rawProduct[sourceField];
        switch (zettaField) {
          case 'title':
            product.title = value;
            break;
          case 'description':
            product.description = value;
            break;
          case 'category':
            product.category = value;
            break;
          case 'condition':
            product.condition = value as Product['condition'];
            break;
          case 'price':
            product.price = parseFloat(value) || 0;
            break;
          case 'images':
            product.images = value ? value.split('|') : [];
            break;
          case 'warranty_duration':
            product.warranty_duration = parseInt(value) || 0;
            break;
        }
      });

      // Calculate Zetta price (with 6% discount by default)
      if (product.price) {
        product.zetta_price = product.price * 0.94;
      }

      product.status = 'available';
      products.push(product);
    }

    return products;
  },

  // Parse XML catalog
  async parseXMLCatalog(xmlContent: string, mappingRules: Record<string, string>): Promise<Partial<Product>[]> {
    // Simple XML parsing (in production, use a proper XML parser)
    const products: Partial<Product>[] = [];
    const productMatches = xmlContent.match(/<product>[\s\S]*?<\/product>/g) || [];

    productMatches.forEach(productXml => {
      const product: Partial<Product> = {};
      
      Object.entries(mappingRules).forEach(([zettaField, sourceField]) => {
        const regex = new RegExp(`<${sourceField}>([\\s\\S]*?)<\\/${sourceField}>`, 'i');
        const match = productXml.match(regex);
        const value = match ? match[1].trim() : '';

        switch (zettaField) {
          case 'title':
            product.title = value;
            break;
          case 'description':
            product.description = value;
            break;
          case 'category':
            product.category = value;
            break;
          case 'condition':
            product.condition = value as Product['condition'];
            break;
          case 'price':
            product.price = parseFloat(value) || 0;
            break;
          case 'images':
            product.images = value ? value.split(',') : [];
            break;
          case 'warranty_duration':
            product.warranty_duration = parseInt(value) || 0;
            break;
        }
      });

      // Calculate Zetta price
      if (product.price) {
        product.zetta_price = product.price * 0.94;
      }

      product.status = 'available';
      products.push(product);
    });

    return products;
  },

  // Sync products from external API
  async syncFromAPI(config: CatalogSyncConfig): Promise<{ data: SyncLog | null; error: any }> {
    const syncLog: Omit<SyncLog, 'id'> = {
      config_id: config.id,
      started_at: new Date().toISOString(),
      status: 'running',
      products_added: 0,
      products_updated: 0,
      products_removed: 0,
    };

    try {
      // Fetch data from external API
      const response = await fetch(config.source_url!, {
        headers: config.api_key ? {
          'Authorization': `Bearer ${config.api_key}`,
        } : {},
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      const products = Array.isArray(data) ? data : data.products || [];

      // Process products
      for (const externalProduct of products) {
        const mappedProduct: Partial<Product> = {
          seller_id: config.seller_id,
          status: 'available',
        };

        // Apply mapping rules
        Object.entries(config.mapping_rules).forEach(([zettaField, apiField]) => {
          const value = externalProduct[apiField];
          switch (zettaField) {
            case 'title':
              mappedProduct.title = value;
              break;
            case 'description':
              mappedProduct.description = value;
              break;
            case 'price':
              mappedProduct.price = parseFloat(value) || 0;
              mappedProduct.zetta_price = mappedProduct.price * 0.94;
              break;
            // Add more field mappings as needed
          }
        });

        // Check if product exists
        const { data: existingProduct } = await supabase
          .from('products')
          .select('id')
          .eq('seller_id', config.seller_id)
          .eq('title', mappedProduct.title)
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
            .insert(mappedProduct as Omit<Product, 'id' | 'created_at' | 'updated_at'>);
          syncLog.products_added++;
        }
      }

      // Update sync config last sync time
      await this.updateSyncConfig(config.id, { last_sync: new Date().toISOString() });

      syncLog.completed_at = new Date().toISOString();
      syncLog.status = 'success';

      return { data: syncLog as SyncLog, error: null };
    } catch (error: any) {
      syncLog.completed_at = new Date().toISOString();
      syncLog.status = 'failed';
      syncLog.error_message = error.message;
      
      return { data: syncLog as SyncLog, error };
    }
  },

  // Sync products from CSV file
  async syncFromCSV(config: CatalogSyncConfig, csvContent: string): Promise<{ data: SyncLog | null; error: any }> {
    const syncLog: Omit<SyncLog, 'id'> = {
      config_id: config.id,
      started_at: new Date().toISOString(),
      status: 'running',
      products_added: 0,
      products_updated: 0,
      products_removed: 0,
    };

    try {
      const products = await this.parseCSVCatalog(csvContent, config.mapping_rules);

      for (const productData of products) {
        const mappedProduct = {
          ...productData,
          seller_id: config.seller_id,
        };

        // Check if product exists by title
        const { data: existingProduct } = await supabase
          .from('products')
          .select('id')
          .eq('seller_id', config.seller_id)
          .eq('title', mappedProduct.title)
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
            .insert(mappedProduct as Omit<Product, 'id' | 'created_at' | 'updated_at'>);
          syncLog.products_added++;
        }
      }

      // Update sync config last sync time
      await this.updateSyncConfig(config.id, { last_sync: new Date().toISOString() });

      syncLog.completed_at = new Date().toISOString();
      syncLog.status = 'success';

      return { data: syncLog as SyncLog, error: null };
    } catch (error: any) {
      syncLog.completed_at = new Date().toISOString();
      syncLog.status = 'failed';
      syncLog.error_message = error.message;
      
      return { data: syncLog as SyncLog, error };
    }
  },

  // Get sync logs
  async getSyncLogs(configId: string): Promise<{ data: SyncLog[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('sync_logs')
        .select('*')
        .eq('config_id', configId)
        .order('started_at', { ascending: false })
        .limit(10);

      return { data: data as SyncLog[] | null, error };
    } catch (error) {
      console.error('Error fetching sync logs:', error);
      return { data: null, error };
    }
  },

  // Schedule automatic sync
  async scheduleSync(config: CatalogSyncConfig): Promise<{ error: any }> {
    // In a real application, this would set up a cron job or use a task scheduler
    // For now, we'll just update the config status
    try {
      await this.updateSyncConfig(config.id, { status: 'active' });
      
      console.log(`Scheduled ${config.schedule} sync for config ${config.id}`);
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // Manual sync trigger
  async triggerManualSync(configId: string): Promise<{ data: SyncLog | null; error: any }> {
    try {
      const { data: config, error: configError } = await supabase
        .from('catalog_sync_configs')
        .select('*')
        .eq('id', configId)
        .single();

      if (configError) throw configError;
      if (!config) throw new Error('Sync configuration not found');

      switch (config.sync_type) {
        case 'api':
          return await this.syncFromAPI(config);
        case 'csv':
          // In a real app, this would fetch the CSV from the source URL
          return { data: null, error: new Error('CSV sync requires file upload') };
        case 'xml':
          // In a real app, this would fetch the XML from the source URL
          return { data: null, error: new Error('XML sync requires file upload') };
        default:
          return { data: null, error: new Error('Unsupported sync type') };
      }
    } catch (error) {
      console.error('Error triggering manual sync:', error);
      return { data: null, error };
    }
  },

  // Validate mapping rules
  validateMappingRules(mappingRules: Record<string, string>): string[] {
    const errors: string[] = [];
    const requiredFields = ['title', 'price', 'category'];
    
    for (const field of requiredFields) {
      if (!mappingRules[field]) {
        errors.push(`Missing mapping for required field: ${field}`);
      }
    }
    
    return errors;
  },
};