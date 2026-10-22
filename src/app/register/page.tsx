"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Hotel, 
  Loader2, 
  CheckCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";

function RegisterForm() {
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    marqueeName: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  // System details from URL or browser
  const [systemDetails, setSystemDetails] = useState({
    machineId: "",
    osInfo: "",
    hostname: "",
  });

  useEffect(() => {
    const urlMachineId = searchParams.get("machineId") || "";
    const urlHostname = searchParams.get("hostname") || "";
    const urlOsInfo = searchParams.get("osInfo") || "";

    // Fallback to browser details if url params are missing
    const browserOs = typeof window !== "undefined" ? window.navigator.userAgent : "";

    setSystemDetails({
      machineId: urlMachineId,
      hostname: urlHostname || "Web-Browser",
      osInfo: urlOsInfo || browserOs,
    });
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post("/api/register", {
        ...formData,
        ...systemDetails,
      });

      toast.success("Account created successfully!");
      setIsRegistered(true);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-10 rounded-[2rem] shadow-2xl border-t-[8px] border-emerald-500 text-center max-w-md w-full"
      >
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100">
          <CheckCircle size={40} />
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-4">Registration Submitted</h1>
        
        <p className="text-gray-500 mb-8 text-sm leading-relaxed font-medium">
          Thank you! Your marquee admin account has been created. Since this is a premium managed system, your device and account activation is currently <span className="text-amber-500 font-bold">PENDING APPROVAL</span> by the Super Admin.
        </p>

        <div className="bg-gray-50 p-4 rounded-xl text-left space-y-2 mb-8 border border-gray-100">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Device Association</p>
          <div className="grid grid-cols-3 text-xs gap-y-1">
            <span className="text-gray-400 font-medium">Machine ID:</span>
            <span className="col-span-2 font-mono text-gray-700 truncate">{systemDetails.machineId || "N/A (Web Browser)"}</span>
            <span className="text-gray-400 font-medium">Hostname:</span>
            <span className="col-span-2 text-gray-700 font-semibold">{systemDetails.hostname}</span>
          </div>
        </div>

        <Link 
          href="/login"
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
        >
          Go to Sign In
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl w-full"
    >
      <div className="bg-white p-10 rounded-[2rem] shadow-2xl border-t-[8px] border-blue-500 relative overflow-hidden">
        
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-100 mb-4 overflow-hidden">
            <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-tight mb-2">
            Create Marquee Account
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Join Lincoz MMS & manage your banquet with excellence
          </p>
        </div>

        {systemDetails.machineId && (
          <div className="mb-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center text-xs font-bold font-mono">
              EXE
            </div>
            <div className="text-left min-w-0 flex-1">
              <p className="text-xs font-bold text-blue-700">Desktop App Installation Detected</p>
              <p className="text-[10px] text-blue-500 truncate font-mono">ID: {systemDetails.machineId} | Host: {systemDetails.hostname}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium"
                  placeholder="Arfan Ashraf"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Business / Marquee Name</label>
              <div className="relative">
                <Hotel className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.marqueeName}
                  onChange={(e) => setFormData({ ...formData, marqueeName: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium"
                  placeholder="Royal Banquet Marquee"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium"
                  placeholder="03001234567"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-12 pr-12 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center disabled:opacity-70 mt-4 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-xs font-semibold">
            Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] px-4 font-sans py-12">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-sm font-bold text-gray-500">Loading signup details...</p>
        </div>
      }>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
