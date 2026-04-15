import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { 
  MdOutlineDelete, MdPayments, MdCheckCircle, MdPendingActions, 
  MdAccessTime, MdOutlinePayments, MdRocket, MdTrendingUp, MdAccountBalance, MdLayers, MdHistory
} from "react-icons/md";
import axiosWrapper from "../../utils/AxiosWrapper";
import Heading from "../../components/Heading";
import DeleteConfirm from "../../components/DeleteConfirm";
import Loading from "../../components/Loading";
import CustomButton from "../../components/CustomButton";

const AdminFees = () => {
  const [fees, setFees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedFeeId, setSelectedFeeId] = useState(null);
  const [bulkData, setBulkData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    amount: "50000",
    titlePrefix: "Academic Session Fees"
  });
  const userToken = localStorage.getItem("userToken");

  const fetchAllFees = async () => {
    setIsLoading(true);
    try {
      const response = await axiosWrapper.get("/fees/all", { headers: { Authorization: `Bearer ${userToken}` } });
      if (response.data.success) setFees(response.data.data);
    } catch { toast.error("Coordinate retrieval failure"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchAllFees(); }, []);

  const handleBulkLaunch = async () => {
    if (!bulkData.startDate || !bulkData.amount) { toast.error("Incomplete session data"); return; }
    try {
      toast.loading("Instantiating global session...");
      const response = await axiosWrapper.post("/fees/bulk-assign", bulkData, { headers: { Authorization: `Bearer ${userToken}` } });
      toast.dismiss();
      if (response.data.success) { toast.success("Global protocol archived"); fetchAllFees(); }
    } catch { toast.dismiss(); toast.error("Instantiation failure"); }
  };

  const handleMarkCashPaid = async (feeId) => {
    try {
      toast.loading("Recording manual asset collection...");
      const res = await axiosWrapper.patch(`/fees/update/${feeId}`, { status: "paid", transactionId: "COLLECTED_VIA_CASH" }, { headers: { Authorization: `Bearer ${userToken}` } });
      toast.dismiss();
      if (res.data.success) { toast.success("Asset verified"); fetchAllFees(); }
    } catch { toast.dismiss(); toast.error("Verification failed"); }
  };

  const stats = {
    totalPaid: fees.filter(f => f.status === 'paid').length,
    totalPending: fees.filter(f => f.status === 'unpaid').length,
    totalAmount: fees.filter(f => f.status === 'paid').reduce((acc, curr) => acc + (curr.totalAmount || 0), 0)
  };

  return (
    <div className="w-full space-y-8 anim-fade-up">
      <Heading title="Fiscal Repository" subtitle="Centralized ledger for academic capital management and asset tracking" />

      {/* Session Launcher */}
      <div className="bento-card p-8 bg-gradient-to-br from-[var(--gold-pale)] to-white border-[var(--gold)]/20 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform">
            <MdRocket size={160} className="text-[var(--gold)]" />
         </div>
         <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-8">
            <div className="flex items-start gap-5">
               <div className="w-16 h-16 rounded-2xl bg-[var(--gold)] text-white flex items-center justify-center shadow-xl shadow-amber-200/50 flex-shrink-0 animate-bounce-slow">
                  <MdRocket size={32} />
               </div>
               <div>
                  <h3 className="text-xl font-black text-[var(--navy-dark)] uppercase tracking-tight">Initiate Global Cycle</h3>
                  <p className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest leading-loose mt-1">Automatic fee assignment protocol with integrated late-cycle penalties (Rs. 50/interval)</p>
               </div>
            </div>
            <div className="flex flex-wrap items-end gap-4 p-2 bg-white/50 backdrop-blur-md rounded-[2rem] border border-white/80 shadow-inner">
               <div className="px-4 py-2">
                  <label className="text-[0.55rem] font-black text-gray-400 uppercase tracking-widest block mb-1">Epoch Date</label>
                  <input type="date" value={bulkData.startDate} onChange={(e) => setBulkData({...bulkData, startDate: e.target.value})} className="bg-transparent border-none p-0 text-sm font-black text-[var(--navy-dark)] focus:ring-0" />
               </div>
               <div className="h-8 w-px bg-gray-200 mx-2"></div>
               <div className="px-4 py-2">
                  <label className="text-[0.55rem] font-black text-gray-400 uppercase tracking-widest block mb-1">Asset Value (₹)</label>
                  <input type="number" value={bulkData.amount} onChange={(e) => setBulkData({...bulkData, amount: e.target.value})} className="bg-transparent border-none p-0 w-24 text-sm font-black text-[var(--navy-dark)] focus:ring-0" />
               </div>
               <CustomButton onClick={handleBulkLaunch} variant="secondary" className="!rounded-2xl !py-3 !px-8 shadow-xl shadow-amber-200/30 font-black italic">LAUNCH CYCLE</CustomButton>
            </div>
         </div>
      </div>

      {isLoading ? <Loading /> : (
        <>
          {/* Dashboard Metrics */}
          <div className="bento-grid-3 anim-stagger">
              <div className="bento-card bento-stat-premium group anim-scale-in">
                 <MdTrendingUp className="icon-bloom text-emerald-500" />
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-inner"><MdAccountBalance size={20} /></div>
                    <span className="bento-stat-label">Accumulated Assets</span>
                 </div>
                 <span className="text-3xl font-black text-[var(--navy-dark)] tracking-tighter">₹{stats.totalAmount.toLocaleString()}</span>
                 <div className="mt-4 flex items-center gap-2">
                    <div className="h-1 flex-1 bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 w-[65%]"></div>
                    </div>
                    <span className="text-[0.6rem] font-black text-emerald-500">OPTIMAL</span>
                 </div>
              </div>

              <div className="bento-card bento-stat-premium group anim-scale-in" style={{ animationDelay: "0.1s" }}>
                 <MdPendingActions className="icon-bloom text-amber-500" />
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shadow-inner"><MdPendingActions size={20} /></div>
                    <span className="bento-stat-label">Pending Protocols</span>
                 </div>
                 <span className="text-3xl font-black text-[var(--navy-dark)] tracking-tighter">{stats.totalPending} <span className="text-sm font-bold text-gray-300">Units</span></span>
                 <div className="mt-4 flex items-center gap-2">
                    <div className="h-1 flex-1 bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-amber-500 w-[30%]"></div>
                    </div>
                    <span className="text-[0.6rem] font-black text-amber-500">MONITOR</span>
                 </div>
              </div>

              <div className="bento-card bento-stat-premium group anim-scale-in" style={{ animationDelay: "0.2s" }}>
                 <MdCheckCircle className="icon-bloom text-blue-500" />
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shadow-inner"><MdCheckCircle size={20} /></div>
                    <span className="bento-stat-label">Verified Settlements</span>
                 </div>
                 <span className="text-3xl font-black text-[var(--navy-dark)] tracking-tighter">{stats.totalPaid} <span className="text-sm font-bold text-gray-300">Units</span></span>
                 <div className="mt-4 flex items-center gap-2">
                    <div className="h-1 flex-1 bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 w-[85%]"></div>
                    </div>
                    <span className="text-[0.6rem] font-black text-blue-500">STABLE</span>
                 </div>
              </div>
          </div>

          {/* Audit Ledger */}
          <div className="bento-card overflow-hidden anim-fade-up">
            <div className="bento-card-navy p-6 !rounded-none flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md text-[var(--gold-light)] shadow-xl"><MdHistory size={24} /></div>
                  <div>
                    <h2 className="text-base font-black uppercase tracking-tight">Audit Ledger</h2>
                    <p className="text-white/40 text-[0.6rem] font-bold uppercase tracking-widest mt-1">Real-time verification of institutional capital flow</p>
                  </div>
               </div>
               <div className="flex gap-2"> 
                  <div className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
                     <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                     <span className="text-[0.6rem] font-black uppercase tracking-widest text-white/70">LIVE STREAMING ACTIVE</span>
                  </div>
               </div>
            </div>

            <div className="p-2 overflow-x-auto">
              <table className="bento-table">
                <thead>
                  <tr className="!bg-transparent">
                    <th>Entity Identification</th><th>Protocol Description</th><th>Capitalization</th><th>Status</th><th className="text-right pr-8">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fees?.map((fee, idx) => (
                    <tr key={fee._id} className="group">
                      <td>
                        <div className="flex items-center gap-4">
                           <div className="relative">
                              <img src={`${process.env.REACT_APP_MEDIA_LINK}/${fee.studentId?.profile}`} alt=""
                                className="w-11 h-11 rounded-2xl object-cover border-2 border-white shadow-xl group-hover:scale-110 transition-transform"
                                onError={(e) => e.target.src = "https://ui-avatars.com/api/?name=" + (fee.studentId?.firstName || "U") + "&background=F1F3F9&color=142C5B&bold=true"} />
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${fee.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                           </div>
                           <div>
                              <span className="font-black text-[var(--navy-dark)] text-sm uppercase tracking-tight">{fee.studentId?.firstName} {fee.studentId?.lastName}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                 <span className="text-[0.55rem] font-black text-gray-400 uppercase tracking-widest px-1.5 py-0.5 bg-[var(--bg-inset)] rounded-md border border-gray-100">{fee.studentId?.studentId}</span>
                              </div>
                           </div>
                        </div>
                      </td>
                      <td>
                         <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-600 truncate max-w-[180px]">{fee.title}</span>
                            <span className="text-[0.55rem] font-black text-gray-400 uppercase tracking-widest mt-1">Expires: {new Date(fee.dueDate).toLocaleDateString("en-GB")}</span>
                         </div>
                      </td>
                      <td>
                         <div className="flex flex-col">
                            <span className="text-sm font-black text-[var(--navy-dark)]">₹{(fee.totalAmount || 0).toLocaleString()}</span>
                            {fee.lateFee > 0 && <span className="text-[0.55rem] font-black text-red-500 uppercase flex items-center gap-1 group-hover:animate-pulse"> <MdAccessTime size={10} /> + Penalty ₹{fee.lateFee}</span>}
                         </div>
                      </td>
                      <td>
                        <span className={`bento-badge !py-1 !px-3 font-black italic tracking-tighter ${fee.status === 'paid' ? 'bento-badge-success' : 'bento-badge-warning'}`}>
                          {fee.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {fee.status === 'unpaid' && (
                            <button onClick={() => handleMarkCashPaid(fee._id)} className="w-9 h-9 flex items-center justify-center bg-emerald-50 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                              <MdOutlinePayments size={18} />
                            </button>
                          )}
                          <button onClick={() => { setSelectedFeeId(fee._id); setIsDeleteConfirmOpen(true); }} className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                            <MdOutlineDelete size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <DeleteConfirm isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} onConfirm={async () => {
         try {
            toast.loading("Expunging record...");
            await axiosWrapper.delete(`/fees/delete/${selectedFeeId}`, { headers: { Authorization: `Bearer ${userToken}` } });
            toast.dismiss(); toast.success("Object expunged"); setIsDeleteConfirmOpen(false); fetchAllFees();
         } catch { toast.dismiss(); toast.error("Operation failed"); }
      }} message="Confirm data expunction of this fiscal asset protocol." />
    </div>
  );
};

export default AdminFees;
