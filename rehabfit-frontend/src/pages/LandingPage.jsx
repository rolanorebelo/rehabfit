

import { Link } from "react-router-dom";
import { ArrowRight, Activity, Award, BarChart3, Brain, Heart, Shield, Users, Zap, CheckCircle, Star } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Activity className="h-8 w-8 text-emerald-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              RehabFit
            </span>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
              AI Powered
            </span>
          </div>
          <nav className="hidden md:flex gap-8">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
              How It Works
            </a>
            <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
              Success Stories
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-gray-600 hover:text-emerald-600 font-medium transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="text-sm bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-2 rounded-full font-medium shadow-lg hover:shadow-xl transition-all">
              Start Recovery
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          <div className="relative container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
              <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border rounded-full px-4 py-2 shadow-lg">
                <Brain className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">AI-Powered Recovery Platform</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Recover Faster
                </span>
                <br />
                <span className="text-gray-900">Without Breaking Bank</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl leading-relaxed">
                Skip expensive healthcare visits. Get personalized AI-powered recovery plans, track your progress, and access expert guidance for any gym or physical activity injury.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link to="/register" className="group bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl transition-all flex items-center justify-center">
                  Start Your Recovery Journey
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login" className="border-2 border-gray-300 hover:border-emerald-500 text-gray-700 hover:text-emerald-600 px-8 py-4 rounded-full text-lg font-semibold transition-all flex items-center justify-center bg-white/80 backdrop-blur-sm">
                  I'm Already Recovering
                </Link>
              </div>
              
              <div className="flex items-center gap-8 text-sm text-gray-600 pt-8">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>No Healthcare Costs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>AI-Powered Plans</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { number: "10,000+", label: "Users Recovered", icon: Users },
                { number: "95%", label: "Success Rate", icon: Award },
                { number: "$0", label: "Healthcare Costs", icon: Heart },
                { number: "24/7", label: "AI Support", icon: Brain }
              ].map(({ number, label, icon: Icon }, idx) => (
                <div key={idx} className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Icon className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{number}</div>
                  <div className="text-sm text-gray-600 font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center space-y-4 mb-16">
              <div className="inline-block rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
                Revolutionary Features
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
                Everything You Need for
                <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent"> Smart Recovery</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Advanced AI technology meets personalized healthcare to give you the fastest, most effective recovery experience.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {[
                {
                  Icon: Brain,
                  title: "AI-Powered Diagnosis",
                  description: "Get instant analysis of your injury with our advanced AI that understands thousands of injury patterns and recovery protocols.",
                  gradient: "from-emerald-500 to-teal-500"
                },
                {
                  Icon: BarChart3,
                  title: "Smart Progress Tracking",
                  description: "Monitor your recovery with intelligent metrics that adapt to your healing progress and provide actionable insights.",
                  gradient: "from-blue-500 to-indigo-500"
                },
                {
                  Icon: Zap,
                  title: "Personalized Video Library",
                  description: "Access curated exercise videos tailored to your specific injury, fitness level, and recovery stage.",
                  gradient: "from-purple-500 to-pink-500"
                },
                {
                  Icon: Shield,
                  title: "24/7 AI Assistant",
                  description: "Get instant answers to your recovery questions with our intelligent chatbot trained on medical knowledge.",
                  gradient: "from-orange-500 to-red-500"
                },
                {
                  Icon: Heart,
                  title: "Holistic Recovery Plans",
                  description: "Comprehensive plans covering exercise, nutrition, rest, and mental wellness for complete recovery.",
                  gradient: "from-teal-500 to-cyan-500"
                },
                {
                  Icon: Award,
                  title: "Expert-Validated Content",
                  description: "All recommendations are backed by sports medicine experts and physiotherapy best practices.",
                  gradient: "from-indigo-500 to-purple-500"
                }
              ].map(({ Icon, title, description, gradient }, idx) => (
                <div key={idx} className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-emerald-200">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-blue-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className={`w-14 h-14 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
                    <p className="text-gray-600 leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
                Your Recovery Journey in
                <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent"> 3 Simple Steps</span>
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Describe Your Injury",
                  description: "Tell our AI about your injury, pain levels, and recovery goals. The more details, the better your personalized plan."
                },
                {
                  step: "02",
                  title: "Get Your AI Plan",
                  description: "Receive a comprehensive recovery plan with exercises, nutrition tips, and progress milestones tailored just for you."
                },
                {
                  step: "03",
                  title: "Track & Recover",
                  description: "Follow your plan, track progress, and get real-time adjustments from our AI as you heal and get stronger."
                }
              ].map(({ step, title, description }, idx) => (
                <div key={idx} className="relative text-center">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <span className="text-2xl font-bold text-white">{step}</span>
                    </div>
                    {idx < 2 && (
                      <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-emerald-200 to-blue-200"></div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
                  <p className="text-gray-600 leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-gradient-to-br from-emerald-50 to-blue-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
                Real People, Real
                <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent"> Recovery Stories</span>
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Johnson",
                  role: "Marathon Runner",
                  injury: "Knee Injury",
                  testimonial: "RehabFit saved me thousands in physical therapy costs. The AI recommendations were spot-on and I'm back to running marathons!",
                  rating: 5,
                  recovery: "8 weeks"
                },
                {
                  name: "Mike Chen",
                  role: "CrossFit Athlete",
                  injury: "Shoulder Injury",
                  testimonial: "The personalized video library was incredible. Every exercise was perfectly suited to my injury and fitness level.",
                  rating: 5,
                  recovery: "6 weeks"
                },
                {
                  name: "Emma Davis",
                  role: "Yoga Instructor",
                  injury: "Back Pain",
                  testimonial: "24/7 AI support meant I always had answers to my recovery questions. The progress tracking kept me motivated throughout.",
                  rating: 5,
                  recovery: "10 weeks"
                }
              ].map(({ name, role, injury, testimonial, rating, recovery }, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center mb-4">
                    {[...Array(rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 mb-6 leading-relaxed">"{testimonial}"</blockquote>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{name}</div>
                      <div className="text-sm text-gray-600">{role}</div>
                      <div className="text-sm text-emerald-600 font-medium">{injury}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Recovered in</div>
                      <div className="font-bold text-emerald-600">{recovery}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
          <div className="container mx-auto px-4 md:px-6 text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold">
              Ready to Start Your Recovery Journey?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Join thousands who've recovered faster and cheaper with AI-powered personalized plans.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center">
                Start Free Recovery Plan
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/login" className="border-2 border-white/30 hover:border-white text-white hover:bg-white/10 px-8 py-4 rounded-full font-semibold text-lg transition-all">
                Sign In to Continue
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-emerald-400" />
              <span className="text-xl font-bold">RehabFit</span>
              <span className="text-xs bg-emerald-500 text-white px-2 py-1 rounded-full">AI Powered</span>
            </div>
            <p className="text-sm text-gray-400">© 2025 RehabFit. Revolutionizing recovery with AI.</p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-emerald-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}