import { supabase } from './supabase';
import { User, UserProfile } from '../types';

export interface UserAccount {
  id: string;
  email: string;
  role: 'buyer' | 'admin';
  status: 'active' | 'suspended' | 'deactivated';
  profile: UserProfile;
  created_at: string;
  last_sign_in?: string;
  suspension_reason?: string;
  suspended_until?: string;
  activity_summary?: {
    total_orders: number;
    total_spent: number;
    last_order_date?: string;
    total_products?: number; // For sellers
  };
}

export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  details: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface SuspensionLog {
  id: string;
  user_id: string;
  admin_id: string;
  action: 'suspend' | 'unsuspend' | 'deactivate' | 'reactivate';
  reason: string;
  suspended_until?: string;
  created_at: string;
}

export const userManagementService = {
  // Get all users with their profiles and activity summary
  async getAllUsers(filters?: {
    role?: 'buyer' | 'admin';
    status?: 'active' | 'suspended' | 'deactivated';
    search?: string;
  }): Promise<{ data: UserAccount[] | null; error: any }> {
    try {
      let query = supabase
        .from('user_profiles')
        .select(`
          *,
          user:auth.users (
            id,
            email,
            created_at,
            last_sign_in_at
          )
        `);

      if (filters?.role) {
        query = query.eq('role', filters.role);
      }

      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`);
      }

      const { data: profiles, error } = await query;

      if (error) throw error;

      // Map profiles to UserAccount format
      const users: UserAccount[] = await Promise.all(
        (profiles || []).map(async (profile: any) => {
          // Get activity summary
          const activitySummary = await this.getUserActivitySummary(profile.user_id);
          
          return {
            id: profile.user_id,
            email: profile.user?.email || '',
            role: profile.role,
            status: profile.status || 'active',
            profile: profile,
            created_at: profile.user?.created_at || profile.created_at,
            last_sign_in: profile.user?.last_sign_in_at,
            suspension_reason: profile.suspension_reason,
            suspended_until: profile.suspended_until,
            activity_summary: activitySummary,
          };
        })
      );

      // Filter by status if provided
      let filteredUsers = users;
      if (filters?.status) {
        filteredUsers = users.filter(user => user.status === filters.status);
      }

      return { data: filteredUsers, error: null };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { data: null, error };
    }
  },

  // Get user activity summary
  async getUserActivitySummary(userId: string): Promise<UserAccount['activity_summary']> {
    try {
      // Get order statistics
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .eq('buyer_id', userId);

      const totalOrders = orders?.length || 0;
      const totalSpent = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const lastOrderDate = orders && orders.length > 0
        ? orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
        : undefined;

      // For sellers, get product count
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', userId);

      return {
        total_orders: totalOrders,
        total_spent: totalSpent,
        last_order_date: lastOrderDate,
        total_products: productCount || undefined,
      };
    } catch (error) {
      console.error('Error fetching user activity summary:', error);
      return {
        total_orders: 0,
        total_spent: 0,
      };
    }
  },

  // Suspend user
  async suspendUser(
    userId: string,
    adminId: string,
    reason: string,
    suspendedUntil?: Date
  ): Promise<{ error: any }> {
    try {
      // Update user profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          status: 'suspended',
          suspension_reason: reason,
          suspended_until: suspendedUntil?.toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Log the suspension
      await this.logUserAction(userId, adminId, 'suspend', reason, suspendedUntil?.toISOString());

      // Note: In a real application, you would need to implement a backend function
      // to handle user suspension in Supabase Auth. For now, we'll just track it
      // in the user_profiles table
      // const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
      //   // Supabase admin API would handle suspension
      // });

      return { error: null };
    } catch (error) {
      console.error('Error suspending user:', error);
      return { error };
    }
  },

  // Unsuspend user
  async unsuspendUser(userId: string, adminId: string): Promise<{ error: any }> {
    try {
      // Update user profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          status: 'active',
          suspension_reason: null,
          suspended_until: null,
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Log the action
      await this.logUserAction(userId, adminId, 'unsuspend', 'User unsuspended');

      // Note: In a real application, you would need to implement a backend function
      // to handle user unsuspension in Supabase Auth

      return { error: null };
    } catch (error) {
      console.error('Error unsuspending user:', error);
      return { error };
    }
  },

  // Deactivate user (permanent)
  async deactivateUser(userId: string, adminId: string, reason: string): Promise<{ error: any }> {
    try {
      // Update user profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          status: 'deactivated',
          suspension_reason: reason,
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Log the action
      await this.logUserAction(userId, adminId, 'deactivate', reason);

      // Note: In a real application, you would need to implement a backend function
      // to handle permanent user deactivation in Supabase Auth

      return { error: null };
    } catch (error) {
      console.error('Error deactivating user:', error);
      return { error };
    }
  },

  // Reactivate user
  async reactivateUser(userId: string, adminId: string): Promise<{ error: any }> {
    try {
      // Update user profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          status: 'active',
          suspension_reason: null,
          suspended_until: null,
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Log the action
      await this.logUserAction(userId, adminId, 'reactivate', 'User reactivated');

      // Note: In a real application, you would need to implement a backend function
      // to handle user reactivation in Supabase Auth

      return { error: null };
    } catch (error) {
      console.error('Error reactivating user:', error);
      return { error };
    }
  },

  // Log user management action
  async logUserAction(
    userId: string,
    adminId: string,
    action: SuspensionLog['action'],
    reason: string,
    suspendedUntil?: string
  ): Promise<void> {
    try {
      await supabase
        .from('suspension_logs')
        .insert({
          user_id: userId,
          admin_id: adminId,
          action,
          reason,
          suspended_until: suspendedUntil,
        });
    } catch (error) {
      console.error('Error logging user action:', error);
    }
  },

  // Track user activity
  async trackUserActivity(
    userId: string,
    action: string,
    details: any,
    request?: { ip?: string; userAgent?: string }
  ): Promise<void> {
    try {
      await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          action,
          details,
          ip_address: request?.ip,
          user_agent: request?.userAgent,
        });
    } catch (error) {
      console.error('Error tracking user activity:', error);
    }
  },

  // Get user activity logs
  async getUserActivityLogs(
    userId: string,
    limit: number = 50
  ): Promise<{ data: UserActivity[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      return { data: data as UserActivity[] | null, error };
    } catch (error) {
      console.error('Error fetching user activity logs:', error);
      return { data: null, error };
    }
  },

  // Get suspension logs
  async getSuspensionLogs(
    userId?: string
  ): Promise<{ data: SuspensionLog[] | null; error: any }> {
    try {
      let query = supabase
        .from('suspension_logs')
        .select(`
          *,
          user:user_profiles!user_id (
            full_name,
            email
          ),
          admin:user_profiles!admin_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      return { data: data as any[] | null, error };
    } catch (error) {
      console.error('Error fetching suspension logs:', error);
      return { data: null, error };
    }
  },

  // Check if user is currently suspended
  async checkUserSuspension(userId: string): Promise<{
    isSuspended: boolean;
    reason?: string;
    until?: string;
  }> {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('status, suspension_reason, suspended_until')
        .eq('user_id', userId)
        .single();

      if (!profile) {
        return { isSuspended: false };
      }

      // Check if suspension has expired
      if (profile.status === 'suspended' && profile.suspended_until) {
        const suspendedUntil = new Date(profile.suspended_until);
        if (suspendedUntil < new Date()) {
          // Suspension has expired, unsuspend the user
          await this.unsuspendUser(userId, 'system');
          return { isSuspended: false };
        }
      }

      return {
        isSuspended: profile.status === 'suspended',
        reason: profile.suspension_reason,
        until: profile.suspended_until,
      };
    } catch (error) {
      console.error('Error checking user suspension:', error);
      return { isSuspended: false };
    }
  },

  // Get user statistics
  async getUserStatistics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    suspendedUsers: number;
    deactivatedUsers: number;
    newUsersThisMonth: number;
  }> {
    try {
      const { data: users } = await this.getAllUsers();
      
      if (!users) {
        return {
          totalUsers: 0,
          activeUsers: 0,
          suspendedUsers: 0,
          deactivatedUsers: 0,
          newUsersThisMonth: 0,
        };
      }

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      return {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status === 'active').length,
        suspendedUsers: users.filter(u => u.status === 'suspended').length,
        deactivatedUsers: users.filter(u => u.status === 'deactivated').length,
        newUsersThisMonth: users.filter(u => new Date(u.created_at) >= startOfMonth).length,
      };
    } catch (error) {
      console.error('Error getting user statistics:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        suspendedUsers: 0,
        deactivatedUsers: 0,
        newUsersThisMonth: 0,
      };
    }
  },

  // Bulk user actions
  async bulkSuspendUsers(
    userIds: string[],
    adminId: string,
    reason: string,
    suspendedUntil?: Date
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const userId of userIds) {
      const { error } = await this.suspendUser(userId, adminId, reason, suspendedUntil);
      if (error) {
        failed++;
        errors.push(`Failed to suspend user ${userId}: ${error.message}`);
      } else {
        success++;
      }
    }

    return { success, failed, errors };
  },

  // Export user data (for GDPR compliance)
  async exportUserData(userId: string): Promise<{ data: any; error: any }> {
    try {
      const userData: any = {};

      // Get user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      userData.profile = profile;

      // Get orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('buyer_id', userId);
      userData.orders = orders;

      // Get service requests
      const { data: serviceRequests } = await supabase
        .from('service_requests')
        .select('*')
        .eq('user_id', userId);
      userData.serviceRequests = serviceRequests;

      // Get warranties
      const { data: warranties } = await supabase
        .from('warranties')
        .select('*')
        .eq('buyer_id', userId);
      userData.warranties = warranties;

      // Get activity logs
      const { data: activities } = await this.getUserActivityLogs(userId, 1000);
      userData.activities = activities;

      return { data: userData, error: null };
    } catch (error) {
      console.error('Error exporting user data:', error);
      return { data: null, error };
    }
  },
};