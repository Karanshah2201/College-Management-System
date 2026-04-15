import React, { useState, useEffect } from "react";
import { FiLogIn } from "react-icons/fi";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { setUserToken } from "../redux/actions";
import { useDispatch } from "react-redux";
import CustomButton from "../components/CustomButton";
import axiosWrapper from "../utils/AxiosWrapper";
const USER_TYPES = {
  STUDENT: "Student",
  FACULTY: "Faculty",
  ADMIN: "Admin",
};

const LoginForm = ({ selected, onSubmit, formData, setFormData, isLoading }) => (
  <form
    className="bento-card-glass w-full p-12 anim-scale-in border-t-8 border-t-[var(--navy)] shadow-[0_32px_80px_-20px_rgba(20,44,91,0.15)] border-l border-r border-b border-gray-100"
    style={{ background: "rgba(255, 255, 255, 0.95)" }}
    onSubmit={onSubmit}
  >
    <div className="space-y-8">
      <div className="relative group">
        <label className="bento-label !text-[var(--navy-dark)] !text-[0.7rem] !mb-3">
          {selected.toUpperCase()} EMAIL ADDRESS
        </label>
        <div className="relative">
           <input
             type="email"
             required
             className="bento-input !bg-gray-50/50 !border-gray-200 focus:!bg-white focus:!border-[var(--navy)] focus:!ring-4 focus:!ring-[var(--navy)]/5 transition-all !py-4 placeholder:text-gray-400"
             value={formData.email}
             onChange={(e) => setFormData({ ...formData, email: e.target.value })}
             placeholder="Enter your registered email"
           />
        </div>
      </div>

      <div className="relative group">
        <label className="bento-label !text-[var(--navy-dark)] !text-[0.7rem] !mb-3">
          ACCOUNT PASSWORD
        </label>
        <div className="relative">
           <input
             type="password"
             required
             className="bento-input !bg-gray-50/50 !border-gray-200 focus:!bg-white focus:!border-[var(--navy)] focus:!ring-4 focus:!ring-[var(--navy)]/5 transition-all !py-4 placeholder:text-gray-400"
             value={formData.password}
             onChange={(e) => setFormData({ ...formData, password: e.target.value })}
             placeholder="••••••••••••"
           />
        </div>
      </div>

      <div className="flex items-center justify-end">
        <Link
          className="text-[0.7rem] font-bold text-[var(--navy-light)] hover:text-[var(--navy)] transition-all hover:underline"
          to="/forget-password"
        >
          Forgot Password?
        </Link>
      </div>

      <div className="pt-4">
        <CustomButton
          type="submit"
          disabled={isLoading}
          variant="primary"
          className="w-full !py-5 shadow-2xl !text-[0.75rem] !font-bold !tracking-[0.1em] group"
        >
          {isLoading ? "VERIFYING ACCOUNT..." : "SIGN IN TO PORTAL"}
          <FiLogIn className="text-lg group-hover:translate-x-1 transition-transform" />
        </CustomButton>
      </div>
    </div>
  </form>
);

const UserTypeSelector = ({ selected, onSelect }) => (
  <div className="flex justify-center gap-3 mb-10 anim-fade-up">
    {Object.values(USER_TYPES).map((type) => {
      const isSelected = selected === type;
      return (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className={`
            px-8 py-2.5 text-[0.65rem] font-black uppercase tracking-[0.2em] rounded-full transition-all duration-500
            ${isSelected 
              ? "bg-[var(--gold)] text-[var(--navy-dark)] shadow-[0_10px_20px_-5px_rgba(212,160,23,0.4)] scale-110 italic" 
              : "text-[var(--navy-dark)]/50 hover:text-[var(--navy-dark)] hover:bg-white/50 backdrop-blur-sm"}
          `}
        >
          {type}
        </button>
      );
    })}
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get("type");

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [selected, setSelected] = useState(USER_TYPES.STUDENT);
  const [isLoading, setIsLoading] = useState(false);

  const handleUserTypeSelect = (type) => {
    setSelected(type);
    setSearchParams({ type: type.toLowerCase() });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Credentials missing");
      return;
    }

    setIsLoading(true);
    try {
      toast.loading("Authenticating credentials...");
      const response = await axiosWrapper.post(
        `/${selected.toLowerCase()}/login`,
        formData,
        { headers: { "Content-Type": "application/json" } }
      );
      toast.dismiss();
      const { token } = response.data.data;
      localStorage.setItem("userToken", token);
      localStorage.setItem("userType", selected);
      dispatch(setUserToken(token));
      toast.success("Login Successful");
      navigate(`/${selected.toLowerCase()}`);
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Login Failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
      navigate(`/${localStorage.getItem("userType").toLowerCase()}`);
    }
  }, [navigate]);

  useEffect(() => {
    if (type) {
      const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
      setSelected(capitalizedType);
    }
  }, [type]);

  return (
    <div className="min-h-screen login-wave flex items-center justify-center p-6 relative overflow-hidden font-['Inter']">
      <div className="w-full max-w-lg z-10 flex flex-col items-center">
        
        {/* Logo and Typography */}
        <div className="flex flex-col items-center mb-8 anim-fade-up">
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
             Secure Portal Access
          </p>
        </div>

        <UserTypeSelector selected={selected} onSelect={handleUserTypeSelect} />
        
        <div className="w-full max-w-md">
          <LoginForm
            selected={selected}
            onSubmit={handleSubmit}
            formData={formData}
            setFormData={setFormData}
            isLoading={isLoading}
          />
        </div>
      </div>
      <Toaster position="bottom-center" />
    </div>
  );
};

export default Login;
