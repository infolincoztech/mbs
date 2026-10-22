"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Package, 
  Settings2, 
  DollarSign, 
  Loader2,
  Trash2,
  CheckCircle2,
  LayoutGrid,
  List
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function PackagesPage() {
  const [activeTab, setActiveTab] = useState<"packages" | "facilities">("packages");
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", price: "", description: "" });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/${activeTab}`);
      setData(res.data);
    } catch (error) {
      toast.error(`Failed to fetch ${activeTab}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post(`/api/${activeTab}`, newItem);
      toast.success(`${activeTab === "packages" ? "Package" : "Facility"} created!`);
      fetchData();
      setIsModalOpen(false);
      setNewItem({ name: "", price: "", description: "" });
    } catch (error) {
      toast.error("Creation failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services & Pricing</h1>
          <p className="text-gray-500">Manage your event packages and individual facilities.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <Plus size={20} /> Add {activeTab === "packages" ? "Package" : "Facility"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab("packages")}
          className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === "packages" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          Packages
        </button>
        <button 
          onClick={() => setActiveTab("facilities")}
          className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === "facilities" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          Facilities
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="col-span-full h-64 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
          ) : data.length > 0 ? (
            data.map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    {activeTab === "packages" ? <Package size={24} /> : <Settings2 size={24} />}
                  </div>
                  <button className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>

                <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                {activeTab === "packages" && (
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{item.description || "No description provided."}</p>
                )}

                <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-blue-600">
                    <span className="text-sm font-bold">Rs.</span>
                    <span className="text-2xl font-black">{item.price}</span>
                  </div>
                  <div className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full uppercase tracking-widest">
                    Active
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full h-64 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
              {activeTab === "packages" ? <Package size={48} /> : <Settings2 size={48} />}
              <p className="font-medium text-lg">No {activeTab} found.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative p-8"
          >
            <h2 className="text-2xl font-bold mb-6">Add {activeTab === "packages" ? "Package" : "Facility"}</h2>
            <form onSubmit={handleCreate} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Name</label>
                <input 
                  type="text" 
                  required
                  placeholder={activeTab === "packages" ? "e.g. Platinum Wedding" : "e.g. Buffet Catering"}
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Price (Rs.)</label>
                <input 
                  type="number" 
                  required
                  placeholder="0.00"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                />
              </div>

              {activeTab === "packages" && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Description</label>
                  <textarea 
                    rows={3}
                    placeholder="What's included in this package..."
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium resize-none"
                  />
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : "Save Item"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
