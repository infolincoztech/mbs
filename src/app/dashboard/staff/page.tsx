"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Users, 
  Mail, 
  DollarSign, 
  Loader2,
  Trash2,
  ShieldCheck,
  TrendingDown,
  Gift,
  FileText,
  CheckCircle2
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  
  // Form Data
  const [formData, setFormData] = useState({ name: "", email: "", designation: "", salary: "" });
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [payrollData, setPayrollData] = useState({ advanceDeducted: "0", bonus: "0" });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await axios.get("/api/staff");
      setStaff(res.data);
    } catch (error) {
      toast.error("Failed to fetch staff");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post("/api/staff", formData);
      toast.success("Staff member hired!");
      fetchStaff();
      setIsAddModalOpen(false);
      setFormData({ name: "", email: "", designation: "", salary: "" });
    } catch (error) {
      toast.error("Failed to add staff");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGiveAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post(`/api/staff/${selectedStaff.id}/advance`, { amount: advanceAmount });
      toast.success("Advance granted and recorded in expenses!");
      fetchStaff();
      setIsAdvanceModalOpen(false);
      setAdvanceAmount("");
    } catch (error) {
      toast.error("Failed to grant advance");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaySalary = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post(`/api/staff/${selectedStaff.id}/payroll`, payrollData);
      toast.success("Salary paid and recorded!");
      fetchStaff();
      setIsPayrollModalOpen(false);
      setPayrollData({ advanceDeducted: "0", bonus: "0" });
    } catch (error) {
      toast.error("Failed to pay salary");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm("Are you sure you want to remove this staff member?")) return;
    try {
      await axios.delete(`/api/staff/${id}`);
      toast.success("Staff member removed");
      fetchStaff();
    } catch (error) {
      toast.error("Failed to delete staff");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff & Payroll Management</h1>
          <p className="text-gray-500">Manage your employees, track advances, and issue daily wages.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <Plus size={20} /> Hire Staff
        </button>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full h-64 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        ) : staff.length > 0 ? (
          staff.map((s, index) => (
            <motion.div 
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6"
            >
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-2xl font-black">
                    {s.name[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{s.name}</h3>
                    <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase w-fit mt-1">
                      <ShieldCheck size={12} /> {s.designation}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {s.email && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Mail size={16} /> {s.email}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-900 font-bold">
                    <DollarSign size={16} className="text-green-500" /> Base Wages: Rs. {s.salary.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 text-gray-900 font-bold">
                    <TrendingDown size={16} className="text-red-500" /> Advance Taken: <span className="text-red-500">Rs. {s.advanceTaken.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 justify-center min-w-[200px] border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                <button 
                  onClick={() => { setSelectedStaff(s); setIsAdvanceModalOpen(true); }}
                  className="w-full py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  Give Advance
                </button>
                <button 
                  onClick={() => { setSelectedStaff(s); setIsHistoryModalOpen(true); }}
                  className="w-full py-2.5 bg-gray-50 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <FileText size={16} /> View History
                </button>
                {(() => {
                  const lastPayroll = s.payrolls?.[0];
                  if (lastPayroll) {
                    const payrollDate = new Date(lastPayroll.createdAt);
                    const now = new Date();
                    if (payrollDate.getMonth() === now.getMonth() && payrollDate.getFullYear() === now.getFullYear()) {
                      return (
                        <div className="w-full py-3 bg-gray-100 text-gray-400 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                          <CheckCircle2 size={16} /> Wages Paid
                        </div>
                      );
                    }
                  }
                  return (
                    <button 
                      onClick={() => { 
                        setSelectedStaff(s); 
                        setPayrollData({ advanceDeducted: Math.min(s.advanceTaken, s.salary).toString(), bonus: "0" });
                        setIsPayrollModalOpen(true); 
                      }}
                      className="w-full py-3 bg-green-600 text-white shadow-lg shadow-green-100 rounded-xl font-bold text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      Pay Wages
                    </button>
                  );
                })()}
                
                {s.payrolls?.length > 0 && (
                  <div className="mt-2 text-xs text-gray-400 text-center font-medium">
                    Last paid: {format(new Date(s.payrolls[0].month), "MMM yyyy")}
                  </div>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full h-64 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <Users size={48} />
            <p className="font-medium text-lg">No staff members found.</p>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative p-8"
          >
            <h2 className="text-2xl font-bold mb-6">Hire New Staff</h2>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Full Name</label>
                <input 
                  type="text" required placeholder="John Doe"
                  value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Email Address (Optional)</label>
                <input 
                  type="email" placeholder="john@example.com"
                  value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Designation</label>
                  <input 
                    type="text" required placeholder="Manager"
                    value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Daily Wages (Rs.)</label>
                  <input 
                    type="number" required placeholder="50000"
                    value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2">
                  {isLoading ? <Loader2 className="animate-spin" /> : "Hire Staff"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Advance Modal */}
      {isAdvanceModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsAdvanceModalOpen(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl relative p-8"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingDown size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Grant Advance</h2>
              <p className="text-sm text-gray-500 font-medium mt-1">For {selectedStaff.name}</p>
            </div>
            
            <form onSubmit={handleGiveAdvance} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Advance Amount (Rs.)</label>
                <input 
                  type="number" required placeholder="0" max={selectedStaff.salary}
                  value={advanceAmount} onChange={(e) => setAdvanceAmount(e.target.value)}
                  className="w-full p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 transition-all font-black text-xl text-center"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsAdvanceModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2">
                  {isLoading ? <Loader2 className="animate-spin" /> : "Confirm"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Payroll Modal */}
      {isPayrollModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsPayrollModalOpen(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative p-8"
          >
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                <FileText size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Issue Wages</h2>
                <p className="text-sm text-gray-500 font-medium">Paying {selectedStaff.name} for {format(new Date(), "MMMM yyyy")}</p>
              </div>
            </div>
            
            <form onSubmit={handlePaySalary} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase">Base Wages</p>
                  <p className="text-xl font-black text-gray-900 mt-1">Rs. {selectedStaff.salary.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                  <p className="text-xs font-bold text-red-400 uppercase">Total Advance Owed</p>
                  <p className="text-xl font-black text-red-600 mt-1">Rs. {selectedStaff.advanceTaken.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 flex justify-between">
                    <span>Deduct Advance (Rs.)</span>
                    <span className="text-xs text-gray-400">Max: {selectedStaff.advanceTaken}</span>
                  </label>
                  <input 
                    type="number" required placeholder="0" max={selectedStaff.advanceTaken}
                    value={payrollData.advanceDeducted} 
                    onChange={(e) => setPayrollData({ ...payrollData, advanceDeducted: e.target.value })}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-bold"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Gift size={16} className="text-blue-500" /> Add Bonus (Optional)
                  </label>
                  <input 
                    type="number" placeholder="0"
                    value={payrollData.bonus} 
                    onChange={(e) => setPayrollData({ ...payrollData, bonus: e.target.value })}
                    className="w-full p-4 bg-blue-50/50 border border-blue-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-bold text-blue-600"
                  />
                </div>
              </div>

              <div className="p-6 bg-green-600 rounded-2xl text-white shadow-xl shadow-green-100 flex justify-between items-center">
                <span className="font-bold">Net Payable</span>
                <span className="text-3xl font-black">
                  Rs. {(selectedStaff.salary - parseFloat(payrollData.advanceDeducted || "0") + parseFloat(payrollData.bonus || "0")).toLocaleString()}
                </span>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setIsPayrollModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-[2] py-4 bg-green-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-100">
                  {isLoading ? <Loader2 className="animate-spin" /> : "Finalize Payment"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {/* History Modal */}
      {isHistoryModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsHistoryModalOpen(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative p-8 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Payment History: {selectedStaff.name}</h2>
              <button onClick={() => setIsHistoryModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Trash2 size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-8">
              {/* Advances Section */}
              <div>
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <TrendingDown size={14} className="text-red-500" /> Advance History
                </h3>
                <div className="space-y-3">
                  {selectedStaff.advances?.length > 0 ? (
                    selectedStaff.advances.map((adv: any) => (
                      <div key={adv.id} className="flex justify-between items-center p-4 bg-red-50/50 rounded-2xl border border-red-100">
                        <div>
                          <p className="font-bold text-red-700">Rs. {adv.amount.toLocaleString()}</p>
                          <p className="text-xs text-red-400">{format(new Date(adv.date), "PPP")}</p>
                        </div>
                        <span className="px-3 py-1 bg-white text-red-500 text-[10px] font-bold rounded-full border border-red-100 uppercase">Paid</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic">No advance records found.</p>
                  )}
                </div>
              </div>

              {/* Payroll Section */}
              <div>
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FileText size={14} className="text-green-500" /> Wages History
                </h3>
                <div className="space-y-3">
                  {selectedStaff.payrolls?.length > 0 ? (
                    selectedStaff.payrolls.map((pay: any) => (
                      <div key={pay.id} className="p-4 bg-green-50/50 rounded-2xl border border-green-100">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-green-700">Rs. {pay.netPaid.toLocaleString()}</p>
                            <p className="text-xs text-green-400">{format(new Date(pay.createdAt), "PPP")}</p>
                          </div>
                          <span className="text-xs font-black text-green-600 uppercase">{format(new Date(pay.month), "MMM yyyy")}</span>
                        </div>
                        <div className="flex gap-4 text-[10px] font-bold text-green-500/70">
                          <span>Base: {pay.baseSalary}</span>
                          {pay.advanceDeducted > 0 && <span>Deduction: -{pay.advanceDeducted}</span>}
                          {pay.bonus > 0 && <span>Bonus: +{pay.bonus}</span>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic">No salary records found.</p>
                  )}
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsHistoryModalOpen(false)}
              className="w-full mt-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
