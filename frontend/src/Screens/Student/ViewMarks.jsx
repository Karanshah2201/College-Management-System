import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axiosWrapper from "../../utils/AxiosWrapper";
import Heading from "../../components/Heading";
import { useSelector } from "react-redux";
import { MdAssessment, MdSubject, MdEmojiEvents, MdTimeline, MdBarChart, MdAssignmentTurnedIn } from "react-icons/md";

const ViewMarks = () => {
  const userData = useSelector((state) => state.userData);
  const [dataLoading, setDataLoading] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(userData?.semester || 1);
  const [marks, setMarks] = useState([]);
  const userToken = localStorage.getItem("userToken");

  const fetchMarks = async (semester) => {
    setDataLoading(true);
    toast.loading("Querying scholastic records...");
    try {
      const response = await axiosWrapper.get(`/marks/student?semester=${semester}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (response.data.success) setMarks(response.data.data);
    } catch { toast.error("Synchronization failure"); }
    finally { setDataLoading(false); toast.dismiss(); }
  };

  useEffect(() => { if (userData?.semester) fetchMarks(userData.semester); }, [userData]);

  const midTermMarks = marks.filter((mark) => mark.examId.examType === "mid");
  const endTermMarks = marks.filter((mark) => mark.examId.examType === "end");

  const calculateGpa = (mks) => {
    if (mks.length === 0) return 0;
    const totalPosSize = mks.reduce((s, m) => s + (m.marksObtained / m.examId.totalMarks), 0);
    return ((totalPosSize / mks.length) * 10).toFixed(2);
  };

  return (
    <div className="w-full space-y-8 anim-fade-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <Heading title="Academic Performance" subtitle="Real-time evaluation metrics and result history" />
        <div className="bento-card-flat p-1 flex items-center gap-2">
           <span className="text-[0.6rem] font-black text-gray-400 uppercase ml-3 tracking-widest">Select Term</span>
           <select 
             value={selectedSemester} 
             onChange={(e) => { setSelectedSemester(e.target.value); fetchMarks(e.target.value); }}
             className="bento-input !py-1.5 !px-4 !text-xs !border-0 bg-transparent font-bold text-[var(--navy)]"
           >
             {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
           </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bento-grid-3 anim-stagger">
         <div className="bento-card-glass p-6 anim-scale-in">
            <MdTimeline className="text-blue-500 mb-4" size={24} />
            <p className="text-[0.6rem] font-black text-gray-400 uppercase tracking-widest mb-1">Index Point Average</p>
            <h3 className="text-3xl font-black text-[var(--navy-dark)]">{calculateGpa(marks)} <span className="text-sm text-gray-400 font-bold">/ 10</span></h3>
         </div>
         <div className="bento-card-glass p-6 anim-scale-in" style={{ animationDelay: "0.1s" }}>
            <MdAssignmentTurnedIn className="text-emerald-500 mb-4" size={24} />
            <p className="text-[0.6rem] font-black text-gray-400 uppercase tracking-widest mb-1">Evaluations Cleared</p>
            <h3 className="text-3xl font-black text-[var(--navy-dark)]">{marks.length} <span className="text-sm text-gray-400 font-bold">Objects</span></h3>
         </div>
         <div className="bento-card-glass p-6 anim-scale-in" style={{ animationDelay: "0.2s" }}>
            <MdEmojiEvents className="text-[var(--gold)] mb-4" size={24} />
            <p className="text-[0.6rem] font-black text-gray-400 uppercase tracking-widest mb-1">Scholar Standing</p>
            <h3 className="text-3xl font-black text-[var(--navy-dark)]">PASS <span className="text-sm text-gray-400 font-bold">In Term {selectedSemester}</span></h3>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mid Term Bento */}
        <div className="bento-card p-8">
          <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shadow-inner"><MdBarChart size={20} /></div>
            <div>
              <h2 className="text-base font-black text-[var(--navy-dark)] uppercase tracking-tight">Phase 01: Mid Term</h2>
              <p className="text-[0.6rem] font-bold text-gray-400 uppercase">Foundational Assessment</p>
            </div>
          </div>
          {dataLoading ? <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-50 rounded-2xl"></div>)}</div> : midTermMarks.length > 0 ? (
            <div className="space-y-4">
              {midTermMarks.map((m, idx) => (
                <div key={m._id} className="bento-card-flat p-5 hover:border-[var(--gold)] transition-all group overflow-hidden relative">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 opacity-0 group-hover:opacity-40 rounded-full -mr-12 -mt-12 transition-all"></div>
                   <div className="flex justify-between items-center relative z-10">
                      <div className="space-y-1">
                        <p className="text-[0.6rem] font-black text-amber-600 uppercase tracking-widest">{m.examId.name}</p>
                        <h4 className="text-sm font-bold text-[var(--navy-dark)]">{m.subjectId.name}</h4>
                      </div>
                      <div className="text-right">
                         <p className="text-xl font-black text-[var(--navy)] tracking-tighter">{m.marksObtained}</p>
                         <p className="text-[0.6rem] font-bold text-gray-400 uppercase">Limit: {m.examId.totalMarks}</p>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          ) : <div className="py-20 text-center text-gray-400 italic font-medium">No mid-term metrics localized.</div>}
        </div>

        {/* End Term Bento */}
        <div className="bento-card p-8">
          <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shadow-inner"><MdEmojiEvents size={20} /></div>
            <div>
              <h2 className="text-base font-black text-[var(--navy-dark)] uppercase tracking-tight">Phase 02: End Term</h2>
              <p className="text-[0.6rem] font-bold text-gray-400 uppercase">Summative Performance</p>
            </div>
          </div>
          {dataLoading ? <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-50 rounded-2xl"></div>)}</div> : endTermMarks.length > 0 ? (
            <div className="space-y-4">
              {endTermMarks.map((m, idx) => (
                <div key={m._id} className="bento-card-flat p-5 hover:border-indigo-200 transition-all group overflow-hidden relative">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 opacity-0 group-hover:opacity-40 rounded-full -mr-12 -mt-12 transition-all"></div>
                   <div className="flex justify-between items-center relative z-10">
                      <div className="space-y-1">
                        <p className="text-[0.6rem] font-black text-indigo-600 uppercase tracking-widest">{m.examId.name}</p>
                        <h4 className="text-sm font-bold text-[var(--navy-dark)]">{m.subjectId.name}</h4>
                      </div>
                      <div className="text-right">
                         <p className="text-xl font-black text-[var(--navy)] tracking-tighter">{m.marksObtained}</p>
                         <p className="text-[0.6rem] font-bold text-gray-400 uppercase">Limit: {m.examId.totalMarks}</p>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          ) : <div className="py-20 text-center text-gray-400 italic font-medium">Final terminal results pending synchronization.</div>}
        </div>
      </div>
    </div>
  );
};

export default ViewMarks;
