"use client";

import { useState, useEffect } from "react";
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
  ShieldCheck,
  CreditCard,
  UserCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

export default function SuperAdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/api/dashboard/stats");
        setStats(res.data.stats);
      } catch (error) {
        console.error("Failed to fetch stats");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cardData = [
    { label: "Total Revenue", value: "Rs.6,000", sub: "Lifetime generated", icon: <CreditCard size={20} />, color: "border-blue-500", iconColor: "text-blue-500" },
    { label: "Active Licenses", value: "1", sub: "Schools with valid keys", icon: <TrendingUp size={20} />, color: "border-emerald-500", iconColor: "text-emerald-500" },
    { label: "Total Schools", value: "1", sub: "Registered tenants", icon: <Building2 size={20} />, color: "border-purple-500", iconColor: "text-purple-500" },
    { label: "Platform Users", value: "1", sub: "Across all schools", icon: <Users size={20} />, color: "border-orange-500", iconColor: "text-orange-500" },
  ];

  return (
    <div className="space-y-10 p-2">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">SaaS Overview</h1>
        <p className="text-gray-500 mt-1 text-lg">Monitor your subscription revenue and active tenant schools.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardData.map((stat, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white p-6 rounded-2xl border-l-4 ${stat.color} shadow-sm border-y border-r border-gray-100 flex flex-col justify-between h-40`}
          >
            <div className="flex justify-between items-start">
              <span className="text-gray-600 font-bold text-sm">{stat.label}</span>
              <div className={stat.iconColor}>{stat.icon}</div>
            </div>
            <div>
              <h3 className="text-3xl font-black text-gray-900">{stat.value}</h3>
              <p className="text-xs text-gray-400 font-medium mt-1">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#f8fafc] border-2 border-dashed border-gray-200 rounded-[2.5rem] h-[450px] flex flex-col items-center justify-center text-gray-400 gap-4">
          <TrendingUp size={48} className="opacity-20" />
          <p className="font-bold text-lg">Subscription Growth Chart (Coming Soon)</p>
        </div>
        <div className="bg-[#f8fafc] border-2 border-dashed border-gray-200 rounded-[2.5rem] h-[450px] flex flex-col items-center justify-center text-gray-400 gap-4">
          <CreditCard size={48} className="opacity-20" />
          <p className="font-bold text-lg">Revenue Over Time (Coming Soon)</p>
        </div>
      </div>
    </div>
  );
}
