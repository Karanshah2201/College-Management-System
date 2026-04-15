import React, { useState } from "react";
import UpdatePasswordLoggedIn from "../../components/UpdatePasswordLoggedIn";
import CustomButton from "../../components/CustomButton";
import {
  MdEmail, MdPhone, MdPerson, MdBloodtype, MdCalendarToday, MdWork, MdAttachMoney, MdVerified, MdShield, MdLocationOn, MdLocationCity, MdMap, MdPin, MdPublic, MdContactPhone, MdFamilyRestroom, MdLockOpen, MdFingerprint
} from "react-icons/md";

const InfoCell = ({ icon: Icon, label, value, color = "var(--navy)" }) => (
  <div className="bento-card-inset p-4 flex items-start gap-4 anim-scale-in group hover:bg-white transition-all duration-300">
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white shadow-sm group-hover:scale-110 transition-transform"
      style={{ color: color }}
    >
      <Icon size={18} />
    </div>
    <div className="min-w-0">
      <p className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">
        {label}
      </p>
      <p className="text-sm font-black text-[var(--navy-dark)] truncate">{value || "N/A"}</p>
    </div>
  </div>
);

const Profile = ({ profileData }) => {
  const [showUpdatePasswordModal, setShowUpdatePasswordModal] = useState(false);
  if (!profileData) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  return (
    <div className="w-full space-y-8 anim-fade-up">
      {/* Hero Bento Profile */}
      <div className="bento-card-navy p-10 relative overflow-hidden group">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
         <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[var(--gold)] opacity-10 rounded-full blur-[100px] group-hover:opacity-20 transition-opacity"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex flex-col md:flex-row items-center gap-8">
               <div className="relative">
                  <div className="absolute inset-0 bg-[var(--gold)] rounded-[2.5rem] blur-xl opacity-30 animate-pulse"></div>
                  <img
                    src={`${process.env.REACT_APP_MEDIA_LINK}/${profileData.profile}`}
                    alt="Profile"
                    className="relative w-32 h-32 rounded-[2.5rem] object-cover border-4 border-white/20 shadow-2xl"
                    onError={(e) => e.target.src = "https://ui-avatars.com/api/?name=" + profileData.firstName + "&background=F2C94C&color=0B1F3A&bold=true"}
                  />
               </div>
               <div className="text-center md:text-left">
                  <h1 className="text-4xl font-black text-white tracking-tighter mb-2 italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {`${profileData.firstName} ${profileData.lastName}`}
                  </h1>
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                     <span className="bento-badge !bg-white/10 !text-white !border-white/20 font-black italic">
                        {profileData.designation.toUpperCase()}
                     </span>
                     <span className="text-[0.65rem] font-black text-white/50 uppercase tracking-widest border-l border-white/20 pl-3">
                        Employee ID: {profileData.employeeId}
                     </span>
                  </div>
                  {profileData.isSuperAdmin && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[0.6rem] font-black uppercase tracking-widest">
                       <MdShield size={12} /> Access Level: Super Admin
                    </div>
                  )}
               </div>
            </div>
            <CustomButton
              onClick={() => setShowUpdatePasswordModal(true)}
              variant="secondary"
              className="!px-10 !py-4 shadow-2xl shadow-amber-900/40 italic"
            >
              <MdLockOpen size={18} className="mr-2" /> Change Password
            </CustomButton>
         </div>
      </div>

      {showUpdatePasswordModal && (
        <UpdatePasswordLoggedIn onClose={() => setShowUpdatePasswordModal(false)} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core Identification */}
        <div className="lg:col-span-2 bento-card p-10 bg-white/50 backdrop-blur-md">
           <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-[var(--gold)] to-[var(--gold-light)]"></div>
              <h2 className="text-xl font-black text-[var(--navy-dark)] uppercase tracking-tight italic" style={{ fontFamily: "'Playfair Display', serif" }}>Core Identification</h2>
           </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 anim-stagger">
              <InfoCell icon={MdEmail} label="Email Address" value={profileData.email} />
              <InfoCell icon={MdPhone} label="Contact Number" value={profileData.phone} />
              <InfoCell icon={MdPerson} label="Gender" value={profileData.gender} />
              <InfoCell icon={MdBloodtype} label="Blood Group" value={profileData.bloodGroup} color="#DC2626" />
              <InfoCell icon={MdCalendarToday} label="Date of Birth" value={formatDate(profileData.dob)} />
              <InfoCell icon={MdWork} label="Joining Date" value={formatDate(profileData.joiningDate)} />
              <InfoCell icon={MdAttachMoney} label="Monthly Salary" value={`Rs. ${profileData.salary?.toLocaleString()}`} color="#059669" />
              <InfoCell icon={MdVerified} label="Account Status" value={profileData.status} color="#059669" />
              <InfoCell icon={MdFingerprint} label="System Role" value={profileData.isSuperAdmin ? "SUPER ADMIN" : "ADMIN"} />
           </div>
        </div>

        {/* Spatial Coordinates & Emergency */}
        <div className="space-y-8">
            <div className="bento-card p-10 bg-white/70">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-[var(--navy)] to-blue-400"></div>
                 <h2 className="text-xl font-black text-[var(--navy-dark)] uppercase tracking-tight italic" style={{ fontFamily: "'Playfair Display', serif" }}>Location Info</h2>
              </div>
              <div className="space-y-4 anim-stagger">
                 <InfoCell icon={MdLocationOn} label="Primary Address" value={profileData.address} />
                 <InfoCell icon={MdLocationCity} label="City" value={profileData.city} />
                 <InfoCell icon={MdPin} label="Pincode" value={profileData.pincode} />
                 <InfoCell icon={MdPublic} label="Country" value={profileData.country} />
              </div>
           </div>

           <div className="bento-card p-10 bg-gradient-to-br from-red-50 to-white border-red-100">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-1.5 h-8 rounded-full bg-red-500"></div>
                 <h2 className="text-xl font-black text-[var(--navy-dark)] uppercase tracking-tight italic" style={{ fontFamily: "'Playfair Display', serif" }}>Emergency Contact</h2>
              </div>
              <div className="space-y-4 anim-stagger">
                 <InfoCell icon={MdPerson} label="Contact Person" value={profileData.emergencyContact?.name} color="#D97706" />
                 <InfoCell icon={MdFamilyRestroom} label="Relationship" value={profileData.emergencyContact?.relationship} color="#D97706" />
                 <div className="p-4 bg-red-500 rounded-2xl flex items-start gap-4 shadow-xl shadow-red-200 group group-hover:scale-105 transition-transform">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white"><MdContactPhone size={20} /></div>
                    <div className="flex flex-col">
                       <span className="text-[0.55rem] font-black text-white/60 uppercase tracking-widest">Phone Number</span>
                       <span className="text-sm font-black text-white">{profileData.emergencyContact?.phone}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
