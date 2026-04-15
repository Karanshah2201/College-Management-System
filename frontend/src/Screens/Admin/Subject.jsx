import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { MdOutlineDelete, MdEdit, MdLibraryBooks, MdClass, MdPerson, MdStar } from "react-icons/md";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import Heading from "../../components/Heading";
import DeleteConfirm from "../../components/DeleteConfirm";
import axiosWrapper from "../../utils/AxiosWrapper";
import CustomButton from "../../components/CustomButton";
import Loading from "../../components/Loading";
import NoData from "../../components/NoData";
import { CgDanger } from "react-icons/cg";

const Subject = () => {
  const [data, setData] = useState({
    name: "", code: "", branch: "", semester: "", credits: "", facultyId: "",
  });
  const [subjects, setSubjects] = useState([]);
  const [branches, setBranches] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const userToken = localStorage.getItem("userToken");
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    getSubjectHandler();
    getBranchHandler();
    getFacultyHandler();
  }, []);

  const getSubjectHandler = async () => {
    try {
      setDataLoading(true);
      const response = await axiosWrapper.get(`/subject`, { headers: { Authorization: `Bearer ${userToken}` } });
      if (response.data.success) setSubjects(response.data.data);
      else toast.error(response.data.message);
    } catch (error) {
      if (error.response?.status === 404) setSubjects([]);
      else toast.error("Error fetching subjects");
    } finally { setDataLoading(false); }
  };

  const getBranchHandler = async () => {
    try {
      const response = await axiosWrapper.get(`/branch`, { headers: { Authorization: `Bearer ${userToken}` } });
      if (response.data.success) setBranches(response.data.data);
    } catch { /* silent */ }
  };

  const getFacultyHandler = async () => {
    try {
      const response = await axiosWrapper.get(`/faculty/`, { headers: { Authorization: `Bearer ${userToken}` } });
      if (response.data.success) setFaculties(response.data.data);
    } catch { /* silent */ }
  };

  const addSubjectHandler = async (e) => {
    if (e) e.preventDefault();
    if (!data.name || !data.code || !data.branch || !data.semester || !data.credits) {
      toast.dismiss(); toast.error("Please fill all required fields"); return;
    }
    try {
      toast.loading(isEditing ? "Updating Subject" : "Adding Subject");
      const headers = { "Content-Type": "application/json", Authorization: `Bearer ${userToken}` };
      const response = isEditing 
        ? await axiosWrapper.patch(`/subject/${selectedSubjectId}`, data, { headers })
        : await axiosWrapper.post(`/subject`, data, { headers });
      toast.dismiss();
      if (response.data.success) {
        toast.success(response.data.message); resetForm(); getSubjectHandler();
      } else toast.error(response.data.message);
    } catch (error) { toast.dismiss(); toast.error(error.response.data.message); }
  };

  const resetForm = () => {
    setData({ name: "", code: "", branch: "", semester: "", credits: "", facultyId: "" });
    setShowModal(false); setIsEditing(false); setSelectedSubjectId(null);
  };

  const deleteSubjectHandler = (id) => { setIsDeleteConfirmOpen(true); setSelectedSubjectId(id); };
  const editSubjectHandler = (sub) => {
    setData({ name: sub.name, code: sub.code, branch: sub.branch?._id, semester: sub.semester, credits: sub.credits, facultyId: sub.facultyId?._id || "" });
    setSelectedSubjectId(sub._id); setIsEditing(true); setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      toast.loading("Deleting Subject");
      const response = await axiosWrapper.delete(`/subject/${selectedSubjectId}`, { headers: { Authorization: `Bearer ${userToken}` } });
      toast.dismiss();
      if (response.data.success) { toast.success("Subject deleted"); setIsDeleteConfirmOpen(false); getSubjectHandler(); }
      else toast.error(response.data.message);
    } catch (error) { toast.dismiss(); toast.error(error.response.data.message); }
  };

  return (
    <div className="w-full mx-auto mt-6 flex justify-center items-start flex-col mb-10 anim-fade-up">
      <Heading title="Subject Catalog" subtitle="Manage academic curriculum and credit units">
        {branches.length > 0 && (
          <CustomButton onClick={() => setShowModal(true)}>
            <IoMdAdd className="text-lg" /> New Subject
          </CustomButton>
        )}
      </Heading>

      {dataLoading ? <Loading /> : branches.length === 0 ? (
        <div className="bento-card p-12 text-center w-full">
          <CgDanger className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-gray-400">Please add branches before creating subjects</p>
        </div>
      ) : (
        <div className="w-full">
          {subjects.length > 0 ? (
            <div className="bento-grid-3 anim-stagger">
              {subjects.map((sub, idx) => (
                <div key={sub._id} className="bento-card hover-lift p-5 anim-scale-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(20,44,91,0.07)" }}>
                      <MdLibraryBooks className="text-[var(--navy)] text-lg" />
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => editSubjectHandler(sub)} className="p-2 rounded-lg text-gray-400 hover:text-[var(--navy)] hover:bg-[var(--bg-inset)] transition-all"><MdEdit size={16} /></button>
                      <button onClick={() => deleteSubjectHandler(sub._id)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"><MdOutlineDelete size={16} /></button>
                    </div>
                  </div>
                  <h3 className="font-bold text-[var(--navy-dark)] text-base mb-1 truncate">{sub.name}</h3>
                  <p className="text-[0.65rem] font-bold text-[var(--gold)] uppercase tracking-wider mb-4">{sub.code}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MdClass size={13} className="text-blue-400" />
                      <span>Sem {sub.semester} • {sub.branch?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MdPerson size={13} className="text-amber-400" />
                      <span>{sub.facultyId ? `${sub.facultyId.firstName} ${sub.facultyId.lastName}` : "No Faculty Assigned"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <span className="bento-badge bento-badge-success flex items-center gap-1">
                      <MdStar size={10} /> {sub.credits} Credits
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <NoData title="Curriculum is empty. Add your first subject!" />
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="bento-modal-overlay">
          <div className="bento-modal">
            <div className="bento-modal-header">
              <h2 className="text-lg font-bold text-[var(--navy-dark)]">{isEditing ? "Modify Subject" : "Create New Subject"}</h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-700 transition-colors"><IoMdClose size={24} /></button>
            </div>
            <form onSubmit={addSubjectHandler}>
              <div className="bento-modal-body space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="md:col-span-2">
                    <label className="bento-label">Subject Title</label>
                    <input type="text" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} className="bento-input" placeholder="e.g. Advanced Mathematics" required />
                  </div>
                  <div>
                    <label className="bento-label">Subject Code</label>
                    <input type="text" value={data.code} onChange={(e) => setData({ ...data, code: e.target.value })} className="bento-input" placeholder="MATH-102" required />
                  </div>
                  <div>
                    <label className="bento-label">Credit Units</label>
                    <input type="number" value={data.credits} onChange={(e) => setData({ ...data, credits: e.target.value })} className="bento-input" placeholder="4" required />
                  </div>
                  <div>
                    <label className="bento-label">Academic Branch</label>
                    <select value={data.branch} onChange={(e) => setData({ ...data, branch: e.target.value })} className="bento-input" required>
                      <option value="">Select Branch</option>
                      {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="bento-label">Target Semester</label>
                    <select value={data.semester} onChange={(e) => setData({ ...data, semester: e.target.value })} className="bento-input" required>
                      <option value="">Select Sem</option>
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="bento-label">Assign Faculty (Optional)</label>
                    <select value={data.facultyId} onChange={(e) => setData({ ...data, facultyId: e.target.value })} className="bento-input">
                      <option value="">Unassigned</option>
                      {faculties.map(f => <option key={f._id} value={f._id}>{f.firstName} {f.lastName}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="bento-modal-footer">
                <CustomButton onClick={resetForm} variant="ghost">Discard</CustomButton>
                <CustomButton type="submit">Complete Operation</CustomButton>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirm isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} onConfirm={confirmDelete} message="Delete subject? This may affect student transcripts." />
    </div>
  );
};

export default Subject;
