import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { MdOutlineDelete, MdEdit, MdAccountTree, MdAdd, MdLayers, MdFingerprint } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import axiosWrapper from "../../utils/AxiosWrapper";
import Heading from "../../components/Heading";
import DeleteConfirm from "../../components/DeleteConfirm";
import CustomButton from "../../components/CustomButton";
import Loading from "../../components/Loading";
import NoData from "../../components/NoData";

const Branch = () => {
  const [data, setData] = useState({ name: "", branchId: "" });
  const [branch, setBranch] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => { getBranchHandler(); }, []);

  const getBranchHandler = async () => {
    setDataLoading(true);
    try {
      const response = await axiosWrapper.get(`/branch`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
      });
      if (response.data.success) setBranch(response.data.data);
    } catch { setBranch([]); }
    finally { setDataLoading(false); }
  };

  const addBranchHandler = async () => {
    if (!data.name || !data.branchId) { toast.error("Essential data required"); return; }
    try {
      toast.loading(isEditing ? "Reconfiguring sector..." : "Establishing sector...");
      const res = await axiosWrapper[isEditing ? 'patch' : 'post'](`/branch${isEditing ? `/${selectedBranchId}` : ''}`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
      });
      toast.dismiss();
      if (res.data.success) {
        toast.success("Sector archived");
        setData({ name: "", branchId: "" }); setShowAddForm(false); setIsEditing(false); getBranchHandler();
      }
    } catch { toast.dismiss(); toast.error("Synchronization failure"); }
  };

  const editBranchHandler = (b) => { setData({ name: b.name, branchId: b.branchId }); setSelectedBranchId(b._id); setIsEditing(true); setShowAddForm(true); };

  return (
    <div className="w-full space-y-8 anim-fade-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <Heading title="Academic Sectors" subtitle="Manage departmental hierarchies and operational branches" />
        <CustomButton onClick={() => { setShowAddForm(true); setData({ name: "", branchId: "" }); setIsEditing(false); }} className="!rounded-2xl shadow-xl shadow-blue-100 italic">
          <MdAdd className="mr-2" size={20} /> Establish Sector
        </CustomButton>
      </div>

      {dataLoading ? <Loading /> : (
        <div className="w-full">
          {branch?.length === 0 ? (
            <NoData title="No departmental sectors localized in the registry" />
          ) : (
            <div className="bento-grid-3 anim-stagger">
              {branch.map((item, index) => (
                <div key={item._id} className="bento-card hover-lift p-6 anim-scale-in group" style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[var(--bg-inset)] text-[var(--navy)] border border-white shadow-inner group-hover:scale-110 transition-transform">
                      <MdAccountTree size={28} />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => editBranchHandler(item)} className="p-2 rounded-lg text-gray-400 hover:text-[var(--navy)] hover:bg-white transition-all shadow-sm"><MdEdit size={16} /></button>
                      <button onClick={() => { setSelectedBranchId(item._id); setIsDeleteConfirmOpen(true); }} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"><MdOutlineDelete size={16} /></button>
                    </div>
                  </div>
                  <h3 className="font-black text-[var(--navy-dark)] text-base mb-1 uppercase tracking-tight">{item.name}</h3>
                  <div className="flex items-center gap-1.5 text-[0.6rem] font-black text-blue-500 uppercase tracking-widest mb-6">
                    <MdFingerprint size={12} className="text-blue-300" />
                    ID: {item.branchId}
                  </div>
                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                     <span className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-tighter">Established</span>
                     <span className="text-[0.6rem] font-black text-[var(--navy)] uppercase bg-[var(--bg-inset)] px-3 py-1 rounded-full border border-white">
                        {new Date(item.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                     </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sector Configuration Modal */}
      {showAddForm && (
        <div className="bento-modal-overlay">
          <div className="bento-modal !max-w-md">
            <div className="bento-modal-header border-b-0 pb-2">
              <h2 className="text-lg font-black text-[var(--navy-dark)] tracking-tight uppercase flex items-center gap-3">
                <MdLayers className="text-[var(--navy)]" />
                {isEditing ? "Reconfigure Sector" : "Initialize Sector"}
              </h2>
              <button onClick={() => setShowAddForm(false)} className="text-gray-300 hover:text-gray-500 transition-colors"><IoMdClose size={24} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="bento-label">Sector Identification</label>
                <input type="text" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} className="bento-input" placeholder="e.g. Artificial Intelligence" required />
              </div>
              <div>
                <label className="bento-label">Institutional Tag</label>
                <input type="text" value={data.branchId} onChange={(e) => setData({ ...data, branchId: e.target.value })} className="bento-input" placeholder="e.g. AI-DEPT" required />
              </div>
              <div className="pt-4 flex gap-3">
                 <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 bento-card-flat py-3.5 font-black text-[0.6rem] uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-colors rounded-2xl">ABORT</button>
                 <CustomButton onClick={addBranchHandler} className="flex-[2] !py-3.5 shadow-xl shadow-blue-100">{isEditing ? "OVERWRITE" : "COMMENCE"}</CustomButton>
              </div>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirm isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} onConfirm={async () => {
         try {
            toast.loading("Expunging sector...");
            const res = await axiosWrapper.delete(`/branch/${selectedBranchId}`, { headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` } });
            toast.dismiss();
            if (res.data.success) { toast.success("Sector expunged"); setIsDeleteConfirmOpen(false); getBranchHandler(); }
         } catch { toast.dismiss(); toast.error("Operation failed"); }
      }} message="Confirm data expunction of this academic sector protocol." />
    </div>
  );
};

export default Branch;
