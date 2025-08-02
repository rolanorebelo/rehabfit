import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, ArrowLeft, Eye, EyeOff, Mail, Lock, User, Heart, Target, Check } from "lucide-react";
import { toast } from "react-toastify";
import API from "../api/axios";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    injuryType: "",
    fitnessGoal: "",
    age: "",
    weight: "",
    height: "",
    activityLevel: "",
    agreeTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateStep1 = () => {
    const { fullName, email, password, confirmPassword } = formData;
    if (!fullName || !email || !password || !confirmPassword) {
      toast.error("Please fill in all required fields");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return false;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const { injuryType, fitnessGoal, age, weight, height } = formData;
    if (!injuryType || !fitnessGoal || !age || !weight || !height) {
      toast.error("Please complete your health profile");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agreeTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await API.post('/auth/register', {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        injuryType: formData.injuryType,
        fitnessGoal: formData.fitnessGoal
      });
      toast.success("Welcome to RehabFit! Please sign in to start your recovery journey.");
      navigate("/login");
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        typeof error.response.data.message === "string" &&
        error.response.data.message.toLowerCase().includes("duplicate")
      ) {
        toast.error("A user with this email already exists.");
      } else {
        toast.error(error.response?.data?.message || "Registration failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const injuryTypes = [
    { value: "knee", label: "Knee Injury", emoji: "🦵" },
    { value: "shoulder", label: "Shoulder Injury", emoji: "💪" },
    { value: "back", label: "Back Pain", emoji: "🔗" },
    { value: "ankle", label: "Ankle Sprain", emoji: "🦶" },
    { value: "wrist", label: "Wrist Injury", emoji: "✋" },
    { value: "neck", label: "Neck Pain", emoji: "🤕" },
    { value: "hip", label: "Hip Injury", emoji: "🏃" },
    { value: "other", label: "Other", emoji: "❓" }
  ];

  const fitnessGoals = [
    { value: "recovery", label: "Full Recovery", emoji: "🎯" },
    { value: "strength", label: "Strength Building", emoji: "💪" },
    { value: "mobility", label: "Improved Mobility", emoji: "🤸" },
    { value: "pain-reduction", label: "Pain Reduction", emoji: "😌" },
    { value: "sports", label: "Return to Sports", emoji: "⚽" },
    { value: "daily-activities", label: "Daily Activities", emoji: "🚶" }
  ];

  const steps = [
    { number: 1, title: "Account Setup", description: "Basic information and login credentials" },
    { number: 2, title: "Health Profile", description: "Tell us about your injury and goals" },
    { number: 3, title: "Review & Start", description: "Confirm details and begin recovery" }
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-6xl mx-auto p-8 relative z-10">
        <Link
          to="/"
          className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm transition-all"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>

        <div className="flex flex-col items-center justify-center min-h-screen">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Activity className="h-8 w-8 text-emerald-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                RehabFit
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Start Your Recovery Journey</h1>
            <p className="text-gray-600">Join thousands who've recovered faster with AI-powered plans</p>
          </div>

          {/* Progress Steps */}
          <div className="w-full max-w-3xl mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                      currentStep >= step.number
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {currentStep > step.number ? <Check className="h-5 w-5" /> : step.number}
                    </div>
                    <div className="mt-2 text-center">
                      <div className="text-sm font-medium text-gray-900">{step.title}</div>
                      <div className="text-xs text-gray-500 max-w-24">{step.description}</div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.number ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Container */}
          <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Account Setup */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h2>
                    <p className="text-gray-600">Let's get you started with the basics</p>
                  </div>

                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white/70 backdrop-blur-sm"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white/70 backdrop-blur-sm"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white/70 backdrop-blur-sm"
                          placeholder="Create password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white/70 backdrop-blur-sm"
                          placeholder="Confirm password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Health Profile */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Health Profile</h2>
                    <p className="text-gray-600">Help us personalize your recovery plan</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      What type of injury are you recovering from?
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {injuryTypes.map((injury) => (
                        <button
                          key={injury.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, injuryType: injury.value }))}
                          className={`p-3 rounded-xl border-2 transition-all text-center ${
                            formData.injuryType === injury.value
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-600'
                          }`}
                        >
                          <div className="text-2xl mb-1">{injury.emoji}</div>
                          <div className="text-xs font-medium">{injury.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      What's your primary fitness goal?
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {fitnessGoals.map((goal) => (
                        <button
                          key={goal.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, fitnessGoal: goal.value }))}
                          className={`p-3 rounded-xl border-2 transition-all text-center ${
                            formData.fitnessGoal === goal.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-600'
                          }`}
                        >
                          <div className="text-2xl mb-1">{goal.emoji}</div>
                          <div className="text-xs font-medium">{goal.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                        Age
                      </label>
                      <input
                        id="age"
                        name="age"
                        type="number"
                        required
                        value={formData.age}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white/70 backdrop-blur-sm"
                        placeholder="25"
                      />
                    </div>

                    <div>
                      <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                        Weight (kg)
                      </label>
                      <input
                        id="weight"
                        name="weight"
                        type="number"
                        required
                        value={formData.weight}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white/70 backdrop-blur-sm"
                        placeholder="70"
                      />
                    </div>

                    <div>
                      <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
                        Height (cm)
                      </label>
                      <input
                        id="height"
                        name="height"
                        type="number"
                        required
                        value={formData.height}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white/70 backdrop-blur-sm"
                        placeholder="175"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700 mb-2">
                      Activity Level (Before Injury)
                    </label>
                    <select
                      id="activityLevel"
                      name="activityLevel"
                      value={formData.activityLevel}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white/70 backdrop-blur-sm"
                    >
                      <option value="">Select your activity level</option>
                      <option value="sedentary">Sedentary (Little to no exercise)</option>
                      <option value="light">Lightly Active (1-3 days/week)</option>
                      <option value="moderate">Moderately Active (3-5 days/week)</option>
                      <option value="active">Very Active (6-7 days/week)</option>
                      <option value="athlete">Athlete (Professional/Competitive)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Step 3: Review & Start */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Start!</h2>
                    <p className="text-gray-600">Review your information and begin your recovery journey</p>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6 border border-emerald-200">
                    <h3 className="font-semibold text-gray-900 mb-4">Your Recovery Profile</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">{formData.fullName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">{formData.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Age:</span>
                          <span className="font-medium">{formData.age} years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Weight:</span>
                          <span className="font-medium">{formData.weight} kg</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Injury:</span>
                          <span className="font-medium">
                            {injuryTypes.find(i => i.value === formData.injuryType)?.label}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Goal:</span>
                          <span className="font-medium">
                            {fitnessGoals.find(g => g.value === formData.fitnessGoal)?.label}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Height:</span>
                          <span className="font-medium">{formData.height} cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Activity Level:</span>
                          <span className="font-medium capitalize">{formData.activityLevel}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Heart className="h-6 w-6 text-blue-600 mt-1" />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• AI creates your personalized recovery plan</li>
                          <li>• Access to exercise videos tailored to your injury</li>
                          <li>• 24/7 AI assistant for recovery questions</li>
                          <li>• Track progress with smart analytics</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="agreeTerms"
                      name="agreeTerms"
                      type="checkbox"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-700">
                      I agree to the{" "}
                      <a href="#" className="text-emerald-600 hover:text-emerald-500 font-medium">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-emerald-600 hover:text-emerald-500 font-medium">
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 mt-6 border-t border-gray-200">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all"
                  >
                    Previous
                  </button>
                ) : (
                  <div></div>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading || !formData.agreeTerms}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Target className="h-5 w-5" />
                        Start Recovery Journey
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link 
                  to="/login" 
                  className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}