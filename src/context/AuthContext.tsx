
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export type UserRole = "admin" | "cashier" | "customer";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

// Mock user data for demonstration
const MOCK_USERS = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@canteen.com",
    password: "admin123",
    role: "admin" as UserRole,
  },
  {
    id: "2",
    name: "Cashier User",
    email: "cashier@canteen.com",
    password: "cashier123",
    role: "cashier" as UserRole,
  },
  {
    id: "3",
    name: "Customer User",
    email: "customer@canteen.com",
    password: "customer123",
    role: "customer" as UserRole,
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is logged in
    const savedUser = localStorage.getItem("canteen_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API request delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Find user in mock data
      const foundUser = MOCK_USERS.find(
        (u) => u.email === email && u.password === password
      );
      
      if (foundUser) {
        // Remove password before saving user data
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem("canteen_user", JSON.stringify(userWithoutPassword));
        
        // Redirect based on role
        if (foundUser.role === "admin") {
          navigate("/admin");
        } else if (foundUser.role === "cashier") {
          navigate("/cashier");
        } else {
          navigate("/customer");
        }
        
        toast.success("Login successful!");
      } else {
        toast.error("Invalid email or password");
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API request delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Check if email already exists
      if (MOCK_USERS.some((u) => u.email === email)) {
        toast.error("Email already in use");
        setLoading(false);
        return;
      }
      
      // Create new user (in a real app, this would be a backend call)
      const newUser = {
        id: `${MOCK_USERS.length + 1}`,
        name,
        email,
        role: "customer" as UserRole,
      };
      
      // In a real app, we would save this to a database
      setUser(newUser);
      localStorage.setItem("canteen_user", JSON.stringify(newUser));
      
      navigate("/customer");
      toast.success("Account created successfully!");
    } catch (error) {
      toast.error("Signup failed. Please try again.");
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("canteen_user");
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const forgotPassword = async (email: string) => {
    setLoading(true);
    try {
      // Simulate API request delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Check if email exists
      const userExists = MOCK_USERS.some((u) => u.email === email);
      
      if (userExists) {
        toast.success("Password reset link sent to your email");
      } else {
        toast.error("Email not found");
      }
    } catch (error) {
      toast.error("Failed to send reset link. Please try again.");
      console.error("Forgot password error:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API request delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // In a real app, validate token and update password
      toast.success("Password reset successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Password reset failed. Please try again.");
      console.error("Reset password error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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
