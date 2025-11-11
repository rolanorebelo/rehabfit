import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, ArrowLeft, Eye, EyeOff, Mail, Lock, Brain, Shield, Zap } from "lucide-react";
import { toast } from "react-toastify";
import { useGoogleLogin } from '@react-oauth/google';
import API from "../api/axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        // Get user info from Google using the access token
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${response.access_token}`
          }
        });
        
        const userInfo = await userInfoResponse.json();
        
        // Send the access token to our backend
        const result = await API.post('/auth/google', {
          token: response.access_token,
          email: userInfo.email,
          name: userInfo.name
        });

        if (result.data && result.data.token) {
          localStorage.setItem('token', result.data.token);
          toast.success("Welcome back! Let's continue your recovery journey.");
          navigate('/dashboard');
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        console.error('Google login error:', error);
        toast.error(error.response?.data?.message || 'Google login failed');
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      toast.error('Google login failed');
    }
  });

  const handleGoogleSignIn = () => {
    googleLogin();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await API.post('/auth/login', { email, password });
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        toast.success("Welcome back! Ready to continue your recovery?");
        navigate("/dashboard");
      } else {
        toast.error("Invalid credentials or server error.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-400/5 to-blue-400/5 rounded-full blur-3xl"></div>
      </div>

      {/* Left side - Features showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center p-12">
        <div className="max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <div className="relative">
              <Activity className="h-8 w-8 text-emerald-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              RehabFit
            </span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-100 mb-6">
            Welcome Back to Your
            <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent"> Recovery Journey</span>
          </h1>
          
          <p className="text-lg text-gray-300 mb-8">
            Continue tracking your progress and get personalized AI-powered recovery recommendations.
          </p>

          <div className="space-y-6">
            {[
              {
                icon: Brain,
                title: "AI-Powered Insights",
                description: "Get intelligent recommendations based on your progress",
                color: "from-blue-500 to-indigo-500"
              },
              {
                icon: Shield,
                title: "Secure & Private",
                description: "Your health data is encrypted and protected",
                color: "from-emerald-500 to-teal-500"
              },
              {
                icon: Zap,
                title: "Real-time Support",
                description: "24/7 AI assistant ready to help with your recovery",
                color: "from-purple-500 to-pink-500"
              }
            ].map(({ icon: Icon, title, description, color }, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-100 mb-1">{title}</h3>
                  <p className="text-gray-300 text-sm">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <Link
          to="/"
          className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-sm font-medium text-gray-400 hover:text-gray-200 bg-gray-800/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm transition-all"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>

        <div className="w-full max-w-md">
          <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Activity className="h-8 w-8 text-emerald-400" />
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                  RehabFit
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-100 mb-2">Welcome Back</h2>
              <p className="text-gray-300">Continue your recovery journey</p>
            </div>

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

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-700/50 backdrop-blur-sm text-gray-100 placeholder-gray-400"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-600 rounded bg-gray-700"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-emerald-400 hover:text-emerald-300">
                    Forgot password?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Sign In to Dashboard"
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 border-2 border-gray-600 hover:border-gray-500 bg-gray-700/50 hover:bg-gray-700 py-3 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md text-gray-200"
              >
                <img 
                  src="https://www.google.com/favicon.ico" 
                  alt="Google" 
                  className="w-5 h-5"
                />
                Sign in with Google
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-300">
                Don't have an account?{" "}
                <Link 
                  to="/register" 
                  className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Start your recovery journey
                </Link>
              </p>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>Secure Login</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              <span>Privacy Protected</span>
            </div>
            <div className="flex items-center gap-1">
              <Brain className="h-3 w-3" />
              <span>AI Powered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}