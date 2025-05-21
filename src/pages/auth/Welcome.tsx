
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, LogIn, UserPlus, Mail, User } from "lucide-react";
import { Card } from "@/components/ui/card";

const Welcome = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center p-4">
      <div className="text-center mb-8">
        <div className="mx-auto w-24 h-24 bg-canteen-primary rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl text-white font-bold">CC</span>
        </div>
        <h1 className="text-3xl font-bold text-canteen-primary">Canteen Connect</h1>
        <p className="text-gray-600 mt-2">Order delicious food from your campus canteen</p>
      </div>

      <Card className="max-w-md mx-auto w-full p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-center">Welcome</h2>
          <p className="text-gray-500 text-center text-sm">Choose how you want to continue</p>
          
          <div className="pt-4 space-y-3">
            <Link to="/login">
              <Button variant="outline" className="w-full flex items-center justify-between" size="lg">
                <div className="flex items-center">
                  <LogIn className="mr-2 h-5 w-5" />
                  <span>Login with Email</span>
                </div>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            
            <Link to="/signup">
              <Button variant="outline" className="w-full flex items-center justify-between" size="lg">
                <div className="flex items-center">
                  <UserPlus className="mr-2 h-5 w-5" />
                  <span>Create an Account</span>
                </div>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            
            <Button variant="outline" className="w-full flex items-center justify-between" size="lg">
              <div className="flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                <span>Continue with OTP</span>
              </div>
              <ArrowRight className="h-5 w-5" />
            </Button>
            
            <Link to="/customer">
              <Button variant="outline" className="w-full flex items-center justify-between" size="lg">
                <div className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  <span>Continue as Guest</span>
                </div>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </Card>
      
      <div className="mt-8 text-center text-gray-600 text-sm">
        <p>Demo accounts:</p>
        <p>Admin: admin@canteen.com / admin123</p>
        <p>Cashier: cashier@canteen.com / cashier123</p>
        <p>Customer: customer@canteen.com / customer123</p>
      </div>
    </div>
  );
};

export default Welcome;
