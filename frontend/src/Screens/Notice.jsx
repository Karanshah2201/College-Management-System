import React, { useEffect, useState } from "react";
import { IoMdLink, IoMdAdd, IoMdClose } from "react-icons/io";
import { HiOutlineCalendar } from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";
import { MdDeleteOutline, MdEditNote, MdNotifications, MdRecordVoiceOver, MdChevronRight, MdLayers } from "react-icons/md";
import toast from "react-hot-toast";
import Heading from "../components/Heading";
import axiosWrapper from "../utils/AxiosWrapper";
import CustomButton from "../components/CustomButton";
import DeleteConfirm from "../components/DeleteConfirm";
import Loading from "../components/Loading";

const Notice = () => {
  const router = useLocation();
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedNoticeId, setSelectedNoticeId] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const token = localStorage.getItem("userToken");

  const [formData, setFormData] = useState({
    title: "", description: "", type: "student", link: "",
  });

  useEffect(() => {
    if (!token) { toast.error("Session expired"); navigate("/login"); }
  }, [token, navigate]);

  const getNotices = async () => {
    try {
      setDataLoading(true);
      const response = await axiosWrapper.get("/notice", { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) setNotices(response.data.data);
    } catch (error) {
      if (error.response?.status === 404) setNotices([]);
    } finally { setDataLoading(false); }
  };

  useEffect(() => { getNotices(); }, [router.pathname]);

  const openAddModal = () => { setEditingNotice(null); setFormData({ title: "", description: "", type: "student", link: "" }); setShowAddModal(true); };
  const handleEdit = (notice) => { setEditingNotice(notice); setFormData({ title: notice.title || "", description: notice.description || "", type: notice.type || "student", link: notice.link || "" }); setShowAddModal(true); };

  const handleSubmitNotice = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) { toast.error("Essential fields missing"); return; }
    try {
      toast.loading("Promulgating broadcast...");
      const response = await axiosWrapper[editingNotice ? "put" : "post"](`/notice${editingNotice ? `/${editingNotice._id}` : ""}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      toast.dismiss();
      if (response.data.success) { toast.success("Broadcast archived"); getNotices(); setShowAddModal(false); }
    } catch { toast.dismiss(); toast.error("Sync failure"); }
  };

  const handleDelete = async () => {
    try {
      toast.loading("Expunging broadcast...");
      const response = await axiosWrapper.delete(`/notice/${selectedNoticeId}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.dismiss();
      if (response.data.success) { toast.success("Object expunged"); setIsDeleteConfirmOpen(false); getNotices(); }
    } catch { toast.dismiss(); toast.error("Operation failed"); }
  };

  const TYPE_COLORS = {
    student: { bg: "bg-blue-50/50", text: "text-blue-500", border: "border-blue-100", icon: "text-blue-400" },
    faculty: { bg: "bg-amber-50/50", text: "text-amber-500", border: "border-amber-100", icon: "text-amber-400" },
    both: { bg: "bg-emerald-50/50", text: "text-emerald-500", border: "border-emerald-100", icon: "text-emerald-400" },
  };

  const isOperator = router.pathname === "/faculty" || router.pathname === "/admin";

  return (
    <div className="w-full space-y-8 anim-fade-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <Heading title="Broadcasting Hub" subtitle="Official faculty and student circular synchronization system" />
        {isOperator && (
          <CustomButton onClick={openAddModal} className="!rounded-2xl shadow-xl shadow-blue-100"><IoMdAdd className="mr-2" size={20} /> New Dispatch</CustomButton>
        )}
      </div>

      {dataLoading ? <div className="flex justify-center py-20"><div className="animate-spin w-10 h-10 border-4 border-[var(--navy)] border-t-transparent rounded-full" /></div> : notices.length === 0 ? (
        <div className="bento-card p-20 text-center flex flex-col items-center">
          <MdNotifications size={64} className="text-gray-100 mb-4" />
          <p className="text-gray-400 font-medium italic">No active broadcasts found in the repository</p>
        </div>
      ) : (
        <div className="bento-grid-3 anim-stagger">
          {notices.map((notice, idx) => {
            const tc = TYPE_COLORS[notice.type] || TYPE_COLORS.both;
            return (
              <div key={notice._id} className="bento-card hover-lift p-6 anim-scale-in group" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="flex items-start justify-between mb-5">
                   <div className={`p-2.5 rounded-xl border ${tc.bg} ${tc.border} transition-transform group-hover:scale-110`}>
                      <MdRecordVoiceOver className={tc.icon} size={20} />
                   </div>
                   <div className="flex items-center gap-2">
                     <span className={`bento-badge !py-0.5 !text-[0.6rem] uppercase font-black ${notice.type === 'student' ? 'bento-badge-info' : notice.type === 'faculty' ? 'bento-badge-warning' : 'bento-badge-success'}`}>
                       {notice.type}
                     </span>
                     {isOperator && (
                       <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => handleEdit(notice)} className="p-1.5 rounded-lg text-gray-400 hover:text-[var(--navy)] hover:bg-[var(--bg-inset)] transition-all"><MdEditNote size={18} /></button>
                         <button onClick={() => { setSelectedNoticeId(notice._id); setIsDeleteConfirmOpen(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"><MdDeleteOutline size={18} /></button>
                       </div>
                     )}
                   </div>
                </div>

                <h3 className={`text-sm font-black text-[var(--navy-dark)] mb-3 leading-snug tracking-tight ${notice.link ? "cursor-pointer group-hover:text-[var(--navy)]" : ""}`} onClick={() => notice.link && window.open(notice.link)}>
                  {notice.title}
                  {notice.link && <IoMdLink className="inline ml-1 text-gray-400 opacity-50" />}
                </h3>
                
                <p className="text-[0.68rem] font-medium text-gray-500 line-clamp-3 mb-6 leading-relaxed group-hover:text-gray-600">
                  {notice.description}
                </p>

                <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                  <div className="flex items-center gap-2 text-[0.6rem] font-black text-gray-400 uppercase tracking-widest">
                    <HiOutlineCalendar size={14} className="text-gray-300" />
                    {new Date(notice.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                  </div>
                  {notice.link && (
                    <button onClick={() => window.open(notice.link)} className="text-[0.6rem] font-black text-[var(--navy)] flex items-center gap-1 group/link uppercase">
                      Examine Link <MdChevronRight className="group-hover/link:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dispatch Modal */}
      {showAddModal && (
        <div className="bento-modal-overlay">
          <div className="bento-modal !max-w-md">
            <div className="bento-modal-header border-b-0 pb-2">
              <h2 className="text-lg font-black text-[var(--navy-dark)] tracking-tight uppercase flex items-center gap-3">
                <MdLayers className="text-[var(--navy)]" />
                {editingNotice ? "Modify Dispatch" : "Construct Dispatch"}
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-300 hover:text-gray-500 transition-colors"><IoMdClose size={24} /></button>
            </div>
            <form onSubmit={handleSubmitNotice} className="p-6 space-y-5">
              <div><label className="bento-label">Subject Identification</label><input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="bento-input" placeholder="Core identifier..." required /></div>
              <div><label className="bento-label">Broadcast Content</label><textarea rows="5" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bento-input" placeholder="Transcribe official update..." required /></div>
              <div><label className="bento-label">External Reference (Optional)</label><input type="text" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} className="bento-input" placeholder="https://resource.cdn/..." /></div>
              <div><label className="bento-label">Target Demographic</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="bento-input">
                  <option value="student">Student Registry</option><option value="faculty">Faculty Registry</option><option value="both">Global Broadcast</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                 <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bento-card-flat py-3 font-black text-[0.65rem] uppercase tracking-widest text-gray-400 hover:text-gray-600">ABORT</button>
                 <CustomButton type="submit" className="flex-[2] !py-3 shadow-xl shadow-blue-100">{editingNotice ? "OVERWRITE" : "COMMENCE"}</CustomButton>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirm isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} onConfirm={handleDelete} message="Confirm data expunction of this broadcast." />
    </div>
  );
};

export default Notice;
