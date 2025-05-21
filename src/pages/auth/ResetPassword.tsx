
import React from "react";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

const ResetPassword = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-canteen-primary">Canteen Billing System</h1>
        <p className="text-gray-600">Set your new password</p>
      </div>
      <ResetPasswordForm />
    </div>
  );
};

export default ResetPassword;
