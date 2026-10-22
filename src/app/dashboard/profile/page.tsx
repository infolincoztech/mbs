"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Palette, 
  Image as ImageIcon,
  Save,
  Loader2,
  Lock
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
    marqueeName: "",
    primaryColor: "#2563eb",
  });

  const role = session?.user?.role;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // In a real app, you'd have an API to update user/marquee settings
      await new Promise(r => setTimeout(r, 1000)); 
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500">Manage your profile and marquee branding.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Tabs (Simulated) */}
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl font-bold text-blue-600 shadow-sm">
            <User size={20} /> Personal Info
          </button>
          {role === "MARQUEE_ADMIN" && (
            <button className="w-full flex items-center gap-3 p-4 hover:bg-white hover:border-gray-100 rounded-2xl font-bold text-gray-500 transition-all">
              <Palette size={20} /> Branding (White-label)
            </button>
          )}
          <button className="w-full flex items-center gap-3 p-4 hover:bg-white hover:border-gray-100 rounded-2xl font-bold text-gray-500 transition-all">
            <Lock size={20} /> Password & Security
          </button>
        </div>

        {/* Form Area */}
        <div className="md:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm"
          >
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 text-3xl font-bold">
                  {session?.user?.name?.[0]}
                </div>
                <div>
                  <button type="button" className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all">
                    Change Avatar
                  </button>
                  <p className="text-xs text-gray-400 mt-2">JPG, GIF or PNG. Max size of 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="email" 
                      readOnly
                      value={formData.email}
                      className="w-full pl-10 pr-4 py-4 bg-gray-100 border border-gray-100 rounded-2xl outline-none text-gray-400 font-medium cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="+92 300 1234567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                    />
                  </div>
                </div>
                {role === "MARQUEE_ADMIN" && (
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Primary Brand Color</label>
                    <div className="relative flex items-center gap-3">
                      <input 
                        type="color" 
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-12 h-12 rounded-xl border-none cursor-pointer"
                      />
                      <span className="font-mono text-sm uppercase">{formData.primaryColor}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-gray-50">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center gap-2 disabled:opacity-70"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
