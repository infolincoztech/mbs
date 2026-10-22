"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  Printer, 
  Download, 
  Mail, 
  CheckCircle2, 
  Building2,
  Phone,
  Globe
} from "lucide-react";
import axios from "axios";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function InvoicePage() {
  const { id } = useParams();
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulated fetch - in real app fetch by ID
    setTimeout(() => {
      setBooking({
        id: id,
        eventDate: new Date(),
        client: { name: "Hamza Sheikh", email: "hamza@example.com", phone: "+92 300 1234567" },
        hall: { name: "Royal Ballroom" },
        totalAmount: 4500,
        paidAmount: 1500,
        status: "CONFIRMED",
        marquee: { name: "Grand Palace Marquee", address: "Main Boulevard, Gulberg, Lahore" }
      });
      setIsLoading(false);
    }, 1000);
  }, [id]);

  if (isLoading) return <div className="h-screen flex items-center justify-center">Loading Invoice...</div>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Actions */}
      <div className="flex justify-between items-center mb-8 no-print">
        <h1 className="text-2xl font-bold">Invoice #{id?.slice(0, 8)}</h1>
        <div className="flex gap-4">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl font-bold shadow-sm hover:bg-gray-50"
          >
            <Printer size={18} /> Print
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100">
            <Download size={18} /> Download PDF
          </button>
        </div>
      </div>

      {/* Invoice Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-gray-50 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100%] opacity-50" />
        
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl mb-4">
              G
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{booking.marquee.name}</h2>
            <p className="text-gray-500 text-sm max-w-xs mt-1">{booking.marquee.address}</p>
          </div>
          <div className="text-right">
            <h3 className="text-4xl font-black text-blue-600 uppercase tracking-tighter">Invoice</h3>
            <p className="text-gray-400 mt-2 font-bold">DATE: {format(new Date(), "MMM dd, yyyy")}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Billed To</p>
            <h4 className="font-bold text-lg">{booking.client.name}</h4>
            <div className="space-y-1 mt-2 text-sm text-gray-500 font-medium">
              <p className="flex items-center gap-2"><Mail size={14} /> {booking.client.email}</p>
              <p className="flex items-center gap-2"><Phone size={14} /> {booking.client.phone}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Event Details</p>
            <h4 className="font-bold text-lg">{booking.hall.name}</h4>
            <p className="text-sm text-blue-600 font-bold mt-1">{format(new Date(booking.eventDate), "EEEE, MMM dd, yyyy")}</p>
            <p className="text-xs text-gray-400 mt-1">Evening Slot</p>
          </div>
        </div>

        {/* Table */}
        <div className="mb-12">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="py-4">Description</th>
                <th className="py-4 text-center">Qty</th>
                <th className="py-4 text-right">Price</th>
                <th className="py-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr>
                <td className="py-6">
                  <p className="font-bold text-gray-900">Hall Booking Fee</p>
                  <p className="text-xs text-gray-400">Full usage of {booking.hall.name}</p>
                </td>
                <td className="py-6 text-center font-bold">1</td>
                <td className="py-6 text-right font-bold">Rs. 1,500.00</td>
                <td className="py-6 text-right font-black text-gray-900">Rs. 1,500.00</td>
              </tr>
              <tr>
                <td className="py-6">
                  <p className="font-bold text-gray-900">Catering Services</p>
                  <p className="text-xs text-gray-400">Platinum Wedding Package (500 Guests)</p>
                </td>
                <td className="py-6 text-center font-bold">500</td>
                <td className="py-6 text-right font-bold">Rs. 6.00</td>
                <td className="py-6 text-right font-black text-gray-900">Rs. 3,000.00</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="flex justify-end pt-8 border-t-2 border-gray-50">
          <div className="w-64 space-y-4">
            <div className="flex justify-between text-gray-500 font-bold">
              <span>Subtotal</span>
              <span>Rs. 4,500.00</span>
            </div>
            <div className="flex justify-between text-blue-600 font-black text-xl pt-4 border-t border-gray-100">
              <span>Total Amount</span>
              <span>Rs. 4,500.00</span>
            </div>
            <div className="flex justify-between text-green-500 font-bold text-sm">
              <span>Paid Amount</span>
              <span>Rs. 1,500.00</span>
            </div>
            <div className="flex justify-between text-red-500 font-black text-sm bg-red-50 p-3 rounded-xl mt-4">
              <span>Balance Due</span>
              <span>Rs. 3,000.00</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-12 border-t border-gray-50 flex justify-between items-center text-[10px] font-black text-gray-300 uppercase tracking-widest">
          <p>Powered by Lincoz Tech</p>
          <div className="flex gap-6">
            <p>Terms & Conditions Apply</p>
            <p>Verification QR</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
