import React, { useState, useEffect } from "react";
import axiosWrapper from "../../utils/AxiosWrapper";
import toast from "react-hot-toast";
import { MdCheckCircle, MdCancel, MdAccessTime, MdAttachFile, MdPerson, MdCalendarMonth, MdAssignmentInd, MdMessage, MdArrowForward } from "react-icons/md";
import Heading from "../../components/Heading";
import Loading from "../../components/Loading";
import NoData from "../../components/NoData";

const STATUS_STYLES = {
  pending: { bg: "bg-amber-50 text-amber-500 border-amber-100", icon: MdAccessTime },
  approved: { bg: "bg-emerald-50 text-emerald-500 border-emerald-100", icon: MdCheckCircle },
  rejected: { bg: "bg-red-50 text-red-500 border-red-100", icon: MdCancel },
};

const Leave = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remark, setRemark] = useState({});
  const userToken = localStorage.getItem("userToken");

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await axiosWrapper.get("/leave/admin", { headers: { Authorization: `Bearer ${userToken}` } });
      setLeaves(res.data.data || []);
    } catch { toast.error("Coordinate retrieval failure"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleAction = async (leaveId, status) => {
    try {
      toast.loading(`Synchronizing decision: ${status}...`);
      await axiosWrapper.patch(`/leave/status/${leaveId}`, { status, facultyRemark: remark[leaveId] || "" }, { headers: { Authorization: `Bearer ${userToken}` } });
      toast.dismiss();
      toast.success(`Protocol ${status} verified`);
      fetchLeaves();
    } catch { toast.dismiss(); toast.error("Decision sync failure"); }
  };

  return (
    <div className="w-full space-y-8 anim-fade-up">
      <Heading title="Absence Petitions" subtitle="Review and moderate institutional leave applications and justifications" />

      {loading ? (
        <Loading />
      ) : leaves.length === 0 ? (
        <NoData title="No active petitions registered in the audit queue" />
      ) : (
        <div className="bento-grid-2 anim-stagger">
          {leaves.map((leave, idx) => {
            const from = new Date(leave.fromDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
            const to = new Date(leave.toDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
            const isFaculty = leave.requesterType === "faculty";
            const userString = isFaculty
              ? `${leave.facultyId?.firstName} ${leave.facultyId?.lastName}`
              : `${leave.studentId?.firstName} ${leave.studentId?.middleName || ""} ${leave.studentId?.lastName}`;
            const userSub = isFaculty
              ? `FACULTY CORE - ${leave.facultyId?.employeeId}`
              : `STUDENT UNIT - ${leave.studentId?.enrollmentNo}`;
            const st = STATUS_STYLES[leave.status] || STATUS_STYLES.pending;
            const StatusIcon = st.icon;

            return (
              <div key={leave._id} className="bento-card hover-lift p-6 anim-scale-in group" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="flex items-start justify-between gap-4 mb-6">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--bg-inset)] flex items-center justify-center text-[var(--navy)] border border-white shadow-inner group-hover:scale-110 transition-transform">
                         {isFaculty ? <MdAssignmentInd size={22} /> : <MdPerson size={22} />}
                      </div>
                      <div>
                         <p className="font-black text-[var(--navy-dark)] text-sm uppercase tracking-tight">{userString}</p>
                         <p className="text-[0.6rem] font-black text-gray-400 uppercase tracking-widest mt-0.5">{userSub}</p>
                      </div>
                   </div>
                   <div className={`bento-badge !py-1 !px-3 border shadow-sm flex items-center gap-2 ${st.bg}`}>
                      <StatusIcon size={14} />
                      <span className="font-black italic tracking-tighter">{leave.status.toUpperCase()}</span>
                   </div>
                </div>

                <div className="space-y-4 mb-8">
                   <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-inset)] border border-white/50">
                      <div className="flex flex-col">
                         <span className="text-[0.55rem] font-black text-gray-400 uppercase tracking-widest">Initial Epoch</span>
                         <span className="text-xs font-black text-[var(--navy-dark)]">{from}</span>
                      </div>
                      <MdArrowForward className="text-gray-300" />
                      <div className="flex flex-col text-right">
                         <span className="text-[0.55rem] font-black text-gray-400 uppercase tracking-widest">Terminal Epoch</span>
                         <span className="text-xs font-black text-[var(--navy-dark)]">{to}</span>
                      </div>
                   </div>

                   <div className="px-1">
                      <span className="text-[0.6rem] font-black text-gray-400 uppercase tracking-widest block mb-2">Justification Manifest</span>
                      <p className="text-[0.7rem] font-medium text-gray-600 leading-relaxed italic border-l-2 border-gray-100 pl-4">
                        {leave.reason}
                      </p>
                   </div>

                   {leave.attachment && (
                     <button 
                       onClick={() => window.open(`${process.env.REACT_APP_MEDIA_LINK}/${leave.attachment}`)}
                       className="w-full py-2.5 rounded-xl bg-blue-50/50 border border-blue-100 text-[0.65rem] font-black text-blue-600 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors">
                       <MdAttachFile size={16} /> Examine Artifact Payload
                     </button>
                   )}
                </div>

                {leave.status === "pending" ? (
                  <div className="pt-6 border-t border-gray-50 space-y-4">
                    <div className="relative group/remark">
                      <MdMessage className="absolute left-4 top-3.5 text-gray-300 group-focus-within/remark:text-[var(--navy)] transition-colors" size={16} />
                      <input
                        type="text"
                        placeholder="AUTHENTICATION REMARK (OPTIONAL)"
                        className="bento-input !py-3 !pl-12 !text-[0.65rem] font-bold uppercase tracking-widest bg-gray-50/50"
                        value={remark[leave._id] || ""}
                        onChange={(e) => setRemark((prev) => ({ ...prev, [leave._id]: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleAction(leave._id, "approved")}
                        className="py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-[0.65rem] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg shadow-emerald-200 hover:scale-105 active:scale-95 italic"
                      >
                        Authorize
                      </button>
                      <button
                        onClick={() => handleAction(leave._id, "rejected")}
                        className="py-3 bg-red-500 hover:bg-red-600 text-white text-[0.65rem] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg shadow-red-200 hover:scale-105 active:scale-95 italic"
                      >
                        Expunge
                      </button>
                    </div>
                  </div>
                ) : leave.facultyRemark && (
                   <div className="pt-6 border-t border-gray-50">
                      <div className="p-3 rounded-xl bg-gray-50 border border-white text-[0.65rem] font-medium text-gray-400 italic flex gap-2 items-start">
                         <MdMessage className="mt-0.5 shrink-0" size={12} />
                         <span>Protocol Marker: "{leave.facultyRemark}"</span>
                      </div>
                   </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Leave;
