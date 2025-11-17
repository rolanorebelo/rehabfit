import { useState } from "react";
import { Link } from "react-router-dom";
import { Activity, ArrowLeft, Mail, Send } from "lucide-react";
import { toast } from "react-toastify";
import API from "../api/axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await API.post('/auth/forgot-password', { email });
      setIsSubmitted(true);
      toast.success("Password reset instructions sent!");
    } catch (error) {
      // Always show success message for security (don't reveal if email exists)
      setIsSubmitted(true);
      toast.success("If an account exists, you'll receive reset instructions.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      </div>

      <Link
        to="/login"
        className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-sm font-medium text-gray-400 hover:text-gray-200 bg-gray-800/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm transition-all z-10"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to login
      </Link>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Activity className="h-8 w-8 text-emerald-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                RehabFit
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-100 mb-2">Forgot Password?</h2>
            <p className="text-gray-300 text-sm">
              {isSubmitted 
                ? "Check your email for reset instructions" 
                : "Enter your email and we'll send you reset instructions"}
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-700/50 backdrop-blur-sm text-gray-100 placeholder-gray-400"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Send Reset Instructions
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                <Send className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-gray-200 font-medium mb-2">Email Sent!</p>
                <p className="text-gray-300 text-sm">
                  If an account exists with <strong>{email}</strong>, you'll receive password reset instructions shortly.
                </p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-gray-300 text-sm">
                  <strong className="text-gray-200">Note:</strong> For development, check the backend console logs for the reset token and link.
                </p>
              </div>

              <button
                onClick={() => setIsSubmitted(false)}
                className="w-full border-2 border-gray-600 hover:border-gray-500 bg-gray-700/50 hover:bg-gray-700 text-gray-200 py-3 rounded-xl font-medium transition-all duration-200"
              >
                Try Another Email
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-300 text-sm">
              Remember your password?{" "}
              <Link 
                to="/login" 
                className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
