import React, { useEffect, useState } from "react";
import { FiUpload } from "react-icons/fi";
import { MdOutlineDelete, MdEdit, MdLink, MdCalendarMonth, MdSchool, MdClass, MdCloudUpload } from "react-icons/md";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import Heading from "../../components/Heading";
import toast from "react-hot-toast";
import axiosWrapper from "../../utils/AxiosWrapper";
import DeleteConfirm from "../../components/DeleteConfirm";
import CustomButton from "../../components/CustomButton";

const AddTimetableModal = ({ isOpen, onClose, onSubmit, initialData = null, branches }) => {
  const [formData, setFormData] = useState({ branch: initialData?.branch?._id || "", semester: initialData?.semester || "", file: null, previewUrl: initialData?.link ? `${process.env.REACT_APP_MEDIA_LINK}/${initialData.link}` : "" });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, file, previewUrl: URL.createObjectURL(file) });
  };

  if (!isOpen) return null;

  return (
    <div className="bento-modal-overlay">
      <div className="bento-modal !max-w-md">
        <div className="bento-modal-header">
          <h2 className="text-lg font-bold text-[var(--navy-dark)]">{initialData ? "Update Schedule Blueprint" : "Provision New Schedule"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors"><IoMdClose size={24} /></button>
        </div>
        <div className="bento-modal-body space-y-5">
           <div><label className="bento-label">Departmental Branch</label>
             <select value={formData.branch} onChange={(e) => setFormData({ ...formData, branch: e.target.value })} className="bento-input">
               <option value="">Select Branch</option>{branches?.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
             </select>
           </div>
           <div><label className="bento-label">Academic Semester</label>
             <select value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })} className="bento-input">
               <option value="">Select Semester</option>{[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => <option key={sem} value={sem}>Term {sem}</option>)}
             </select>
           </div>
           <div className="pt-2">
             <label className="bento-label text-center block mb-2">Schedule Artifact (Image)</label>
             <div className="relative group overflow-hidden bg-[var(--bg-inset)] border-2 border-dashed border-gray-200 rounded-2xl p-6 transition-all hover:border-[var(--navy)]">
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                <div className="text-center">
                  <MdCloudUpload size={32} className="mx-auto text-gray-300 mb-2 group-hover:text-[var(--navy)] transition-colors" />
                  <p className="text-[0.6rem] font-bold text-gray-500 uppercase tracking-widest">{formData.file ? formData.file.name : 'Select JPG/PNG'}</p>
                </div>
             </div>
           </div>
           {formData.previewUrl && (
             <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm mt-4">
                <img src={formData.previewUrl} alt="Preview" className="w-full h-32 object-cover" />
             </div>
           )}
        </div>
        <div className="bento-modal-footer">
          <CustomButton variant="ghost" onClick={onClose}>Discard</CustomButton>
          <CustomButton onClick={() => onSubmit(formData)}>Commit Schedule</CustomButton>
        </div>
      </div>
    </div>
  );
};

