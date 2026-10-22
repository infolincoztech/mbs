"use client";

import { useState, useEffect } from "react";
import { 
  BarChart3, 
  PieChart, 
  Download, 
  Filter, 
  Calendar,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart as RePieChart, Pie } from "recharts";
import axios from "axios";

export default function ReportsPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get("/api/analytics");
        setData(res.data);
      } catch (error) {
        console.error("Failed to fetch reports data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const revenueData = data?.chartData || [];
  const categoryData = data?.hallDistribution || [];

  const handleExport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert("Report downloaded successfully!");
    }, 2000);
  };

  if (isLoading) {
    return <div className="p-12 text-center font-bold text-gray-400">Loading Reports...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-500">Deep dive into your marquee's performance data.</p>
        </div>
        <button 
          onClick={handleExport}
          disabled={isGenerating}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="animate-spin" /> : <Download size={20} />}
          Export Annual Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Distribution */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold">Monthly Revenue Distribution</h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg uppercase">Income</span>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: '#f3f4f6', radius: 12}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="revenue" fill="var(--primary-color)" radius={[12, 12, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event Categories */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold mb-8">Hall Distribution</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={categoryData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-4">
            {categoryData.map((item: any) => (
              <div key={item.name} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-bold text-gray-700">{item.name}</span>
                </div>
                <span className="text-sm font-black text-gray-900">{item.value} Bookings</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/50">
          <h3 className="text-xl font-bold">Occupancy Reports</h3>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Busiest Month", value: "June", icon: <Calendar className="text-blue-600" /> },
            { label: "Avg. Guests", value: "450", icon: <ArrowUpRight className="text-green-600" /> },
            { label: "Hall A Usage", value: "88%", icon: <PieChart className="text-purple-600" /> },
            { label: "Cancellation Rate", value: "2.4%", icon: <BarChart3 className="text-red-600" /> },
          ].map((stat, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                {stat.icon} {stat.label}
              </div>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
