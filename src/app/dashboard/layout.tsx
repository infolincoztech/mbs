"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { Loader2, Search, Menu } from "lucide-react";
import axios from "axios";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      axios.post("/api/notifications/generate").catch(() => {});
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#f3f4f6]">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: "var(--primary-color)" }} />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const primaryColor = (session?.user as any)?.primaryColor || "#2563eb";

  return (
    <div 
      className="flex min-h-screen bg-[#f3f4f6]"
      style={{ "--primary-color": primaryColor } as any}
    >
      {/* Sidebar - Hidden on mobile by default */}
      <div className={`${isMobileMenuOpen ? "block" : "hidden"} md:block fixed inset-0 z-[60] md:relative md:z-0`}>
        <div className="absolute inset-0 bg-black/20 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
        <Sidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
      </div>

      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 hover:bg-gray-50 rounded-lg"
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="flex items-center space-x-6">
            <NotificationDropdown />
            
            <div className="h-10 w-[1px] bg-gray-100"></div>

            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold">{session?.user?.name}</p>
                <p className="text-xs text-gray-400 capitalize">{session?.user?.role?.toLowerCase().replace("_", " ")}</p>
              </div>
              <div 
                className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold shadow-lg shadow-gray-200"
                style={{ backgroundColor: "var(--primary-color)" }}
              >
                {session?.user?.name?.[0] || "U"}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
