import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { 
  MdPayments, MdEventNote, MdOutlineMoneyOff, MdAccessTime,
  MdCheckCircle, MdPendingActions, MdInfoOutline, MdHistory,
  MdShield, MdAccountBalanceWallet, MdLocalAtm, MdArrowForward
} from "react-icons/md";
import axiosWrapper from "../../utils/AxiosWrapper";

const Fees = ({ profileData }) => {
  const [fees, setFees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const userToken = localStorage.getItem("userToken");

  const fetchFees = async () => {
    setIsLoading(true);
    try {
      const response = await axiosWrapper.get("/fees/my-fees", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (response.data.success) setFees(response.data.data);
    } catch { toast.error("Financial ledger sync failure"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchFees(); }, []);

  const formatDate = (date) => new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayFee = async (feeId) => {
    try {
      const res = await loadRazorpayScript();
      if (!res) { toast.error("Razorpay SDK offline"); return; }
      toast.loading("Securing gateway...");
      const orderRes = await axiosWrapper.post("/payment/capture", { feeId }, { headers: { Authorization: `Bearer ${userToken}` } });
      toast.dismiss();
      if (!orderRes.data.success) { toast.error(orderRes.data.message); return; }
      const { amount, id: order_id, currency } = orderRes.data.data;
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY,
        amount: amount.toString(),
        currency: currency,
        name: "University Ledger",
        description: `ID: ${feeId}`,
        order_id: order_id,
        handler: async (response) => {
          try {
            toast.loading("Verifying transaction...");
            const verifyRes = await axiosWrapper.post("/payment/verify", { ...response, feeId }, { headers: { Authorization: `Bearer ${userToken}` } });
            toast.dismiss();
            if (verifyRes.data.success) { toast.success("Ledger Synchronized!"); fetchFees(); }
          } catch { toast.dismiss(); toast.error("Verification timeout"); }
        },
        prefill: { name: `${profileData?.firstName} ${profileData?.lastName}`, email: profileData?.email, contact: profileData?.phone },
        theme: { color: "#0B1F3A" },
      };
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch { toast.dismiss(); toast.error("Handshake failed"); }
  };

  const pendingFees = fees.filter(f => f.status === 'unpaid');
  const primaryPendingFee = pendingFees[0];

  return (
    <div className="w-full space-y-8 anim-fade-up">
      {/* Financial Overview Bento */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 anim-stagger">
        {/* Urgent Duo Hero */}
        <div className="md:col-span-8 bento-card p-0 overflow-hidden group">
          <div className="h-full bg-gradient-to-br from-[var(--navy-dark)] via-[var(--navy)] to-[var(--navy-light)] p-8 relative">
             <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--gold)] opacity-[0.05] rounded-full -mr-20 -mt-20 blur-3xl transform group-hover:scale-110 transition-transform duration-700"></div>
             {primaryPendingFee ? (
               <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <span className="bento-badge bg-[var(--gold)] text-[var(--navy-dark)] !px-4 !py-1 !text-[0.6rem] font-black uppercase tracking-widest">Immediate Compliance Required</span>
                    <h2 className="text-3xl font-black text-white mt-4 tracking-tight uppercase">{primaryPendingFee.title}</h2>
                    <p className="text-white/50 text-xs font-bold mt-1 tracking-widest uppercase">Maturity Date: <span className="text-[var(--gold-light)]">{formatDate(primaryPendingFee.dueDate)}</span></p>
                  </div>
                  <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
                    <div className="flex gap-8">
                       <div>
                         <p className="text-white/30 text-[0.6rem] font-bold uppercase tracking-widest mb-1">Unpaid Balance</p>
                         <p className="text-3xl font-black text-[var(--gold-light)]">₹{primaryPendingFee.totalAmount.toLocaleString()}</p>
                       </div>
                       {primaryPendingFee.lateFee > 0 && (
                         <div className="border-l border-white/10 pl-8">
                           <p className="text-red-400/50 text-[0.6rem] font-bold uppercase tracking-widest mb-1">Accrued Penalty</p>
                           <p className="text-xl font-black text-red-400">₹{primaryPendingFee.lateFee.toLocaleString()}</p>
                         </div>
                       )}
                    </div>
                    <button onClick={() => handlePayFee(primaryPendingFee._id)} className="bg-[var(--gold)] hover:bg-[var(--gold-light)] text-[var(--navy-dark)] px-8 py-3.5 rounded-2xl font-black text-sm tracking-widest shadow-2xl flex items-center gap-2 group/btn transition-all hover:scale-[1.02] active:scale-95">
                      INITIALIZE TRANSFER <MdArrowForward className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
               </div>
             ) : (
               <div className="relative z-10 h-full flex flex-col items-center justify-center text-center py-10">
                  <MdShield size={64} className="text-[var(--gold)] opacity-20 mb-4" />
                  <h2 className="text-xl font-black text-white uppercase tracking-widest">Account Clear</h2>
                  <p className="text-white/40 text-[0.65rem] font-bold mt-1 uppercase">All recognized obligations have been synchronized</p>
               </div>
             )}
          </div>
        </div>

        {/* Small Stats */}
        <div className="md:col-span-4 space-y-4">
           <div className="bento-card-glass p-6">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-inner"><MdCheckCircle size={20} /></div>
                 <div>
                    <label className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest">Settled Objects</label>
                    <p className="text-xl font-black text-[var(--navy-dark)]">{fees.filter(f => f.status === 'paid').length} Units</p>
                 </div>
              </div>
           </div>
           <div className="bento-card-glass p-6">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shadow-inner"><MdPendingActions size={20} /></div>
                 <div>
                    <label className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest">Outstanding</label>
                    <p className="text-xl font-black text-[var(--navy-dark)]">{pendingFees.length} Dues</p>
                 </div>
              </div>
           </div>
           <div className="bento-card-glass p-6">
              <div className="flex items-center gap-4 text-red-500 font-black">
                 <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shadow-inner"><MdLocalAtm size={20} /></div>
                 <div>
                    <label className="text-[0.6rem] font-bold text-red-300 uppercase tracking-widest">Total Penalty</label>
                    <p className="text-xl tracking-tighter">₹{fees.reduce((a, c) => a + (c.lateFee || 0), 0).toLocaleString()}</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Payment Registry */}
      <div className="bento-card p-8">
        <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shadow-inner"><MdHistory size={20} /></div>
          <div>
            <h2 className="text-base font-black text-[var(--navy-dark)] uppercase tracking-tight">Financial Transaction Ledger</h2>
            <p className="text-[0.6rem] font-bold text-gray-400 uppercase">Historical record of all debits and credits</p>
          </div>
        </div>

        {isLoading ? <div className="animate-pulse space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-50 rounded-2xl"></div>)}</div> : fees.length === 0 ? (
          <div className="text-center py-20">
             <MdOutlineMoneyOff size={48} className="text-gray-100 mx-auto mb-4" />
             <p className="text-gray-400 font-medium italic">Archive is currently empty</p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-[0.65rem] font-black text-gray-400 uppercase tracking-[0.2em]">
                  <th className="px-6 py-2">Asset Description</th>
                  <th className="px-6 py-2">Base Value</th>
                  <th className="px-6 py-2">Penalty</th>
                  <th className="px-6 py-2">Maturity</th>
                  <th className="px-6 py-2 text-center">Protocol Status</th>
                  <th className="px-6 py-2 text-center">Operation</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((f, idx) => (
                  <tr key={f._id} className="bento-card-flat group hover:border-[var(--navy)] transition-all anim-scale-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-[var(--bg-inset)] text-[var(--navy)] flex items-center justify-center group-hover:bg-[var(--navy)] group-hover:text-white transition-colors"><MdEventNote size={14} /></div>
                         <p className="text-xs font-bold text-[var(--navy-dark)]">{f.title}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4"><p className="text-xs font-bold text-gray-600">₹{f.amount.toLocaleString()}</p></td>
                    <td className="px-6 py-4">
                      {f.lateFee > 0 ? <p className="text-xs font-black text-red-500">₹{f.lateFee.toLocaleString()}</p> : <p className="text-[0.65rem] font-bold text-emerald-500">-- NULL --</p>}
                    </td>
                    <td className="px-6 py-4"><p className="text-[0.65rem] font-bold text-gray-400">{formatDate(f.dueDate)}</p></td>
                    <td className="px-6 py-4 text-center">
                       <span className={`bento-badge !py-0.5 !text-[0.6rem] uppercase font-black ${f.status === 'paid' ? 'bento-badge-success' : 'bento-badge-info ring-1 ring-amber-200 animate-pulse'}`}>
                         {f.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       {f.status === 'unpaid' ? (
                         <button onClick={() => handlePayFee(f._id)} className="text-[0.65rem] font-black text-[var(--navy)] hover:text-white border border-[var(--navy)] px-4 py-1.5 rounded-xl hover:bg-[var(--navy)] transition-colors">SETTLE</button>
                       ) : (
                         <span className="text-[0.55rem] font-black text-emerald-500 uppercase tracking-widest">{f.transactionId === 'COLLECTED_VIA_CASH' ? 'OFFLINE' : 'ONLINE'}</span>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-8 flex items-center gap-3 bg-[var(--bg-inset)] p-4 rounded-2xl border border-gray-100">
          <MdInfoOutline className="text-[var(--gold)] shrink-0" size={20} />
          <p className="text-[0.65rem] font-bold text-gray-500 leading-relaxed uppercase tracking-widest">Late compliance overhead is calculated at ₹50 per diurnal cycle post maturity.</p>
        </div>
      </div>
    </div>
  );
};

export default Fees;
