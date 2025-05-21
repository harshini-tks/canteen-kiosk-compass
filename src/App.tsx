
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CanteenProvider } from "./context/CanteenContext";

// Auth Pages
import Welcome from "./pages/auth/Welcome";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Dashboard Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import CashierDashboard from "./pages/cashier/CashierDashboard";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Route guard component
const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles: string[] }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/welcome" />;
  }
  
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === "admin") {
      return <Navigate to="/admin" />;
    } else if (user.role === "cashier") {
      return <Navigate to="/cashier" />;
    } else {
      return <Navigate to="/customer" />;
    }
  }
  
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <CanteenProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Redirect root to welcome */}
              <Route path="/" element={<Navigate to="/welcome" />} />
              
              {/* Auth routes */}
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              
              {/* Admin routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Cashier routes */}
              <Route 
                path="/cashier" 
                element={
                  <ProtectedRoute allowedRoles={["cashier"]}>
                    <CashierDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Customer routes */}
              <Route 
                path="/customer" 
                element={<CustomerDashboard />}
              />
              
              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </CanteenProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
