"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar as CalendarIcon, Clock, Users, DollarSign, Loader2, Building2, TrendingUp } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSuccess: () => void;
  editBooking?: any;
}

export const BookingModal = ({ isOpen, onClose, selectedDate, onSuccess, editBooking }: BookingModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [halls, setHalls] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    hallId: "",
    eventDate: format(selectedDate, "yyyy-MM-dd"),
    startTime: "",
    endTime: "",
    guestCount: "",
    pricePerHead: "",
    totalAmount: "",
    paidAmount: "",
    clientName: "",
    clientPhone: "",
    clientAddress: "",
    clientCnic: "",
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchHalls();
      if (editBooking) {
        setFormData({
          hallId: editBooking.hallId,
          eventDate: format(new Date(editBooking.eventDate), "yyyy-MM-dd"),
          startTime: editBooking.startTime,
          endTime: editBooking.endTime,
          guestCount: editBooking.guestCount.toString(),
          pricePerHead: editBooking.pricePerHead.toString(),
          totalAmount: editBooking.totalAmount.toString(),
          paidAmount: editBooking.paidAmount.toString(),
          clientName: editBooking.clientName || "",
          clientPhone: editBooking.clientPhone || "",
          clientAddress: editBooking.clientAddress || "",
          clientCnic: editBooking.clientCnic || "",
          notes: editBooking.notes || "",
        });
      } else {
        setFormData({
          hallId: "",
          eventDate: format(selectedDate, "yyyy-MM-dd"),
          startTime: "",
          endTime: "",
          guestCount: "",
          pricePerHead: "",
          totalAmount: "",
          paidAmount: "",
          clientName: "",
          clientPhone: "",
          clientAddress: "",
          clientCnic: "",
          notes: "",
        });
      }
    }
  }, [isOpen, selectedDate, editBooking]);

  const fetchHalls = async () => {
    try {
      const res = await axios.get("/api/halls");
      setHalls(res.data);
      if (!editBooking && res.data.length > 0) {
        setFormData(prev => ({ ...prev, hallId: res.data[0].id }));
      }
    } catch (error) {
      toast.error("Failed to fetch halls");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editBooking) {
        await axios.patch(`/api/bookings/${editBooking.id}`, formData);
        toast.success("Booking updated successfully!");
      } else {
        await axios.post("/api/bookings", formData);
        toast.success("Booking created successfully!");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to save booking");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[95vh]"
      >
        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">New Hall Booking</h2>
            <p className="text-gray-500 text-sm">Fill in the details to reserve a slot.</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hall Selection */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Building2 size={16} className="text-blue-600" /> Select Hall
              </label>
              <select
                required
                value={formData.hallId}
                onChange={(e) => setFormData({ ...formData, hallId: e.target.value })}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
              >
                {halls.map(hall => (
                  <option key={hall.id} value={hall.id}>{hall.name} ({hall.capacity} cap)</option>
                ))}
              </select>
            </div>

            {/* Client Details Section */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
              <h3 className="md:col-span-2 text-sm font-bold text-blue-900 uppercase tracking-widest">Client Information</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Client Name *</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full p-4 bg-white border border-blue-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+92 300 0000000"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  className="w-full p-4 bg-white border border-blue-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">CNIC Number *</label>
                <input
                  type="text"
                  required
                  placeholder="XXXXX-XXXXXXX-X"
                  value={formData.clientCnic}
                  onChange={(e) => setFormData({ ...formData, clientCnic: e.target.value })}
                  className="w-full p-4 bg-white border border-blue-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Complete Address"
                  value={formData.clientAddress}
                  onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                  className="w-full p-4 bg-white border border-blue-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                />
              </div>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <CalendarIcon size={16} className="text-blue-600" /> Event Date
              </label>
              <input
                type="date"
                required
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
              />
            </div>

            {/* Timing */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Clock size={16} className="text-blue-600" /> Start Time
              </label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Clock size={16} className="text-blue-600" /> End Time
              </label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
              />
            </div>

            {/* Guest Count */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Users size={16} className="text-blue-600" /> Total Guests
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 500"
                value={formData.guestCount}
                onChange={(e) => {
                  const val = e.target.value;
                  const newGuest = parseFloat(val || "0");
                  const newPrice = parseFloat(formData.pricePerHead || "0");
                  setFormData(prev => ({ 
                    ...prev, 
                    guestCount: val,
                    totalAmount: isNaN(newGuest * newPrice) ? "0" : (newGuest * newPrice).toString()
                  }));
                }}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
              />
            </div>

            {/* Price Per Head */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-600" /> Price Per Head (Rs.)
              </label>
              <input
                type="number"
                placeholder="e.g. 1500"
                value={formData.pricePerHead}
                onChange={(e) => {
                  const val = e.target.value;
                  const newPrice = parseFloat(val || "0");
                  const newGuest = parseFloat(formData.guestCount || "0");
                  setFormData(prev => ({ 
                    ...prev, 
                    pricePerHead: val,
                    totalAmount: isNaN(newGuest * newPrice) ? "0" : (newGuest * newPrice).toString()
                  }));
                }}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
              />
            </div>

            {/* Total Amount */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <DollarSign size={16} className="text-blue-600" /> Total Bill (Rs.)
              </label>
              <input
                type="number"
                required
                placeholder="0.00"
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
              />
            </div>

            {/* Advance Payment */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <DollarSign size={16} className="text-blue-600" /> Advance Paid (Rs.)
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={formData.paidAmount}
                onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Special Notes</label>
            <textarea
              placeholder="Any specific requirements..."
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium resize-none"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Confirm Booking"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
