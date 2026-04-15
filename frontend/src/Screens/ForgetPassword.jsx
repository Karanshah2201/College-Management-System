import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axiosWrapper from "../utils/AxiosWrapper";
import CustomButton from "../components/CustomButton";
import { MdEmail, MdArrowBack, MdShield, MdFingerprint } from "react-icons/md";

const USER_TYPES = {
  STUDENT: "Student",
  FACULTY: "Faculty",
  ADMIN: "Admin",
};

const ForgetPassword = () => {
  const navigate = useNavigate();
  const userToken = localStorage.getItem("userToken");
  const [selected, setSelected] = useState(USER_TYPES.STUDENT);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userToken) navigate(`/${localStorage.getItem("userType")}`);
  }, [userToken, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error("Email is required"); return; }
    setLoading(true);
    toast.loading("Sending reset link...");
    try {
      const resp = await axiosWrapper.post(`/${selected.toLowerCase()}/forget-password`, { email });
      toast.dismiss();
      if (resp.data.success) toast.success("Reset link sent successfully");
    } catch { toast.dismiss(); toast.error("Account not found"); }
    finally { setLoading(false); setEmail(""); }
  };

  return (
    <div className="min-h-screen login-wave flex items-center justify-center p-6 relative overflow-hidden font-['Inter']">
      <div className="w-full max-w-[440px] relative z-10 anim-fade-up">
        {/* Superior Header */}
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
             Account Recovery Portal
          </p>
        </div>

        {/* Portal Switching */}
        <div className="bento-card-flat p-1.5 bg-gray-100/50 backdrop-blur-xl border-gray-200/50 mb-8 grid grid-cols-3 gap-1.5 shadow-inner rounded-[1.4rem]">
          {Object.values(USER_TYPES).map((type) => (
            <button
              key={type}
              onClick={() => setSelected(type)}
              className={`py-3 rounded-[1.1rem] text-[0.6rem] font-black uppercase tracking-widest transition-all duration-300 ${
              selected === type ? "bg-[var(--gold)] text-[var(--navy-dark)] shadow-md scale-105 italic" : "text-[var(--navy-dark)]/50 hover:text-[var(--navy-dark)]"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Core Interface */}
        <form 
          className="bento-card-glass w-full p-12 anim-scale-in border-t-8 border-t-[var(--navy)] shadow-[0_32px_80px_-20px_rgba(20,44,91,0.15)] border-l border-r border-b border-gray-100"
          style={{ background: "rgba(255, 255, 255, 0.95)" }}
          onSubmit={onSubmit}
        >
          <div className="mb-10 space-y-4 group">
            <label className="bento-label !text-[var(--navy-dark)]">Registered Institutional Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered institutional email"
              className="bento-input !bg-gray-50/30 !border-gray-200 !text-[var(--navy-dark)] placeholder:text-gray-400 focus:!ring-[var(--navy)]/10 focus:!border-[var(--navy)] transition-all font-medium !py-4.5 !px-5"
              required
            />
          </div>

          <CustomButton type="submit" disabled={loading} variant="primary" className="w-full !py-5 shadow-2xl font-bold uppercase tracking-widest">
            {loading ? "SENDING LINK..." : "SEND RESET LINK"}
          </CustomButton>

          <div className="mt-8 pt-8 border-t border-gray-100 flex justify-center">
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

export default ForgetPassword;
