import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { User, UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<{ error: any }>;
  retryConnection: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Utility function to handle network errors
const handleNetworkError = (error: any): string => {
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return 'Network connection error. Please check your internet connection and try again.';
  }
  if (error instanceof AuthError) {
    return error.message;
  }
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
};

// Retry utility with exponential backoff
const retryWithBackoff = async <T,>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.log(`Retry attempt ${i + 1}/${maxRetries} failed:`, error);
      
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Network: Online');
      setConnectionStatus('connecting');
      retryConnection();
    };

    const handleOffline = () => {
      console.log('📵 Network: Offline');
      setConnectionStatus('disconnected');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    if (!navigator.onLine) {
      setConnectionStatus('disconnected');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const retryConnection = async () => {
    try {
      setConnectionStatus('connecting');
      const { data: { session } } = await supabase.auth.getSession();
      setConnectionStatus('connected');
      console.log('✅ Successfully reconnected to Supabase');
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('❌ Failed to reconnect:', error);
      setConnectionStatus('disconnected');
    }
  };

  useEffect(() => {
    let mounted = true;

    // Check active session
    const initializeAuth = async () => {
      try {
        setConnectionStatus('connecting');
        
        const { data: { session }, error } = await retryWithBackoff(
          () => supabase.auth.getSession(),
          3,
          1000
        );
        
        if (error) throw error;
        
        if (mounted) {
          setSession(session);
          setConnectionStatus('connected');
          
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setConnectionStatus('disconnected');
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (mounted) {
        setSession(session);
        
        if (session?.user) {
          // Give Supabase a moment to propagate the session
          setTimeout(async () => {
            if (mounted) {
              await fetchUserProfile(session.user.id);
            }
          }, 100);
        } else {
          setUser(null);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Ensure we have a valid session before fetching profile
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession || currentSession.user.id !== userId) {
        console.error('No valid session for user:', userId);
        return;
      }

      // Don't use .eq('user_id', userId) because RLS policies already filter by auth.uid()
      // The policy "Users can view their own profile" uses auth.uid() = user_id
      const result = await retryWithBackoff(
        async () => await supabase
          .from('user_profiles')
          .select('*'),
        2,
        500
      );
      
      const { data: profiles, error } = result;
      
      const profile = profiles?.[0] || null;

      if (error) {
        console.error('Error fetching user profile:', error);
        // If profile doesn't exist yet, create it
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating new profile for user:', userId);
          // Note: This will fail with 403 until INSERT policy is added to the database
          const { data: newProfile, error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: userId,
              role: 'buyer',
            })
            .select()
            .single();
          
          if (insertError) {
            console.error('Failed to create profile:', insertError);
            console.log('You need to add an INSERT policy to your Supabase user_profiles table');
          } else if (newProfile) {
            setUser({
              id: userId,
              email: currentSession.user.email || '',
              role: newProfile.role || 'buyer',
              profile: newProfile,
              created_at: newProfile.created_at,
              updated_at: newProfile.updated_at,
            });
          }
        }
      } else if (profile) {
        setUser({
          id: userId,
          email: currentSession.user.email || '',
          role: profile.role || 'buyer',
          profile: profile,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        });
      }
    } catch (err) {
      console.error('Unexpected error in fetchUserProfile:', err);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setConnectionStatus('connecting');
      
      const { data, error } = await retryWithBackoff(
        () => supabase.auth.signUp({
          email,
          password,
        }),
        2,
        1000
      );
      
      if (error) throw error;
      
      setConnectionStatus('connected');

      if (!error && data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: data.user.id,
            role: 'buyer', // Default role
          });

        if (!profileError) {
          await fetchUserProfile(data.user.id);
        }
      }

      return { error: null };
    } catch (error) {
      setConnectionStatus('disconnected');
      return { error: { message: handleNetworkError(error) } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setConnectionStatus('connecting');
      
      const { error } = await retryWithBackoff(
        () => supabase.auth.signInWithPassword({
          email,
          password,
        }),
        2,
        1000
      );
      
      if (error) throw error;
      
      setConnectionStatus('connected');
      return { error: null };
    } catch (error) {
      setConnectionStatus('disconnected');
      return { error: { message: handleNetworkError(error) } };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfile = async (profile: Partial<UserProfile>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const result = await retryWithBackoff(
        async () => await supabase
          .from('user_profiles')
          .update(profile)
          .eq('user_id', user.id),
        2,
        1000
      );
      
      const { error } = result;

      if (!error) {
        await fetchUserProfile(user.id);
      }

      return { error };
    } catch (error) {
      return { error: { message: handleNetworkError(error) } };
    }
  };

  const value = {
    user,
    session,
    loading,
    connectionStatus,
    signUp,
    signIn,
    signOut,
    updateProfile,
    retryConnection,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};