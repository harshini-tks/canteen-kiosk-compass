
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export type UserRole = "admin" | "cashier" | "customer";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

// Mock user data for demonstration when Supabase auth fails
const MOCK_USERS = [
  {
    id: "3",
    name: "Customer User",
    email: "customer@canteen.com",
    password: "customer123",
    role: "customer" as UserRole,
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to clean up auth state
const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('canteen_user');
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session?.user) {
          // When user signs in, create our app user object
          setUser({
            id: session.user.id,
            name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            role: "customer" // Default role
          });
        } else {
          setUser(null);
        }
        
        // Check for sign in and sign out events to provide feedback
        if (event === 'SIGNED_IN') {
          toast.success("Login successful!");
        } else if (event === 'SIGNED_OUT') {
          toast.success("Logged out successfully");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: "customer" // Default role
        });
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Clean up existing state
      cleanupAuthState();
      
      // Attempt sign out first to avoid existing session issues
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        // Fallback to mock users if Supabase fails in development
        const mockUser = MOCK_USERS.find(
          (u) => u.email === email && u.password === password
        );
        
        if (mockUser) {
          // Remove password before saving
          const { password: _, ...userWithoutPassword } = mockUser;
          setUser(userWithoutPassword);
          localStorage.setItem("canteen_user", JSON.stringify(userWithoutPassword));
          navigate("/customer");
          toast.success("Login successful using mock data!");
        } else {
          throw error;
        }
      } else if (data.user) {
        navigate("/customer");
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please try again.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      // Clean up existing state
      cleanupAuthState();
      
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });
      
      if (error) throw error;
      
      if (data.user) {
        toast.success("Account created successfully! Please verify your email if required.");
        
        // Supabase may require email verification - check if session exists
        if (data.session) {
          navigate("/customer");
        } else {
          navigate("/login");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Signup failed. Please try again.");
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clean up auth state
      cleanupAuthState();
      
      // Attempt global sign out
      await supabase.auth.signOut({ scope: 'global' });
      
      setUser(null);
      setSession(null);
      navigate("/welcome");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  const forgotPassword = async (email: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) throw error;
      
      toast.success("Password reset link sent to your email");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset link. Please try again.");
      console.error("Forgot password error:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string) => {
    setLoading(true);
    try {
      // In a real Supabase app, this would use updateUser instead
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) throw error;
      
      toast.success("Password reset successfully");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Password reset failed. Please try again.");
      console.error("Reset password error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        login,
        signup,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
