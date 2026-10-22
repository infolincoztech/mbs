"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  CreditCard, 
  Clock, 
  AlertTriangle,
  Loader2,
  CheckCircle2,
  TrendingUp,
  DollarSign
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function SubscriptionsManagementPage() {
  const [subs, setSubs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const res = await axios.get("/api/subscriptions/all");
      setSubs(res.data);
    } catch (error) {
      toast.error("Failed to fetch subscriptions");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscription Control</h1>
          <p className="text-gray-500">Monitor and manage all SaaS subscription plans.</p>
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-3 bg-white border border-gray-100 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
              <DollarSign size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Monthly MRR</p>
              <p className="text-lg font-black text-gray-900">Rs. 12,450</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {["Basic", "Professional", "Enterprise"].map((plan) => (
          <div key={plan} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-bold">{plan} Plan</h4>
                <p className="text-xs text-gray-500">
                  {plan === "Basic" ? "12" : plan === "Professional" ? "45" : "18"} Active Users
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-blue-600">Rs. {plan === "Basic" ? "4,900" : plan === "Professional" ? "9,900" : "19,900"}/mo</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/50">
          <h3 className="text-xl font-bold">Billing History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-50">
                <th className="px-8 py-4">Marquee</th>
                <th className="px-8 py-4">Plan</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Renewal Date</th>
                <th className="px-8 py-4">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : subs.map((sub: any) => (
                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-6 font-bold text-gray-900">{sub.marquee.name}</td>
                  <td className="px-8 py-6">
                    <span className="font-semibold text-sm">{sub.planType}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`flex items-center gap-1.5 font-bold text-xs ${
                      sub.status === "ACTIVE" ? "text-green-500" : "text-yellow-500"
                    }`}>
                      {sub.status === "ACTIVE" ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                      {sub.status}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-gray-500 font-medium">{format(new Date(sub.endDate), "MMM dd, yyyy")}</td>
                  <td className="px-8 py-6 font-black text-gray-900">
                    Rs. {sub.planType === "BASIC" ? "4,900" : sub.planType === "PROFESSIONAL" ? "9,900" : "19,900"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
