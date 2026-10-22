"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Info, AlertTriangle, XCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("/api/notifications");
      setNotifications(res.data);
    } catch (error) {
      console.error("Failed to fetch notifications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await axios.post("/api/notifications", { id, action: "read" });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error("Failed to mark as read");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await axios.delete(`/api/notifications?id=${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error("Failed to delete notification");
    }
  };

  const clearAll = async () => {
    try {
      await axios.delete("/api/notifications");
      setNotifications([]);
    } catch (error) {
      console.error("Failed to clear notifications");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "SUCCESS": return <Check className="text-emerald-500" size={16} />;
      case "WARNING": return <AlertTriangle className="text-amber-500" size={16} />;
      case "ERROR": return <XCircle className="text-red-500" size={16} />;
      default: return <Info className="text-blue-500" size={16} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <Bell size={20} className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-lg">Notifications</h3>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{unreadCount} New</span>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {isLoading ? (
                  <div className="p-12 flex flex-col items-center justify-center text-gray-400 gap-2">
                    <Loader2 className="animate-spin" size={24} />
                    <p className="text-sm">Loading alerts...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-12 text-center text-gray-400">
                    <Bell className="mx-auto mb-3 opacity-20" size={48} />
                    <p className="text-sm">No new notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-4 hover:bg-gray-50 transition-colors group relative flex gap-4 ${!n.read ? "bg-blue-50/30" : ""}`}
                      >
                        <div className="mt-1" onClick={() => markAsRead(n.id)}>{getIcon(n.type)}</div>
                        <div className="flex-1 cursor-pointer" onClick={() => markAsRead(n.id)}>
                          <p className={`text-sm ${!n.read ? "font-bold text-gray-900" : "text-gray-600"}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-gray-400 mt-2 font-medium">
                            {formatDistanceToNow(new Date(n.createdAt))} ago
                          </p>
                        </div>
                        <div className="flex flex-col items-center justify-between">
                          {!n.read && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(n.id);
                            }}
                            className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <button 
                  onClick={clearAll}
                  className="w-full p-4 text-center text-sm font-bold text-red-600 hover:bg-red-50 transition-all border-t border-gray-50"
                >
                  Clear All Notifications
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
