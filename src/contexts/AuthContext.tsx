import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { User, UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Check active session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(session);
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
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
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('*');
      
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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

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

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const updateProfile = async (profile: Partial<UserProfile>) => {
    if (!user) return { error: 'No user logged in' };

    const { error } = await supabase
      .from('user_profiles')
      .update(profile)
      .eq('user_id', user.id);

    if (!error) {
      await fetchUserProfile(user.id);
    }

    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};