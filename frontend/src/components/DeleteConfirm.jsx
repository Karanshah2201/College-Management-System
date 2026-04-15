import React from "react";
import CustomButton from "./CustomButton";
import { MdErrorOutline, MdClose } from "react-icons/md";

const DeleteConfirm = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="bento-modal-overlay z-[200]" onClick={onClose}>
      <div
        className="bento-modal !max-w-sm mx-4 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500"></div>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors">
          <MdClose size={24} />
        </button>

        <div className="p-8 text-center pt-10">
          <div className="w-20 h-20 rounded-[2rem] mx-auto mb-6 flex items-center justify-center bg-red-50 text-red-500 shadow-inner group">
            <MdErrorOutline className="text-4xl group-hover:scale-110 transition-transform" />
          </div>

          <h3 className="text-2xl font-black text-[var(--navy-dark)] mb-3 tracking-tighter uppercase italic" style={{ fontFamily: "'Playfair Display', serif" }}>
            Data Expunction
          </h3>

          <p className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest leading-loose mb-10">
            {message || "Confirm the irreversible removal of this entity from the secure database archives."}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={onClose} className="py-3.5 rounded-2xl font-black text-[0.6rem] uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-colors">
              Abort Protocol
            </button>
            <CustomButton onClick={onConfirm} variant="danger" className="!py-3.5 shadow-red-200 uppercase tracking-[0.2em] italic">
              Expunge
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirm;
