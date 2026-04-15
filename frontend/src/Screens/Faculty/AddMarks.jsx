import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axiosWrapper from "../../utils/AxiosWrapper";
import Heading from "../../components/Heading";
import CustomButton from "../../components/CustomButton";
import { MdSearch, MdChevronLeft, MdCheckCircle, MdAssignment, MdDateRange, MdAccessTime, MdPeople, MdFactCheck, MdErrorOutline } from "react-icons/md";

const AddMarks = () => {
  const [branches, setBranches] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const userToken = localStorage.getItem("userToken");
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [masterMarksData, setMasterMarksData] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [consent, setConsent] = useState(false);
  const [showSearch, setShowSearch] = useState(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "branch") setSelectedBranch(branches.find((b) => b._id === value));
    else if (name === "subject") setSelectedSubject(subjects.find((s) => s._id === value));
    else if (name === "semester") setSelectedSemester(value);
    else if (name === "exam") setSelectedExam(exams.find((e) => e._id === value));
  };

  const fetchBranches = async () => {
    try {
      const response = await axiosWrapper.get("/branch", { headers: { Authorization: `Bearer ${userToken}` } });
      if (response.data.success) setBranches(response.data.data);
    } catch { /* silent */ }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axiosWrapper.get(`/subject?branch=${selectedBranch?._id}`, { headers: { Authorization: `Bearer ${userToken}` } });
      if (response.data.success) setSubjects(response.data.data);
    } catch { setSubjects([]); }
  };

  const fetchExams = async () => {
    try {
      const response = await axiosWrapper.get(`/exam?semester=${selectedSemester}`, { headers: { Authorization: `Bearer ${userToken}` } });
      if (response.data.success) setExams(response.data.data);
    } catch { setExams([]); }
  };

  const searchStudents = async () => {
    setDataLoading(true);
    toast.loading("Fetching student roster...");
    try {
      const response = await axiosWrapper.get(`/marks/students?branch=${selectedBranch?._id}&subject=${selectedSubject?._id}&semester=${selectedSemester}&examId=${selectedExam?._id}`, { headers: { Authorization: `Bearer ${userToken}` } });
      toast.dismiss();
      if (response.data.success) {
        if (response.data.data.length === 0) {
          toast.error("No student records found for this criteria");
        } else {
          setStudents(response.data.data);
          const initial = {}; response.data.data.forEach((s) => initial[s._id] = s.obtainedMarks || "");
          setMarksData(initial); setMasterMarksData(response.data.data); setShowSearch(false);
        }
      }
    } catch { toast.dismiss(); toast.error("Database query failed"); }
    finally { setDataLoading(false); }
  };

  const handleSubmit = async () => {
    if (!consent) { toast.error("Confirmation signature required"); return; }
    const hasEmpty = Object.values(marksData).some((m) => m === "");
    if (hasEmpty) { toast.error("Incomplete data: All entries required"); return; }
    setDataLoading(true);
    toast.loading("Committing marks to ledger...");
    try {
      const marksToSubmit = Object.entries(marksData).map(([studentId, marks]) => ({ studentId, obtainedMarks: Number(marks) }));
      const response = await axiosWrapper.post("/marks/bulk", { marks: marksToSubmit, examId: selectedExam?._id, subjectId: selectedSubject?._id, semester: selectedSemester }, { headers: { Authorization: `Bearer ${userToken}` } });
      if (response.data.success) {
        toast.success("Marks synchronized successfully!");
        setMarksData({}); setConsent(false); setShowSearch(true);
      }
    } catch { toast.error("Sync failure"); }
    finally { setDataLoading(false); toast.dismiss(); }
  };

  useEffect(() => { fetchBranches(); }, []);
  useEffect(() => { if (selectedBranch) fetchSubjects(); }, [selectedBranch]);
  useEffect(() => { if (selectedSemester) fetchExams(); }, [selectedSemester]);

  return (
    <div className="w-full space-y-8 anim-fade-up">
      <Heading title="Examination Ledger" subtitle="Transcribe and verify student academic performance" />

      {showSearch ? (
        <div className="bento-card p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="bento-label">Academic Semester</label>
              <select name="semester" value={selectedSemester || ""} onChange={handleInputChange} className="bento-input">
                <option value="">Choose Term</option>
                {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div>
              <label className="bento-label">Departmental Branch</label>
              <select name="branch" value={selectedBranch?._id || ""} onChange={handleInputChange} className="bento-input">
                <option value="">Choose Branch</option>
                {branches?.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="bento-label">Target Subject</label>
              <select name="subject" value={selectedSubject?._id || ""} onChange={handleInputChange} disabled={!selectedBranch} className="bento-input disabled:bg-gray-50 disabled:cursor-not-allowed">
                <option value="">{selectedBranch ? "Choose Subject" : "Select Branch First"}</option>
                {subjects?.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
              </select>
            </div>
            <div>
              <label className="bento-label">Evaluation Event</label>
              <select name="exam" value={selectedExam?._id || ""} onChange={handleInputChange} disabled={!selectedSemester} className="bento-input disabled:bg-gray-50 disabled:cursor-not-allowed">
                <option value="">{selectedSemester ? "Choose Exam" : "Select Semester First"}</option>
                {exams?.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-8 flex justify-center">
             <CustomButton onClick={searchStudents} disabled={dataLoading || !selectedBranch || !selectedSubject || !selectedExam} className="!px-12 !py-3">
               <MdSearch className="mr-2" size={20} /> Initialize Grading
             </CustomButton>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
           {/* Context Bento Grid */}
           <div className="bento-grid-4 anim-stagger">
              <div className="bento-card-glass p-4 anim-scale-in">
                 <p className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest mb-1">Session Context</p>
                 <div className="flex items-center gap-2">
                   <MdAssignment className="text-[var(--navy)]" />
                   <p className="font-bold text-[var(--navy-dark)] text-sm">{selectedBranch?.branchId} - S{selectedSemester}</p>
                 </div>
              </div>
              <div className="bento-card-glass p-4 anim-scale-in" style={{ animationDelay: "0.1s" }}>
                 <p className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest mb-1">Assessment</p>
                 <div className="flex items-center gap-2">
                   <MdFactCheck className="text-amber-500" />
                   <p className="font-bold text-[var(--navy-dark)] text-sm">{selectedExam?.name}</p>
                 </div>
              </div>
              <div className="bento-card-glass p-4 anim-scale-in" style={{ animationDelay: "0.2s" }}>
                 <p className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest mb-1">Evaluation Scope</p>
                 <div className="flex items-center gap-2 text-xs">
                   <MdDateRange className="text-blue-500" />
                   <span className="font-medium text-gray-600 truncate">{selectedExam?.date ? new Date(selectedExam.date).toLocaleDateString() : 'N/A'} • {selectedExam?.time}</span>
                 </div>
              </div>
              <div className="bento-card-glass p-4 anim-scale-in" style={{ animationDelay: "0.3s" }}>
                 <p className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest mb-1">Student Quorum</p>
                 <div className="flex items-center gap-2">
                   <MdPeople className="text-emerald-500" />
                   <p className="font-bold text-[var(--navy-dark)] text-sm">{masterMarksData.length} Candidates</p>
                 </div>
              </div>
           </div>

           <div className="flex justify-between items-center">
             <CustomButton variant="ghost" onClick={() => setShowSearch(true)} className="!px-4 !py-2 !rounded-xl border border-gray-100"><MdChevronLeft size={18} /> Modify Criteria</CustomButton>
             <div className="bento-badge bento-badge-info font-bold">Max Scaling: {selectedExam?.totalMarks} Units</div>
           </div>

           {/* Input Grid */}
           <div className="bento-grid-3 anim-stagger">
             {masterMarksData.map((s, idx) => (
                <div key={s._id} className="bento-card p-4 flex flex-col gap-3 anim-scale-in" style={{ animationDelay: `${idx * 0.02}s` }}>
                   <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                     <span className="text-[0.65rem] font-black text-[var(--navy)] tracking-tighter bg-blue-50 px-2 py-0.5 rounded shadow-sm">{s.enrollmentNo}</span>
                     <p className="text-xs font-bold text-gray-600 truncate max-w-[120px]">{s.firstName} {s.lastName}</p>
                   </div>
                   <div className="relative group">
                     <input type="number" min={0} max={selectedExam?.totalMarks || 100} value={marksData[s._id] || ""} placeholder="Input Value" onChange={(e) => setMarksData({ ...marksData, [s._id]: e.target.value })} className="bento-input !py-3 !pl-10 !text-sm group-focus-within:border-[var(--gold)]" />
                     <MdAssignment className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[var(--gold)] transition-colors" />
                     <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[0.6rem] font-bold text-gray-300">/ {selectedExam?.totalMarks}</div>
                   </div>
                </div>
             ))}
           </div>

           {/* Submit Block */}
           <div className="bento-card p-8 bg-gray-50/50 border-t-4 border-t-[var(--navy)] flex flex-col items-center gap-6">
              <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100">
                <input type="checkbox" id="consent" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-[var(--navy)] focus:ring-[var(--navy)] cursor-pointer" />
                <label htmlFor="consent" className="text-xs font-bold text-gray-600 cursor-pointer flex items-center gap-2">
                   <MdCheckCircle className="text-emerald-500" size={18} /> I verify the accuracy of the transcribed evaluation data
                </label>
              </div>
              <CustomButton onClick={handleSubmit} disabled={dataLoading || !consent} className="!px-16 !py-4 !text-base shadow-2xl transform active:scale-95 shadow-blue-200">
                {dataLoading ? "Synchronizing Data..." : "Finalize Evaluation Ledger"}
              </CustomButton>
           </div>
        </div>
      )}
    </div>
  );
};

export default AddMarks;
