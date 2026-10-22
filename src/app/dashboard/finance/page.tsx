"use client";

import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CheckCircle2,
  Printer
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function FinancePage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Month Selection
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());

  const [formData, setFormData] = useState({
    type: "EXPENSE",
    amount: "",
    category: "Maintenance",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });

  useEffect(() => {
    fetchFinanceData();
  }, [selectedMonth, selectedYear]);

  const fetchFinanceData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/finance?month=${selectedMonth}&year=${selectedYear}`);
      setData(res.data);
    } catch (error) {
      toast.error("Failed to fetch finance data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post("/api/finance", formData);
      toast.success("Transaction recorded!");
      fetchFinanceData();
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to record transaction");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:space-y-4 print:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance & Accounts</h1>
          <p className="text-gray-500">Track your marquee's profitability and expenses.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-3 bg-white border border-gray-100 rounded-xl font-bold outline-none cursor-pointer"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={i}>
                {format(new Date(2000, i, 1), "MMMM")}
              </option>
            ))}
          </select>

          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-3 bg-white border border-gray-100 rounded-xl font-bold outline-none cursor-pointer"
          >
            {[currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button 
            onClick={handlePrint}
            className="px-4 py-3 bg-gray-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg"
          >
            <Printer size={18} /> <span className="hidden md:inline">Print Report</span>
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            <Plus size={18} /> <span className="hidden md:inline">Add Expense</span>
          </button>
        </div>
      </div>

      {/* Print Only Header */}
      <div className="hidden print:block text-center mb-8 border-b-2 border-gray-900 pb-4">
        <h1 className="text-4xl font-black uppercase tracking-widest">Financial Report</h1>
        <p className="text-xl font-bold text-gray-500 mt-2">
          {format(new Date(parseInt(selectedYear), parseInt(selectedMonth), 1), "MMMM yyyy")}
        </p>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm print:border-gray-300 print:shadow-none print:rounded-2xl"
            >
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4 print:hidden">
                <TrendingUp size={24} />
              </div>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-widest print:text-black">Total Income</p>
              <h3 className="text-4xl font-black mt-2 print:text-3xl text-green-600">Rs. {data?.summary?.totalIncome?.toLocaleString() || 0}</h3>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm print:border-gray-300 print:shadow-none print:rounded-2xl"
            >
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-4 print:hidden">
                <TrendingDown size={24} />
              </div>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-widest print:text-black">Total Expenses</p>
              <h3 className="text-4xl font-black mt-2 print:text-3xl text-red-600">Rs. {data?.summary?.totalExpense?.toLocaleString() || 0}</h3>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-100 print:bg-white print:border-2 print:border-black print:text-black print:shadow-none print:rounded-2xl"
            >
              <div className="w-12 h-12 bg-white/20 text-white rounded-2xl flex items-center justify-center mb-4 print:hidden">
                <Wallet size={24} />
              </div>
              <p className="opacity-70 text-sm font-bold uppercase tracking-widest print:opacity-100">Net Profit</p>
              <h3 className="text-4xl font-black mt-2 print:text-3xl">Rs. {data?.summary?.netProfit?.toLocaleString() || 0}</h3>
            </motion.div>
          </div>

          {/* Transactions List */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden print:border-none print:shadow-none print:mt-12">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50 print:bg-transparent print:p-0 print:border-black print:mb-4">
              <h3 className="text-xl font-bold uppercase tracking-widest print:text-2xl">Transaction Ledger</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse print:text-sm">
                <thead>
                  <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-50 print:text-black print:border-black">
                    <th className="px-8 py-4 print:px-2">Date</th>
                    <th className="px-8 py-4 print:px-2">Transaction</th>
                    <th className="px-8 py-4 print:px-2">Category</th>
                    <th className="px-8 py-4 print:px-2">Type</th>
                    <th className="px-8 py-4 print:px-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 print:divide-gray-300">
                  {data?.records?.length > 0 ? data.records.map((record: any) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6 text-gray-500 font-medium print:px-2 print:text-black">
                        {format(new Date(record.date), "MMM dd, yyyy")}
                      </td>
                      <td className="px-8 py-6 print:px-2">
                        <span className="font-bold text-gray-900">{record.description || "General"}</span>
                      </td>
                      <td className="px-8 py-6 print:px-2">
                        <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-full uppercase tracking-wider print:bg-transparent print:p-0 print:text-black">
                          {record.category}
                        </span>
                      </td>
                      <td className="px-8 py-6 print:px-2">
                        <div className={`flex items-center gap-1.5 font-bold text-xs ${record.type === "INCOME" ? "text-green-600" : "text-red-600"} print:text-black`}>
                          {record.type}
                        </div>
                      </td>
                      <td className={`px-8 py-6 font-black text-right print:px-2 ${record.type === "INCOME" ? "text-green-600" : "text-red-600"} print:text-black`}>
                        {record.type === "INCOME" ? "+" : "-"}Rs. {record.amount.toLocaleString()}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-8 py-16 text-center text-gray-400 font-bold">
                        No transactions recorded for this month.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 no-print">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative p-8"
          >
            <h2 className="text-2xl font-bold mb-6">Record New Expense</h2>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                >
                  <option value="Maintenance">Maintenance</option>
                  <option value="Salary">Staff Salary</option>
                  <option value="Utility">Utilities (Electricity/Water)</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Inventory">Inventory Purchase</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Amount (Rs.)</label>
                <input 
                  type="number" required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Description</label>
                <input 
                  type="text" required
                  placeholder="e.g. Electricity Bill Jan 2026"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={isLoading}
                  className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : "Save Transaction"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
