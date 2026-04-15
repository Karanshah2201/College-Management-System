import React, { useState } from "react";
import { toast } from "react-hot-toast";
import axiosWrapper from "../utils/AxiosWrapper";
import { IoMdClose } from "react-icons/io";
import { MdLock, MdShield, MdFingerprint } from "react-icons/md";
import CustomButton from "./CustomButton";

const UpdatePasswordLoggedIn = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const userToken = localStorage.getItem("userToken");
  const userType = localStorage.getItem("userType");

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error("Checkphrase mismatch"); return; }
    if (newPassword.length < 8) { toast.error("Checkphrase must be ≥ 8 symbols"); return; }
    
    setIsLoading(true);
    toast.loading("Updating security settings...");
    try {
      const res = await axiosWrapper.post(`/${userType.toLowerCase()}/change-password`, { currentPassword, newPassword }, {
          headers: { Authorization: `Bearer ${userToken}` },
      });
      toast.dismiss();
      if (res.data.success) { 
        toast.success("Security status updated"); 
        onClose();
      }
    } catch { toast.dismiss(); toast.error("Session expired or invalid credentials"); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="bento-modal-overlay z-[200]" onClick={onClose}>
      <div className="bento-modal !max-w-md relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--navy)] to-[var(--gold)]"></div>
        
        <div className="bento-modal-header border-b-0 pb-0">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-[var(--bg-inset)] text-[var(--navy)] flex items-center justify-center border border-gray-100 shadow-inner">
                <MdShield size={20} />
             </div>
              <div>
                <h2 className="text-base font-black text-[var(--navy-dark)] uppercase tracking-tight">Account Security</h2>
                <p className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest leading-none">Update Login Credentials</p>
              </div>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors p-1"><IoMdClose size={24} /></button>
        </div>

        <form onSubmit={handlePasswordUpdate} className="p-8 space-y-6">
          <div className="space-y-2 group">
            <label className="bento-label !mb-0 flex items-center gap-2">
              <MdLock className="text-gray-300 transition-colors group-hover:text-[var(--navy)]" size={14} /> 
              Current Account Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="bento-input"
              placeholder="Enter current password"
              required
            />
          </div>

          <div className="h-px bg-gray-50 mx-4"></div>

          <div className="space-y-5">
            <div className="space-y-2 group">
              <label className="bento-label !mb-0 flex items-center gap-2">
                <MdFingerprint className="text-gray-300 transition-colors group-hover:text-emerald-500" size={14} /> 
                New Secure Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bento-input focus:border-emerald-500/30"
                placeholder="Minimum 8 characters"
                required
              />
            </div>
            <div className="space-y-2 group">
              <label className="bento-label !mb-0 flex items-center gap-2">
                <MdFingerprint className="text-gray-300 transition-colors group-hover:text-emerald-500" size={14} /> 
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bento-input focus:border-emerald-500/30"
                placeholder="Re-type new password"
                required
              />
            </div>
          </div>

          <div className="pt-6 flex gap-3">
             <button type="button" onClick={onClose} className="flex-1 bento-card-flat py-3.5 font-black text-[0.6rem] uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-colors rounded-2xl">
               Cancel
             </button>
             <CustomButton type="submit" disabled={isLoading} className="flex-[2] !py-3.5 shadow-xl shadow-blue-100">
               {isLoading ? "UPDATING..." : "UPDATE PASSWORD"}
             </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePasswordLoggedIn;
