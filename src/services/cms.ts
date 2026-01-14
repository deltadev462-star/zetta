import { supabase } from './supabase';

// Types for CMS content
export interface CMSHeroSection {
  id?: string;
  title: string;
  subtitle?: string;
  cta_text?: string;
  cta_link?: string;
  background_image?: string;
  gradient_start?: string;
  gradient_end?: string;
  is_active?: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface CMSService {
  id?: string;
  icon_name: string;
  title: string;
  description: string;
  gradient_start: string;
  gradient_end: string;
  shadow_color: string;
  is_active?: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface CMSBrand {
  id?: string;
  name: string;
  logo_url: string;
  website_url?: string;
  description?: string;
  is_active?: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface CMSProcessStep {
  id?: string;
  icon_name: string;
  title: string;
  description: string;
  color: string;
  highlight_text?: string;
  step_number: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface CMSFeaturedEquipment {
  id?: string;
  product_id?: string;
  title_override?: string;
  description_override?: string;
  is_featured?: boolean;
  display_order?: number;
  custom_badge?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  product?: any; // Will be joined from products table
}

export interface CMSTestimonial {
  id?: string;
  customer_name: string;
  customer_title?: string;
  customer_company?: string;
  customer_image?: string;
  testimonial_text: string;
  rating?: number;
  is_active?: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface CMSSiteSetting {
  id?: string;
  setting_key: string;
  setting_value: any;
  setting_type: 'text' | 'number' | 'boolean' | 'json' | 'image';
  description?: string;
  created_at?: string;
  updated_at?: string;
  updated_by?: string;
}

export interface CMSFooterSection {
  id?: string;
  section_title: string;
  section_type: 'links' | 'contact' | 'social' | 'newsletter';
  content: any;
  display_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface CMSPageMeta {
  id?: string;
  page_slug: string;
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  keywords?: string[];
  custom_meta?: any;
  created_at?: string;
  updated_at?: string;
  updated_by?: string;
}

export interface CMSMedia {
  id?: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size?: number;
  alt_text?: string;
  caption?: string;
  folder?: string;
  uploaded_by?: string;
  created_at?: string;
}

class CMSServiceClass {
  // Hero Sections
  async getHeroSections(activeOnly = false) {
    try {
      let query = supabase.from('cms_hero_sections').select('*');
      
      if (activeOnly) {
        query = query.eq('is_active', true);
      }
      
      query = query.order('display_order', { ascending: true });
      
      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching hero sections:', error);
      return { data: null, error };
    }
  }

  async getHeroSectionById(id: string) {
    try {
      const { data, error } = await supabase
        .from('cms_hero_sections')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching hero section:', error);
      return { data: null, error };
    }
  }

  async createHeroSection(section: CMSHeroSection) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('cms_hero_sections')
        .insert({
          ...section,
          created_by: user?.id,
          updated_by: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating hero section:', error);
      return { data: null, error };
    }
  }

  async updateHeroSection(id: string, updates: Partial<CMSHeroSection>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('cms_hero_sections')
        .update({
          ...updates,
          updated_by: user?.id
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating hero section:', error);
      return { data: null, error };
    }
  }

  async deleteHeroSection(id: string) {
    try {
      const { error } = await supabase
        .from('cms_hero_sections')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting hero section:', error);
      return { error };
    }
  }

  // Services
  async getServices(activeOnly = false) {
    try {
      let query = supabase.from('cms_services').select('*');
      
      if (activeOnly) {
        query = query.eq('is_active', true);
      }
      
      query = query.order('display_order', { ascending: true });
      
      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching services:', error);
      return { data: null, error };
    }
  }

  async getServiceById(id: string) {
    try {
      const { data, error } = await supabase
        .from('cms_services')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching service:', error);
      return { data: null, error };
    }
  }

  async createService(service: CMSService) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('cms_services')
        .insert({
          ...service,
          created_by: user?.id,
          updated_by: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating service:', error);
      return { data: null, error };
    }
  }

  async updateService(id: string, updates: Partial<CMSService>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('cms_services')
        .update({
          ...updates,
          updated_by: user?.id
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating service:', error);
      return { data: null, error };
    }
  }

  async deleteService(id: string) {
    try {
      const { error } = await supabase
        .from('cms_services')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting service:', error);
      return { error };
    }
  }

  // Brands
  async getBrands(activeOnly = false) {
    try {
      let query = supabase.from('cms_brands').select('*');
      
      if (activeOnly) {
        query = query.eq('is_active', true);
      }
      
      query = query.order('display_order', { ascending: true });
      
      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching brands:', error);
      return { data: null, error };
    }
  }

  async getBrandById(id: string) {
    try {
      const { data, error } = await supabase
        .from('cms_brands')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching brand:', error);
      return { data: null, error };
    }
  }

  async createBrand(brand: CMSBrand) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('cms_brands')
        .insert({
          ...brand,
          created_by: user?.id,
          updated_by: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating brand:', error);
      return { data: null, error };
    }
  }

  async updateBrand(id: string, updates: Partial<CMSBrand>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('cms_brands')
        .update({
          ...updates,
          updated_by: user?.id
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating brand:', error);
      return { data: null, error };
    }
  }

  async deleteBrand(id: string) {
    try {
      const { error } = await supabase
        .from('cms_brands')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting brand:', error);
      return { error };
    }
  }

  // Process Steps
  async getProcessSteps(activeOnly = false) {
    try {
      let query = supabase.from('cms_process_steps').select('*');
      
      if (activeOnly) {
        query = query.eq('is_active', true);
      }
      
      query = query.order('step_number', { ascending: true });
      
      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching process steps:', error);
      return { data: null, error };
    }
  }

  async getProcessStepById(id: string) {
    try {
      const { data, error } = await supabase
        .from('cms_process_steps')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching process step:', error);
      return { data: null, error };
    }
  }

  async createProcessStep(step: CMSProcessStep) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('cms_process_steps')
        .insert({
          ...step,
          created_by: user?.id,
          updated_by: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating process step:', error);
      return { data: null, error };
    }
  }

  async updateProcessStep(id: string, updates: Partial<CMSProcessStep>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('cms_process_steps')
        .update({
          ...updates,
          updated_by: user?.id
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating process step:', error);
      return { data: null, error };
    }
  }

  async deleteProcessStep(id: string) {
    try {
      const { error } = await supabase
        .from('cms_process_steps')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting process step:', error);
      return { error };
    }
  }

  // Featured Equipment
  async getFeaturedEquipment(activeOnly = false) {
    try {
      let query = supabase
        .from('cms_featured_equipment')
        .select(`
          *,
          product:products(
            id,
            title,
            description,
            price,
            zetta_price,
            images,
            category,
            condition,
            status
          )
        `);
      
      if (activeOnly) {
        query = query.eq('is_featured', true);
      }
      
      query = query.order('display_order', { ascending: true });
      
      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching featured equipment:', error);
      return { data: null, error };
    }
  }

  async createFeaturedEquipment(featured: CMSFeaturedEquipment) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('cms_featured_equipment')
        .insert({
          ...featured,
          created_by: user?.id,
          updated_by: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating featured equipment:', error);
      return { data: null, error };
    }
  }

  async updateFeaturedEquipment(id: string, updates: Partial<CMSFeaturedEquipment>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('cms_featured_equipment')
        .update({
          ...updates,
          updated_by: user?.id
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating featured equipment:', error);
      return { data: null, error };
    }
  }

  async deleteFeaturedEquipment(id: string) {
    try {
      const { error } = await supabase
        .from('cms_featured_equipment')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting featured equipment:', error);
      return { error };
    }
  }

  // Testimonials
  async getTestimonials(activeOnly = false) {
    try {
      let query = supabase.from('cms_testimonials').select('*');
      
      if (activeOnly) {
        query = query.eq('is_active', true);
      }
      
      query = query.order('display_order', { ascending: true });
      
      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      return { data: null, error };
    }
  }

  async createTestimonial(testimonial: CMSTestimonial) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('cms_testimonials')
        .insert({
          ...testimonial,
          created_by: user?.id,
          updated_by: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating testimonial:', error);
      return { data: null, error };
    }
  }

  async updateTestimonial(id: string, updates: Partial<CMSTestimonial>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('cms_testimonials')
        .update({
          ...updates,
          updated_by: user?.id
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating testimonial:', error);
      return { data: null, error };
    }
  }

  async deleteTestimonial(id: string) {
    try {
      const { error } = await supabase
        .from('cms_testimonials')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      return { error };
    }
  }

  // Site Settings
  async getSiteSettings() {
    try {
      const { data, error } = await supabase
        .from('cms_site_settings')
        .select('*')
        .order('setting_key', { ascending: true });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching site settings:', error);
      return { data: null, error };
    }
  }

  async getSettingByKey(key: string) {
    try {
      const { data, error } = await supabase
        .from('cms_site_settings')
        .select('*')
        .eq('setting_key', key)
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching setting:', error);
      return { data: null, error };
    }
  }

  async updateSetting(key: string, value: any, type?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('cms_site_settings')
        .upsert({
          setting_key: key,
          setting_value: typeof value === 'object' ? value : { value },
          setting_type: type || 'text',
          updated_by: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating setting:', error);
      return { data: null, error };
    }
  }

  // Footer Sections
  async getFooterSections(activeOnly = false) {
    try {
      let query = supabase.from('cms_footer_sections').select('*');
      
      if (activeOnly) {
        query = query.eq('is_active', true);
      }
      
      query = query.order('display_order', { ascending: true });
      
      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching footer sections:', error);
      return { data: null, error };
    }
  }

  async createFooterSection(section: CMSFooterSection) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('cms_footer_sections')
        .insert({
          ...section,
          created_by: user?.id,
          updated_by: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating footer section:', error);
      return { data: null, error };
    }
  }

  async updateFooterSection(id: string, updates: Partial<CMSFooterSection>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('cms_footer_sections')
        .update({
          ...updates,
          updated_by: user?.id
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating footer section:', error);
      return { data: null, error };
    }
  }

  async deleteFooterSection(id: string) {
    try {
      const { error } = await supabase
        .from('cms_footer_sections')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting footer section:', error);
      return { error };
    }
  }

  // Page Meta
  async getPageMeta(slug?: string) {
    try {
      if (slug) {
        const { data, error } = await supabase
          .from('cms_page_meta')
          .select('*')
          .eq('page_slug', slug)
          .single();
        
        if (error) throw error;
        return { data, error: null };
      } else {
        const { data, error } = await supabase
          .from('cms_page_meta')
          .select('*');
        
        if (error) throw error;
        return { data, error: null };
      }
    } catch (error) {
      console.error('Error fetching page meta:', error);
      return { data: null, error };
    }
  }

  async updatePageMeta(slug: string, meta: Partial<CMSPageMeta>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('cms_page_meta')
        .upsert({
          page_slug: slug,
          ...meta,
          updated_by: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating page meta:', error);
      return { data: null, error };
    }
  }

  // Media
  async getMedia(folder?: string) {
    try {
      let query = supabase.from('cms_media').select('*');
      
      if (folder) {
        query = query.eq('folder', folder);
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching media:', error);
      return { data: null, error };
    }
  }

  async uploadMedia(file: File, folder = 'general', altText?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log('Starting upload for:', file.name, 'to folder:', folder);

      // Upload file to Supabase Storage
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const filePath = `cms/${folder}/${fileName}`;

      console.log('Uploading to path:', filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful, getting public URL...');

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      // Save media metadata
      const { data, error } = await supabase
        .from('cms_media')
        .insert({
          file_name: fileName,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          alt_text: altText || file.name,
          folder,
          uploaded_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }

      console.log('Media metadata saved successfully');
      return { data, error: null };
    } catch (error) {
      console.error('Error uploading media:', error);
      return { data: null, error };
    }
  }

  async deleteMedia(id: string, fileUrl: string) {
    try {
      // Extract file path from URL
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split('/storage/v1/object/public/media/');
      const filePath = pathParts[1];

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([filePath]);

      if (storageError) console.error('Error deleting file from storage:', storageError);

      // Delete metadata
      const { error } = await supabase
        .from('cms_media')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting media:', error);
      return { error };
    }
  }

  // Real-time subscriptions
  subscribeToChanges(table: string, callback: (payload: any) => void) {
    const subscription = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        callback
      )
      .subscribe();

    return subscription;
  }

  unsubscribe(subscription: any) {
    supabase.removeChannel(subscription);
  }
}

export const cmsService = new CMSServiceClass();