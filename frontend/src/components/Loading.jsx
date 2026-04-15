import React from "react";

const Loading = () => {
  return (
    <div className="w-full min-h-[50vh] flex flex-col justify-center items-center gap-6 anim-fade-up">
      <div className="relative group">
        <div className="absolute inset-0 bg-[var(--navy)] rounded-[2rem] blur-2xl opacity-10 animate-pulse group-hover:opacity-20 transition-opacity"></div>
        <div className="relative p-6 bg-white/50 backdrop-blur-3xl rounded-[2.5rem] border border-white/40 shadow-2xl flex items-center justify-center">
           <div className="w-14 h-14 relative flex items-center justify-center">
              <div className="absolute inset-0 border-[5px] border-gray-100 rounded-2xl"></div>
              <div className="absolute inset-0 border-[5px] border-transparent border-t-[var(--navy)] border-r-[var(--gold)] rounded-2xl animate-spin shadow-inner"></div>
           </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center">
         <p className="text-[0.6rem] font-black text-[var(--navy-dark)] uppercase tracking-[0.4em] mb-1.5 ml-[0.4em]">
           Synchronizing
         </p>
         <div className="flex gap-1.5 items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-bounce" style={{ animationDelay: "0s" }}></div>
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--navy)] animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-bounce" style={{ animationDelay: "0.4s" }}></div>
         </div>
      </div>
    </div>
  );
};

export default Loading;
