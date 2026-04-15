import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { MdOutlineDelete, MdEdit, MdAdminPanelSettings, MdEmail, MdPhone, MdBadge, MdWork, MdAdd, MdLayers, MdCloudUpload, MdVerifiedUser, MdSecurity } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import axiosWrapper from "../../utils/AxiosWrapper";
import Heading from "../../components/Heading";
import DeleteConfirm from "../../components/DeleteConfirm";
import CustomButton from "../../components/CustomButton";
import Loading from "../../components/Loading";
import NoData from "../../components/NoData";

const Admin = () => {
  const [data, setData] = useState({
    firstName: "", lastName: "", email: "", phone: "", profile: "",
    address: "", city: "", state: "", pincode: "", country: "",
    gender: "", dob: "", designation: "", joiningDate: "", salary: "",
    status: "active", emergencyContact: { name: "", relationship: "", phone: "" },
    bloodGroup: "",
  });
  const [admins, setAdmins] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const userToken = localStorage.getItem("userToken");
  const [file, setFile] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => { getAdminsHandler(); }, []);

  const getAdminsHandler = async () => {
    setDataLoading(true);
    try {
      const response = await axiosWrapper.get(`/admin`, { headers: { Authorization: `Bearer ${userToken}` } });
      if (response.data.success) setAdmins(response.data.data);
    } catch { setAdmins([]); }
    finally { setDataLoading(false); }
  };

  const addAdminHandler = async (e) => {
    e.preventDefault();
    try {
      toast.loading(isEditing ? "Reconfiguring operative..." : "Provisioning operative...");
      const fd = new FormData();
      Object.keys(data).forEach(k => {
        if (k === "emergencyContact") {
          Object.keys(data.emergencyContact).forEach(sk => fd.append(`emergencyContact[${sk}]`, data.emergencyContact[sk]));
        } else fd.append(k, data[k]);
      });
      if (file) fd.append("file", file);
      const res = await axiosWrapper[isEditing ? 'patch' : 'post'](`/admin/${isEditing ? selectedAdminId : 'register'}`, fd, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${userToken}` }
      });
      toast.dismiss();
      if (res.data.success) { 
        toast.success(isEditing ? "Operative reconfigured" : "Operative provisioned");
        resetForm(); getAdminsHandler();
      }
    } catch { toast.dismiss(); toast.error("Synchronization failure"); }
  };

  const resetForm = () => {
    setData({
      firstName: "", lastName: "", email: "", phone: "", profile: "", address: "", city: "", state: "",
      pincode: "", country: "", gender: "", dob: "", designation: "", joiningDate: "", salary: "",
      status: "active", emergencyContact: { name: "", relationship: "", phone: "" }, bloodGroup: "",
    });
    setShowAddForm(false); setIsEditing(false); setSelectedAdminId(null); setFile(null);
  };

  return (
    <div className="w-full space-y-8 anim-fade-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <Heading title="Administrative Core" subtitle="Manage high-level system operatives and security clearance protocols" />
        <CustomButton onClick={() => setShowAddForm(true)} className="!rounded-2xl shadow-xl shadow-blue-100 italic">
          <MdAdd className="mr-2" size={20} /> Provision Operative
        </CustomButton>
      </div>

      {dataLoading ? <Loading /> : (
        <div className="w-full">
          {admins.length === 0 ? (
            <NoData title="No other operatives found in the core directive" />
          ) : (
            <div className="bento-grid-2 anim-stagger">
              {admins.map((item, index) => (
                <div key={item._id} className="bento-card-glass p-8 anim-scale-in group" style={{ animationDelay: `${index * 0.05}s` }}>
                   <div className="flex items-start gap-8">
                      <div className="relative">
                         <div className="absolute inset-0 bg-[var(--navy)] rounded-3xl blur-xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                         <img
                           src={`${process.env.REACT_APP_MEDIA_LINK}/${item.profile}`}
                           alt=""
                           className="relative w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-2xl group-hover:scale-105 transition-transform"
                           onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${item.firstName}+${item.lastName}&background=0b1f3a&color=ffffff&bold=true`}
                         />
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-start mb-4">
                            <div>
                               <h3 className="text-xl font-black text-[var(--navy-dark)] uppercase tracking-tighter italic" style={{ fontFamily: "'Playfair Display', serif" }}>{item.firstName} {item.lastName}</h3>
                               <div className="flex items-center gap-3 mt-1">
                                  <span className="bento-badge !bg-emerald-500/10 !text-emerald-500 !border-emerald-500/20 font-black italic tracking-widest text-[0.55rem]">
                                     {item.designation.toUpperCase()}
                                  </span>
                                  <span className="text-[0.6rem] font-black text-gray-400 uppercase tracking-widest">ID: {item.employeeId}</span>
                               </div>
                            </div>
                            <div className="flex gap-2">
                               <button onClick={() => { setData({
                                  firstName: item.firstName || "", lastName: item.lastName || "", email: item.email || "",
                                  phone: item.phone || "", profile: item.profile || "", address: item.address || "",
                                  city: item.city || "", state: item.state || "", pincode: item.pincode || "",
                                  country: item.country || "", gender: item.gender || "", dob: item.dob?.split("T")[0] || "",
                                  designation: item.designation || "", joiningDate: item.joiningDate?.split("T")[0] || "",
                                  salary: item.salary || "", status: item.status || "active",
                                  emergencyContact: {
                                    name: item.emergencyContact?.name || "", relationship: item.emergencyContact?.relationship || "",
                                    phone: item.emergencyContact?.phone || "",
                                  },
                                  bloodGroup: item.bloodGroup || "",
                                }); setSelectedAdminId(item._id); setIsEditing(true); setShowAddForm(true); }} className="w-9 h-9 flex items-center justify-center bg-white rounded-xl text-gray-400 hover:text-[var(--navy)] shadow-sm hover:shadow-md transition-all"><MdEdit size={18} /></button>
                               <button onClick={() => { setSelectedAdminId(item._id); setIsDeleteConfirmOpen(true); }} className="w-9 h-9 flex items-center justify-center bg-white rounded-xl text-gray-400 hover:text-red-500 shadow-sm hover:shadow-md transition-all"><MdOutlineDelete size={18} /></button>
                            </div>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-[var(--bg-inset)] flex items-center justify-center text-amber-500 shadow-inner"><MdEmail size={14} /></div>
                               <span className="text-[0.65rem] font-bold text-gray-500 truncate">{item.email}</span>
                            </div>
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-[var(--bg-inset)] flex items-center justify-center text-blue-500 shadow-inner"><MdPhone size={14} /></div>
                               <span className="text-[0.65rem] font-bold text-gray-500">{item.phone}</span>
                            </div>
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-[var(--bg-inset)] flex items-center justify-center text-emerald-500 shadow-inner"><MdVerifiedUser size={14} /></div>
                               <span className="text-[0.65rem] font-black text-emerald-600 uppercase tracking-widest">CLEARANCE ACTIVE</span>
                            </div>
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-[var(--bg-inset)] flex items-center justify-center text-indigo-500 shadow-inner"><MdBadge size={14} /></div>
                               <span className="text-[0.65rem] font-black text-indigo-600 uppercase tracking-widest">CORE DIRECTIVE</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Operative Provisioning Modal */}
      {showAddForm && (
        <div className="bento-modal-overlay">
          <div className="bento-modal !max-w-4xl">
            <div className="bento-modal-header border-b-0 pb-2">
              <h2 className="text-lg font-black text-[var(--navy-dark)] tracking-tight uppercase flex items-center gap-3 italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                <MdLayers className="text-[var(--navy)]" />
                {isEditing ? "Reconfigure Operative" : "Provision New Operative"}
              </h2>
              <button onClick={resetForm} className="text-gray-300 hover:text-gray-500 transition-colors"><IoMdClose size={24} /></button>
            </div>
            <form onSubmit={addAdminHandler} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div><label className="bento-label">Forename</label><input type="text" value={data.firstName} onChange={(e) => setData({...data, firstName: e.target.value})} className="bento-input" required /></div>
                <div><label className="bento-label">Surname</label><input type="text" value={data.lastName} onChange={(e) => setData({...data, lastName: e.target.value})} className="bento-input" required /></div>
                <div><label className="bento-label">Designation</label><input type="text" value={data.designation} onChange={(e) => setData({...data, designation: e.target.value})} className="bento-input" required /></div>
                
                <div><label className="bento-label">Neural Address</label><input type="email" value={data.email} onChange={(e) => setData({...data, email: e.target.value})} className="bento-input" required /></div>
                <div><label className="bento-label">Comm Link</label><input type="tel" value={data.phone} onChange={(e) => setData({...data, phone: e.target.value})} className="bento-input" required /></div>
                <div><label className="bento-label">Biological Ref</label>
                  <select value={data.gender} onChange={(e) => setData({...data, gender: e.target.value})} className="bento-input" required>
                    <option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                  </select>
                </div>
                
                <div><label className="bento-label">Origin Epoch</label><input type="date" value={data.dob} onChange={(e) => setData({...data, dob: e.target.value})} className="bento-input" required /></div>
                <div><label className="bento-label">Bio-Signature</label>
                  <select value={data.bloodGroup} onChange={(e) => setData({...data, bloodGroup: e.target.value})} className="bento-input">
                    <option value="">Select</option>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div>
                   <label className="bento-label">Visual ID Attachment</label>
                   <div className="relative group overflow-hidden bg-[var(--bg-inset)] border border-dashed border-gray-200 rounded-2xl p-4 transition-all hover:border-[var(--navy)] h-[45px] flex items-center justify-center">
                      <input type="file" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      <div className="flex items-center gap-2">
                        <MdCloudUpload className="text-gray-300 group-hover:text-[var(--navy)] transition-colors" size={18} />
                        <p className="text-[0.6rem] font-bold text-gray-400 group-hover:text-gray-600 uppercase tracking-widest truncate max-w-[120px]">{file ? file.name : 'UPLOAD AVATAR'}</p>
                      </div>
                   </div>
                </div>

                <div className="md:col-span-3 pt-6 border-t border-gray-100"><h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Operational Metrics & Navigation</h3></div>
                <div><label className="bento-label">Activation Date</label><input type="date" value={data.joiningDate} onChange={(e) => setData({...data, joiningDate: e.target.value})} className="bento-input" required /></div>
                <div><label className="bento-label">Asset Scale (Salary)</label><input type="number" value={data.salary} onChange={(e) => setData({...data, salary: e.target.value})} className="bento-input" required /></div>
                <div className="md:col-span-3"><label className="bento-label">Vector Coordinates (Address)</label><input type="text" value={data.address} onChange={(e) => setData({...data, address: e.target.value})} className="bento-input" required /></div>
                <div><label className="bento-label">Sector City</label><input type="text" value={data.city} onChange={(e) => setData({...data, city: e.target.value})} className="bento-input" required /></div>
                <div><label className="bento-label">Grid State</label><input type="text" value={data.state} onChange={(e) => setData({...data, state: e.target.value})} className="bento-input" required /></div>
                <div><label className="bento-label">Global Grid</label><input type="text" value={data.country} onChange={(e) => setData({...data, country: e.target.value})} className="bento-input" required /></div>
              </div>

              <div className="pt-8 flex gap-3">
                 <button type="button" onClick={resetForm} className="flex-1 bento-card-flat py-4 font-black text-[0.65rem] uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-colors rounded-2xl">ABORT PROVISIONING</button>
                 <CustomButton type="submit" className="flex-[2] !py-4 shadow-xl shadow-blue-100 font-black italic">
                   {isEditing ? "OVERWRITE PROTOCOLS" : "COMMENCE DEPLOYMENT"}
                 </CustomButton>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirm isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} onConfirm={async () => {
         try {
            toast.loading("Expunging operative credentials...");
            await axiosWrapper.delete(`/admin/${selectedAdminId}`, { headers: { Authorization: `Bearer ${userToken}` } });
            toast.dismiss(); toast.success("Operative expunged"); setIsDeleteConfirmOpen(false); getAdminsHandler();
         } catch { toast.dismiss(); toast.error("Operation failure"); }
      }} message="Confirm data expunction of this high-level operative and all associated clearances." />
    </div>
  );
};

export default Admin;
