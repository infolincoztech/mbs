"use client";

import { useState, useEffect } from "react";
import { 
  Building2, 
  User, 
  Calendar, 
  MoreVertical, 
  Loader2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function MarqueesManagementPage() {
  const [marquees, setMarquees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMarquees();
  }, []);

  const fetchMarquees = async () => {
    try {
      const res = await axios.get("/api/marquees/all");
      setMarquees(res.data);
    } catch (error) {
      toast.error("Failed to fetch marquees");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage Marquees</h1>
        <p className="text-gray-500">Global overview of all registered marquee businesses.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xl font-bold">All Marquees</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-50">
                <th className="px-8 py-4">Marquee Name</th>
                <th className="px-8 py-4">Owner</th>
                <th className="px-8 py-4">Subscription</th>
                <th className="px-8 py-4">Joined Date</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : marquees.map((m: any) => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                        {m.name[0]}
                      </div>
                      <span className="font-bold text-gray-900">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{m.owner.name}</span>
                      <span className="text-xs text-gray-400">{m.owner.email}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      {m.subscription?.planType || "TRIAL"}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-gray-500 font-medium">{format(new Date(m.createdAt), "MMM dd, yyyy")}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-1.5 text-green-500 font-bold text-xs">
                      <CheckCircle2 size={14} /> Active
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600 transition-colors">
                      <ExternalLink size={18} />
                    </button>
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
