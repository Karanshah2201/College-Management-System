import React, { useState } from "react";
import CustomButton from "../../components/CustomButton";
import UpdatePasswordLoggedIn from "../../components/UpdatePasswordLoggedIn";
import { MdEmail, MdPhone, MdLocationOn, MdCake, MdSchool, MdFingerprint, MdLock, MdCall } from "react-icons/md";

const Profile = ({ profileData }) => {
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  if (!profileData) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
  };

  return (
    <div className="w-full space-y-8 anim-fade-up">
      {/* Hero Bento Card */}
      <div className="bento-card p-0 overflow-hidden relative">
        <div className="h-40 bg-gradient-to-br from-[var(--navy)] via-[var(--navy-light)] to-[var(--gold)] opacity-90 bento-wave"></div>
        <div className="px-8 pb-8 flex flex-col md:flex-row items-end gap-6 -mt-16 relative z-10">
          <div className="relative">
            <img
              src={`${process.env.REACT_APP_MEDIA_LINK}/${profileData.profile}`}
              alt="Profile"
              className="w-44 h-44 rounded-[2.5rem] object-cover border-8 border-white shadow-2xl ring-1 ring-gray-100"
              onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${profileData.firstName}+${profileData.lastName}&background=0b1f3a&color=ffffff&size=200`}
            />
            <div className="absolute bottom-4 right-4 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
          </div>
          <div className="flex-1 mb-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-black text-[var(--navy-dark)] tracking-tight">
                {profileData.firstName} {profileData.middleName} {profileData.lastName}
              </h1>
            </div>
            <div className="flex items-center gap-4 mt-2">
               <span className="bento-badge bento-badge-success !py-1 !px-4 font-bold uppercase tracking-widest text-[0.65rem]">
                Active Scholar
              </span>
              <p className="text-gray-500 font-bold flex items-center gap-2 text-sm uppercase tracking-tighter">
                <MdFingerprint className="text-[var(--gold)]" />
                {profileData.enrollmentNo}
              </p>
            </div>
          </div>
          <div className="flex gap-3 mb-2">
            <CustomButton onClick={() => setShowPasswordUpdate(!showPasswordUpdate)} variant="ghost" className="!rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md">
              <MdLock className="mr-2" /> Security Settings
            </CustomButton>
          </div>
        </div>
      </div>

      {showPasswordUpdate && (
        <div className="bento-modal-overlay">
          <div className="bento-modal !max-w-md">
            <div className="bento-modal-header border-b-0">
              <h2 className="text-lg font-bold text-[var(--navy-dark)]">System Access Security</h2>
            </div>
            <div className="p-6">
              <UpdatePasswordLoggedIn onClose={() => setShowPasswordUpdate(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 anim-stagger">
        {/* Academic Block */}
        <div className="bento-card p-6 anim-scale-in">
          <h3 className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-2">
            <MdSchool className="text-[var(--navy)]" size={16} /> Academic Registry
          </h3>
          <div className="space-y-6">
            <div className="bento-stat-premium p-0 group">
              <MdSchool className="icon-bloom text-[var(--gold)]" />
              <label className="text-[0.65rem] font-bold text-gray-400 uppercase">Degree Program</label>
              <p className="text-sm font-black text-[var(--navy-dark)]">{profileData.branchId.name}</p>
            </div>
            <div className="bento-stat-premium p-0 group">
              <MdFingerprint className="icon-bloom text-blue-500" />
              <label className="text-[0.65rem] font-bold text-gray-400 uppercase">Current Session</label>
              <p className="text-sm font-black text-[var(--navy-dark)]">Semester {profileData.semester}</p>
            </div>
          </div>
        </div>

        {/* Identity Block */}
        <div className="bento-card p-6 anim-scale-in" style={{ animationDelay: "0.1s" }}>
          <h3 className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-2">
            <MdEmail className="text-[var(--navy)]" size={16} /> Communication
          </h3>
          <div className="space-y-6">
            <div className="bento-stat-premium p-0 group">
              <MdEmail className="icon-bloom text-emerald-500" />
              <label className="text-[0.65rem] font-bold text-gray-400 uppercase">Institutional Email</label>
              <p className="text-sm font-black text-[var(--navy-dark)] truncate">{profileData.email}</p>
            </div>
            <div className="bento-stat-premium p-0 group">
              <MdPhone className="icon-bloom text-indigo-500" />
              <label className="text-[0.65rem] font-bold text-gray-400 uppercase">Primary Mobile</label>
              <p className="text-sm font-black text-[var(--navy-dark)]">{profileData.phone}</p>
            </div>
          </div>
        </div>

        {/* Bio Block */}
        <div className="bento-card p-6 anim-scale-in" style={{ animationDelay: "0.2s" }}>
          <h3 className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-2">
            <MdCake className="text-[var(--navy)]" size={16} /> Demographic
          </h3>
          <div className="space-y-6">
            <div className="bento-stat-premium p-0 group">
              <MdCake className="icon-bloom text-pink-500" />
              <label className="text-[0.65rem] font-bold text-gray-400 uppercase">Date of Birth</label>
              <p className="text-sm font-black text-[var(--navy-dark)]">{formatDate(profileData.dob)}</p>
            </div>
            <div className="flex gap-4">
               <div className="flex-1">
                <label className="text-[0.65rem] font-bold text-gray-400 uppercase">Gender</label>
                <p className="text-sm font-black text-[var(--navy-dark)] capitalize">{profileData.gender}</p>
              </div>
              <div className="border-l border-gray-100 pl-4 flex-1">
                <label className="text-[0.65rem] font-bold text-gray-400 uppercase">Blood</label>
                <p className="text-sm font-black text-red-500">{profileData.bloodGroup}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Location Block */}
        <div className="md:col-span-2 bento-card p-6 anim-scale-in" style={{ animationDelay: "0.3s" }}>
           <h3 className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-gray-400 mb-4 flex items-center gap-2">
            <MdLocationOn className="text-[var(--navy)]" size={16} /> Residential Mapping
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-center md:text-left">
            <div className="bento-stat-premium p-0 group">
              <MdLocationOn className="icon-bloom" />
              <label className="text-[0.65rem] font-bold text-gray-400 uppercase">Primary Address</label>
              <p className="text-sm font-black text-[var(--navy-dark)] leading-relaxed">{profileData.address}</p>
              <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-tighter">{profileData.city}, {profileData.state}, {profileData.country}</p>
            </div>
            <div className="flex items-center justify-center md:justify-end">
              <div className="bg-[var(--bg-inset)] p-5 rounded-3xl flex flex-col items-center gap-1 border border-gray-100/50">
                  <p className="text-[0.6rem] font-black text-gray-400 uppercase tracking-[0.2em]">Pincode</p>
                  <p className="text-2xl font-black text-[var(--navy)] tracking-tight">{profileData.pincode}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Block */}
        <div className="bento-card p-6 anim-scale-in" style={{ animationDelay: "0.4s" }}>
          <h3 className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-2">
            <MdCall className="text-red-500" size={16} /> Crisis Proxy
          </h3>
          <div className="bg-red-50/50 p-5 rounded-3xl border border-red-100 flex flex-col h-[calc(100%-3rem)] justify-center">
             <div className="mb-4">
                <p className="text-sm font-black text-red-900 uppercase tracking-tighter">{profileData.emergencyContact.name}</p>
                <p className="text-[0.62rem] font-bold text-red-500 uppercase tracking-[0.1em]">{profileData.emergencyContact.relationship}</p>
             </div>
             <div className="bg-white px-4 py-3 rounded-2xl flex items-center gap-3 text-red-600 font-black text-sm shadow-sm border border-red-100/50">
               <MdPhone size={16} /> {profileData.emergencyContact.phone}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
