"use client";

import { useState, useEffect } from "react";
import { 
  Building2, 
  Plus, 
  Trash2, 
  Edit2, 
  Loader2, 
  ExternalLink,
  ShieldCheck,
  Calendar,
  CreditCard,
  Palette
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

export default function SuperAdminMarqueesPage() {
  const [marquees, setMarquees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    ownerName: "",
    ownerEmail: "",
    ownerPassword: "",
    planType: "MONTHLY",
    expiryDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    primaryColor: "#2563eb",
    logo: ""
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [selectedMarquee, setSelectedMarquee] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    address: "",
    contactPhone: "",
    contactEmail: "",
    primaryColor: "",
    logo: ""
  });
  const [subFormData, setSubFormData] = useState({
    planType: "",
    endDate: ""
  });

  useEffect(() => {
    fetchMarquees();
  }, []);

  const fetchMarquees = async () => {
    try {
      const res = await axios.get("/api/super-admin/marquees");
      setMarquees(res.data);
    } catch (error) {
      toast.error("Failed to fetch marquees");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post("/api/super-admin/marquees", formData);
      toast.success("Marquee created successfully!");
      setIsModalOpen(false);
      fetchMarquees();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create marquee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will delete all data for this marquee!")) return;
    try {
      await axios.delete(`/api/super-admin/marquees/${id}`);
      toast.success("Marquee deleted");
      fetchMarquees();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleEditClick = (m: any) => {
    setSelectedMarquee(m);
    setEditFormData({
      name: m.name,
      address: m.address || "",
      contactPhone: m.contactPhone || "",
      contactEmail: m.contactEmail || "",
      primaryColor: m.primaryColor,
      logo: m.logo || ""
    });
    setIsEditModalOpen(true);
  };

  const handleSubscriptionClick = (m: any) => {
    setSelectedMarquee(m);
    setSubFormData({
      planType: m.subscription?.planType || "BASIC",
      endDate: format(new Date(m.subscription?.endDate), "yyyy-MM-dd")
    });
    setIsSubscriptionModalOpen(true);
  };

  const handleUpdateMarquee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.patch(`/api/super-admin/marquees/${selectedMarquee.id}`, editFormData);
      toast.success("Marquee updated successfully!");
      setIsEditModalOpen(false);
      fetchMarquees();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update marquee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.patch(`/api/super-admin/marquees/${selectedMarquee.id}`, subFormData);
      toast.success("Subscription updated successfully!");
      setIsSubscriptionModalOpen(false);
      fetchMarquees();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update subscription");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marquee Management</h1>
          <p className="text-gray-500">Create and manage all marquee accounts and subscriptions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <Plus size={20} /> New Marquee
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-50 bg-gray-50/50">
                  <th className="px-8 py-4">Marquee Info</th>
                  <th className="px-8 py-4">Owner Info</th>
                  <th className="px-8 py-4">Plan & Expiry</th>
                  <th className="px-8 py-4">Branding</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : marquees.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: m.primaryColor }}
                        >
                          {m.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{m.name}</p>
                          <p className="text-xs text-gray-400">ID: {m.id.substring(0,8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{m.owner?.name}</span>
                        <span className="text-xs text-gray-400">{m.owner?.email}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full w-fit">
                          {m.subscription?.planType}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar size={12} /> {format(new Date(m.subscription?.endDate), "MMM dd, yyyy")}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-full border border-gray-200"
                          style={{ backgroundColor: m.primaryColor }}
                        />
                        <span className="text-xs font-mono text-gray-400">{m.primaryColor}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleSubscriptionClick(m)}
                          className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Subscription Management"
                        >
                          <CreditCard size={18} />
                        </button>
                        <button 
                          onClick={() => handleEditClick(m)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit Marquee"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(m.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Marquee"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Register New Marquee</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-blue-600">Marquee Details</h3>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Business Name</label>
                    <input 
                      type="text" required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Theme Color</label>
                    <div className="flex gap-3">
                      <input 
                        type="color" 
                        className="w-12 h-12 rounded-xl cursor-pointer"
                        value={formData.primaryColor}
                        onChange={e => setFormData({...formData, primaryColor: e.target.value})}
                      />
                      <input 
                        type="text" 
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                        value={formData.primaryColor}
                        onChange={e => setFormData({...formData, primaryColor: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Marquee Logo (URL)</label>
                    <input 
                      type="text"
                      placeholder="https://example.com/logo.png"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                      value={formData.logo}
                      onChange={e => setFormData({...formData, logo: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-blue-600">Owner Account</h3>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Owner Name</label>
                    <input 
                      type="text" required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                      value={formData.ownerName}
                      onChange={e => setFormData({...formData, ownerName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Owner Email</label>
                    <input 
                      type="email" required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                      value={formData.ownerEmail}
                      onChange={e => setFormData({...formData, ownerEmail: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Initial Password</label>
                    <input 
                      type="text" required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                      value={formData.ownerPassword}
                      onChange={e => setFormData({...formData, ownerPassword: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-sm font-black uppercase tracking-widest text-blue-600 mb-4">Subscription Plan</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Plan Type</label>
                    <select 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                      value={formData.planType}
                      onChange={e => setFormData({...formData, planType: e.target.value})}
                    >
                      <option value="TRIAL">7 Days Trial</option>
                      <option value="MONTHLY">Monthly (3,000)</option>
                      <option value="HALF_YEARLY">6 Months (10,000)</option>
                      <option value="YEARLY">Yearly (20,000)</option>
                      <option value="LIFETIME">Lifetime (100,000)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Expiry Date</label>
                    <input 
                      type="date" required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                      value={formData.expiryDate}
                      onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-2 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isSubmitting && setIsEditModalOpen(false)} />
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Edit Marquee</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            
            <form onSubmit={handleUpdateMarquee} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-blue-600">Basic Details</h3>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Business Name</label>
                    <input 
                      type="text" required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                      value={editFormData.name}
                      onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Theme Color</label>
                    <div className="flex gap-3">
                      <input 
                        type="color" 
                        className="w-12 h-12 rounded-xl cursor-pointer"
                        value={editFormData.primaryColor}
                        onChange={e => setEditFormData({...editFormData, primaryColor: e.target.value})}
                      />
                      <input 
                        type="text" 
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                        value={editFormData.primaryColor}
                        onChange={e => setEditFormData({...editFormData, primaryColor: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Logo (URL)</label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                      value={editFormData.logo}
                      onChange={e => setEditFormData({...editFormData, logo: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-blue-600">Contact Details</h3>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Address</label>
                    <textarea 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 h-24"
                      value={editFormData.address}
                      onChange={e => setEditFormData({...editFormData, address: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Contact Phone</label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                      value={editFormData.contactPhone}
                      onChange={e => setEditFormData({...editFormData, contactPhone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Contact Email</label>
                    <input 
                      type="email"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                      value={editFormData.contactEmail}
                      onChange={e => setEditFormData({...editFormData, contactEmail: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-2 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {isSubscriptionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isSubmitting && setIsSubscriptionModalOpen(false)} />
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Subscription Management</h2>
                <p className="text-gray-400 text-sm">{selectedMarquee?.name}</p>
              </div>
              <button onClick={() => setIsSubscriptionModalOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            
            <form onSubmit={handleUpdateSubscription} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Plan Type (Upgrade)</label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                    value={subFormData.planType}
                    onChange={e => setSubFormData({...subFormData, planType: e.target.value})}
                  >
                    <option value="TRIAL">7 Days Trial</option>
                    <option value="MONTHLY">Monthly (3,000)</option>
                    <option value="HALF_YEARLY">6 Months (10,000)</option>
                    <option value="YEARLY">Yearly (20,000)</option>
                    <option value="LIFETIME">Lifetime (100,000)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Expiry Date (Renew)</label>
                  <input 
                    type="date" required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                    value={subFormData.endDate}
                    onChange={e => setSubFormData({...subFormData, endDate: e.target.value})}
                  />
                  <p className="text-[10px] text-gray-400 mt-2 italic">* Set a future date to extend/renew the subscription.</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsSubscriptionModalOpen(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-2 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Update Subscription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
