import React, { useState, useEffect } from "react";
import axiosWrapper from "../../utils/AxiosWrapper";
import toast from "react-hot-toast";
import { MdCheckCircle, MdCancel, MdPending, MdPerson, MdCalendarToday, MdDescription, MdAttachFile, MdLabel, MdHistory } from "react-icons/md";
import CustomButton from "../../components/CustomButton";

const userToken = () => localStorage.getItem("userToken");
const authHeader = () => ({ Authorization: `Bearer ${userToken()}` });

const STATUS_UI = {
  present: { icon: MdCheckCircle, class: "bento-badge-success", label: "Present" },
  absent: { icon: MdCancel, class: "bento-badge-danger", label: "Absent" },
  pending: { icon: MdPending, class: "bento-badge-info", label: "Pending" },
  approved: { icon: MdCheckCircle, class: "bento-badge-success", label: "Approved" },
  rejected: { icon: MdCancel, class: "bento-badge-danger", label: "Rejected" },
};

// ─── Mark Attendance Tab ──────────────────────────────────────────────────────
const MarkAttendance = ({ profileData }) => {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!profileData?._id) return;
      try {
        const res = await axiosWrapper.get(`/subject/`, {
          headers: authHeader(),
          params: { facultyId: profileData._id },
        });
        setSubjects(res.data.data || []);
      } catch { setSubjects([]); }
    };
    fetchSubjects();
  }, [profileData]);

  const fetchStudents = async () => {
    if (!selectedSubject) return;
    const sub = subjects.find((s) => s._id === selectedSubject);
    if (!sub) return;
    setLoading(true);
    try {
      const studRes = await axiosWrapper.get(`/attendance/students`, {
        headers: authHeader(),
        params: { branchId: profileData.branchId, semester: sub.semester },
      });
      const studentList = studRes.data.data || [];
      setStudents(studentList);

      const attRes = await axiosWrapper.get(`/attendance/by-date`, {
        headers: authHeader(),
        params: { subjectId: selectedSubject, date },
      });
      const existing = {};
      (attRes.data.data || []).forEach((r) => { existing[r.studentId] = r.status; });

      const initial = {};
      studentList.forEach((s) => { initial[s._id] = existing[s._id] || "present"; });
      setAttendance(initial);
    } catch { toast.error("Failed to sync attendance data"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (selectedSubject && date) fetchStudents();
  }, [selectedSubject, date]);

  const toggle = (id) => {
    setAttendance((prev) => ({ ...prev, [id]: prev[id] === "present" ? "absent" : "present" }));
  };

  const markAll = (status) => {
    const updated = {};
    students.forEach((s) => (updated[s._id] = status));
    setAttendance(updated);
  };

  const handleSubmit = async () => {
    if (!selectedSubject || !date || !students.length) {
      toast.error("Complete session details first"); return;
    }
    const sub = subjects.find((s) => s._id === selectedSubject);
    setSubmitting(true);
    try {
      const attendanceList = students.map((s) => ({ studentId: s._id, status: attendance[s._id] || "absent" }));
      await axiosWrapper.post("/attendance/mark", {
        subjectId: selectedSubject, date, semester: sub.semester, branchId: profileData.branchId, attendanceList,
      }, { headers: authHeader() });
      toast.success("Attendance registry updated!");
    } catch { toast.error("Sync failed"); }
    finally { setSubmitting(false); }
  };

  const presentCount = Object.values(attendance).filter((v) => v === "present").length;
  const perc = students.length ? (presentCount / students.length) * 100 : 0;

  return (
    <div className="space-y-6 anim-fade-up">
      <div className="bento-card-flat p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div>
            <label className="bento-label">Academic Subject</label>
            <select className="bento-input" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
              <option value="">Choose Course Segment</option>
              {subjects.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.code}) - Sem {s.semester}</option>)}
            </select>
          </div>
          <div>
            <label className="bento-label">Session Date</label>
            <input type="date" className="bento-input" value={date} max={new Date().toISOString().split("T")[0]} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-[var(--navy)] border-t-transparent rounded-full" /></div> : students.length > 0 && (
        <div className="space-y-6">
          <div className="bento-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Attendance Quorum</span>
                 <span className="text-sm font-black text-[var(--navy)]">{presentCount} / {students.length}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-50 shadow-inner">
                <div className="bg-gradient-to-r from-emerald-400 to-green-500 h-full rounded-full transition-all duration-700 shadow-sm" style={{ width: `${perc}%` }} />
              </div>
            </div>
            <div className="flex gap-2">
               <CustomButton onClick={() => markAll("present")} variant="secondary" className="!py-2 !px-4 text-[0.65rem] !rounded-xl">Mark All Present</CustomButton>
               <CustomButton onClick={() => markAll("absent")} variant="ghost" className="!py-2 !px-4 text-[0.65rem] !rounded-xl border border-red-100 text-red-500 hover:bg-red-50">Mark All Absent</CustomButton>
            </div>
          </div>

          <div className="bento-grid-2 anim-stagger">
            {students.map((student, idx) => {
              const status = attendance[student._id] || "absent";
              const ui = STATUS_UI[status];
              return (
                <div key={student._id} className="bento-card hover-lift p-4 flex items-center justify-between anim-scale-in" style={{ animationDelay: `${idx * 0.03}s` }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-inset)] flex items-center justify-center text-[var(--navy)] font-bold text-xs">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[var(--navy-dark)] truncate">{student.firstName} {student.lastName}</p>
                      <p className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-tight">{student.enrollmentNo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className={`${ui.class} bento-badge !px-3 !py-1 text-[0.65rem] !rounded-lg flex items-center gap-1.5`}>
                       <ui.icon size={12} /> {ui.label}
                     </span>
                     <button onClick={() => toggle(student._id)} className={`w-12 h-6 rounded-full transition-all p-1 flex items-center shadow-inner ${status === "present" ? "bg-emerald-500" : "bg-gray-200"}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${status === "present" ? "translate-x-6" : "translate-x-0"}`} />
                     </button>
                  </div>
                </div>
              );
            })}
          </div>

          <CustomButton onClick={handleSubmit} disabled={submitting} className="w-full !py-4 !text-base shadow-xl transform active:scale-[0.98]">
            {submitting ? "Processing Registry..." : "Commit Attendance Records"}
          </CustomButton>
        </div>
      )}
    </div>
  );
};

