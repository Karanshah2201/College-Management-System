import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { MdOutlineDelete, MdEdit, MdEmail, MdPhone, MdBadge, MdWork, MdGroups } from "react-icons/md";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import axiosWrapper from "../../utils/AxiosWrapper";
import Heading from "../../components/Heading";
import DeleteConfirm from "../../components/DeleteConfirm";
import CustomButton from "../../components/CustomButton";
import Loading from "../../components/Loading";
import NoData from "../../components/NoData";

const Faculty = () => {
  const [data, setData] = useState({
    firstName: "", lastName: "", email: "", phone: "", profile: "",
    address: "", city: "", state: "", pincode: "", country: "",
    gender: "", dob: "", designation: "", joiningDate: "", salary: "",
    status: "active", emergencyContact: { name: "", relationship: "", phone: "" },
    bloodGroup: "", branchId: "",
  });

  const [branches, setBranches] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedFacultyId, setSelectedFacultyId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const userToken = localStorage.getItem("userToken");
  const [file, setFile] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    getFacultyHandler();
    getBranchHandler();
  }, []);

  const getBranchHandler = async () => {
    try {
      const response = await axiosWrapper.get(`/branch`, { headers: { Authorization: `Bearer ${userToken}` } });
      if (response.data.success) setBranches(response.data.data);
      else toast.error(response.data.message);
    } catch (error) {
      if (error.response?.status !== 404) toast.error("Error fetching branches");
    }
  };

  const getFacultyHandler = async () => {
    try {
      setDataLoading(true);
      const response = await axiosWrapper.get(`/faculty`, { headers: { Authorization: `Bearer ${userToken}` } });
      if (response.data.success) setFaculty(response.data.data);
      else toast.error(response.data.message);
    } catch (error) {
      if (error.response?.status === 404) setFaculty([]);
      else toast.error("Error fetching faculty");
    } finally { setDataLoading(false); }
  };

  const addFacultyHandler = async (e) => {
    e.preventDefault();
    try {
      toast.loading(isEditing ? "Updating Faculty" : "Adding Faculty");
      const headers = { "Content-Type": "multipart/form-data", Authorization: `Bearer ${userToken}` };
      const formDataToSend = new FormData();
      for (const key in data) {
        if (key === "emergencyContact") {
          for (const subKey in data.emergencyContact) {
            formDataToSend.append(`emergencyContact[${subKey}]`, data.emergencyContact[subKey]);
          }
        } else formDataToSend.append(key, data[key]);
      }
      if (file) formDataToSend.append("file", file);
      let response;
      if (isEditing) response = await axiosWrapper.patch(`/faculty/${selectedFacultyId}`, formDataToSend, { headers });
      else response = await axiosWrapper.post(`/faculty/register`, formDataToSend, { headers });
      toast.dismiss();
      if (response.data.success) {
        toast.success(isEditing ? response.data.message : "Faculty created! Default pass: faculty123");
        resetForm(); getFacultyHandler();
      } else toast.error(response.data.message);
    } catch (error) { toast.dismiss(); toast.error(error.response?.data?.message || "Error"); }
  };

  const deleteFacultyHandler = (id) => { setIsDeleteConfirmOpen(true); setSelectedFacultyId(id); };
  const editFacultyHandler = (faculty) => {
    setData({
      firstName: faculty.firstName || "", lastName: faculty.lastName || "", email: faculty.email || "",
      phone: faculty.phone || "", profile: faculty.profile || "", address: faculty.address || "",
      city: faculty.city || "", state: faculty.state || "", pincode: faculty.pincode || "",
      country: faculty.country || "", gender: faculty.gender || "", dob: faculty.dob?.split("T")[0] || "",
      designation: faculty.designation || "", joiningDate: faculty.joiningDate?.split("T")[0] || "",
      salary: faculty.salary || "", status: faculty.status || "active",
      emergencyContact: {
        name: faculty.emergencyContact?.name || "", relationship: faculty.emergencyContact?.relationship || "",
        phone: faculty.emergencyContact?.phone || "",
      },
      bloodGroup: faculty.bloodGroup || "", branchId: faculty.branchId || "",
    });
    setSelectedFacultyId(faculty._id); setIsEditing(true); setShowAddForm(true);
  };

  const confirmDelete = async () => {
    try {
      toast.loading("Deleting Faculty");
      const response = await axiosWrapper.delete(`/faculty/${selectedFacultyId}`, { headers: { Authorization: `Bearer ${userToken}` } });
      toast.dismiss();
      if (response.data.success) { toast.success("Faculty deleted"); setIsDeleteConfirmOpen(false); getFacultyHandler(); }
      else toast.error(response.data.message);
    } catch (error) { toast.dismiss(); toast.error(error.response?.data?.message || "Error"); }
  };

  const resetForm = () => {
    setData({
      firstName: "", lastName: "", email: "", phone: "", profile: "", address: "", city: "", state: "",
      pincode: "", country: "", gender: "", dob: "", designation: "", joiningDate: "", salary: "",
      status: "active", emergencyContact: { name: "", relationship: "", phone: "" }, bloodGroup: "", branchId: "",
    });
    setShowAddForm(false); setIsEditing(false); setSelectedFacultyId(null); setFile(null);
  };

  const handleInputChange = (field, value) => setData({ ...data, [field]: value });
  const handleEmergencyContactChange = (field, value) => setData({ ...data, emergencyContact: { ...data.emergencyContact, [field]: value } });

  return (
    <div className="w-full mx-auto mt-6 flex justify-center items-start flex-col mb-10 anim-fade-up">
      <Heading title="Faculty Management" subtitle="Manage university staff and academic instructors">
        <CustomButton onClick={() => setShowAddForm(true)}>
          <IoMdAdd className="text-lg" /> New Faculty
        </CustomButton>
      </Heading>

      {dataLoading ? <Loading /> : (
        <div className="w-full">
          {faculty.length > 0 ? (
            <div className="bento-grid-2 anim-stagger">
              {faculty.map((item, index) => (
                <div key={index} className="bento-card hover-lift p-5 anim-scale-in" style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="flex items-start gap-4">
                    <img
                      src={`${process.env.REACT_APP_MEDIA_LINK}/${item.profile}`}
                      alt=""
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white shadow-md"
                      onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${item.firstName}+${item.lastName}&background=f3f4f6&color=142c5b&bold=true`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-[var(--navy-dark)] text-base truncate">{item.firstName} {item.lastName}</h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="bento-badge-info bento-badge !px-2 !py-0.5 !text-[0.6rem]">{item.designation}</span>
                            <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest">{item.employeeId}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => editFacultyHandler(item)} className="p-1.5 rounded-lg text-gray-400 hover:text-[var(--navy)] hover:bg-[var(--bg-inset)] transition-all"><MdEdit size={16} /></button>
                          <button onClick={() => deleteFacultyHandler(item._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"><MdOutlineDelete size={16} /></button>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <MdEmail size={13} className="text-amber-400" />
                          <span className="truncate">{item.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <MdPhone size={13} className="text-blue-400" />
                          <span>{item.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <MdWork size={13} className="text-emerald-400" />
                          <span>Staff ID: {item.employeeId}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <MdGroups size={13} className="text-pink-400" />
                          <span className="truncate">{branches.find(b => b._id === item.branchId)?.name || 'Department'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <NoData title="No faculty members found in the registry" />
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddForm && (
        <div className="bento-modal-overlay">
          <div className="bento-modal !max-w-4xl">
            <div className="bento-modal-header">
              <h2 className="text-lg font-bold text-[var(--navy-dark)]">{isEditing ? "Edit Faculty Details" : "Register Faculty"}</h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-700 transition-colors"><IoMdClose size={24} /></button>
            </div>
            <form onSubmit={addFacultyHandler}>
              <div className="bento-modal-body bg-gray-50/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-3 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <MdBadge size={18} className="text-[var(--navy)]" />
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400">Professional Identity</span>
                  </div>
                  <div><label className="bento-label">First Name</label><input type="text" value={data.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} className="bento-input" required /></div>
                  <div><label className="bento-label">Last Name</label><input type="text" value={data.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} className="bento-input" required /></div>
                  <div><label className="bento-label">Designation</label><input type="text" value={data.designation} onChange={(e) => handleInputChange("designation", e.target.value)} className="bento-input" required /></div>
                  
                  <div><label className="bento-label">Email</label><input type="email" value={data.email} onChange={(e) => handleInputChange("email", e.target.value)} className="bento-input" required /></div>
                  <div><label className="bento-label">Phone</label><input type="tel" value={data.phone} onChange={(e) => handleInputChange("phone", e.target.value)} className="bento-input" required /></div>
                  <div><label className="bento-label">Branch</label>
                    <select value={data.branchId} onChange={(e) => handleInputChange("branchId", e.target.value)} className="bento-input" required>
                      <option value="">Select Department</option>{branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                  </div>

                  <div className="md:col-span-3 mt-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <MdWork size={18} className="text-[var(--navy)]" />
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400">employment details</span>
                  </div>
                  <div><label className="bento-label">Joining Date</label><input type="date" value={data.joiningDate} onChange={(e) => handleInputChange("joiningDate", e.target.value)} className="bento-input" required /></div>
                  <div><label className="bento-label">Monthly Salary</label><input type="number" value={data.salary} onChange={(e) => handleInputChange("salary", e.target.value)} className="bento-input" required /></div>
                  <div><label className="bento-label">Gender</label>
                    <select value={data.gender} onChange={(e) => handleInputChange("gender", e.target.value)} className="bento-input" required>
                      <option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div><label className="bento-label">Date of Birth</label><input type="date" value={data.dob} onChange={(e) => handleInputChange("dob", e.target.value)} className="bento-input" required /></div>
                  <div><label className="bento-label">Blood Group</label>
                    <select value={data.bloodGroup} onChange={(e) => handleInputChange("bloodGroup", e.target.value)} className="bento-input">
                      <option value="">Select</option>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="bento-label">Profile Photo</label>
                    <input type="file" onChange={(e) => setFile(e.target.files[0])} className="bento-input" accept="image/*" />
                  </div>

                  <div className="md:col-span-3 mt-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <MdEmail size={18} className="text-[var(--navy)]" />
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400">Communication & Address</span>
                  </div>
                  <div className="md:col-span-2"><label className="bento-label">Address</label><input type="text" value={data.address} onChange={(e) => handleInputChange("address", e.target.value)} className="bento-input" required /></div>
                  <div><label className="bento-label">City</label><input type="text" value={data.city} onChange={(e) => handleInputChange("city", e.target.value)} className="bento-input" required /></div>
                  <div><label className="bento-label">State</label><input type="text" value={data.state} onChange={(e) => handleInputChange("state", e.target.value)} className="bento-input" required /></div>
                  <div><label className="bento-label">Pincode</label><input type="text" value={data.pincode} onChange={(e) => handleInputChange("pincode", e.target.value)} className="bento-input" required /></div>
                  <div><label className="bento-label">Country</label><input type="text" value={data.country} onChange={(e) => handleInputChange("country", e.target.value)} className="bento-input" required /></div>
                </div>
              </div>
              <div className="bento-modal-footer">
                <p className="text-[0.6rem] text-gray-400 italic mr-auto">Default pass: faculty123</p>
                <CustomButton onClick={resetForm} variant="ghost">Cancel</CustomButton>
                <CustomButton type="submit">Save Faculty</CustomButton>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirm isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} onConfirm={confirmDelete} message="Delete faculty member and revoke all access?" />
    </div>
  );
};

export default Faculty;