const Timetable = () => {
  const [branch, setBranch] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedTimetableId, setSelectedTimetableId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState(null);
  const userToken = localStorage.getItem("userToken");

  useEffect(() => { getBranchHandler(); getTimetablesHandler(); }, []);

  const getBranchHandler = async () => {
    try {
      const response = await axiosWrapper.get(`/branch`, { headers: { Authorization: `Bearer ${userToken}` } });
      if (response.data.success) setBranch(response.data.data);
    } catch { /* silent */ }
  };

  const getTimetablesHandler = async () => {
    try {
      const response = await axiosWrapper.get(`/timetable`, { headers: { Authorization: `Bearer ${userToken}` } });
      if (response.data.success) setTimetables(response.data.data);
    } catch { setTimetables([]); }
  };

  const handleSubmitTimetable = async (formData) => {
    toast.loading(editingTimetable ? "Synchronizing Blueprint..." : "Archiving Schedule...");
    try {
      const submitData = new FormData();
      submitData.append("branch", formData.branch); submitData.append("semester", formData.semester);
      if (formData.file) submitData.append("file", formData.file);
      let response;
      if (editingTimetable) response = await axiosWrapper.put(`/timetable/${editingTimetable._id}`, submitData, { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${userToken}` } });
      else response = await axiosWrapper.post("/timetable", submitData, { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${userToken}` } });
      toast.dismiss();
      if (response.data.success) { toast.success("Schedule localized"); getTimetablesHandler(); setShowAddModal(false); setEditingTimetable(null); }
      else toast.error(response.data.message);
    } catch { toast.dismiss(); toast.error("Sync failure"); }
  };

  const deleteTimetableHandler = (id) => { setIsDeleteConfirmOpen(true); setSelectedTimetableId(id); };

  const confirmDelete = async () => {
    toast.loading("De-indexing schedule...");
    try {
      const response = await axiosWrapper.delete(`/timetable/${selectedTimetableId}`, { headers: { Authorization: `Bearer ${userToken}` } });
      toast.dismiss();
      if (response.data.success) { toast.success("Record purged"); setIsDeleteConfirmOpen(false); getTimetablesHandler(); }
    } catch { toast.dismiss(); toast.error("Purge failure"); }
  };

  return (
    <div className="w-full space-y-8 anim-fade-up">
      <Heading title="Temporal Planning" subtitle="Orchestrate academic sessions and room allocations">
        <CustomButton onClick={() => setShowAddModal(true)}><IoMdAdd className="text-lg" /> New Plot</CustomButton>
      </Heading>

      {timetables.length === 0 ? (
        <div className="bento-card p-20 text-center flex flex-col items-center">
           <MdCalendarMonth size={64} className="text-gray-100 mb-4" />
           <p className="text-gray-400 font-medium italic">No blueprints formulated yet</p>
        </div>
      ) : (
        <div className="bento-grid-3 anim-stagger">
          {timetables.map((item, index) => (
            <div key={index} className="bento-card hover-lift p-5 anim-scale-in group" style={{ animationDelay: `${index * 0.05}s` }}>
               <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[var(--navy)] flex items-center justify-center shadow-inner">
                     <MdCalendarMonth size={24} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                    <button onClick={() => { setEditingTimetable(item); setShowAddModal(true); }} className="p-2 rounded-xl text-gray-400 hover:text-[var(--navy)] hover:bg-[var(--bg-inset)]"><MdEdit size={14} /></button>
                    <button onClick={() => deleteTimetableHandler(item._id)} className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50"><MdOutlineDelete size={14} /></button>
                  </div>
               </div>
               
               <h3 className="font-bold text-[var(--navy-dark)] text-sm mb-1 truncate uppercase tracking-tight">{item.branch.name}</h3>
               <div className="flex items-center gap-2 mb-6">
                 <span className="bento-badge bento-badge-info !py-0.5 !text-[0.6rem]">SEMESTER {item.semester}</span>
                 <span className="text-[0.6rem] font-bold text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
               </div>

               <div className="space-y-3 mb-6 border-t border-gray-50 pt-4">
                  <div className="flex items-center gap-2 text-[0.65rem] font-bold text-gray-500">
                    <MdSchool className="text-blue-400" /> UNIT: {item.branch.branchId}
                  </div>
                  <div className="flex items-center gap-2 text-[0.65rem] font-bold text-gray-500">
                    <MdClass className="text-amber-400" /> STATUS: Synchronized
                  </div>
               </div>

               <button onClick={() => window.open(`${process.env.REACT_APP_MEDIA_LINK}/${item.link}`)} className="w-full bg-[var(--navy)] text-white text-[0.65rem] font-bold py-2.5 rounded-xl shadow-lg shadow-blue-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                 <MdLink size={16} /> DOWNLOAD BLUEPRINT
               </button>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddTimetableModal
          isOpen={showAddModal}
          onClose={() => { setShowAddModal(false); setEditingTimetable(null); }}
          onSubmit={handleSubmitTimetable}
          initialData={editingTimetable}
          branches={branch}
        />
      )}

      <DeleteConfirm isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} onConfirm={confirmDelete} message="Revoke this temporal blueprint permanently?" />
    </div>
  );
};

export default Timetable;
