import React, { useEffect, useRef, useState } from "react";
import { usePasswordToggle } from "../../hooks/usePasswordToggle";

interface InputWithIconProps {
  type?: string;
  name: string;
  label: string;
  iconLeft: React.ReactNode;
  value: string;
  hasError?: boolean;
  errorMessage?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

function InputWithIcon({
  type = "text",
  name,
  label,
  iconLeft,
  value,
  hasError = false,
  errorMessage,
  onChange,
  className,
}: InputWithIconProps) {
  /* const isActive = value.length > 0; */
  const inputRef = useRef<HTMLInputElement>(null);
  const [isActive, setIsActive] = useState(value.length > 0);

  const isPassword = type === "password";
  const { inputType, icon, toggle } = usePasswordToggle();

  useEffect(() => {
    const input = inputRef.current;
    if (input && input.value.length > 0) {
      setIsActive(true);
    }
  }, []);

  useEffect(() => {
    setIsActive(value.length > 0);
  }, [value]);

  const borderColor = hasError
    ? "border-red-500"
    : "border-neutral-10 dark:border-primary-90";
  const iconColor = hasError ? "" : "text-neutral-0 dark:text-primary-90";
  const focusBorder = hasError
    ? "focus-within:border-red-500 dark:focus-within:border-red-500"
    : "focus-within:border-primary-40 dark:focus-within:border-secondary-70";

  const labelBaseClass = `absolute left-0 transition-all duration-200 pointer-events-none text-left`;
  const labelActiveClass = isActive
    ? "-top-5 -left-7 text-sm bg-neutral-white px-2 dark:bg-dark-10"
    : "top-1/2 translate-y-[-50%] text-base";
  const labelFocusClass =
    "peer-focus:-top-5 peer-focus:translate-y-0 peer-focus:-left-7 peer-focus:text-sm peer-focus:bg-neutral-white peer-focus:px-2 dark:peer-focus:bg-dark-10";
  const labelColorClass = hasError
    ? "text-error"
    : "text-neutral-10 dark:text-primary-90";

  return (
    <div className="relative w-full mb-5">
      <div
        className={`group flex items-center w-full border rounded-lg px-4 py-3 focus-within:border-primary-40 dark:focus-within:border-secondary-70 transition-colors ${borderColor} ${focusBorder} ${className} dark:bg-dark-10`}
      >
        <span className={`text-neutral-0 mr-3 ${iconColor}`}>{iconLeft}</span>

        <div className="relative w-full">
          <input
            ref={inputRef}
            id={`input-${name}`}
            name={name}
            type={isPassword ? inputType : type}
            placeholder=" "
            value={value}
            onChange={onChange}
            className={`peer w-full outline-none bg-transparent text-base text-primary-40 dark:text-neutral-white placeholder-transparent !border-none !shadow-none`}
          />
          <label
            htmlFor={`input-${name}`}
            className={`${labelBaseClass} ${labelActiveClass} ${labelFocusClass} ${labelColorClass}`}
          >
            {label}
          </label>
        </div>

        {isPassword && (
          <span
            className="ml-3 text-neutral-0 group-focus-within:text-primary-40 dark:text-primary-90 dark:group-focus-within:text-primary-90 transition-colors cursor-pointer mt-1"
            onClick={toggle}
          >
            {icon}
          </span>
        )}
      </div>

      {hasError && errorMessage && (
        <p className="mt-1 text-sm text-error">{errorMessage}</p>
      )}
    </div>
  );
}

export default InputWithIcon;
