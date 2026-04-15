import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axiosWrapper from "../utils/AxiosWrapper";
import CustomButton from "../components/CustomButton";
import { MdLock, MdFingerprint, MdCheckCircle, MdArrowBack } from "react-icons/md";

const UpdatePassword = () => {
  const navigate = useNavigate();
  const { resetId, type } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { if (!resetId) { toast.error("Session expired"); navigate("/"); } }, [resetId, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    if (!type) { toast.error("Invalid Reset Protocol"); return; }
    
    setIsLoading(true);
    toast.loading("Updating password...");
    try {
      const response = await axiosWrapper.post(`/${type}/update-password/${resetId}`, { password: newPassword, resetId });
      toast.dismiss();
      if (response.data.success) { toast.success("Password Updated Successfully"); navigate("/"); }
    } catch { toast.dismiss(); toast.error("Update failed. Please try again."); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen login-wave flex items-center justify-center p-6 relative overflow-hidden font-['Inter']">
      <div className="w-full max-w-[440px] relative z-10 anim-fade-up">
        {/* Branding Header - Consistently Identical to Login */}
        <div className="flex flex-col items-center mb-10 anim-fade-up">
          <div 
             style={{ boxShadow: "0 0 0 3px rgba(212,160,23,0.3), 0 8px 24px rgba(20,44,91,0.15)" }}
             className="rounded-full items-center justify-center mb-6 overflow-hidden block"
          >
             <img src="/assets/Logo.jpg" alt="University Logo" className="w-[84px] h-[84px] object-cover" />
          </div>
          <h1 
             style={{ fontFamily: "'Playfair Display', serif", color: "var(--navy-dark)" }}
             className="text-3xl font-bold text-center tracking-tight mb-1"
          >
            University College
          </h1>
          <p className="text-[0.7rem] font-bold text-[var(--navy-dark)]/60 uppercase tracking-[0.3em] ml-2">
            Secure Account Access
          </p>
        </div>

        {/* Core Interface */}
        <form 
          className="bento-card-glass w-full p-12 anim-scale-in border-t-8 border-t-[var(--navy)] shadow-[0_32px_80px_-20px_rgba(20,44,91,0.15)] border-l border-r border-b border-gray-100"
          style={{ background: "rgba(255, 255, 255, 0.95)" }}
          onSubmit={onSubmit}
        >
          <div className="space-y-8">
            <div className="space-y-4 group">
              <label className="bento-label !text-[var(--navy-dark)]/80">New Account Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (8+ characters)"
                className="bento-input !bg-gray-50/50 !border-gray-200 !text-[var(--navy-dark)] placeholder:text-gray-400 focus:!ring-[var(--navy)]/10 focus:!border-[var(--navy)] transition-all font-medium !py-4.5 !px-5"
                required
              />
            </div>

            <div className="space-y-4 group">
              <label className="bento-label !text-[var(--navy-dark)]/80">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="bento-input !bg-gray-50/50 !border-gray-200 !text-[var(--navy-dark)] placeholder:text-gray-400 focus:!ring-[var(--navy)]/10 focus:!border-[var(--navy)] transition-all font-medium !py-4.5 !px-5"
                required
              />
            </div>
          </div>

          <CustomButton type="submit" disabled={isLoading} variant="primary" className="w-full !py-5 mt-10 shadow-2xl font-bold uppercase tracking-widest">
            {isLoading ? "UPDATING..." : "UPDATE PASSWORD"}
          </CustomButton>

          <div className="mt-8 pt-8 border-t border-white/10 flex justify-center">
             <Link to="/" className="text-[0.65rem] font-black text-[var(--navy-dark)]/30 hover:text-[var(--gold)] uppercase tracking-widest flex items-center gap-2 transition-all group">
                <MdArrowBack className="group-hover:-translate-x-1 transition-transform" /> Back to Authentication
             </Link>
          </div>
        </form>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
};

export default UpdatePassword;
