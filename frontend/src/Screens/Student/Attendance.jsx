import React, { useState, useEffect } from "react";
import axiosWrapper from "../../utils/AxiosWrapper";
import toast from "react-hot-toast";
import { MdInsertChart, MdEventNote, MdCloudUpload, MdHistory, MdPerson, MdDateRange, MdSubject, MdCheckCircle, MdError, MdWarning, MdAttachment } from "react-icons/md";
import CustomButton from "../../components/CustomButton";

const userToken = () => localStorage.getItem("userToken");
const authHeader = () => ({ Authorization: `Bearer ${userToken()}` });

// ─── SVG Donut Chart ─────────────────────────────────────────────────────────
const DonutChart = ({ percentage, size = 160, stroke = 18 }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (percentage / 100) * circ;
  const color = percentage >= 75 ? "#10b981" : percentage >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
    </svg>
  );
};

// ─── Attendance Summary Tab ───────────────────────────────────────────────────
const AttendanceSummary = () => {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axiosWrapper.get("/attendance/my", { headers: authHeader() });
        setSummary(res.data.data || []);
      } catch { toast.error("Sync failure"); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-10 h-10 border-4 border-[var(--navy)] border-t-transparent rounded-full" /></div>;
  if (summary.length === 0) return <div className="bento-card p-20 text-center text-gray-400 italic font-medium">No participation logs synchronized yet.</div>;

  const totalPresent = summary.reduce((s, x) => s + x.present, 0);
  const totalClasses = summary.reduce((s, x) => s + x.total, 0);
  const overallPct = totalClasses === 0 ? 0 : Math.round((totalPresent / totalClasses) * 100);
  const overallColorClass = overallPct >= 75 ? "text-emerald-500" : overallPct >= 50 ? "text-amber-500" : "text-red-500";

  return (
    <div className="space-y-8 anim-fade-up">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Overall Stat Card */}
        <div className="md:col-span-5 bento-card p-8 flex flex-col items-center justify-center relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--navy)] opacity-[0.02] rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
           <div className="relative">
              <DonutChart percentage={overallPct} size={200} stroke={22} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-black tracking-tighter ${overallColorClass}`}>{overallPct}%</span>
                <span className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest mt-1">Global Index</span>
              </div>
           </div>
           <div className="mt-8 grid grid-cols-3 gap-8 w-full border-t border-gray-50 pt-8">
              <div className="text-center">
                <p className="text-[0.6rem] font-black text-gray-400 uppercase mb-1">Total</p>
                <p className="text-sm font-black text-[var(--navy)]">{totalClasses}</p>
              </div>
              <div className="text-center border-l border-gray-50">
                <p className="text-[0.6rem] font-black text-gray-400 uppercase mb-1">Present</p>
                <p className="text-sm font-black text-emerald-500">{totalPresent}</p>
              </div>
              <div className="text-center border-l border-gray-50">
                <p className="text-[0.6rem] font-black text-gray-400 uppercase mb-1">Deficit</p>
                <p className="text-sm font-black text-red-500">{totalClasses - totalPresent}</p>
              </div>
           </div>
        </div>

        {/* Status Indicators */}
        <div className="md:col-span-7 space-y-4">
           {summary.map((s, idx) => (
             <div key={idx} className="bento-card-glass p-5 flex items-center gap-6 anim-scale-in group" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="relative shrink-0">
                   <DonutChart percentage={s.percentage} size={64} stroke={8} />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-[0.65rem] font-black ${s.percentage >= 75 ? 'text-emerald-500' : s.percentage >= 50 ? 'text-amber-500' : 'text-red-500'}`}>{s.percentage}%</span>
                   </div>
                </div>
                <div className="flex-1 min-w-0">
                   <h3 className="text-sm font-bold text-[var(--navy-dark)] truncate">{s.subjectName}</h3>
                   <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                         <div className={`h-full rounded-full transition-all duration-1000 ${s.percentage >= 75 ? 'bg-emerald-400' : s.percentage >= 50 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${s.percentage}%` }}></div>
                      </div>
                      <span className="text-[0.65rem] font-black text-gray-400">{s.present}/{s.total}</span>
                   </div>
                </div>
                {s.percentage < 75 && (
                  <div className="bg-red-50 p-2 rounded-xl text-red-500 group-hover:scale-110 transition-transform">
                    <MdWarning size={16} title={`Deficit: ${Math.ceil(((0.75 * s.total) - s.present) / 0.25)} sessions`} />
                  </div>
                )}
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

