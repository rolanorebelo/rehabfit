import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../api/axios";
import ChatbotAssistant from "../components/ChatbotAssistant";
import ProgressTracker from "../components/ProgressTracker";
import { 
  Activity, 
  Brain, 
  Heart, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Target, 
  Award, 
  Zap,
  Moon,
  Sun,
  User,
  BarChart3,
  Video,
  MessageCircle,
  Settings,
  LogOut,
  CheckCircle,
  AlertTriangle,
  Clock,
  Flame,
  ArrowRight,
  Save,
  X 
} from "lucide-react";

// Dark mode toggle component
function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = localStorage.theme === "dark" ||
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDark = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
  };

  return (
    <button
      onClick={toggleDark}
      className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-yellow-500" />
      ) : (
        <Moon className="h-5 w-5 text-gray-600" />
      )}
    </button>
  );
}

const LOCAL_STORAGE_VIDEOS_KEY = "rehabfit-recommended-videos";
const SIDENAV = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "progress", label: "Progress", icon: TrendingUp },
  { key: "videos", label: "Videos", icon: Video },
  { key: "ai", label: "AI Assistant", icon: Brain },
  { key: "profile", label: "Profile", icon: User }
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function StatCard({ title, value, change, icon: Icon, trend, color = "emerald" }) {
  const colorClasses = {
    emerald: "from-emerald-500 to-emerald-600",
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    pink: "from-pink-500 to-pink-600"
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${colorClasses[color]} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-gray-500'
          }`}>
            {trend === 'up' && <TrendingUp className="h-4 w-4" />}
            {trend === 'down' && <TrendingDown className="h-4 w-4" />}
            {change}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [section, setSection] = useState("overview");
  const [recommendedVideos, setRecommendedVideos] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_VIDEOS_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [llmSummary, setLlmSummary] = useState([]);
  const [dietPlan, setDietPlan] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [injuryDate, setInjuryDate] = useState("");
  const [estimatedRecovery, setEstimatedRecovery] = useState("");
  const [recoveryPercentage, setRecoveryPercentage] = useState(0);

  // Enhanced stats
  const [dailyStreak, setDailyStreak] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [averagePainReduction, setAveragePainReduction] = useState(0);
  const [weeklyGoalProgress, setWeeklyGoalProgress] = useState(0);

  // Profile editing state
  const [profileForm, setProfileForm] = useState({
    name: "",
    injuryType: "",
    fitnessGoal: "",
    age: "",
    weight: "",
    height: "",
    activityLevel: "",
    injuryDescription: "",
    injuryDate: ""
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const fetchDashboardData = () => {
    API.get("/api/rag/dashboard")
      .then((res) => {
          console.log("Dashboard API response:", res.data); // <-- Add this line
        setEstimatedRecovery(res.data.estimatedRecovery || "N/A");
        setDietPlan(res.data.dietPlan || []);
        setLlmSummary(res.data.llmSummary || []);
        setProgressData(res.data.progressData || []);
        setRecoveryPercentage(res.data.recoveryPercentage || 0);

        // Add this line:
      setRecommendedVideos(res.data.videos || []);
        
        // Calculate enhanced stats
        calculateEnhancedStats(res.data.progressData || []);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load dashboard data.', { autoClose: 3000 });
      });
  };

  const calculateEnhancedStats = (data) => {
    if (data.length > 0) {
      setDailyStreak(Math.floor(Math.random() * 15) + 5);
      setTotalSessions(data.length);
      
      const firstEntry = data[0];
      const lastEntry = data[data.length - 1];
      if (firstEntry && lastEntry) {
        const reduction = ((firstEntry.painLevel - lastEntry.painLevel) / firstEntry.painLevel * 100);
        setAveragePainReduction(Math.max(0, Math.round(reduction)));
      }
      
      setWeeklyGoalProgress(Math.floor(Math.random() * 40) + 60);
    }
  };

  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const response = await API.put("/auth/profile", {
        name: profileForm.name,
        injuryType: profileForm.injuryType,
        fitnessGoal: profileForm.fitnessGoal,
        age: profileForm.age ? parseInt(profileForm.age) : null,
        weight: profileForm.weight ? parseFloat(profileForm.weight) : null,
        height: profileForm.height ? parseFloat(profileForm.height) : null,
        activityLevel: profileForm.activityLevel,
        injuryDescription: profileForm.injuryDescription
      });

      if (response.data && response.data.user) {
        setUser(response.data.user);
        setIsEditingProfile(false);
        toast.success("Profile updated successfully!");
        
        // Refresh dashboard data
        fetchDashboardData();
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form to current user data
    if (user) {
      setProfileForm({
        name: user.name || "",
        injuryType: user.injuryType || "",
        fitnessGoal: user.fitnessGoal || "",
        age: user.age ? user.age.toString() : "",
        weight: user.weight ? user.weight.toString() : "",
        height: user.height ? user.height.toString() : "",
        activityLevel: user.activityLevel || "",
        injuryDescription: user.injuryDescription || "",
        injuryDate: user.injuryDate || ""
      });
    }
    setIsEditingProfile(false);
  };

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_VIDEOS_KEY, JSON.stringify(recommendedVideos));
  }, [recommendedVideos]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    API.get("/auth/me")
      .then((res) => {
        setUser(res.data);
        setInjuryDate(res.data.createdAt ? res.data.createdAt.split("T")[0] : "2024-06-01");
        
        // Initialize profile form with user data
        setProfileForm({
          name: res.data.name || "",
          injuryType: res.data.injuryType || "",
          fitnessGoal: res.data.fitnessGoal || "",
          age: res.data.age ? res.data.age.toString() : "",
          weight: res.data.weight ? res.data.weight.toString() : "",
          height: res.data.height ? res.data.height.toString() : "",
          activityLevel: res.data.activityLevel || "",
          injuryDescription: res.data.injuryDescription || "",
          injuryDate: res.data.injuryDate || ""
        });
      })
      .catch((err) => {
        console.error(err);
        toast.error('Session expired, please login again.', { autoClose: 3000 });
        localStorage.removeItem("token");
        navigate("/login");
      });

    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.info("Logged out successfully.");
    navigate("/login");
  };

  const handleSectionChange = (key) => {
  setSection(key);
  if (key === "overview" || key === "videos") {
    fetchDashboardData();
  }
};

  const getDaysInRecovery = () => {
    if (!injuryDate) return 0;
    const start = new Date(injuryDate);
    const now = new Date();
    return Math.floor((now - start) / (1000 * 60 * 60 * 24));
  };

  const getRecoveryStatus = () => {
    if (recoveryPercentage >= 80) return { status: "Excellent", color: "emerald", icon: CheckCircle };
    if (recoveryPercentage >= 60) return { status: "Good", color: "blue", icon: TrendingUp };
    if (recoveryPercentage >= 40) return { status: "Fair", color: "orange", icon: Clock };
    return { status: "Needs Attention", color: "red", icon: AlertTriangle };
  };

  const recoveryStatus = getRecoveryStatus();

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors duration-300">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 w-full z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Activity className="h-8 w-8 text-emerald-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              RehabFit
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user?.name?.charAt(0) || "U"}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {getGreeting()}, {user?.name || "User"}!
              </span>
            </div>
            <DarkModeToggle />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-xl transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:block text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Side Navigation */}
      <aside className="w-72 bg-white dark:bg-gray-900 shadow-xl flex flex-col py-6 mt-20 transition-colors duration-300 border-r border-gray-200 dark:border-gray-700">
        <div className="px-6 mb-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <span className="text-white text-xl font-bold">
                {user?.name?.charAt(0) || "U"}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{user?.name || "User"}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.injuryType || "Injury Type"}</p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <div className={`w-2 h-2 rounded-full ${recoveryStatus.color === 'emerald' ? 'bg-emerald-400' : 
                recoveryStatus.color === 'blue' ? 'bg-blue-400' : 
                recoveryStatus.color === 'orange' ? 'bg-orange-400' : 'bg-red-400'}`}></div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {recoveryStatus.status}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {SIDENAV.map(item => (
            <button
              key={item.key}
              onClick={() => handleSectionChange(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                section === item.key
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Daily Streak</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{dailyStreak} days</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Keep it up!</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-6 py-8 mt-20 overflow-auto">
        <div className="max-w-7xl mx-auto w-full space-y-8">

          {/* --- OVERVIEW PAGE --- */}
          {section === "overview" && (
            <>
              {/* Hero Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Recovery Progress"
                  value={`${recoveryPercentage}%`}
                  change={`+${Math.floor(Math.random() * 10) + 1}% this week`}
                  icon={recoveryStatus.icon}
                  trend="up"
                  color="emerald"
                />
                <StatCard
                  title="Days in Recovery"
                  value={getDaysInRecovery()}
                  change={`Started ${injuryDate}`}
                  icon={Calendar}
                  color="blue"
                />
                <StatCard
                  title="Pain Reduction"
                  value={`${averagePainReduction}%`}
                  change={averagePainReduction > 20 ? "+5% this week" : "Track more data"}
                  icon={Heart}
                  trend={averagePainReduction > 20 ? "up" : "down"}
                  color="purple"
                />
                <StatCard
                  title="Weekly Goal"
                  value={`${weeklyGoalProgress}%`}
                  change={`${7 - new Date().getDay()} days left`}
                  icon={Target}
                  trend={weeklyGoalProgress >= 70 ? "up" : "down"}
                  color="orange"
                />
              </div>

              {/* Main Dashboard Grid */}
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Recovery Overview */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recovery Overview</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      Last 30 days
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">Current Status</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Injury Type:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{user?.injuryType || "N/A"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Fitness Goal:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{user?.fitnessGoal || "N/A"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Est. Recovery:</span>
                          <span className="font-medium text-emerald-600">{estimatedRecovery}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Total Sessions:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{totalSessions}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">Quick Actions</h3>
                      <div className="space-y-2">
                        <button
                          onClick={() => setSection("progress")}
                          className="w-full flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-3 py-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                        >
                          <TrendingUp className="h-4 w-4" />
                          Log Progress
                        </button>
                        <button
                          onClick={() => setSection("ai")}
                          className="w-full flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-3 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        >
                          <Brain className="h-4 w-4" />
                          Ask AI Assistant
                        </button>
                        <button
                          onClick={() => setSection("videos")}
                          className="w-full flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-3 py-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                        >
                          <Video className="h-4 w-4" />
                          Watch Videos
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recovery Progress Circle */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-center">Recovery Progress</h3>
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 mb-4">
                      <svg className="absolute top-0 left-0 w-32 h-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                          fill="none"
                          className="dark:stroke-gray-700"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="url(#gradient)"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={2 * Math.PI * 56}
                          strokeDashoffset={2 * Math.PI * 56 * (1 - recoveryPercentage / 100)}
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#3b82f6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          {recoveryPercentage}%
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        recoveryStatus.color === 'emerald' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' :
                        recoveryStatus.color === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                        recoveryStatus.color === 'orange' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        <recoveryStatus.icon className="h-4 w-4" />
                        {recoveryStatus.status}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Keep up the great work!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Insights & Diet Plan */}
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="h-5 w-5 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Insights</h2>
                  </div>
                  <div className="space-y-3">
                    {llmSummary.length > 0 ? (
                      llmSummary.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <Zap className="h-4 w-4 text-blue-600 mt-0.5" />
                          <p className="text-sm text-gray-700 dark:text-gray-300">{item}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Start tracking your progress to get AI insights!</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="h-5 w-5 text-emerald-600" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nutrition Plan</h2>
                  </div>
                  <div className="space-y-3">
                    {dietPlan.length > 0 ? (
                      dietPlan.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <p className="text-sm text-gray-700 dark:text-gray-300">{item}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Personalized nutrition plan will appear here!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* --- PROGRESS TRACKER PAGE --- */}
          {section === "progress" && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recovery Progress Tracker</h2>
              </div>
              <ProgressTracker
                user={user}
                progressData={progressData}
                onProgressSaved={fetchDashboardData}
              />
            </div>
          )}

          {/* --- VIDEOS PAGE --- */}
          {section === "videos" && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-6">
                <Video className="h-6 w-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Personalized Exercise Videos</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                AI-curated workout and rehabilitation video recommendations based on your injury and progress.
              </p>
              {recommendedVideos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendedVideos.slice(0, 9).map((video, idx) => {
                    let videoId = "";
                    const match = video.url.match(/(?:v=|\/embed\/|\.be\/)([a-zA-Z0-9_-]{11})/);
                    if (match) {
                      videoId = match[1];
                    }
                    const thumbnail = videoId
                      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                      : "https://via.placeholder.com/320x180?text=No+Thumbnail";
                    
                    return (
                      <div
                        key={idx}
                        className="group bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-600"
                      >
                        <div className="relative overflow-hidden">
                          <img
                            src={thumbnail}
                            alt={video.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                              <Video className="h-6 w-6 text-gray-700" />
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {video.title}
                          </h3>
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                          >
                            Watch on YouTube
                            <ArrowRight className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No videos recommended yet</p>
                  <p>Chat with our AI Assistant to get personalized video recommendations!</p>
                  <button
                    onClick={() => setSection("ai")}
                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Ask AI Assistant
                  </button>
                </div>
              )}
            </div>
          )}

          {/* --- AI ASSISTANT PAGE --- */}
          {section === "ai" && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-6">
                <Brain className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Recovery Assistant</h2>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 mb-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-900 dark:text-blue-300">AI Powered Support</span>
                </div>
                <p className="text-blue-800 dark:text-blue-300 text-sm">
                  Get instant answers about your recovery, personalized exercise suggestions, and expert guidance 24/7.
                </p>
              </div>
              <ChatbotAssistant onRecommendVideos={setRecommendedVideos} userId={user?.id} />
            </div>
          )}

          {/* --- PROFILE PAGE --- */}
          {section === "profile" && (
            <div className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <User className="h-6 w-6 text-emerald-600" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile & Settings</h2>
                  </div>
                  {!isEditingProfile ? (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSavingProfile}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        {isSavingProfile ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {isSavingProfile ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={isEditingProfile ? profileForm.name : (user?.name || "")}
                          onChange={handleProfileFormChange}
                          disabled={!isEditingProfile}
                          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 ${
                            isEditingProfile ? 'bg-white dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-600'
                          }`}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input
                          type="email"
                          value={user?.email || ""}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                          disabled
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age</label>
                          <input
                            type="number"
                            name="age"
                            value={isEditingProfile ? profileForm.age : (user?.age || "")}
                            onChange={handleProfileFormChange}
                            disabled={!isEditingProfile}
                            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 ${
                              isEditingProfile ? 'bg-white dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-600'
                            }`}
                            placeholder="25"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight (kg)</label>
                          <input
                            type="number"
                            name="weight"
                            value={isEditingProfile ? profileForm.weight : (user?.weight || "")}
                            onChange={handleProfileFormChange}
                            disabled={!isEditingProfile}
                            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 ${
                              isEditingProfile ? 'bg-white dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-600'
                            }`}
                            placeholder="70"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Height (cm)</label>
                        <input
                          type="number"
                          name="height"
                          value={isEditingProfile ? profileForm.height : (user?.height || "")}
                          onChange={handleProfileFormChange}
                          disabled={!isEditingProfile}
                          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 ${
                            isEditingProfile ? 'bg-white dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-600'
                          }`}
                          placeholder="175"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Injury & Recovery Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Injury & Recovery Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Injury Type</label>
                        <select
                          name="injuryType"
                          value={isEditingProfile ? profileForm.injuryType : (user?.injuryType || "")}
                          onChange={handleProfileFormChange}
                          disabled={!isEditingProfile}
                          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 ${
                            isEditingProfile ? 'bg-white dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-600'
                          }`}
                        >
                          <option value="">Select injury type</option>
                          <option value="knee">Knee Injury</option>
                          <option value="shoulder">Shoulder Injury</option>
                          <option value="back">Back Pain</option>
                          <option value="ankle">Ankle Sprain</option>
                          <option value="wrist">Wrist Injury</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fitness Goal</label>
                        <select
                          name="fitnessGoal"
                          value={isEditingProfile ? profileForm.fitnessGoal : (user?.fitnessGoal || "")}
                          onChange={handleProfileFormChange}
                          disabled={!isEditingProfile}
                          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 ${
                            isEditingProfile ? 'bg-white dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-600'
                          }`}
                        >
                          <option value="">Select fitness goal</option>
                          <option value="recovery">Full Recovery</option>
                          <option value="strength">Strength Building</option>
                          <option value="mobility">Improved Mobility</option>
                          <option value="pain-reduction">Pain Reduction</option>
                          <option value="sports">Return to Sports</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Activity Level (Before Injury)</label>
                        <select
                          name="activityLevel"
                          value={isEditingProfile ? profileForm.activityLevel : (user?.activityLevel || "")}
                          onChange={handleProfileFormChange}
                          disabled={!isEditingProfile}
                          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 ${
                            isEditingProfile ? 'bg-white dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-600'
                          }`}
                        >
                          <option value="">Select activity level</option>
                          <option value="sedentary">Sedentary (Little to no exercise)</option>
                          <option value="light">Lightly Active (1-3 days/week)</option>
                          <option value="moderate">Moderately Active (3-5 days/week)</option>
                          <option value="active">Very Active (6-7 days/week)</option>
                          <option value="athlete">Athlete (Professional/Competitive)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Injury Date</label>
                        <input
                          type="date"
                          name="injuryDate"
                          value={isEditingProfile ? profileForm.injuryDate : (user?.injuryDate || injuryDate)}
                          onChange={handleProfileFormChange}
                          disabled={!isEditingProfile}
                          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 ${
                            isEditingProfile ? 'bg-white dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-600'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Injury Description</label>
                        <textarea
                          name="injuryDescription"
                          value={isEditingProfile ? profileForm.injuryDescription : (user?.injuryDescription || "")}
                          onChange={handleProfileFormChange}
                          disabled={!isEditingProfile}
                          rows={3}
                          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 ${
                            isEditingProfile ? 'bg-white dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-600'
                          }`}
                          placeholder="Describe how the injury occurred and current symptoms..."
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                {isEditingProfile && (
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <Heart className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Profile Update</h4>
                          <p className="text-sm text-blue-800 dark:text-blue-300">
                            Updating your profile will help our AI provide more personalized recommendations for your recovery journey.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Settings */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Notification Preferences */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Daily Progress Reminders</label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Get reminded to log your daily progress</p>
                      </div>
                      <input type="checkbox" className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Insights</label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Receive personalized AI recommendations</p>
                      </div>
                      <input type="checkbox" className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Exercise Reminders</label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Reminders for your exercise schedule</p>
                      </div>
                      <input type="checkbox" className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Weekly Reports</label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Weekly progress summary emails</p>
                      </div>
                      <input type="checkbox" className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" defaultChecked />
                    </div>
                  </div>
                </div>

                {/* Account Statistics */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Member Since</span>
                      <span className="font-medium text-gray-900 dark:text-white">{injuryDate}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</span>
                      <span className="font-medium text-gray-900 dark:text-white">{totalSessions}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Current Streak</span>
                      <span className="font-medium text-emerald-600">{dailyStreak} days</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">AI Conversations</span>
                      <span className="font-medium text-gray-900 dark:text-white">{Math.floor(Math.random() * 50) + 10}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Videos Watched</span>
                      <span className="font-medium text-gray-900 dark:text-white">{recommendedVideos.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}