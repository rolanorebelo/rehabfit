import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Calendar, TrendingUp, TrendingDown, Plus, Activity, Heart, Target, Award, AlertCircle } from "lucide-react";
import API from "../api/axios";
import { toast } from "react-toastify";

export default function ProgressTracker({ user, progressData, onProgressSaved }) {
  const [entries, setEntries] = useState(progressData || []);
  const [form, setForm] = useState({ 
    pain: "", 
    mobility: "", 
    strength: "", 
    notes: "",
    mood: "",
    sleepQuality: "",
    exerciseMinutes: ""
  });
  const [viewMode, setViewMode] = useState("chart");
  const [timeRange, setTimeRange] = useState("30");
  
  useEffect(() => {
    setEntries(progressData || []);
  }, [progressData]);

  const today = new Date().toISOString().slice(0, 10);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.pain || !form.mobility || !form.strength) {
      toast.error("Please fill in pain, mobility, and strength levels");
      return;
    }
    
    try {
      await API.post("/api/progress", {
        painLevel: Number(form.pain),
        mobility: Number(form.mobility),
        strength: Number(form.strength),
        notes: form.notes,
        mood: form.mood,
        sleepQuality: Number(form.sleepQuality) || null,
        exerciseMinutes: Number(form.exerciseMinutes) || null,
        date: today
      });
      
      toast.success("Progress logged successfully!");
      setForm({ 
        pain: "", 
        mobility: "", 
        strength: "", 
        notes: "",
        mood: "",
        sleepQuality: "",
        exerciseMinutes: ""
      });
      
      if (onProgressSaved) onProgressSaved();
    } catch (err) {
      toast.error("Failed to save progress.");
    }
  };

  const getProgressStats = () => {
    if (entries.length === 0) return { trend: "neutral", improvement: 0, streak: 0 };
    
    const recent = entries.slice(-7); // Last 7 entries
    const older = entries.slice(-14, -7); // Previous 7 entries
    
    if (recent.length === 0) return { trend: "neutral", improvement: 0, streak: 0 };
    
    const recentAvg = recent.reduce((sum, entry) => sum + (10 - entry.painLevel + entry.mobility + entry.strength), 0) / recent.length;
    const olderAvg = older.length > 0 ? 
      older.reduce((sum, entry) => sum + (10 - entry.painLevel + entry.mobility + entry.strength), 0) / older.length : 
      recentAvg;
    
    const improvement = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    // Calculate streak (consecutive days with improvement)
    let streak = 0;
    for (let i = recent.length - 1; i > 0; i--) {
      const current = (10 - recent[i].painLevel + recent[i].mobility + recent[i].strength);
      const previous = (10 - recent[i-1].painLevel + recent[i-1].mobility + recent[i-1].strength);
      if (current >= previous) {
        streak++;
      } else {
        break;
      }
    }
    
    return {
      trend: improvement > 5 ? "up" : improvement < -5 ? "down" : "neutral",
      improvement: Math.abs(improvement),
      streak
    };
  };

  const stats = getProgressStats();

  const getMoodColor = (mood) => {
    switch (mood) {
      case "excellent": return "text-green-600 bg-green-100";
      case "good": return "text-blue-600 bg-blue-100";
      case "fair": return "text-yellow-600 bg-yellow-100";
      case "poor": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const chartData = entries.map(entry => ({
    ...entry,
    date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    recovery: ((10 - entry.painLevel + entry.mobility + entry.strength) / 2.8 * 10).toFixed(1)
  }));

  const painDistribution = entries.reduce((acc, entry) => {
    const level = entry.painLevel <= 3 ? 'Low (0-3)' : 
                  entry.painLevel <= 6 ? 'Medium (4-6)' : 'High (7-10)';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(painDistribution).map(([name, value]) => ({ name, value }));
  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  const StatCard = ({ title, value, change, icon: Icon, trend, color = "emerald" }) => {
    const colorClasses = {
      emerald: "from-emerald-500 to-emerald-600",
      blue: "from-blue-500 to-blue-600",
      purple: "from-purple-500 to-purple-600",
      orange: "from-orange-500 to-orange-600"
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className={`w-10 h-10 bg-gradient-to-r ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          {change && (
            <div className={`flex items-center gap-1 text-xs font-medium ${
              trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-gray-500'
            }`}>
              {trend === 'up' && <TrendingUp className="h-3 w-3" />}
              {trend === 'down' && <TrendingDown className="h-3 w-3" />}
              {change}
            </div>
          )}
        </div>
        <div className="text-xl font-bold text-gray-900 dark:text-white">{value}</div>
        <div className="text-xs text-gray-600 dark:text-gray-400">{title}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Entries"
          value={entries.length}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Current Streak"
          value={`${stats.streak} days`}
          change={stats.streak > 0 ? "improving" : ""}
          icon={Award}
          trend={stats.streak > 0 ? "up" : "neutral"}
          color="emerald"
        />
        <StatCard
          title="Progress Trend"
          value={`${stats.improvement.toFixed(1)}%`}
          change={stats.trend === 'up' ? 'improving' : stats.trend === 'down' ? 'declining' : 'stable'}
          icon={TrendingUp}
          trend={stats.trend}
          color="purple"
        />
        <StatCard
          title="Latest Pain"
          value={entries.length > 0 ? `${entries[entries.length - 1]?.painLevel}/10` : "N/A"}
          icon={Heart}
          color="orange"
        />
      </div>

      {/* Progress Entry Form */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="h-5 w-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Log Today's Progress</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Primary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pain Level (0-10) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="pain"
                  min="0"
                  max="10"
                  value={form.pain}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  placeholder="0"
                  required
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">0 = No pain, 10 = Severe</div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mobility (0-10) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="mobility"
                  min="0"
                  max="10"
                  value={form.mobility}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  placeholder="0"
                  required
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">0 = Very limited, 10 = Full range</div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Strength (0-10) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="strength"
                  min="0"
                  max="10"
                  value={form.strength}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  placeholder="0"
                  required
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">0 = Very weak, 10 = Full strength</div>
              </div>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Overall Mood
              </label>
              <select
                name="mood"
                value={form.mood}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select mood</option>
                <option value="excellent">😊 Excellent</option>
                <option value="good">🙂 Good</option>
                <option value="fair">😐 Fair</option>
                <option value="poor">😞 Poor</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sleep Quality (1-10)
              </label>
              <input
                type="number"
                name="sleepQuality"
                min="1"
                max="10"
                value={form.sleepQuality}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                placeholder="8"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Exercise (minutes)
              </label>
              <input
                type="number"
                name="exerciseMinutes"
                min="0"
                value={form.exerciseMinutes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                placeholder="30"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes & Observations
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              placeholder="How are you feeling today? Any specific observations about your recovery?"
            />
          </div>

          <button
            type="submit"
            className="w-full md:w-auto bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Log Progress Entry
          </button>
        </form>
      </div>

      {entries.length > 0 ? (
        <>
          {/* View Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("chart")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === "chart"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Charts
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === "table"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Table
              </button>
            </div>
            
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="7">Last 7 days</option>
              <option value="14">Last 14 days</option>
              <option value="30">Last 30 days</option>
              <option value="all">All time</option>
            </select>
          </div>

          {/* Charts View */}
          {viewMode === "chart" && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Main Progress Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Progress Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.slice(-(parseInt(timeRange) === 0 ? chartData.length : parseInt(timeRange)))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                    <YAxis domain={[0, 10]} stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#f9fafb', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="painLevel" 
                      stroke="#ef4444" 
                      strokeWidth={3}
                      name="Pain Level" 
                      dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="mobility" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      name="Mobility" 
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="strength" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      name="Strength" 
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Recovery Score Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Overall Recovery Score</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData.slice(-(parseInt(timeRange) === 0 ? chartData.length : parseInt(timeRange)))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                    <YAxis domain={[0, 100]} stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#f9fafb', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="recovery"
                      stroke="#8b5cf6"
                      fill="url(#recoveryGradient)"
                      strokeWidth={2}
                      name="Recovery Score %"
                    />
                    <defs>
                      <linearGradient id="recoveryGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Pain Distribution */}
              {pieData.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pain Level Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Weekly Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Averages</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.slice(-7)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                    <YAxis domain={[0, 10]} stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#f9fafb', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="mobility" fill="#10b981" name="Mobility" />
                    <Bar dataKey="strength" fill="#3b82f6" name="Strength" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Table View */}
          {viewMode === "table" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Pain
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Mobility
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Strength
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Mood
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {entries.slice(-(parseInt(timeRange) === 0 ? entries.length : parseInt(timeRange))).reverse().map((entry, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {new Date(entry.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            entry.painLevel <= 3 ? 'bg-green-100 text-green-800' :
                            entry.painLevel <= 6 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {entry.painLevel}/10
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-emerald-600 h-2 rounded-full" 
                                style={{ width: `${(entry.mobility / 10) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-900 dark:text-gray-100">{entry.mobility}/10</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${(entry.strength / 10) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-900 dark:text-gray-100">{entry.strength}/10</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {entry.mood && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMoodColor(entry.mood)}`}>
                              {entry.mood}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                          {entry.notes || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Insights */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Recovery Insights</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  {stats.trend === 'up' && (
                    <li>• Great progress! Your recovery trend is improving by {stats.improvement.toFixed(1)}%</li>
                  )}
                  {stats.streak > 0 && (
                    <li>• You're on a {stats.streak}-day improvement streak - keep it up!</li>
                  )}
                  {entries.length >= 7 && (
                    <li>• You've logged {entries.length} entries - consistency is key to recovery</li>
                  )}
                  {entries.length > 0 && entries[entries.length - 1]?.painLevel <= 3 && (
                    <li>• Low pain levels indicate good recovery progress</li>
                  )}
                  <li>• Consider asking the AI Assistant for personalized recovery tips based on your progress</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <Activity className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No progress entries yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start tracking your recovery journey by logging your first progress entry above.
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <Target className="h-4 w-4" />
            Consistent tracking leads to better recovery outcomes
          </div>
        </div>
      )}
    </div>
  );
}