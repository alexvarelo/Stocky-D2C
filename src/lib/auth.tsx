import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  username?: string;
  full_name?: string;
  email?: string;
  bio?: string;
  website?: string | null;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profileLoading: boolean;
  userProfile: UserProfile | null;
  signUp: (_email: string, _password: string, _fullName: string, _username: string) => Promise<{ error: unknown }>;
  signIn: (_email: string, _password: string) => Promise<{ error: unknown }>;
  signOut: () => Promise<void>;
  refetchUserProfile: () => Promise<void>;
  resetPassword: (_email: string) => Promise<{ error: unknown }>;
  updatePassword: (_newPassword: string) => Promise<{ error: unknown }>;
  signInWithGoogle: () => Promise<{ error: unknown }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { toast } = useToast();

  // Which user's profile is already loaded. Supabase re-fires auth events on token refresh and
  // when the tab regains focus; those refetch quietly instead of putting the app back into a
  // loading state, which would unmount the current page and lose its state and scroll position.
  const loadedProfileFor = useRef<string | null>(null);

  // Fetch user profile from public.users
  const fetchUserProfile = async (userId: string) => {
    const quiet = loadedProfileFor.current === userId;
    if (!quiet) setProfileLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('id, username, full_name, email, avatar_url, bio, website')
      .eq('id', userId)
      .single();
    if (!error && data) {
      setUserProfile(data);
      loadedProfileFor.current = userId;
    } else if (!quiet) {
      // A failed background refresh keeps the profile we already have.
      setUserProfile(null);
    }
    setProfileLoading(false);
  };

  const clearProfile = () => {
    loadedProfileFor.current = null;
    setUserProfile(null);
    setProfileLoading(false);
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user?.id) {
          fetchUserProfile(session.user.id);
        } else {
          clearProfile();
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.id) {
        fetchUserProfile(session.user.id);
      } else {
        clearProfile();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, username: string) => {
    const redirectUrl = `${window.location.origin}`;

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            username: username
          }
        }
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // Create user profile in public.users table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: email,
              full_name: fullName,
              username: username,
            },
          ]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          toast({
            title: 'Account Created with Warning',
            description: 'Your account was created, but there was an issue setting up your profile. Please contact support.',
            variant: 'default',
          });
          return { error: profileError };
        }
      }

      // Show comprehensive success message
      toast({
        title: 'Check Your Email',
        description: (
          <div className="space-y-1">
            <p>We've sent a confirmation email to <span className="font-semibold">{email}</span>.</p>
            <p>Please check your inbox and click the verification link to activate your account.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Can't find the email? Check your spam folder or request a new verification link.
            </p>
          </div>
        ),
        variant: 'default',
        duration: 15000, // Show for 15 seconds
        className: 'bg-background text-foreground border border-border',
      });

      return { data, error: null };
    } catch (error) {
      console.error('Unexpected error during signup:', error);
      toast({
        title: 'Unexpected Error',
        description: 'An unexpected error occurred during signup. Please try again.',
        variant: 'destructive',
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const refetchUserProfile = async () => {
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast({
        title: "Couldn't send reset email",
        description: error.message,
        variant: "destructive",
      });
    }

    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast({
        title: "Couldn't update password",
        description: error.message,
        variant: "destructive",
      });
    }

    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      toast({
        title: "Couldn't sign in with Google",
        description: error.message,
        variant: "destructive",
      });
    }

    return { error };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      profileLoading,
      userProfile,
      signUp,
      signIn,
      signOut,
      refetchUserProfile,
      resetPassword,
      updatePassword,
      signInWithGoogle,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}