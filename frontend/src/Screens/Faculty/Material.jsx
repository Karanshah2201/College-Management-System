import React, { useEffect, useState } from "react";
import { FiUpload, FiEdit2, FiTrash2 } from "react-icons/fi";
import { AiOutlineClose } from "react-icons/ai";
import { MdLink, MdFolder, MdClass, MdLayers, MdDescription, MdCloudUpload } from "react-icons/md";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import toast from "react-hot-toast";
import Heading from "../../components/Heading";
import axiosWrapper from "../../utils/AxiosWrapper";
import DeleteConfirm from "../../components/DeleteConfirm";
import CustomButton from "../../components/CustomButton";

const Material = () => {
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [branches, setBranches] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState(null);
  const [formData, setFormData] = useState({ title: "", subject: "", semester: "", branch: "", type: "notes" });
  const [file, setFile] = useState(null);
  const [filters, setFilters] = useState({ subject: "", semester: "", branch: "", type: "" });

  useEffect(() => { fetchSubjects(); fetchBranches(); fetchMaterials(); }, []);
  useEffect(() => { fetchMaterials(); }, [filters]);

  const fetchSubjects = async () => {
    try {
      const response = await axiosWrapper.get("/subject", { headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` } });
      if (response.data.success) setSubjects(response.data.data);
    } catch { setSubjects([]); }
  };

  const fetchBranches = async () => {
    try {
      const response = await axiosWrapper.get("/branch", { headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` } });
      if (response.data.success) setBranches(response.data.data);
    } catch { setBranches([]); }
  };

  const fetchMaterials = async () => {
    try {
      setDataLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => { if (value) queryParams.append(key, value); });
      const response = await axiosWrapper.get(`/material?${queryParams}`, { headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` } });
      if (response.data.success) setMaterials(response.data.data);
    } catch { setMaterials([]); }
    finally { setDataLoading(false); }
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFile(e.target.files[0]);

  const resetForm = () => {
    setFormData({ title: "", subject: "", semester: "", branch: "", type: "notes" });
    setFile(null); setEditingMaterial(null); setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDataLoading(true);
    toast.loading(editingMaterial ? "Refreshing Library..." : "Archiving New Resource...");
    try {
      const fd = new FormData();
      Object.keys(formData).forEach(k => fd.append(k, formData[k]));
      if (file) fd.append("file", file);
      if (editingMaterial) await axiosWrapper.put(`/material/${editingMaterial._id}`, fd);
      else await axiosWrapper.post("/material", fd, { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${localStorage.getItem("userToken")}` } });
      toast.dismiss(); toast.success(editingMaterial ? "Resource updated" : "Resource published");
      resetForm(); fetchMaterials();
    } catch { toast.dismiss(); toast.error("Transfer failed"); }
    finally { setDataLoading(false); }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setFormData({ title: material.title, subject: material.subject._id, semester: material.semester, branch: material.branch._id, type: material.type });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await axiosWrapper.delete(`/material/${selectedMaterialId}`, { headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` } });
      toast.success("Document removed"); setIsDeleteConfirmOpen(false); fetchMaterials();
    } catch { toast.error("Removal failed"); }
  };

  return (
    <div className="w-full space-y-8 anim-fade-up">
      <Heading title="Knowledge Repository" subtitle="Digitize and distribute academic assets">
        <CustomButton onClick={() => setShowModal(true)}>
          <IoMdAdd className="text-lg" /> Upload Resource
        </CustomButton>
      </Heading>

      {/* Bento Filter Bar */}
      <div className="bento-card-flat p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <select name="subject" value={filters.subject} onChange={handleFilterChange} className="bento-input !py-2 !text-xs">
          <option value="">All Disciplines</option>
          {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
        <select name="branch" value={filters.branch} onChange={handleFilterChange} className="bento-input !py-2 !text-xs">
          <option value="">All Departments</option>
          {branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>
        <select name="semester" value={filters.semester} onChange={handleFilterChange} className="bento-input !py-2 !text-xs">
          <option value="">All Semesters</option>
          {[1,2,3,4,5,6,7,8].map((sem) => <option key={sem} value={sem}>Term {sem}</option>)}
        </select>
        <select name="type" value={filters.type} onChange={handleFilterChange} className="bento-input !py-2 !text-xs">
          <option value="">All Formats</option>
          <option value="notes">Notes</option>
          <option value="assignment">Assignment</option>
          <option value="syllabus">Syllabus</option>
        </select>
      </div>

      {/* Folder View Grid */}
      {dataLoading ? <div className="flex justify-center py-20"><div className="animate-spin w-10 h-10 border-4 border-[var(--navy)] border-t-transparent rounded-full" /></div> : materials.length === 0 ? (
        <div className="bento-card p-20 text-center flex flex-col items-center">
          <MdFolder size={64} className="text-gray-100 mb-4" />
          <p className="text-gray-400 font-medium italic">Empty Archives</p>
        </div>
      ) : (
        <div className="bento-grid-3 anim-stagger">
          {materials.map((m, idx) => (
            <div key={m._id} className="bento-card hover-lift p-5 anim-scale-in group" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${m.type === 'notes' ? 'bg-amber-50 text-amber-500' : m.type === 'syllabus' ? 'bg-indigo-50 text-indigo-500' : 'bg-emerald-50 text-emerald-500'}`}>
                   {m.type === 'notes' ? <MdDescription size={24} /> : m.type === 'syllabus' ? <MdLayers size={24} /> : <MdFolder size={24} />}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                  <button onClick={() => handleEdit(m)} className="p-2 rounded-xl text-gray-400 hover:text-[var(--navy)] hover:bg-[var(--bg-inset)]"><FiEdit2 size={14} /></button>
                  <button onClick={() => { setSelectedMaterialId(m._id); setIsDeleteConfirmOpen(true); }} className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50"><FiTrash2 size={14} /></button>
                </div>
              </div>
              <h3 className="font-bold text-[var(--navy-dark)] text-sm mb-1 truncate group-hover:text-[var(--navy)] transition-colors">{m.title}</h3>
              <p className="text-[0.6rem] font-black text-gray-400 uppercase tracking-widest mb-4">{m.subject.name}</p>
              
              <div className="space-y-2 mb-6 border-t border-gray-50 pt-4">
                <div className="flex items-center gap-2 text-[0.65rem] font-bold text-gray-500">
                   <MdClass className="text-blue-400" /> SEMESTER {m.semester}
                </div>
                <div className="flex items-center gap-2 text-[0.65rem] font-bold text-gray-500">
                   <MdFolder className="text-amber-400" /> {m.branch.name}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                 <span className="bento-badge bento-badge-info !py-0.5 !text-[0.6rem] uppercase">{m.type}</span>
                 <button onClick={() => window.open(`${process.env.REACT_APP_MEDIA_LINK}/${m.file}`)} className="flex-1 bg-[var(--navy)] text-white text-[0.65rem] font-bold py-2 rounded-xl shadow-lg shadow-blue-100 hover:scale-105 active:scale-95 transition-all text-center flex items-center justify-center gap-2">
                   <MdLink size={16} /> ACCESS FILE
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="bento-modal-overlay">
          <div className="bento-modal !max-w-xl">
            <div className="bento-modal-header">
              <h2 className="text-lg font-bold text-[var(--navy-dark)]">{editingMaterial ? 'Update Resource Architecture' : 'Import New Asset'}</h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-700 p-1 rounded-full"><IoMdClose size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="bento-modal-body space-y-5">
                <div><label className="bento-label">Document Title</label><input type="text" name="title" value={formData.title} onChange={handleInputChange} className="bento-input" placeholder="e.g. Unit 4: Thermodynamics Notes" required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="bento-label">Curriculum Subject</label>
                    <select name="subject" value={formData.subject} onChange={handleInputChange} className="bento-input" required>
                      <option value="">Select</option>{subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div><label className="bento-label">Academic Branch</label>
                    <select name="branch" value={formData.branch} onChange={handleInputChange} className="bento-input" required>
                      <option value="">Select</option>{branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div><label className="bento-label">Term / Sem</label>
                    <select name="semester" value={formData.semester} onChange={handleInputChange} className="bento-input" required>
                      <option value="">Select</option>{[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  </div>
                  <div><label className="bento-label">Resource Format</label>
                    <select name="type" value={formData.type} onChange={handleInputChange} className="bento-input" required>
                      <option value="notes">Lecture Notes</option><option value="assignment">Assignment File</option><option value="syllabus">Syllabus Guide</option><option value="other">Institutional Other</option>
                    </select>
                  </div>
                </div>
                <div className="pt-2">
                  <label className="bento-label text-center block mb-3">Sync Source File</label>
                  <div className="relative group overflow-hidden bg-[var(--bg-inset)] border-2 border-dashed border-gray-200 rounded-2xl p-8 transition-all hover:border-[var(--navy)]">
                    <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" required={!editingMaterial} />
                    <div className="text-center">
                      <MdCloudUpload size={40} className="mx-auto text-gray-300 mb-2 group-hover:text-[var(--navy)] transition-colors" />
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{file ? file.name : 'Select or Drop PDF/Doc'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bento-modal-footer">
                <CustomButton onClick={resetForm} variant="ghost">Discard</CustomButton>
                <CustomButton type="submit">Commit to Storage</CustomButton>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirm isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} onConfirm={handleDelete} message="De-index this academic asset permanently?" />
    </div>
  );
};

export default Material;
