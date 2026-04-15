import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { MdOutlineDelete, MdEdit, MdSchool, MdCalendarToday, MdMoreVert, MdBarChart, MdAssignmentTurnedIn, MdAdd, MdCloudUpload, MdLayers } from "react-icons/md";
import { AiOutlineClose } from "react-icons/ai";
import axiosWrapper from "../utils/AxiosWrapper";
import Heading from "../components/Heading";
import DeleteConfirm from "../components/DeleteConfirm";
import CustomButton from "../components/CustomButton";
import { FiUpload } from "react-icons/fi";
import { useSelector } from "react-redux";
import Loading from "../components/Loading";

const Exam = () => {
  const [data, setData] = useState({ name: "", date: "", semester: "", examType: "mid", timetableLink: "", totalMarks: "" });
  const [exams, setExams] = useState();
  const [showModal, setShowModal] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [file, setFile] = useState(null);
  const userData = useSelector((state) => state.userData);
  const loginType = localStorage.getItem("userType");
  const [processLoading, setProcessLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => { getExamsHandler(); }, []);

  const getExamsHandler = async () => {
    setDataLoading(true);
    try {
      const link = userData.semester ? `/exam?semester=${userData.semester}` : "/exam";
      const response = await axiosWrapper.get(link, { headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` } });
      if (response.data.success) setExams(response.data.data);
    } catch { setExams([]); }
    finally { setDataLoading(false); }
  };

  const addExamHandler = async () => {
    if (!data.name || !data.date || !data.semester) { toast.error("Missing mandatory data points"); return; }
    setProcessLoading(true);
    toast.loading(isEditing ? "Reconfiguring protocol..." : "Instantiating assessment...");
    try {
      const fd = new FormData();
      Object.keys(data).forEach(k => fd.append(k, data[k]));
      if (file) fd.append("file", file);
      const res = await axiosWrapper[isEditing ? 'patch' : 'post'](`/exam${isEditing ? `/${selectedExamId}` : ''}`, fd, { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${localStorage.getItem("userToken")}` } });
      toast.dismiss();
      if (res.data.success) { toast.success("Protocol archived"); resetForm(); getExamsHandler(); }
    } catch { toast.dismiss(); toast.error("Synchronization failure"); }
    finally { setProcessLoading(false); }
  };

  const resetForm = () => { setData({ name: "", date: "", semester: "", examType: "mid", timetableLink: "", totalMarks: "" }); setShowModal(false); setIsEditing(false); setFile(null); };
  const editExamHandler = (e) => { setData({ name: e.name, date: new Date(e.date).toISOString().split("T")[0], semester: e.semester, examType: e.examType, timetableLink: e.timetableLink, totalMarks: e.totalMarks }); setSelectedExamId(e._id); setIsEditing(true); setShowModal(true); };

  const isOperator = loginType !== "Student";

  return (
    <div className="w-full space-y-8 anim-fade-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <Heading title="Evaluation Registry" subtitle="Manage high-stakes assessments and scheduling synchronization" />
        {isOperator && (
          <CustomButton onClick={() => setShowModal(true)} className="!rounded-2xl shadow-xl shadow-blue-100"><MdAdd className="mr-2" size={20} /> New Assessment</CustomButton>
        )}
      </div>

      {dataLoading ? <div className="flex justify-center py-20"><div className="animate-spin w-10 h-10 border-4 border-[var(--navy)] border-t-transparent rounded-full" /></div> : exams?.length === 0 ? (
        <div className="bento-card p-20 text-center flex flex-col items-center">
          <MdSchool size={64} className="text-gray-100 mb-4" />
          <p className="text-gray-400 font-medium italic">No assessment protocols localized in current term</p>
        </div>
      ) : (
        <div className="bento-grid-3 anim-stagger">
          {exams?.map((item, idx) => (
            <div key={item._id} className="bento-card hover-lift p-6 anim-scale-in group" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="flex items-start justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${item.examType === 'mid' ? 'bg-amber-50 text-amber-500' : 'bg-indigo-50 text-indigo-500'}`}>
                   {item.examType === 'mid' ? <MdBarChart size={28} /> : <MdAssignmentTurnedIn size={28} />}
                </div>
                <div className="flex items-center gap-2">
                   <span className={`bento-badge !py-0.5 !text-[0.6rem] uppercase font-black ${item.examType === 'mid' ? 'bento-badge-warning' : 'bento-badge-info'}`}>
                     {item.examType === 'mid' ? 'MID-TERM' : 'TERMINAL'}
                   </span>
                   {isOperator && (
                     <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => editExamHandler(item)} className="p-1.5 rounded-lg text-gray-400 hover:text-[var(--navy)] hover:bg-[var(--bg-inset)] transition-all transition-transform hover:scale-110"><MdEdit size={16} /></button>
                        <button onClick={() => { setSelectedExamId(item._id); setIsDeleteConfirmOpen(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all transition-transform hover:scale-110"><MdOutlineDelete size={16} /></button>
                     </div>
                   )}
                </div>
              </div>
              
              <h3 className="font-black text-[var(--navy-dark)] text-sm mb-1 leading-tight tracking-tight">{item.name}</h3>
              <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-6"><MdCalendarToday size={12} className="text-gray-300" /> {new Date(item.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
              
              <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                 <div className="flex flex-col">
                    <span className="text-[0.55rem] font-black text-gray-400 uppercase tracking-widest">Sem Unit</span>
                    <span className="text-sm font-black text-[var(--navy)]">{item.semester}</span>
                 </div>
                 <div className="text-right flex flex-col">
                    <span className="text-[0.55rem] font-black text-emerald-600 uppercase tracking-widest text-[var(--navy)] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">{item.totalMarks} Weightage</span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Protocol Mixer Modal */}
      {showModal && (
        <div className="bento-modal-overlay">
          <div className="bento-modal !max-w-md">
            <div className="bento-modal-header border-b-0 pb-2">
              <h2 className="text-lg font-black text-[var(--navy-dark)] tracking-tight uppercase flex items-center gap-3">
                <MdLayers className="text-[var(--navy)]" />
                {isEditing ? "Reconfigure Protocol" : "Instantiate Protocol"}
              </h2>
              <button onClick={resetForm} className="text-gray-300 hover:text-gray-500 transition-colors"><AiOutlineClose size={24} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div><label className="bento-label">Protocol Identifier</label><input type="text" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} className="bento-input" placeholder="Primary ID..." required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="bento-label">Epoch Date</label><input type="date" value={data.date} onChange={(e) => setData({ ...data, date: e.target.value })} className="bento-input !py-2 !text-xs" required /></div>
                <div><label className="bento-label">Sem Unit</label>
                  <select value={data.semester} onChange={(e) => setData({ ...data, semester: e.target.value })} className="bento-input !py-2 !text-xs" required>
                    <option value="">Select</option>{[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="bento-label">Protocol Type</label>
                  <select value={data.examType} onChange={(e) => setData({ ...data, examType: e.target.value })} className="bento-input !py-2 !text-xs">
                    <option value="mid">Mid Term</option><option value="end">End Term</option>
                  </select>
                </div>
                <div><label className="bento-label">Max Weightage</label><input type="number" value={data.totalMarks} onChange={(e) => setData({ ...data, totalMarks: e.target.value })} className="bento-input !py-2 !text-xs" /></div>
              </div>
              <div className="pt-2">
                <label className="bento-label">Supporting Artifact (Optional)</label>
                <div className="relative group overflow-hidden bg-[var(--bg-inset)] border-2 border-dashed border-gray-200 rounded-2xl p-6 transition-all hover:border-[var(--navy)]">
                   <input type="file" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                   <div className="text-center">
                     <MdCloudUpload size={32} className="mx-auto text-gray-200 group-hover:text-[var(--navy)] transition-colors mb-2" />
                     <p className="text-[0.6rem] font-bold text-gray-400 group-hover:text-gray-600 uppercase tracking-widest">{file ? file.name : 'PDF SCHEDULE ATTACHMENT'}</p>
                   </div>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                 <button type="button" onClick={resetForm} className="flex-1 bento-card-flat py-3 font-black text-[0.65rem] uppercase tracking-widest text-gray-400 hover:text-gray-600">ABORT</button>
                 <CustomButton onClick={addExamHandler} disabled={processLoading} className="flex-[2] !py-3 shadow-xl shadow-blue-100">{isEditing ? "OVERWRITE" : "COMMENCE"}</CustomButton>
              </div>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirm isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} onConfirm={async () => {
         try {
            toast.loading("Expunging protocol...");
            const res = await axiosWrapper.delete(`/exam/${selectedExamId}`, { headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` } });
            toast.dismiss();
            if (res.data.success) { toast.success("Object expunged"); setIsDeleteConfirmOpen(false); getExamsHandler(); }
         } catch { toast.dismiss(); toast.error("Operation failed"); }
      }} message="Confirm data expunction of this assessment protocol." />
    </div>
  );
};

export default Exam;
