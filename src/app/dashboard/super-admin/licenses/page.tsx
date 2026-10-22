"use client";

import { useState, useEffect } from "react";
import { 
  Shield, 
  Trash2, 
  Edit2, 
  Loader2, 
  Calendar, 
  CheckCircle, 
  AlertOctagon, 
  Cpu, 
  RefreshCw,
  Search,
  User as UserIcon,
  Phone,
  Mail,
  Building,
  Laptop,
  Globe,
  Clock,
  Eye
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { format, differenceInDays } from "date-fns";

export default function SuperAdminLicensesPage() {
  const [licenses, setLicenses] = useState<any[]>([]);
  const [filteredLicenses, setFilteredLicenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<any>(null);

  const [editFormData, setEditFormData] = useState({
    clientName: "",
    status: "PENDING",
    planType: "TRIAL",
    endDate: "",
  });

  useEffect(() => {
    fetchLicenses();
  }, []);

  useEffect(() => {
    let result = licenses;

    if (filterStatus !== "ALL") {
      result = result.filter(l => l.status === filterStatus);
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(l => 
        l.machineId.toLowerCase().includes(q) || 
        (l.clientName && l.clientName.toLowerCase().includes(q)) || 
        (l.osInfo && l.osInfo.toLowerCase().includes(q)) ||
        (l.hostname && l.hostname.toLowerCase().includes(q)) ||
        (l.ipAddress && l.ipAddress.toLowerCase().includes(q)) ||
        (l.user?.name && l.user.name.toLowerCase().includes(q)) ||
        (l.user?.email && l.user.email.toLowerCase().includes(q)) ||
        (l.user?.phone && l.user.phone.toLowerCase().includes(q)) ||
        (l.user?.ownedMarquee?.name && l.user.ownedMarquee.name.toLowerCase().includes(q))
      );
    }

    setFilteredLicenses(result);
  }, [licenses, filterStatus, searchQuery]);

  const fetchLicenses = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/super-admin/licenses");
      setLicenses(res.data);
    } catch (error) {
      toast.error("Failed to fetch licenses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (license: any) => {
    setSelectedLicense(license);
    setEditFormData({
      clientName: license.clientName || license.user?.name || "",
      status: license.status,
      planType: license.planType,
      endDate: format(new Date(license.endDate), "yyyy-MM-dd"),
    });
    setIsEditModalOpen(true);
  };

  const handleDetailClick = (license: any) => {
    setSelectedLicense(license);
    setIsDetailModalOpen(true);
  };

  const handleUpdateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.patch("/api/super-admin/licenses", {
        id: selectedLicense.id,
        ...editFormData
      });
      toast.success("License updated successfully!");
      setIsEditModalOpen(false);
      fetchLicenses();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update license");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (license: any, newStatus: string) => {
    try {
      await axios.patch("/api/super-admin/licenses", {
        id: license.id,
        status: newStatus
      });
      toast.success(`Device status updated to ${newStatus}`);
      fetchLicenses();
    } catch (error) {
      toast.error("Failed to update device status");
    }
  };

  const handleDeleteLicense = async (id: string) => {
    if (!confirm("Are you sure you want to delete this device license?")) return;
    try {
      await axios.delete(`/api/super-admin/licenses?id=${id}`);
      toast.success("Device license deleted");
      fetchLicenses();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="text-blue-600" /> Device Licenses
          </h1>
          <p className="text-gray-500 text-sm mt-1">Approve machine IDs, view connected system details, and manage SaaS subscription plans.</p>
        </div>
        <button 
          onClick={fetchLicenses}
          className="p-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all shadow-sm flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} /> Refresh Data
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {["ALL", "PENDING", "ACTIVE", "BLOCKED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterStatus === status 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-100" 
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search Name, Email, Machine ID, Host..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-600 text-sm font-medium"
          />
        </div>
      </div>

      {/* Device List Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-50 bg-gray-50/50">
                <th className="px-8 py-4">Client & Business</th>
                <th className="px-8 py-4">Machine & System Info</th>
                <th className="px-8 py-4">Plan & Expiry</th>
                <th className="px-8 py-4">Status</th>
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
              ) : filteredLicenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-bold">
                    No registered devices found.
                  </td>
                </tr>
              ) : filteredLicenses.map((lic) => {
                const isExpired = new Date() > new Date(lic.endDate);
                const remaining = differenceInDays(new Date(lic.endDate), new Date());
                
                return (
                  <tr key={lic.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* User and Marquee Column */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                          <UserIcon size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 leading-snug">
                            {lic.user?.name || lic.clientName || "Unnamed Client"}
                          </p>
                          {lic.user?.ownedMarquee?.name && (
                            <p className="text-xs text-blue-600 font-semibold flex items-center gap-1 mt-0.5">
                              <Building size={12} /> {lic.user.ownedMarquee.name}
                            </p>
                          )}
                          <p className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-1 font-medium">
                            <Mail size={11} /> {lic.user?.email || "No email"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Machine and System Info Column */}
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <span className="font-mono text-[11px] text-gray-600 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 block w-fit max-w-[200px] truncate" title={lic.machineId}>
                          ID: {lic.machineId}
                        </span>
                        <div className="text-xs text-gray-500 font-medium flex flex-wrap gap-x-2 gap-y-0.5 items-center">
                          {lic.hostname && (
                            <span className="flex items-center gap-1">
                              <Laptop size={12} className="text-gray-400" /> {lic.hostname}
                            </span>
                          )}
                          {lic.ipAddress && (
                            <span className="flex items-center gap-1 text-[11px] text-gray-400">
                              <Globe size={11} /> {lic.ipAddress}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Plan and Expiry Column */}
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full w-fit uppercase tracking-wider">
                          {lic.planType}
                        </span>
                        <span className={`text-xs flex items-center gap-1 font-semibold ${isExpired ? "text-red-500" : "text-gray-600"}`}>
                          <Calendar size={12} /> {format(new Date(lic.endDate), "MMM dd, yyyy")}
                        </span>
                        {!isExpired && remaining <= 7 && (
                          <span className="text-[10px] text-amber-500 font-bold">
                            Expires in {remaining} {remaining === 1 ? "day" : "days"}!
                          </span>
                        )}
                        {isExpired && (
                          <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">
                            Expired
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="px-8 py-6">
                      <span className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-wider ${
                        lic.status === "ACTIVE" 
                          ? "bg-green-50 text-green-600 border border-green-200" 
                          : lic.status === "PENDING"
                          ? "bg-yellow-50 text-yellow-600 border border-yellow-200"
                          : "bg-red-50 text-red-600 border border-red-200"
                      }`}>
                        {lic.status}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button 
                          onClick={() => handleDetailClick(lic)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                          title="View System Details"
                        >
                          <Eye size={16} />
                        </button>
                        
                        {lic.status === "PENDING" && (
                          <button 
                            onClick={() => handleQuickStatusChange(lic, "ACTIVE")}
                            className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle size={14} /> Activate
                          </button>
                        )}
                        {lic.status === "ACTIVE" && (
                          <button 
                            onClick={() => handleQuickStatusChange(lic, "BLOCKED")}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <AlertOctagon size={14} /> Block
                          </button>
                        )}
                        {lic.status === "BLOCKED" && (
                          <button 
                            onClick={() => handleQuickStatusChange(lic, "ACTIVE")}
                            className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle size={14} /> Unblock
                          </button>
                        )}
                        <button 
                          onClick={() => handleEditClick(lic)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                          title="Edit Plan / Expiry"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteLicense(lic.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                          title="Delete Device"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail View Modal */}
      {isDetailModalOpen && selectedLicense && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsDetailModalOpen(false)} />
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Device & Client Information</h2>
                <p className="text-gray-400 text-[11px] font-mono mt-0.5 select-all">{selectedLicense.machineId}</p>
              </div>
              <button 
                onClick={() => setIsDetailModalOpen(false)} 
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center font-bold text-sm transition-all cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Client Profile details */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Client profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Name</p>
                    <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                      <UserIcon size={14} className="text-blue-500" /> {selectedLicense.user?.name || selectedLicense.clientName || "Unnamed Client"}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Business / Marquee</p>
                    <p className="text-sm font-bold text-blue-600 flex items-center gap-1.5">
                      <Building size={14} /> {selectedLicense.user?.ownedMarquee?.name || "No Associated Marquee"}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Email Address</p>
                    <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 truncate">
                      <Mail size={14} className="text-gray-400" /> {selectedLicense.user?.email || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Phone Number</p>
                    <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                      <Phone size={14} className="text-gray-400" /> {selectedLicense.user?.phone || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* System details */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Device & System Specs</h3>
                <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 font-medium text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-400">Hostname / OS User:</span>
                    <span className="font-bold text-gray-800 flex items-center gap-1"><Laptop size={12} /> {selectedLicense.hostname || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-400">Client IP Address:</span>
                    <span className="font-bold text-gray-800 flex items-center gap-1"><Globe size={12} /> {selectedLicense.ipAddress || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-400">Registered Date:</span>
                    <span className="font-bold text-gray-800">{format(new Date(selectedLicense.createdAt), "PPP p")}</span>
                  </div>
                  <div className="flex flex-col gap-1 py-1">
                    <span className="text-gray-400">Operating System / Agent String:</span>
                    <span className="font-mono text-[10px] text-gray-600 bg-white p-2 rounded-lg border border-gray-100 break-all leading-normal select-all">
                      {selectedLicense.osInfo || "No details available"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subscription details */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">SaaS Subscription Status</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">License Status</p>
                    <span className={`px-2 py-0.5 text-[10px] font-black rounded-full uppercase tracking-wider ${
                      selectedLicense.status === "ACTIVE" 
                        ? "bg-green-50 text-green-600" 
                        : "bg-red-50 text-red-600"
                    }`}>
                      {selectedLicense.status}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Billing Plan</p>
                    <p className="text-sm font-bold text-gray-800 uppercase tracking-wide">{selectedLicense.planType}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Expiration Date</p>
                    <p className="text-xs font-bold text-gray-800 flex items-center gap-1">
                      <Calendar size={13} className="text-gray-400" /> {format(new Date(selectedLicense.endDate), "PPP")}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Remaining Duration</p>
                    <p className="text-xs font-bold text-gray-800 flex items-center gap-1">
                      <Clock size={13} className="text-gray-400" /> 
                      {differenceInDays(new Date(selectedLicense.endDate), new Date()) > 0 
                        ? `${differenceInDays(new Date(selectedLicense.endDate), new Date())} days left` 
                        : "Expired"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
              <button 
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleEditClick(selectedLicense);
                }}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Edit2 size={14} /> Edit Expiry / Plan
              </button>
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold text-sm transition-all cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedLicense && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isSubmitting && setIsEditModalOpen(false)} />
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Edit Plan & Expiry</h2>
                <p className="text-gray-400 text-xs truncate max-w-[320px] font-mono">{selectedLicense.machineId}</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg font-bold">×</button>
            </div>
            
            <form onSubmit={handleUpdateLicense} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Client Name / Label</label>
                  <input 
                    type="text" required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium"
                    value={editFormData.clientName}
                    onChange={e => setEditFormData({...editFormData, clientName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Device Status</label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm font-medium"
                    value={editFormData.status}
                    onChange={e => setEditFormData({...editFormData, status: e.target.value})}
                  >
                    <option value="PENDING">Pending Approval</option>
                    <option value="ACTIVE">Active / Approved</option>
                    <option value="BLOCKED">Blocked / Suspended</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">SaaS Plan Type</label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm font-medium"
                    value={editFormData.planType}
                    onChange={e => setEditFormData({...editFormData, planType: e.target.value})}
                  >
                    <option value="TRIAL">Trial Period</option>
                    <option value="BASIC">Basic Plan</option>
                    <option value="MONTHLY">Monthly Billing</option>
                    <option value="HALF_YEARLY">6 Months Billing</option>
                    <option value="YEARLY">Yearly Billing</option>
                    <option value="LIFETIME">Lifetime License</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Expiry Date</label>
                  <input 
                    type="date" required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm font-medium"
                    value={editFormData.endDate}
                    onChange={e => setEditFormData({...editFormData, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-2 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center text-sm cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
