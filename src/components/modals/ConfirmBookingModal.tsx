"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Users, TrendingUp, DollarSign, Loader2, CheckCircle2 } from "lucide-react";

interface ConfirmBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  onConfirm: (id: string, status: string, guestCount: number, totalAmount: number) => void;
}

export const ConfirmBookingModal = ({ isOpen, onClose, booking, onConfirm }: ConfirmBookingModalProps) => {
  const [guestCount, setGuestCount] = useState(booking?.guestCount || 0);
  const [pricePerHead, setPricePerHead] = useState(booking?.pricePerHead || 0);
  const [discount, setDiscount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (booking) {
      setGuestCount(booking.guestCount || 0);
      setPricePerHead(booking.pricePerHead || 0);
      setDiscount(0);
    }
  }, [booking]);

  if (!isOpen || !booking) return null;

  const totalAmount = guestCount * pricePerHead;
  const advancePaid = booking?.paidAmount || 0;
  const finalTotalAmount = Math.max(0, totalAmount - discount);
  const remainingBalance = finalTotalAmount - advancePaid;

  const handleConfirm = async () => {
    setIsLoading(true);
    await onConfirm(booking.id, "CONFIRMED", guestCount, finalTotalAmount);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-y-auto max-h-[90vh]"
      >
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-blue-50/50">
          <div>
            <h2 className="text-2xl font-bold text-blue-900">Final Verification</h2>
            <p className="text-blue-700 text-sm">Verify guest count and bill before confirming.</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-colors text-blue-900">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Users size={16} className="text-blue-600" /> Actual Guest Count
              </label>
              <input
                type="number"
                value={guestCount}
                onChange={(e) => setGuestCount(parseInt(e.target.value || "0"))}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-bold text-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-600" /> Price Per Head (Locked)
              </label>
              <div className="w-full p-4 bg-gray-100 border border-gray-100 rounded-2xl font-bold text-gray-500">
                Rs. {pricePerHead}
              </div>
            </div>

            {advancePaid > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <DollarSign size={16} className="text-blue-600" /> Advance Paid
                </label>
                <div className="w-full p-4 bg-green-50 border border-green-100 rounded-2xl font-bold text-green-600">
                  Rs. {advancePaid.toLocaleString()}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <DollarSign size={16} className="text-red-500" /> Discount (Optional)
              </label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(parseInt(e.target.value || "0"))}
                className="w-full p-4 bg-red-50 border border-red-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 transition-all font-bold text-red-600"
              />
            </div>

            <div className="p-6 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Remaining Balance</p>
                  <h3 className="text-3xl font-black">Rs. {remainingBalance.toLocaleString()}</h3>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <DollarSign size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold"
            >
              Back
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-[2] py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-xl shadow-green-100 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={20} /> Finalize & Pay</>}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
