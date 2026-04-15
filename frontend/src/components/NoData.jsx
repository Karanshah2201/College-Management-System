import React from "react";
import { MdInbox, MdSearchOff } from "react-icons/md";

const NoData = ({ title }) => {
  return (
    <div className="w-full py-24 flex flex-col items-center justify-center anim-fade-up">
      <div className="relative group">
         <div className="absolute inset-0 bg-[var(--navy)] rounded-[2.5rem] blur-2xl opacity-[0.03] group-hover:opacity-[0.08] transition-opacity"></div>
         <div className="relative w-24 h-24 rounded-[2.5rem] bg-white border border-gray-100 shadow-2xl flex items-center justify-center text-gray-200 group-hover:scale-105 transition-transform duration-500">
            <MdSearchOff size={48} className="group-hover:translate-y-[-2px] transition-transform" />
         </div>
      </div>
      
      <div className="text-center space-y-4">
        <h3 className="text-3xl font-black text-[var(--navy-dark)] tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>
          No Records Found
        </h3>
        <p className="text-[0.65rem] font-black text-gray-400 uppercase tracking-[0.4em] max-w-[280px] mx-auto">
          The requested data is currently unavailable in our archives.
        </p>
      </div>
    </div>
  );
};

export default NoData;
