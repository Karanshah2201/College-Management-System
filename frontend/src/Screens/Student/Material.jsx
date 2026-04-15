import React, { useEffect, useState } from "react";
import { MdLink, MdFolder, MdClass, MdLayers, MdDescription, MdCloudDownload, MdSearch } from "react-icons/md";
import { useSelector } from "react-redux";
import axiosWrapper from "../../utils/AxiosWrapper";
import toast from "react-hot-toast";
import Heading from "../../components/Heading";

const Material = () => {
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const userData = useSelector((state) => state.userData);
  const [filters, setFilters] = useState({ subject: "", type: "" });

  useEffect(() => { if (userData?.semester) fetchSubjects(); }, [userData]);
  useEffect(() => { if (userData?.semester) fetchMaterials(); }, [filters, userData]);

  const fetchSubjects = async () => {
    try {
      const response = await axiosWrapper.get(`/subject?semester=${userData.semester}&branch=${userData.branchId._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
      });
      if (response.data.success) setSubjects(response.data.data);
    } catch { setSubjects([]); }
  };

  const fetchMaterials = async () => {
    setDataLoading(true);
    try {
      const queryParams = new URLSearchParams({ semester: userData.semester, branch: userData.branchId._id });
      if (filters.subject) queryParams.append("subject", filters.subject);
      if (filters.type) queryParams.append("type", filters.type);
      const response = await axiosWrapper.get(`/material?${queryParams}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
      });
      if (response.data.success) setMaterials(response.data.data);
    } catch { setMaterials([]); }
    finally { setDataLoading(false); }
  };

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  return (
    <div className="w-full space-y-8 anim-fade-up">
      <Heading title="Academic Vault" subtitle="Authorized distribution center for course materials and research assets" />

      {/* Bento Filter & Search */}
      <div className="bento-card-flat p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
         <div className="md:col-span-1 flex justify-center text-gray-400"><MdSearch size={20} /></div>
         <div className="md:col-span-5">
           <select name="subject" value={filters.subject} onChange={handleFilterChange} className="bento-input !py-2 !text-xs !border-0 bg-transparent">
             <option value="">All Disciplines</option>
             {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
           </select>
         </div>
         <div className="md:col-span-1 border-l border-gray-100 h-6 hidden md:block"></div>
         <div className="md:col-span-5">
           <select name="type" value={filters.type} onChange={handleFilterChange} className="bento-input !py-2 !text-xs !border-0 bg-transparent">
             <option value="">All Formats</option>
             <option value="notes">Lecture Notes</option>
             <option value="assignment">Assignment Files</option>
             <option value="syllabus">Syllabus Guides</option>
           </select>
         </div>
      </div>

      {dataLoading ? <div className="flex justify-center py-20"><div className="animate-spin w-10 h-10 border-4 border-[var(--navy)] border-t-transparent rounded-full" /></div> : materials.length === 0 ? (
        <div className="bento-card p-20 text-center flex flex-col items-center">
          <MdFolder size={64} className="text-gray-100 mb-4" />
          <p className="text-gray-400 font-medium italic">Vault is currently empty for this term</p>
        </div>
      ) : (
        <div className="bento-grid-3 anim-stagger">
          {materials.map((m, idx) => (
            <div key={m._id} className="bento-card hover-lift p-6 anim-scale-in group" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="flex items-start justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${m.type === 'notes' ? 'bg-amber-50 text-amber-500' : m.type === 'syllabus' ? 'bg-indigo-50 text-indigo-500' : 'bg-emerald-50 text-emerald-500'}`}>
                   {m.type === 'notes' ? <MdDescription size={28} /> : m.type === 'syllabus' ? <MdLayers size={28} /> : <MdFolder size={28} />}
                </div>
                <span className="bento-badge bento-badge-info !py-0.5 !text-[0.6rem] uppercase font-black">{m.type}</span>
              </div>
              
              <h3 className="font-bold text-[var(--navy-dark)] text-sm mb-1 leading-tight group-hover:text-[var(--navy)] transition-colors">{m.title}</h3>
              <p className="text-[0.65rem] font-black text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-50 pb-4">{m.subject.name}</p>
              
              <div className="flex items-center justify-between gap-4">
                 <div className="flex flex-col">
                    <span className="text-[0.55rem] font-bold text-gray-400 uppercase tracking-tighter text-center">Semester</span>
                    <span className="text-xs font-black text-[var(--navy)] text-center">{userData.semester}</span>
                 </div>
                 <button onClick={() => window.open(`${process.env.REACT_APP_MEDIA_LINK}/${m.file}`)} className="flex-1 bg-[var(--navy)] text-white text-[0.65rem] font-bold py-2.5 rounded-xl shadow-lg shadow-blue-100 hover:scale-[1.02] active:scale-95 transition-all text-center flex items-center justify-center gap-2">
                   <MdLink size={16} /> ACCESS REPOSITORY
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Material;
