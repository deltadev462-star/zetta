import { supabase } from './supabase';

export interface Notification {
  id: string;
  recipient_id: string | null;
  recipient_role: 'admin' | 'user';
  type: string;
  title: string;
  message?: string;
  metadata?: Record<string, any>;
  read_at?: string | null;
  created_at: string;
}

export const notificationsService = {
  // Current user (recipient_role = user) notifications
  async getUserNotifications(limit: number = 50): Promise<{ data: Notification[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_role', 'user')
        .order('created_at', { ascending: false })
        .limit(limit);

      return { data: data as Notification[] | null, error };
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return { data: null, error };
    }
  },

  async getUserUnreadCount(): Promise<number> {
    try {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_role', 'user')
        .is('read_at', null);

      return count || 0;
    } catch (error) {
      console.error('Error counting user notifications:', error);
      return 0;
    }
  },

  // Admin-wide notifications (recipient_id is null, recipient_role = admin)
  async getAdminNotifications(limit: number = 50): Promise<{ data: Notification[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_role', 'admin')
        .order('created_at', { ascending: false })
        .limit(limit);

      return { data: data as Notification[] | null, error };
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
      return { data: null, error };
    }
  },

  async getAdminUnreadCount(): Promise<number> {
    try {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_role', 'admin')
        .is('read_at', null);

      return count || 0;
    } catch (error) {
      console.error('Error counting admin notifications:', error);
      return 0;
    }
  },

  // Mark as read
  async markAsRead(notificationId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      return { error };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { error };
    }
  },

  async markAllAsRead(role: 'admin' | 'user'): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('recipient_role', role)
        .is('read_at', null);

      return { error };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return { error };
    }
  },

  // Create admin notification (for backoffice usage; RLS allows admins)
  async createAdminNotification(payload: Omit<Notification, 'id' | 'created_at' | 'read_at'>): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          ...payload,
          recipient_role: 'admin',
          recipient_id: null,
          metadata: payload.metadata || {},
        });

      return { error };
    } catch (error) {
      console.error('Error creating admin notification:', error);
      return { error };
    }
  },

  // Realtime listener
  listen(cb: (n: Notification) => void) {
    const channel = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          cb(payload.new as Notification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};