"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Building2, 
  Users, 
  DollarSign, 
  MoreVertical, 
  Loader2,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

export default function HallsPage() {
  const [halls, setHalls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHall, setNewHall] = useState({
    name: "",
    capacity: "",
    pricePerSlot: "",
    pricePerHead: "",
    features: [] as string[],
  });

  useEffect(() => {
    fetchHalls();
  }, []);

  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedHallId, setSelectedHallId] = useState<string | null>(null);

  const fetchHalls = async () => {
    try {
      const res = await axios.get("/api/halls");
      setHalls(res.data);
    } catch (error) {
      toast.error("Failed to fetch halls");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isEditMode && selectedHallId) {
        await axios.patch(`/api/halls/${selectedHallId}`, newHall);
        toast.success("Hall updated successfully!");
      } else {
        await axios.post("/api/halls", newHall);
        toast.success("Hall added successfully!");
      }
      fetchHalls();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to save hall");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHall = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hall?")) return;
    try {
      await axios.delete(`/api/halls/${id}`);
      toast.success("Hall deleted!");
      fetchHalls();
    } catch (error) {
      toast.error("Failed to delete hall");
    }
  };

  const resetForm = () => {
    setNewHall({ name: "", capacity: "", pricePerSlot: "", pricePerHead: "", features: [] });
    setIsEditMode(false);
    setSelectedHallId(null);
  };

  const openEditModal = (hall: any) => {
    setNewHall({
      name: hall.name,
      capacity: hall.capacity.toString(),
      pricePerSlot: hall.pricePerSlot.toString(),
      pricePerHead: hall.pricePerHead ? hall.pricePerHead.toString() : "0",
      features: hall.features,
    });
    setIsEditMode(true);
    setSelectedHallId(hall.id);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hall Management</h1>
          <p className="text-gray-500">Manage your marquee halls and capacity.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <Plus size={20} /> Add New Hall
        </button>
      </div>

      {/* Halls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full h-64 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        ) : halls.length > 0 ? (
          halls.map((hall, index) => (
            <motion.div 
              key={hall.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => openEditModal(hall)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => handleDeleteHall(hall.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                <Building2 size={28} />
              </div>

              <h3 className="text-xl font-bold mb-2">{hall.name}</h3>
              <div className="flex items-center gap-2 mb-6">
                <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 ${
                  hall.status === "AVAILABLE" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                }`}>
                  {hall.status === "AVAILABLE" ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  {hall.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <Users size={14} /> Capacity
                  </div>
                  <p className="font-bold">{hall.capacity} Guests</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <DollarSign size={14} /> Rate/Slot
                  </div>
                  <p className="font-bold">Rs. {hall.pricePerSlot.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full h-64 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <Building2 size={48} />
            <p className="font-medium">No halls found. Add your first hall to get started.</p>
          </div>
        )}
      </div>

      {/* Add Hall Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative p-8"
          >
            <h2 className="text-2xl font-bold mb-6">{isEditMode ? "Edit Hall" : "Add New Hall"}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Hall Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Imperial Ballroom"
                  value={newHall.name}
                  onChange={(e) => setNewHall({ ...newHall, name: e.target.value })}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Max Capacity</label>
                  <input 
                    type="number" 
                    required
                    placeholder="500"
                    value={newHall.capacity}
                    onChange={(e) => setNewHall({ ...newHall, capacity: e.target.value })}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Base Price (Rs.)</label>
                  <input 
                    type="number" 
                    required
                    placeholder="1200"
                    value={newHall.pricePerSlot}
                    onChange={(e) => setNewHall({ ...newHall, pricePerSlot: e.target.value })}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Per Head (Rs.)</label>
                  <input 
                    type="number" 
                    required
                    placeholder="1500"
                    value={newHall.pricePerHead}
                    onChange={(e) => setNewHall({ ...newHall, pricePerHead: e.target.value })}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                  />
                </div>
              </div>
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
                  className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : (isEditMode ? "Update Hall" : "Save Hall")}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
