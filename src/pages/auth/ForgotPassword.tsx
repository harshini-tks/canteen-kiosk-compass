
import React from "react";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

const ForgotPassword = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-canteen-primary">Canteen Billing System</h1>
        <p className="text-gray-600">Recover your password</p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
};

export default ForgotPassword;
