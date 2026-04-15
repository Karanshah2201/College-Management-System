import React from "react";
import { FiLogOut, FiUser, FiHome } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const router = useLocation();
  const navigate = useNavigate();

  const logouthandler = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userType");
    navigate("/");
  };

  const userType = router.state?.type || localStorage.getItem("userType") || "";

  return (
    <nav className="sticky top-0 z-[100] px-6 py-4 mb-10 transition-all duration-500 bg-white/70 backdrop-blur-2xl border-b border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Left: Branding */}
        <div
          className="flex items-center gap-4 cursor-pointer group"
          onClick={() => navigate(`/${userType.toLowerCase()}`)}
        >
          <div className="relative">
             <div className="absolute inset-0 bg-gradient-to-br from-[var(--gold)] to-[var(--navy)] rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
             <div className="relative p-0.5 rounded-2xl bg-gradient-to-br from-white to-gray-100 shadow-inner group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                <img
                  src="/assets/Logo.jpg"
                  alt="Elite Academy"
                  className="w-11 h-11 rounded-[0.9rem] object-cover"
                  onError={(e) => e.target.src = "https://ui-avatars.com/api/?name=CMS&background=0b1f3a&color=ffffff"}
                />
             </div>
          </div>

          <div>
            <p className="font-['Playfair_Display'] font-black text-xl text-[var(--navy-dark)] leading-none tracking-tight group-hover:text-[var(--navy)] transition-colors">
              Academy <span className="text-[var(--gold)]">Elite</span>
            </p>
            <p className="text-[0.6rem] font-black text-gray-400 uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Integrated {userType ? `${userType}` : "LMS"} Environment
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {userType && (
            <div className="hidden md:flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-[var(--bg-inset)] border border-white/50 shadow-sm">
               <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <FiUser size={12} className="text-[var(--gold)]" />
               </div>
               <span className="text-[0.65rem] font-black text-[var(--navy-dark)] uppercase tracking-widest">{userType} Protocol</span>
            </div>
          )}

          <div className="h-8 w-px bg-gray-100 mx-2 hidden md:block"></div>

          <button
            onClick={logouthandler}
            className="flex items-center gap-2.5 px-6 py-2.5 rounded-2xl font-black text-[0.65rem] uppercase tracking-widest bg-[var(--navy-dark)] text-white shadow-xl shadow-blue-900/10 hover:shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <FiLogOut size={16} className="text-[var(--gold)]" />
            Termination
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
