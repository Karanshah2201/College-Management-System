import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Heading from "../../components/Heading";
import axiosWrapper from "../../utils/AxiosWrapper";
import CustomButton from "../../components/CustomButton";
import NoData from "../../components/NoData";
import { MdSearch, MdSchool, MdClass, MdFingerprint, MdPerson, MdEmail, MdPhone, MdLocationOn, MdCake, MdCall, MdInfo } from "react-icons/md";
import { IoMdClose } from "react-icons/io";

const StudentFinder = () => {
  const [searchParams, setSearchParams] = useState({ enrollmentNo: "", name: "", semester: "", branch: "" });
  const [students, setStudents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const userToken = localStorage.getItem("userToken");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axiosWrapper.get("/branch", { headers: { Authorization: `Bearer ${userToken}` } });
        if (response.data.success) setBranches(response.data.data);
      } catch { /* silent */ }
    };
    fetchBranches();
  }, [userToken]);

  const handleInputChange = (e) => setSearchParams({ ...searchParams, [e.target.name]: e.target.value });

  const searchStudents = async (e) => {
    e.preventDefault();
    setDataLoading(true); setHasSearched(true);
    toast.loading("Querying student databases...");
    try {
      const response = await axiosWrapper.post(`/student/search`, searchParams, { headers: { Authorization: `Bearer ${userToken}` } });
      toast.dismiss();
      if (response.data.success) {
        if (response.data.data.length === 0) { toast.error("No census matches found"); setStudents([]); }
        else { toast.success(`${response.data.data.length} records localized`); setStudents(response.data.data); }
      }
    } catch { toast.dismiss(); toast.error("Database connection failure"); }
    finally { setDataLoading(false); }
  };

  const handleCardClick = (student) => { setSelectedStudent(student); setShowModal(true); };

  return (
    <div className="w-full space-y-8 anim-fade-up">
      <Heading title="Student Intelligence" subtitle="Locate and review student academic and personal profiles" />

      {/* Bento Search Card */}
      <div className="bento-card p-8">
        <form onSubmit={searchStudents}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div><label className="bento-label">Enrollment Identifier</label><input type="text" name="enrollmentNo" value={searchParams.enrollmentNo} onChange={handleInputChange} className="bento-input" placeholder="e.g. STU-2024-001" /></div>
            <div><label className="bento-label">Partial Legal Name</label><input type="text" name="name" value={searchParams.name} onChange={handleInputChange} className="bento-input" placeholder="Search by name..." /></div>
            <div><label className="bento-label">Target Semester</label>
              <select name="semester" value={searchParams.semester} onChange={handleInputChange} className="bento-input">
                <option value="">All Terms</option>{[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div><label className="bento-label">Academic Branch</label>
              <select name="branch" value={searchParams.branch} onChange={handleInputChange} className="bento-input">
                <option value="">All Disciplines</option>{branches?.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-8 flex justify-center">
             <CustomButton type="submit" disabled={dataLoading} className="!px-16 !py-3">
               <MdSearch className="mr-2" size={20} /> Execute Search
             </CustomButton>
          </div>
        </form>
      </div>

      {!hasSearched && (
        <div className="bento-card p-16 text-center flex flex-col items-center">
           <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-6">
             <MdInfo className="text-4xl text-blue-400" />
           </div>
           <p className="text-gray-400 font-medium max-w-sm">Apply primary or secondary filters above to fetch synchronized student data from the repository.</p>
        </div>
      )}

      {hasSearched && students.length === 0 && <NoData title="Search yielded zero matches in this directory" />}

      {students.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-sm font-black text-[var(--navy)] uppercase tracking-[0.2em]">Retrieved Records ({students.length})</h2>
          </div>
          <div className="bento-grid-3 anim-stagger">
            {students.map((s, idx) => (
              <div key={s._id} onClick={() => handleCardClick(s)} className="bento-card hover-lift p-5 anim-scale-in cursor-pointer group" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="flex items-center gap-4">
                   <img src={`${process.env.REACT_APP_MEDIA_LINK}/${s.profile}`} alt="" className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white shadow-md group-hover:scale-110 transition-transform" onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${s.firstName}+${s.lastName}&background=0b1f3a&color=ffffff&bold=true`} />
                   <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-[var(--navy-dark)] text-sm truncate uppercase tracking-tight">{s.firstName} {s.lastName}</h3>
                      <p className="text-[0.6rem] font-black text-[var(--gold)] mt-0.5 tracking-widest">{s.enrollmentNo}</p>
                   </div>
                   <div className="bg-[var(--bg-inset)] p-2 rounded-xl group-hover:bg-[var(--navy)] group-hover:text-white transition-colors">
                      <MdInfo size={16} />
                   </div>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-50 grid grid-cols-2 gap-3">
                   <div className="flex items-center gap-2 text-[0.65rem] font-bold text-gray-500">
                      <MdSchool className="text-blue-400" /> {s.branchId?.name}
                   </div>
                   <div className="flex items-center gap-2 text-[0.65rem] font-bold text-gray-500">
                      <MdClass className="text-amber-400" /> SEMESTER {s.semester}
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showModal && selectedStudent && (
        <div className="bento-modal-overlay">
          <div className="bento-modal !max-w-4xl">
            <div className="bento-modal-header border-b-0 absolute top-2 right-2 z-20">
               <button onClick={() => setShowModal(false)} className="bg-white/90 backdrop-blur p-2 rounded-full shadow-lg text-gray-400 hover:text-red-500 transition-all"><IoMdClose size={24} /></button>
            </div>
            <div className="bento-modal-body p-0">
               <div className="grid grid-cols-1 md:grid-cols-12">
                  {/* Sidebar Profile */}
                  <div className="md:col-span-4 bg-[var(--bg-inset)] p-8 flex flex-col items-center">
                     <img src={`${process.env.REACT_APP_MEDIA_LINK}/${selectedStudent.profile}`} alt="" className="w-48 h-48 rounded-[2rem] object-cover shadow-2xl ring-4 ring-white mb-6 border border-gray-100" onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${selectedStudent.firstName}+${selectedStudent.lastName}&background=0b1f3a&color=ffffff&size=200`} />
                     <h2 className="text-xl font-black text-[var(--navy-dark)] text-center tracking-tighter uppercase whitespace-nowrap">{selectedStudent.firstName} {selectedStudent.lastName}</h2>
                     <span className="bento-badge bento-badge-success mt-2 !px-4 !py-1 !text-[0.6rem]">{selectedStudent.enrollmentNo}</span>
                     
                     <div className="w-full mt-10 space-y-6">
                        <div className="flex flex-col gap-1">
                           <span className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest">Active Email</span>
                           <p className="text-xs font-bold text-[var(--navy)] truncate"><MdEmail className="inline mr-2" /> {selectedStudent.email}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                           <span className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest">Phone Link</span>
                           <p className="text-xs font-bold text-[var(--navy)]"><MdPhone className="inline mr-2" /> {selectedStudent.phone}</p>
                        </div>
                     </div>
                  </div>

                  {/* Main Content */}
                  <div className="md:col-span-8 p-10 space-y-10">
                     <section>
                       <h3 className="text-[0.65rem] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2"><MdSchool className="text-[var(--navy)]" /> Scholastic Dossier</h3>
                       <div className="grid grid-cols-2 gap-8">
                          <div className="bento-stat-premium p-0 group">
                             <MdFingerprint className="icon-bloom text-indigo-500" />
                             <label className="text-[0.65rem] font-bold text-gray-400 uppercase">Reg Identifier</label>
                             <p className="text-sm font-black text-[var(--navy-dark)] uppercase">{selectedStudent.enrollmentNo}</p>
                          </div>
                          <div className="bento-stat-premium p-0 group">
                             <MdSchool className="icon-bloom text-[var(--gold)]" />
                             <label className="text-[0.65rem] font-bold text-gray-400 uppercase">Academic Unit</label>
                             <p className="text-sm font-black text-[var(--navy-dark)]">{selectedStudent.branchId?.name}</p>
                          </div>
                          <div className="bento-stat-premium p-0 group">
                             <MdClass className="icon-bloom text-blue-500" />
                             <label className="text-[0.65rem] font-bold text-gray-400 uppercase">Current Term</label>
                             <p className="text-sm font-black text-[var(--navy-dark)]">Semester {selectedStudent.semester}</p>
                          </div>
                       </div>
                     </section>

                     <section>
                       <h3 className="text-[0.65rem] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2"><MdPerson className="text-[var(--navy)]" /> Biographical Data</h3>
                       <div className="grid grid-cols-3 gap-6">
                          <div><label className="text-[0.6rem] font-bold text-gray-400 uppercase">Gender</label><p className="text-xs font-bold text-[var(--navy-dark)] capitalize">{selectedStudent.gender}</p></div>
                          <div><label className="text-[0.6rem] font-bold text-gray-400 uppercase">D.O.B</label><p className="text-xs font-bold text-[var(--navy-dark)]">{new Date(selectedStudent.dob).toLocaleDateString()}</p></div>
                          <div><label className="text-[0.6rem] font-bold text-gray-400 uppercase">Blood</label><p className="text-xs font-bold text-red-500">{selectedStudent.bloodGroup}</p></div>
                       </div>
                       <div className="mt-6 flex items-start gap-3 bg-[var(--bg-inset)] p-4 rounded-2xl border border-gray-100/50">
                          <MdLocationOn className="text-blue-400 shrink-0 mt-0.5" />
                          <div>
                            <label className="text-[0.6rem] font-bold text-gray-400 uppercase block mb-0.5">Primary Residence</label>
                            <p className="text-xs font-medium text-gray-600 leading-relaxed">{selectedStudent.address}, {selectedStudent.city}, {selectedStudent.state}</p>
                          </div>
                       </div>
                     </section>

                     <section>
                       <h3 className="text-[0.65rem] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2"><MdCall className="text-red-500" /> Crisis Proxy</h3>
                       <div className="bg-red-50/50 rounded-2xl p-5 border border-red-100/50 flex items-center justify-between">
                          <div>
                             <p className="text-sm font-black text-red-900">{selectedStudent.emergencyContact?.name}</p>
                             <p className="text-[0.65rem] font-bold text-red-500 uppercase tracking-widest">{selectedStudent.emergencyContact?.relationship}</p>
                          </div>
                          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-red-100 flex items-center gap-2 text-red-600 font-black text-sm">
                             <MdPhone /> {selectedStudent.emergencyContact?.phone}
                          </div>
                       </div>
                     </section>
                  </div>
               </div>
            </div>
            <div className="bento-modal-footer bg-gray-50/50 border-t border-gray-100">
               <CustomButton onClick={() => setShowModal(false)} className="w-full">Acknowledge Ledger</CustomButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFinder;