// ─── Leave Request Tab ────────────────────────────────────────────────────────
const LeaveRequest = () => {
  const [faculties, setFaculties] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({ facultyId: "", fromDate: "", toDate: "", reason: "" });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const [fRes, lRes] = await Promise.all([
          axiosWrapper.get("/faculty/", { headers: authHeader() }),
          axiosWrapper.get("/leave/my", { headers: authHeader() })
        ]);
        setFaculties(fRes.data.data || []);
        setLeaves(lRes.data.data || []);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    init();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(form.toDate) < new Date(form.fromDate)) { toast.error("Temporal paradox: 'To' precedes 'From'"); return; }
    setSubmitting(true);
    toast.loading("Synchronizing request...");
    try {
      const fd = new FormData();
      Object.keys(form).forEach(k => fd.append(k, form[k]));
      fd.append("requesterType", "student");
      if (file) fd.append("attachment", file);
      await axiosWrapper.post("/leave/request", fd, { headers: { ...authHeader(), "Content-Type": "multipart/form-data" } });
      toast.dismiss(); toast.success("Request archived");
      setForm({ facultyId: "", fromDate: "", toDate: "", reason: "" }); setFile(null);
      const res = await axiosWrapper.get("/leave/my", { headers: authHeader() }); setLeaves(res.data.data || []);
    } catch { toast.dismiss(); toast.error("Sync failure"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 anim-fade-up">
      {/* Request Form */}
      <div className="lg:col-span-5 bento-card p-8 h-fit">
        <h2 className="text-lg font-bold text-[var(--navy-dark)] mb-6 flex items-center gap-2"><MdEventNote className="text-[var(--navy)]" /> Leave Petition</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div><label className="bento-label">Authorizing Faculty</label>
            <select className="bento-input" value={form.facultyId} onChange={(e) => setForm({ ...form, facultyId: e.target.value })} required>
              <option value="">Select Overseer</option>
              {faculties.map((f) => <option key={f._id} value={f._id}>{f.firstName} {f.lastName}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="bento-label">Interval From</label><input type="date" className="bento-input !py-2 !text-xs" value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })} required /></div>
            <div><label className="bento-label">Interval To</label><input type="date" className="bento-input !py-2 !text-xs" value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })} required /></div>
          </div>
          <div><label className="bento-label">Justification Statement</label><textarea className="bento-input min-h-[100px]" placeholder="Transcribe reasoning..." value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required /></div>
          <div><label className="bento-label">Supporting Artifact (Optional)</label>
            <div className="relative group overflow-hidden bg-[var(--bg-inset)] border-2 border-dashed border-gray-200 rounded-2xl p-6 transition-all hover:border-[var(--navy)]">
              <input type="file" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              <div className="text-center">
                <MdCloudUpload size={32} className="mx-auto text-gray-300 mb-2 group-hover:text-[var(--navy)] transition-colors" />
                <p className="text-[0.6rem] font-bold text-gray-500 uppercase tracking-widest">{file ? file.name : 'PDF / JPG SUPPORT'}</p>
              </div>
            </div>
          </div>
          <CustomButton type="submit" disabled={submitting} className="w-full !py-3.5 shadow-xl shadow-blue-100">
            {submitting ? "Transcribing..." : "Commit Petition"}
          </CustomButton>
        </form>
      </div>

      {/* History List */}
      <div className="lg:col-span-7 bento-card p-8">
        <h2 className="text-lg font-bold text-[var(--navy-dark)] mb-6 flex items-center gap-2"><MdHistory className="text-[var(--navy)]" /> Petition Archives</h2>
        {loading ? <div className="flex justify-center py-10"><div className="animate-spin w-8 h-8 border-4 border-[var(--navy)] border-t-transparent rounded-full" /></div> : leaves.length === 0 ? <p className="text-center text-gray-400 italic py-10">No petitions archived.</p> : (
          <div className="space-y-4 anim-stagger">
            {leaves.map((leave, idx) => (
              <div key={leave._id} className="bento-card-glass p-5 anim-scale-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                       <span className={`bento-badge !py-0.5 !text-[0.6rem] uppercase font-black ${leave.status === 'approved' ? 'bento-badge-success' : leave.status === 'rejected' ? 'bento-badge-danger' : 'bento-badge-info'}`}>
                         {leave.status}
                       </span>
                       <span className="text-[0.65rem] font-bold text-gray-400 tracking-tighter">ID: {leave._id.slice(-6)}</span>
                    </div>
                    <p className="text-sm font-bold text-[var(--navy-dark)] uppercase tracking-tight flex items-center gap-2"><MdPerson className="text-gray-400" /> {leave.facultyId?.firstName} {leave.facultyId?.lastName}</p>
                    <p className="text-[0.65rem] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2"><MdDateRange className="text-blue-300" /> {new Date(leave.fromDate).toLocaleDateString()} — {new Date(leave.toDate).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500 mt-3 leading-relaxed bg-white/50 p-3 rounded-xl border border-gray-50">{leave.reason}</p>
                    {leave.attachment && (
                      <a href={`${process.env.REACT_APP_MEDIA_LINK}/${leave.attachment}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[0.65rem] font-black text-[var(--navy)] hover:underline mt-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                        <MdAttachment /> ATTACHED EVIDENCE
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Attendance = () => {
  const [activeTab, setActiveTab] = useState("attendance");

  return (
    <div className="space-y-8">
      {/* Premium Tab Bar */}
      <div className="bento-card-flat p-1 grid grid-cols-2 gap-1 max-w-md mx-auto">
         <button onClick={() => setActiveTab("attendance")} className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-[0.7rem] font-black uppercase tracking-[0.2em] transition-all ${activeTab === "attendance" ? "bg-[var(--navy)] text-white shadow-lg" : "text-gray-400 hover:bg-[var(--bg-inset)] hover:text-[var(--navy)]"}`}>
            <MdInsertChart size={18} /> Stats
         </button>
         <button onClick={() => setActiveTab("leave")} className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-[0.7rem] font-black uppercase tracking-[0.2em] transition-all ${activeTab === "leave" ? "bg-[var(--navy)] text-white shadow-lg" : "text-gray-400 hover:bg-[var(--bg-inset)] hover:text-[var(--navy)]"}`}>
            <MdEventNote size={18} /> Petition
         </button>
      </div>

      {activeTab === "attendance" ? <AttendanceSummary /> : <LeaveRequest />}
    </div>
  );
};

export default Attendance;