// ─── Leave Requests Tab ───────────────────────────────────────────────────────
const LeaveRequests = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remark, setRemark] = useState({});

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await axiosWrapper.get("/leave/faculty", { headers: authHeader() });
      setLeaves(res.data.data || []);
    } catch { toast.error("Leave buffer offline"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleAction = async (leaveId, status) => {
    try {
      await axiosWrapper.patch(`/leave/status/${leaveId}`, { status, facultyRemark: remark[leaveId] || "" }, { headers: authHeader() });
      toast.success(`Request ${status}`);
      fetchLeaves();
    } catch { toast.error("Sync error"); }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-[var(--navy)] border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-4 anim-fade-up">
      {leaves.length === 0 ? <div className="bento-card p-12 text-center text-gray-400 font-medium">No pending leave applications</div> : leaves.map((leave, idx) => {
        const ui = STATUS_UI[leave.status];
        return (
          <div key={leave._id} className="bento-card p-5 anim-scale-in group" style={{ animationDelay: `${idx * 0.1}s` }}>
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1 space-y-3">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center"><MdPerson className="text-indigo-500 text-xl" /></div>
                   <div>
                     <p className="font-bold text-[var(--navy-dark)]">{leave.studentId?.firstName} {leave.studentId?.lastName}</p>
                     <p className="text-[0.65rem] font-bold text-gray-400 tracking-wider">ENROLL: {leave.studentId?.enrollmentNo}</p>
                   </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                       <MdCalendarToday className="text-[var(--gold)] mt-1 shrink-0" size={14} />
                       <div className="text-xs">
                         <span className="font-bold text-gray-400 block pb-0.5">TIMELINE:</span>
                         <span className="font-bold text-[var(--navy)] truncate block italic">{new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}</span>
                       </div>
                    </div>
                    <div className="flex items-start gap-2">
                       <MdLabel className="text-blue-400 mt-1 shrink-0" size={14} />
                       <div className="text-xs">
                         <span className="font-bold text-gray-400 block pb-0.5">REASON:</span>
                         <span className="font-medium text-gray-600 italic block">{leave.reason}</span>
                       </div>
                    </div>
                 </div>
                 {leave.attachment && (
                    <a href={`${process.env.REACT_APP_MEDIA_LINK}/${leave.attachment}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[0.65rem] font-bold text-[var(--navy)] bg-blue-50/50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                      <MdAttachFile /> ATTACHED EVIDENCE
                    </a>
                 )}
              </div>
              <div className="flex flex-col items-end gap-3 min-w-[150px]">
                 <span className={`${ui.class} bento-badge !px-3 !py-1 text-[0.65rem] !rounded-lg flex items-center gap-1.5`}>
                   <ui.icon size={12} /> {ui.label}
                 </span>
                 {leave.status === "pending" && (
                   <div className="w-full space-y-2 mt-2">
                     <input type="text" placeholder="Resolution remark..." className="bento-input !py-2 !text-xs" value={remark[leave._id] || ""} onChange={(e) => setRemark({ ...remark, [leave._id]: e.target.value })} />
                     <div className="flex gap-2 w-full">
                       <button onClick={() => handleAction(leave._id, "approved")} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[0.65rem] font-bold py-2 rounded-xl transition shadow-lg shadow-emerald-200">Approve</button>
                       <button onClick={() => handleAction(leave._id, "rejected")} className="flex-1 bg-red-500 hover:bg-red-600 text-white text-[0.65rem] font-bold py-2 rounded-xl transition shadow-lg shadow-red-200">Reject</button>
                     </div>
                   </div>
                 )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── My Leave Request Tab (Faculty -> Admin) ──────────────────────────────────
const MyLeaveRequest = () => {
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({ fromDate: "", toDate: "", reason: "" });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMyLeaves = async () => {
    setLoading(true);
    try {
      const res = await axiosWrapper.get("/leave/my", { headers: authHeader() });
      setLeaves(res.data.data || []);
    } catch { toast.error("Sync error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMyLeaves(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fromDate || !form.toDate || !form.reason) { toast.error("Missing mandatory fields"); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.keys(form).forEach(k => fd.append(k, form[k]));
      if (file) fd.append("attachment", file);
      fd.append("requesterType", "faculty");
      await axiosWrapper.post("/leave/request", fd, { headers: { ...authHeader(), "Content-Type": "multipart/form-data" } });
      toast.success("Leave requisition filed!");
      setForm({ fromDate: "", toDate: "", reason: "" }); setFile(null); fetchMyLeaves();
    } catch { toast.error("Filing error"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 anim-fade-up">
      <div className="lg:col-span-1">
        <div className="bento-card p-6 sticky top-6">
          <h2 className="text-lg font-bold text-[var(--navy-dark)] mb-6 flex items-center gap-2">
            <MdDescription className="text-[var(--gold)]" /> Requisition Form
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div><label className="bento-label">Commence Date</label><input type="date" className="bento-input" value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })} required /></div>
              <div><label className="bento-label">Conclusion Date</label><input type="date" className="bento-input" value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })} required /></div>
              <div><label className="bento-label">Core Reason</label><textarea className="bento-input !min-h-[100px] resize-none" placeholder="Elaborate justification..." value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required /></div>
              <div><label className="bento-label">Documentary Evidence</label><input type="file" className="bento-input" onChange={(e) => setFile(e.target.files[0])} /></div>
            </div>
            <CustomButton type="submit" disabled={submitting} className="w-full">
               {submitting ? "Processing..." : "Submit File"}
            </CustomButton>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bento-card p-6">
          <h2 className="text-lg font-bold text-[var(--navy-dark)] mb-6 flex items-center gap-2">
            <MdHistory className="text-[var(--navy)]" /> Requisition History
          </h2>
          {loading ? <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-[var(--navy)] border-t-transparent rounded-full" /></div> : leaves.length === 0 ? <p className="text-center text-gray-400 py-12">No document history found</p> : (
            <div className="space-y-4">
              {leaves.map((leave, idx) => {
                const ui = STATUS_UI[leave.status];
                return (
                  <div key={idx} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 hover:border-blue-100 transition-all">
                    <div className="flex justify-between items-start mb-3">
                       <span className={`${ui.class} bento-badge !px-2 !py-0.5 text-[0.6rem] !rounded-lg flex items-center gap-1.5`}>
                         <ui.icon size={10} /> {ui.label}
                       </span>
                       <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-tighter italic">ID: {leave._id.slice(-6).toUpperCase()}</span>
                    </div>
                    <p className="text-xs font-bold text-[var(--navy-dark)] mb-1">Duration: {new Date(leave.fromDate).toLocaleDateString()} to {new Date(leave.toDate).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500 italic mb-3">"{leave.reason}"</p>
                    {leave.facultyRemark && <p className="text-[0.6rem] bg-amber-50 text-amber-900 p-2 rounded-lg font-medium border border-amber-100">Admin Response: {leave.facultyRemark}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const Attendance = ({ profileData }) => {
  const [activeTab, setActiveTab] = useState("mark");
  const tabs = [
    { id: "mark", label: "Registry", icon: MdCalendarToday },
    { id: "leaves", label: "Resolutions", icon: MdPending },
    { id: "myleaves", label: "My Files", icon: MdHistory },
  ];

  return (
    <div className="space-y-8 anim-fade-up">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id ? "bg-[var(--navy)] text-white shadow-lg" : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            <tab.icon /> {tab.label}
          </button>
        ))}
      </div>
      <div className="transition-all duration-300">
        {activeTab === "mark" && <MarkAttendance profileData={profileData} />}
        {activeTab === "leaves" && <LeaveRequests />}
        {activeTab === "myleaves" && <MyLeaveRequest />}
      </div>
    </div>
  );
};

export default Attendance;
