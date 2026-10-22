"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  Building2,
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  Search,
  Edit,
  Trash2
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import axios from "axios";
import { toast } from "react-hot-toast";
import { BookingModal } from "@/components/modals/BookingModal";
import { ConfirmBookingModal } from "@/components/modals/ConfirmBookingModal";

const formatTime12hr = (time24: string) => {
  if (!time24) return "";
  const [h, m] = time24.split(":");
  const date = new Date();
  date.setHours(parseInt(h), parseInt(m));
  return format(date, "hh:mm a");
};

export default function BookingsPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch bookings for the current month
  useEffect(() => {
    fetchBookings();
  }, [currentMonth]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/bookings");
      setBookings(res.data);
    } catch (error) {
      toast.error("Failed to fetch bookings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string, guestCount?: number, totalAmount?: number) => {
    try {
      await axios.patch(`/api/bookings/status/${id}`, { 
        status,
        guestCount,
        totalAmount,
        paidAmount: status === "CONFIRMED" ? totalAmount : undefined
      });
      toast.success(`Booking ${status.toLowerCase()}!`);
      fetchBookings();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    try {
      await axios.delete(`/api/bookings/${id}`);
      toast.success("Booking deleted");
      fetchBookings();
    } catch (error) {
      toast.error("Failed to delete booking");
    }
  };

  const openConfirmModal = (booking: any) => {
    setSelectedBooking(booking);
    setIsConfirmModalOpen(true);
  };

  const openEditModal = (booking: any) => {
    setSelectedBooking(booking);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const selectedDateBookings = bookings.filter(b => isSameDay(new Date(b.eventDate), selectedDate));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Event Calendar</h1>
          <p className="text-gray-500">Manage and track all marquee bookings effortlessly.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <Plus size={20} /> New Booking
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Side */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold">{format(currentMonth, "MMMM yyyy")}</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors border"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors border"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-4 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                <div key={day} className="text-center text-sm font-bold text-gray-400 uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-4">
              {/* Padding for start of month */}
              {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              
              {days.map((day, i) => {
                const hasBooking = bookings.some(b => isSameDay(new Date(b.eventDate), day));
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());

                return (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    key={i}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all border
                      ${isSelected ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100" : "bg-white border-gray-100 hover:border-blue-200"}
                      ${isToday && !isSelected ? "border-blue-600 text-blue-600" : ""}
                    `}
                  >
                    <span className="text-lg font-bold">{format(day, "d")}</span>
                    {hasBooking && !isSelected && (
                      <div className="absolute bottom-2 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-gray-500 text-sm font-medium">Monthly Total</p>
              <h3 className="text-2xl font-bold mt-1">{bookings.filter(b => isSameMonth(new Date(b.eventDate), currentMonth)).length}</h3>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-gray-500 text-sm font-medium">Confirmed</p>
              <h3 className="text-2xl font-bold text-green-500 mt-1">
                {bookings.filter(b => isSameMonth(new Date(b.eventDate), currentMonth) && b.status === "CONFIRMED").length}
              </h3>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-gray-500 text-sm font-medium">Pending</p>
              <h3 className="text-2xl font-bold text-yellow-500 mt-1">
                {bookings.filter(b => isSameMonth(new Date(b.eventDate), currentMonth) && b.status === "PENDING").length}
              </h3>
            </div>
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm min-h-[500px] flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold">{format(selectedDate, "EEEE")}</h3>
                <p className="text-gray-500">{format(selectedDate, "do MMMM, yyyy")}</p>
              </div>
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                <CalendarIcon size={20} />
              </div>
            </div>

            <div className="flex-1 space-y-4">
              {selectedDateBookings.length > 0 ? (
                selectedDateBookings.map((booking, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={index}
                    className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          booking.status === "CONFIRMED" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
                        }`}>
                          {booking.status}
                        </div>
                        <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase">
                          {formatTime12hr(booking.startTime)} - {formatTime12hr(booking.endTime)}
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600"><MoreVertical size={16} /></button>
                    </div>
                    
                    <h4 className="font-bold text-gray-900">{booking.clientName || booking.client?.name || "Private Event"}</h4>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs font-medium text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Building2 size={14} className="text-blue-500" />
                        {booking.hall?.name}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-blue-500" />
                        {booking.guestCount} Guests
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between items-center border-t border-gray-100">
                      <div className="text-sm font-bold text-blue-600">
                        Rs. {booking.totalAmount.toLocaleString()}
                      </div>
                      {booking.status === "PENDING" ? (
                        <button 
                          onClick={() => openConfirmModal(booking)}
                          className="px-3 py-1 bg-green-600 text-white text-[10px] font-bold rounded-lg hover:bg-green-700 transition-all shadow-sm"
                        >
                          Confirm & Pay
                        </button>
                      ) : (
                        <div />
                      )}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openEditModal(booking)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50 py-20">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={32} />
                  </div>
                  <p className="font-medium text-gray-500">No events scheduled for this day.</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-8 w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold hover:border-blue-600 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} /> Add Slot
            </button>
          </div>
        </div>
      </div>

      <BookingModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditMode(false);
          setSelectedBooking(null);
        }}
        selectedDate={selectedDate}
        onSuccess={fetchBookings}
        editBooking={selectedBooking}
      />

      <ConfirmBookingModal 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        booking={selectedBooking}
        onConfirm={handleUpdateStatus}
      />
    </div>
  );
}
