"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, Eye, EyeOff, Laptop } from "lucide-react";
import { toast } from "react-hot-toast";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const machineId = searchParams.get("machineId") || "";
  const hostname = searchParams.get("hostname") || "";
  const osInfo = searchParams.get("osInfo") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Invalid credentials");
      } else {
        toast.success("Logged in successfully!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] px-4 font-sans py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white p-10 rounded-[1.5rem] shadow-2xl border-t-[8px] border-blue-500 relative overflow-hidden">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-blue-100 mb-6 overflow-hidden">
              <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-tight mb-2">
              Lincoz Marquee<br/>Management System
            </h1>
            <p className="text-gray-500 text-sm font-medium">
              Modern Event Management, Managed with Excellence
            </p>
          </div>

          {machineId && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-left">
              <p className="text-xs font-bold text-amber-700 flex items-center gap-1.5 mb-1">
                <Laptop size={14} /> PC License Required
              </p>
              <p className="text-[11px] text-gray-500 font-medium mb-3 leading-normal">
                This computer is not registered. Please create a marquee account to link and register this PC.
              </p>
              <Link 
                href={`/register?machineId=${encodeURIComponent(machineId)}&hostname=${encodeURIComponent(hostname)}&osInfo=${encodeURIComponent(osInfo)}`}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center shadow-md shadow-amber-100"
              >
                Sign Up & Register This PC
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">Password</label>
                <Link href="#" className="text-sm text-blue-500 hover:text-blue-600 font-medium">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium"
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
              className="w-full py-4 bg-blue-500 text-white rounded-lg font-bold text-lg hover:bg-blue-600 transition-all shadow-md flex items-center justify-center disabled:opacity-70 mt-4 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-xs font-semibold">
              Don't have an account? <Link href="/register" className="text-blue-600 hover:underline">Sign Up</Link>
            </p>
          </div>

          <div className="mt-8 text-center space-y-1">
            <p className="text-gray-500 text-xs font-medium">Protected by secure authentication.</p>
            <p className="text-gray-400 text-xs font-medium">Powered by Lincoz Tech</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
