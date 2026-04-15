import React from "react";

const CustomButton = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  variant = "primary",
  title,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "btn-navy";
      case "secondary":
        return "btn-gold";
      case "danger":
        return "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-xl shadow-red-900/20";
      case "ghost":
        return "bg-white/40 backdrop-blur-xl text-[var(--navy-dark)] border border-white/60 shadow-lg hover:bg-white/60";
      case "outline":
        return "bg-transparent border-2 border-[var(--navy)] text-[var(--navy)] hover:bg-[var(--navy)] hover:text-white";
      default:
        return "btn-navy";
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        px-6 py-3 rounded-2xl
        font-black text-[0.65rem] uppercase tracking-[0.2em]
        transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed
        flex items-center justify-center gap-3
        hover:scale-105 active:scale-95
        ${getVariantClasses()}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default CustomButton;
