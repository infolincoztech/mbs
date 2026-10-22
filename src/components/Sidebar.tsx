"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Building2, 
  Settings, 
  LogOut,
  BarChart3,
  Package,
  Wallet,
  Menu,
  ChevronRight,
  Shield,
  Hotel
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Sidebar = ({ onCloseMobile }: { onCloseMobile?: () => void }) => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const role = session?.user?.role;

  const menuItems = {
    SUPER_ADMIN: [
      { label: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/dashboard" },
      { label: "Manage Marquees", icon: <Hotel size={20} />, href: "/dashboard/super-admin/marquees" },
      { label: "Device Licenses", icon: <Shield size={20} />, href: "/dashboard/super-admin/licenses" },
      { label: "Settings", icon: <Settings size={20} />, href: "/dashboard/settings" },
    ],
    MARQUEE_ADMIN: [
      { label: "Overview", icon: <LayoutDashboard size={20} />, href: "/dashboard" },
      { label: "Halls", icon: <Hotel size={20} />, href: "/dashboard/halls" },
      { label: "Bookings", icon: <Calendar size={20} />, href: "/dashboard/bookings" },
      { label: "Staff", icon: <Users size={20} />, href: "/dashboard/staff" },
      { label: "Finance", icon: <Wallet size={20} />, href: "/dashboard/finance" },

      { label: "Settings", icon: <Settings size={20} />, href: "/dashboard/settings" },
    ],
    STAFF: [
      { label: "Tasks", icon: <LayoutDashboard size={20} />, href: "/dashboard" },
      { label: "Bookings", icon: <Calendar size={20} />, href: "/dashboard/bookings" },
      { label: "Attendance", icon: <Users size={20} />, href: "/dashboard/attendance" },
    ],
    CLIENT: [
      { label: "My Bookings", icon: <Calendar size={20} />, href: "/dashboard" },
      { label: "Profile", icon: <Users size={20} />, href: "/dashboard/profile" },
    ],
  };

  const currentMenu = role ? menuItems[role as keyof typeof menuItems] : [];

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="h-screen sticky top-0 bg-white border-r border-gray-100 flex flex-col z-50 transition-all duration-300"
    >
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#2563eb] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100 overflow-hidden">
          <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
        </div>
        {!isCollapsed && (
          <span className="font-bold text-xl truncate max-w-[180px]" style={{ color: "var(--primary-color)" }}>
            {(session?.user as any)?.marqueeName || "Lincoz MMS"}
          </span>
        )}
      </div>

      <div className="flex-1 px-4 py-4">
        <nav className="space-y-1">
          {currentMenu.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={onCloseMobile}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-xl transition-all group
                  ${isActive 
                    ? "text-white shadow-lg shadow-gray-200" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}
                `}
                style={isActive ? { backgroundColor: "var(--primary-color)" } : {}}
              >
                <div className={`${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`}>
                  {item.icon}
                </div>
                {!isCollapsed && <span className="font-bold text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-50">
        {!isCollapsed && (
          <div className="bg-gray-50/80 rounded-2xl p-4 flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#3b82f6] rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-100">
                {session?.user?.name?.[0] || "A"}
              </div>
              <div className="flex flex-col min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate">{session?.user?.name || "Arfan Ashraf"}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-0.5">{role || "SUPERADMIN"}</p>
              </div>
            </div>
            <button 
              onClick={() => signOut()}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-24 bg-white border border-gray-100 p-1 rounded-full shadow-sm hover:bg-gray-50 md:flex hidden"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronRight size={14} className="rotate-180" />}
      </button>
    </motion.aside>
  );
};
