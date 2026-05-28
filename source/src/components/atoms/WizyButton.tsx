import React from "react";

interface WizyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "solid" | "outline" | "disabled" | "custom";
  size?: "lg" | "md" | "sm";
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const sizeClasses = {
  lg: "py-3 px-6 text-base",
  md: "py-2.5 px-5 text-sm",
  sm: "py-2 px-4 text-xs",
};

const variantClasses = {
  solid:
    "cursor-pointer bg-primary-40 text-white border border-primary-40 hover:bg-primary-50 dark:bg-secondary-20 dark:hover:bg-secondary-30 dark:border-secondary-20",
  outline:
    "cursor-pointer bg-transparent text-primary-40 border border-primary-40 hover:bg-primary-40/10 dark:text-primary-90 dark:border-secondary-20 dark:bg-secondary-20/25",
  disabled:
    "bg-neutral-10 text-neutral-40 border border-neutral-20 cursor-not-allowed dark:bg-primary-50",
  custom: "transition hover:shadow-md",
};

const WizyButton: React.FC<WizyButtonProps> = ({
  variant = "solid",
  size = "md",
  iconLeft,
  iconRight,
  children,
  className = "",
  ...props
}) => {
  const baseClasses =
    "flex w-full items-center justify-center gap-2 font-semibold rounded-lg transition-colors duration-200";

  const isDisabled = variant === "disabled" || props.disabled;
  const appliedVariant = isDisabled ? "disabled" : variant;

  return (
    <button
      className={`${className} ${baseClasses} ${sizeClasses[size]} ${variantClasses[appliedVariant]}`}
      disabled={isDisabled}
      {...props}
    >
      {iconLeft && <span className="text-lg">{iconLeft}</span>}
      <span>{children}</span>
      {iconRight && <span className="text-lg">{iconRight}</span>}
    </button>
  );
};

export default WizyButton;
