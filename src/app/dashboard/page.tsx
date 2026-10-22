"use client";

import { useSession } from "next-auth/react";
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  BarChart as BarChartIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { BookingModal } from "@/components/modals/BookingModal";

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const role = session?.user?.role;

  const fetchStats = async () => {
    try {
      const res = await axios.get("/api/dashboard/stats");
      setStats(res.data.stats);
      if (res.data.chartData) setChartData(res.data.chartData);
    } catch (error) {
      console.error("Failed to fetch stats");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [role]);

  const getIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("marquee") || l.includes("school")) return <Building2 size={20} />;
    if (l.includes("booking")) return <Calendar size={20} />;
    if (l.includes("revenue") || l.includes("profit")) return <DollarSign size={20} />;
    if (l.includes("subscription") || l.includes("license")) return <CheckCircle2 size={20} />;
    if (l.includes("user") || l.includes("staff")) return <Users size={20} />;
    if (l.includes("trend")) return <TrendingUp size={20} />;
    return <Clock size={20} />;
  };

  if (role === "SUPER_ADMIN") {
    return (
      <div className="space-y-10">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">SaaS Overview</h1>
          <p className="text-gray-500 mt-1 text-lg">Monitor your subscription revenue and active tenant schools.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-white animate-pulse rounded-2xl border border-gray-100 shadow-sm" />
            ))
          ) : (
            stats?.map((stat: any, index: number) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white p-6 rounded-2xl border-l-4 border-blue-500 shadow-sm border-y border-r border-gray-100 flex flex-col justify-between h-40`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-gray-600 font-bold text-sm">{stat.label}</span>
                  <div className="text-blue-500">{getIcon(stat.label)}</div>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-gray-900">{stat.value}</h3>
                  <p className="text-xs text-gray-400 font-medium mt-1">{stat.trend || "Live Data"}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-100 rounded-[2.5rem] h-[450px] flex flex-col items-center justify-center text-gray-400 gap-4 shadow-sm">
            <TrendingUp size={48} className="opacity-20" />
            <p className="font-bold text-lg">Subscription Growth Chart (Coming Soon)</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-[2.5rem] h-[450px] flex flex-col items-center justify-center text-gray-400 gap-4 shadow-sm">
            <BarChartIcon size={48} className="opacity-20" />
            <p className="font-bold text-lg">Revenue Over Time (Coming Soon)</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {session?.user?.name}!</h1>
        <p className="text-gray-500">Here's what's happening with your marquee today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white animate-pulse rounded-3xl border border-gray-100" />
          ))
        ) : (
          stats?.map((stat: any, index: number) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  {getIcon(stat.label)}
                </div>
                <div className={`flex items-center text-sm font-bold text-green-500`}>
                  <ArrowUpRight size={16} />
                  {stat.trend}
                </div>
              </div>
              <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
            </motion.div>
          ))
        )}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Revenue Chart */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold">Revenue Trends</h3>
              <select className="bg-gray-50 border-none rounded-xl text-sm font-bold p-2 outline-none">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.length > 0 ? chartData : [
                  { name: 'Mon', total: 0 },
                  { name: 'Tue', total: 0 },
                  { name: 'Wed', total: 0 },
                  { name: 'Thu', total: 0 },
                  { name: 'Fri', total: 0 },
                  { name: 'Sat', total: 0 },
                  { name: 'Sun', total: 0 },
                ]}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>


        </div>

        <div className="space-y-8">
          {/* Quick Actions / Notifications */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
            <div className="space-y-4">
              <button 
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                New Booking
              </button>
              <button 
                onClick={() => router.push("/dashboard/finance")}
                className="w-full py-4 bg-white text-blue-600 border border-blue-600 rounded-2xl font-bold hover:bg-blue-50 transition-all"
              >
                Add Expense
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold mb-6">System Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Database</span>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Cloud Storage</span>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">WhatsApp API</span>
                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        selectedDate={new Date()}
        onSuccess={fetchStats}
      />
    </div>
  );
}
