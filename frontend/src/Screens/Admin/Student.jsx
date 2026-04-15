import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { MdOutlineDelete, MdEdit, MdSchool, MdPerson, MdEmail, MdPhone, MdDateRange } from "react-icons/md";
import { IoMdAdd, IoMdClose, IoMdSearch } from "react-icons/io";
import Heading from "../../components/Heading";
import DeleteConfirm from "../../components/DeleteConfirm";
import axiosWrapper from "../../utils/AxiosWrapper";
import CustomButton from "../../components/CustomButton";
import NoData from "../../components/NoData";
import Loading from "../../components/Loading";
import { CgDanger } from "react-icons/cg";

const Student = () => {
  const [searchParams, setSearchParams] = useState({
    enrollmentNo: "",
    name: "",
    semester: "",
    branch: "",
  });
  const [students, setStudents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [file, setFile] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const userToken = localStorage.getItem("userToken");

  const [formData, setFormData] = useState({
    firstName: "", middleName: "", lastName: "", phone: "", semester: "",
    branchId: "", gender: "", dob: "", address: "", city: "", state: "",
    pincode: "", country: "", profile: "", status: "active", bloodGroup: "",
    emergencyContact: { name: "", relationship: "", phone: "" },
  });

  useEffect(() => { getBranchHandler(); }, []);

  const getBranchHandler = async () => {
    try {
      const response = await axiosWrapper.get(`/branch`, { headers: { Authorization: `Bearer ${userToken}` } });
      if (response.data.success) setBranches(response.data.data);
      else toast.error(response.data.message);
    } catch (error) {
      if (error.response?.status === 404) setBranches([]);
      else toast.error(error.response?.data?.message || "Error fetching branches");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const searchStudents = async (e) => {
    e.preventDefault();
    if (!searchParams.enrollmentNo && !searchParams.name && !searchParams.semester && !searchParams.branch) {
      toast.error("Select at least one filter"); return;
    }
    setDataLoading(true); setHasSearched(true);
    try {
      const response = await axiosWrapper.post(`/student/search`, searchParams, { headers: { Authorization: `Bearer ${userToken}` } });
      if (response.data.success) setStudents(response.data.data);
      else toast.error(response.data.message);
    } catch (error) {
      setStudents([]); toast.error(error.response?.data?.message || "Error searching students");
    } finally { setDataLoading(false); }
  };

  const handleFormInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEmergencyContactChange = (field, value) => {
    setFormData((prev) => ({ ...prev, emergencyContact: { ...prev.emergencyContact, [field]: value } }));
  };

  const addStudentHandler = async (e) => {
    e.preventDefault();
    try {
      toast.loading(isEditing ? "Updating Student" : "Adding Student");
      const headers = { "Content-Type": "multipart/form-data", Authorization: `Bearer ${userToken}` };
      const formDataToSend = new FormData();
      for (const key in formData) {
        if (key === "emergencyContact") {
          for (const subKey in formData.emergencyContact) {
            formDataToSend.append(`emergencyContact[${subKey}]`, formData.emergencyContact[subKey]);
          }
        } else formDataToSend.append(key, formData[key]);
      }
      if (file) formDataToSend.append("file", file);
      let response;
      if (isEditing) response = await axiosWrapper.patch(`/student/${selectedStudentId}`, formDataToSend, { headers });
      else response = await axiosWrapper.post(`/student/register`, formDataToSend, { headers });
      toast.dismiss();
      if (response.data.success) {
        toast.success(isEditing ? response.data.message : `Student created! Default pass: student123`);
        resetForm();
        if (hasSearched) searchStudents({ preventDefault: () => {} });
      } else toast.error(response.data.message);
    } catch (error) { toast.dismiss(); toast.error(error.response?.data?.message || "Error"); }
  };

  const deleteStudentHandler = (id) => { setIsDeleteConfirmOpen(true); setSelectedStudentId(id); };
  const editStudentHandler = (student) => {
    setFormData({
      firstName: student.firstName || "", middleName: student.middleName || "", lastName: student.lastName || "",
      phone: student.phone || "", semester: student.semester || "", branchId: student.branchId?._id || "",
      gender: student.gender || "", dob: student.dob?.split("T")[0] || "", address: student.address || "",
      city: student.city || "", state: student.state || "", pincode: student.pincode || "",
      country: student.country || "", profile: student.profile || "", status: student.status || "active",
      bloodGroup: student.bloodGroup || "",
      emergencyContact: {
        name: student.emergencyContact?.name || "", relationship: student.emergencyContact?.relationship || "",
        phone: student.emergencyContact?.phone || "",
      },
    });
    setSelectedStudentId(student._id); setIsEditing(true); setShowAddForm(true);
  };

  const confirmDelete = async () => {
    try {
      toast.loading("Deleting Student");
      const response = await axiosWrapper.delete(`/student/${selectedStudentId}`, { headers: { Authorization: `Bearer ${userToken}` } });
      toast.dismiss();
      if (response.data.success) { toast.success("Student deleted"); setIsDeleteConfirmOpen(false); searchStudents({ preventDefault: () => {} }); }
      else toast.error(response.data.message);
    } catch (error) { toast.dismiss(); toast.error(error.response?.data?.message || "Error"); }
  };

  const resetForm = () => {
    setFormData({
      firstName: "", middleName: "", lastName: "", phone: "", semester: "",
      branchId: "", gender: "", dob: "", address: "", city: "", state: "",
      pincode: "", country: "", profile: "", status: "active", bloodGroup: "",
      emergencyContact: { name: "", relationship: "", phone: "" },
    });
    setShowAddForm(false); setIsEditing(false); setSelectedStudentId(null); setFile(null);
  };

  return (
    <div className="w-full mx-auto mt-6 flex justify-center items-start flex-col mb-10 anim-fade-up">
      <Heading title="Student Management" subtitle="Manage university students and their records">
        {branches.length > 0 && (
          <CustomButton onClick={() => setShowAddForm(true)}>
            <IoMdAdd className="text-lg" /> New Student
          </CustomButton>
        )}
      </Heading>

      {branches.length > 0 ? (
        <div className="w-full space-y-6">
          {/* Bento Search Card */}
          <div className="bento-card-flat p-6">
            <form onSubmit={searchStudents} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div>
                <label className="bento-label">Enrollment No.</label>
                <input type="text" name="enrollmentNo" value={searchParams.enrollmentNo} onChange={handleInputChange} className="bento-input" placeholder="000XXX00" />
              </div>
              <div>
                <label className="bento-label">Name</label>
                <input type="text" name="name" value={searchParams.name} onChange={handleInputChange} className="bento-input" placeholder="John Doe" />
              </div>
              <div>
                <label className="bento-label">Semester</label>
                <select name="semester" value={searchParams.semester} onChange={handleInputChange} className="bento-input">
                  <option value="">All Semesters</option>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
              <div>
                <label className="bento-label">Branch</label>
                <select name="branch" value={searchParams.branch} onChange={handleInputChange} className="bento-input">
                  <option value="">All Branches</option>
                  {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
              <CustomButton type="submit" disabled={dataLoading} className="w-full">
                {dataLoading ? "..." : <><IoMdSearch size={18} /> Search</>}
              </CustomButton>
            </form>
          </div>

          {!hasSearched ? (
            <div className="bento-card p-12 text-center anim-fade-up">
              <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center" style={{ background: "var(--bg-inset)" }}>
                <IoMdSearch className="text-4xl text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">Select filters above to find students</p>
            </div>
          ) : dataLoading ? (
            <Loading />
          ) : students.length === 0 ? (
            <NoData title="No students matching criteria" />
          ) : (
            <div className="bento-grid-2 anim-stagger">
              {students.map((student, idx) => (
                <div key={student._id} className="bento-card hover-lift p-5 anim-scale-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="flex items-start gap-4">
                    <img
                      src={`${process.env.REACT_APP_MEDIA_LINK}/${student.profile}`}
                      alt=""
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white shadow-md"
                      onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=f3f4f6&color=142c5b&bold=true`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-[var(--navy-dark)] text-base truncate">{student.firstName} {student.lastName}</h3>
                          <p className="text-[0.65rem] font-bold text-[var(--gold)] uppercase tracking-wider">{student.enrollmentNo}</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => editStudentHandler(student)} className="p-1.5 rounded-lg text-gray-400 hover:text-[var(--navy)] hover:bg-[var(--bg-inset)] transition-all"><MdEdit size={16} /></button>
                          <button onClick={() => deleteStudentHandler(student._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"><MdOutlineDelete size={16} /></button>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <MdSchool size={13} className="text-blue-400" />
                          <span className="truncate">{student.branchId?.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <MdDateRange size={13} className="text-emerald-400" />
                          <span>Sem {student.semester}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <MdEmail size={13} className="text-amber-400" />
                          <span className="truncate">{student.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <MdPhone size={13} className="text-pink-400" />
                          <span>{student.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bento-card p-12 text-center w-full">
          <CgDanger className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-gray-400">Please add branches before managing students</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddForm && (
        <div className="bento-modal-overlay">
          <div className="bento-modal !max-w-4xl">
            <div className="bento-modal-header">
              <h2 className="text-lg font-bold text-[var(--navy-dark)]">{isEditing ? "Edit Student Details" : "Register Student"}</h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-700 transition-colors"><IoMdClose size={24} /></button>
            </div>
            <form onSubmit={addStudentHandler}>
              <div className="bento-modal-body bg-gray-50/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-3 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <MdPerson className="text-[var(--navy)]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Identity Details</span>
                  </div>
                  <div><label className="bento-label">First Name</label><input type="text" value={formData.firstName} onChange={(e) => handleFormInputChange("firstName", e.target.value)} className="bento-input" required /></div>
                  <div><label className="bento-label">Middle Name</label><input type="text" value={formData.middleName} onChange={(e) => handleFormInputChange("middleName", e.target.value)} className="bento-input" /></div>
                  <div><label className="bento-label">Last Name</label><input type="text" value={formData.lastName} onChange={(e) => handleFormInputChange("lastName", e.target.value)} className="bento-input" required /></div>
                  
                  <div><label className="bento-label">Phone</label><input type="tel" value={formData.phone} onChange={(e) => handleFormInputChange("phone", e.target.value)} className="bento-input" required /></div>
                  <div><label className="bento-label">Gender</label>
                    <select value={formData.gender} onChange={(e) => handleFormInputChange("gender", e.target.value)} className="bento-input" required>
                      <option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                    </select>
                  </div>
                  <div><label className="bento-label">Date of Birth</label><input type="date" value={formData.dob} onChange={(e) => handleFormInputChange("dob", e.target.value)} className="bento-input" required /></div>
                  
                  <div><label className="bento-label">Semester</label>
                    <select value={formData.semester} onChange={(e) => handleFormInputChange("semester", e.target.value)} className="bento-input" required>
                      <option value="">Select</option>{[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                    </select>
                  </div>
                  <div><label className="bento-label">Branch</label>
                    <select value={formData.branchId} onChange={(e) => handleFormInputChange("branchId", e.target.value)} className="bento-input" required>
                      <option value="">Select</option>{branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div><label className="bento-label">Blood Group</label>
                    <select value={formData.bloodGroup} onChange={(e) => handleFormInputChange("bloodGroup", e.target.value)} className="bento-input">
                      <option value="">Select</option>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>

                  <div className="md:col-span-3 mt-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <MdSchool className="text-[var(--navy)]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Contact & Profile</span>
                  </div>
                  <div className="md:col-span-2"><label className="bento-label">Address</label><input type="text" value={formData.address} onChange={(e) => handleFormInputChange("address", e.target.value)} className="bento-input" required /></div>
                  <div><label className="bento-label">City</label><input type="text" value={formData.city} onChange={(e) => handleFormInputChange("city", e.target.value)} className="bento-input" required /></div>
                  <div><label className="bento-label">State</label><input type="text" value={formData.state} onChange={(e) => handleFormInputChange("state", e.target.value)} className="bento-input" required /></div>
                  <div><label className="bento-label">Pincode</label><input type="text" value={formData.pincode} onChange={(e) => handleFormInputChange("pincode", e.target.value)} className="bento-input" required /></div>
                  <div><label className="bento-label">Country</label><input type="text" value={formData.country} onChange={(e) => handleFormInputChange("country", e.target.value)} className="bento-input" required /></div>
                  <div className="md:col-span-3">
                    <label className="bento-label">Profile Photo</label>
                    <input type="file" onChange={(e) => setFile(e.target.files[0])} className="bento-input" accept="image/*" />
                  </div>

                  <div className="md:col-span-3 mt-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <CgDanger className="text-red-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Emergency Contact</span>
                  </div>
                  <div><label className="bento-label">Name</label><input type="text" value={formData.emergencyContact.name} onChange={(e) => handleEmergencyContactChange("name", e.target.value)} className="bento-input" required /></div>
                  <div><label className="bento-label">Relationship</label><input type="text" value={formData.emergencyContact.relationship} onChange={(e) => handleEmergencyContactChange("relationship", e.target.value)} className="bento-input" required /></div>
                  <div><label className="bento-label">Phone</label><input type="tel" value={formData.emergencyContact.phone} onChange={(e) => handleEmergencyContactChange("phone", e.target.value)} className="bento-input" required /></div>
                </div>
              </div>
              <div className="bento-modal-footer">
                <CustomButton onClick={resetForm} variant="ghost">Cancel</CustomButton>
                <CustomButton type="submit">Submit Details</CustomButton>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirm isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} onConfirm={confirmDelete} message="Delete student and all associated records?" />
    </div>
  );
};

export default Student;
