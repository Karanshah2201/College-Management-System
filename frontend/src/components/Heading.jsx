import React from "react";

const Heading = (props) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-6 anim-fade-up">
      <div className="flex items-center gap-5">
        <div className="relative group">
           <div className="absolute inset-0 bg-[var(--gold)] rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
           <div
            className="relative w-1.5 h-12 rounded-full overflow-hidden"
            style={{
              background: "linear-gradient(180deg, var(--navy-dark) 0%, var(--navy) 50%, var(--gold) 100%)",
            }}
          />
        </div>
        
        <div className="space-y-1">
          <h2
            className="text-4xl font-black text-[var(--navy-dark)] tracking-tighter leading-none uppercase"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {props.title}
          </h2>
          {props.subtitle && (
            <p className="text-[0.6rem] font-black text-gray-400 uppercase tracking-[0.3em] pl-0.5">
              {props.subtitle}
            </p>
          )}
        </div>
      </div>
      
      {props.children && (
        <div className="flex items-center gap-3 w-full md:w-auto bento-card-flat p-1 !rounded-2xl bg-white/50 backdrop-blur-md border border-white/40 shadow-sm">
          {props.children}
        </div>
      )}
    </div>
  );
};

export default Heading;
