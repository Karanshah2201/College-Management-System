import React, { useState } from "react";
import CustomButton from "../../components/CustomButton";
import UpdatePasswordLoggedIn from "../../components/UpdatePasswordLoggedIn";
import { MdEmail, MdPhone, MdLocationOn, MdCake, MdWork, MdBadge, MdLock, MdCall } from "react-icons/md";

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
        <div className="h-32 bg-gradient-to-r from-[var(--navy)] via-[var(--navy-light)] to-[var(--gold)] opacity-90 bento-wave"></div>
        <div className="px-8 pb-8 flex flex-col md:flex-row items-end gap-6 -mt-12 relative z-10">
          <div className="relative">
            <img
              src={`${process.env.REACT_APP_MEDIA_LINK}/${profileData.profile}`}
              alt="Profile"
              className="w-40 h-40 rounded-3xl object-cover border-8 border-white shadow-xl ring-1 ring-gray-100"
              onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${profileData.firstName}+${profileData.lastName}&background=0b1f3a&color=ffffff&size=200`}
            />
            <div className="absolute bottom-3 right-3 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
          </div>
          <div className="flex-1 mb-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black text-[var(--navy-dark)] tracking-tight">
                {profileData.firstName} {profileData.lastName}
              </h1>
              <span className="bento-badge bento-badge-info !py-1 !px-3 font-bold uppercase tracking-widest text-[0.65rem]">
                {profileData.designation}
              </span>
            </div>
            <p className="text-gray-500 font-medium mt-1 flex items-center gap-2">
              <MdBadge className="text-[var(--gold)]" />
              Emp ID: {profileData.employeeId} • Faculty Member
            </p>
          </div>
          <div className="flex gap-3 mb-2">
            <CustomButton onClick={() => setShowPasswordUpdate(!showPasswordUpdate)} variant="ghost" className="!rounded-xl border border-gray-200">
              <MdLock className="mr-2" /> Security Settings
            </CustomButton>
          </div>
        </div>
      </div>

      {showPasswordUpdate && (
        <div className="bento-modal-overlay">
          <div className="bento-modal !max-w-md">
            <div className="bento-modal-header">
              <h2 className="text-lg font-bold text-[var(--navy-dark)]">Update Account Password</h2>
            </div>
            <div className="p-6">
              <UpdatePasswordLoggedIn onClose={() => setShowPasswordUpdate(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 anim-stagger">
        {/* Contact Block */}
        <div className="bento-card p-6 anim-scale-in">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
            <MdEmail className="text-[var(--navy)]" size={16} /> Contact Identity
          </h3>
          <div className="space-y-6">
            <div className="bento-stat-premium p-0 group">
              <MdEmail className="icon-bloom" />
              <label className="text-[0.65rem] font-bold text-gray-400 uppercase">Email Address</label>
              <p className="text-sm font-bold text-[var(--navy-dark)] truncate">{profileData.email}</p>
            </div>
            <div className="bento-stat-premium p-0 group">
              <MdPhone className="icon-bloom text-emerald-500" />
              <label className="text-[0.65rem] font-bold text-gray-400 uppercase">Primary Phone</label>
              <p className="text-sm font-bold text-[var(--navy-dark)]">{profileData.phone}</p>
            </div>
          </div>
        </div>

        {/* Academic Block */}
        <div className="bento-card p-6 anim-scale-in" style={{ animationDelay: "0.1s" }}>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
            <MdWork className="text-[var(--navy)]" size={16} /> Office Details
          </h3>
          <div className="space-y-6">
            <div className="bento-stat-premium p-0 group">
              <MdWork className="icon-bloom text-[var(--gold)]" />
              <label className="text-[0.65rem] font-bold text-gray-400 uppercase">Joining Date</label>
              <p className="text-sm font-bold text-[var(--navy-dark)]">{formatDate(profileData.joiningDate)}</p>
            </div>
            <div className="bento-stat-premium p-0 group">
              <MdBadge className="icon-bloom text-blue-500" />
              <label className="text-[0.65rem] font-bold text-gray-400 uppercase">Salary Structure</label>
              <p className="text-sm font-bold text-[var(--navy-dark)]">₹ {profileData.salary.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Personal Block */}
        <div className="bento-card p-6 anim-scale-in" style={{ animationDelay: "0.2s" }}>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
            <MdCake className="text-[var(--navy)]" size={16} /> Bio Data
          </h3>
          <div className="space-y-6">
            <div className="bento-stat-premium p-0 group">
              <MdCake className="icon-bloom text-pink-500" />
              <label className="text-[0.65rem] font-bold text-gray-400 uppercase">Birth Date</label>
              <p className="text-sm font-bold text-[var(--navy-dark)]">{formatDate(profileData.dob)}</p>
            </div>
            <div className="flex gap-4">
               <div>
                <label className="text-[0.65rem] font-bold text-gray-400 uppercase">Blood</label>
                <p className="text-sm font-bold text-red-500">{profileData.bloodGroup}</p>
              </div>
              <div className="border-l border-gray-100 pl-4">
                <label className="text-[0.65rem] font-bold text-gray-400 uppercase">Status</label>
                <p className="text-sm font-bold text-emerald-500 capitalize">{profileData.status}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Location Block */}
        <div className="md:col-span-2 bento-card p-6 anim-scale-in" style={{ animationDelay: "0.3s" }}>
           <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-2">
            <MdLocationOn className="text-[var(--navy)]" size={16} /> Residential Address
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bento-stat-premium p-0 group">
              <MdLocationOn className="icon-bloom" />
              <label className="text-[0.65rem] font-bold text-gray-400 uppercase">Full Address</label>
              <p className="text-sm font-bold text-[var(--navy-dark)] leading-relaxed">{profileData.address}</p>
              <p className="text-xs text-gray-400 font-medium mt-1">{profileData.city}, {profileData.state}, {profileData.country}</p>
            </div>
            <div className="flex items-center justify-end">
              <div className="bg-[var(--bg-inset)] p-4 rounded-2xl flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest">Pincode</p>
                  <p className="text-xl font-black text-[var(--navy)] tracking-tight">{profileData.pincode}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Block */}
        <div className="bento-card p-6 anim-scale-in" style={{ animationDelay: "0.4s" }}>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
            <MdCall className="text-red-500" size={16} /> Emergency Link
          </h3>
          <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100">
             <p className="text-sm font-bold text-red-900">{profileData.emergencyContact.name}</p>
             <p className="text-[0.65rem] font-bold text-red-500 uppercase mb-3">{profileData.emergencyContact.relationship}</p>
             <div className="bg-white px-3 py-2 rounded-xl flex items-center gap-2 text-red-600 font-bold text-sm shadow-sm border border-red-100/50">
               <MdPhone size={14} /> {profileData.emergencyContact.phone}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
