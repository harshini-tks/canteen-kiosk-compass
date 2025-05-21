
import React from "react";
import LoginForm from "@/components/auth/LoginForm";

const Login = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-canteen-primary">Canteen Billing System</h1>
        <p className="text-gray-600">Welcome back! Please login to your account</p>
      </div>
      <LoginForm />
      <div className="mt-8 text-center text-gray-600 text-sm">
        <p>Demo accounts:</p>
        <p>Admin: admin@canteen.com / admin123</p>
        <p>Cashier: cashier@canteen.com / cashier123</p>
        <p>Customer: customer@canteen.com / customer123</p>
      </div>
    </div>
  );
};

export default Login;
