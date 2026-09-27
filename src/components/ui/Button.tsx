import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "chip" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  className?: string;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  icon,
  iconPosition = "right",
  className = "",
  disabled,
  loading = false,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

  const sizeStyles = {
    sm: "min-h-11 text-sm px-4 py-2 rounded-full gap-1.5",
    md: "min-h-12 text-sm px-6 py-3 rounded-full gap-2",
    lg: "min-h-14 text-base px-7 py-3.5 rounded-full gap-2.5 font-semibold",
  };

  const variantStyles = {
    danger: "bg-[#A63737] text-white hover:bg-red-800",
    primary:
      "bg-primary-container text-white hover:bg-primary shadow-sm hover:shadow-soft active:translate-y-0.5",
    secondary:
      "bg-surface-lowest text-primary hover:bg-surface-container shadow-sm border border-stone-200/80",
    outline:
      "bg-transparent border border-primary text-primary hover:bg-surface-container",
    ghost:
      "bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-container",
    chip: "bg-surface-container text-text-secondary hover:bg-secondary-container hover:text-text-primary rounded-full text-xs py-1.5 px-3",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
      )}
      {!loading && icon && iconPosition === "left" && (
        <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {!loading && icon && iconPosition === "right" && (
        <span className="shrink-0">{icon}</span>
      )}
    </button>
  );
};
