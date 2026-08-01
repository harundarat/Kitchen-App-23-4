import type { InputHTMLAttributes, ReactNode } from "react";

interface InputFormProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "prefix"
> {
  label?: ReactNode;
  error?: string;
  prefix?: ReactNode;
  postfix?: ReactNode;
}

export default function InputForm({
  name,
  label,
  error,
  prefix,
  postfix,
  className = "",
  disabled,
  ...inputProps
}: InputFormProps) {
  return (
    <div
      className={`${className} flex flex-col items-start gap-2 ${disabled ? "cursor-not-allowed" : ""}`}
    >
      {label && <label htmlFor={name}>{label}</label>}
      <div
        className={`bg-bg focus-within:ring-primary flex w-full gap-2 rounded border border-gray-500 px-3 py-2 shadow-xs ring-inset focus-within:ring-2 ${disabled ? "cursor-not-allowed" : ""}`}
      >
        {prefix && <span className="text-gray-500">{prefix}</span>}
        <input
          {...inputProps}
          name={name}
          id={name}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          className={`w-full border-none p-0 focus:ring-0 focus:outline-hidden ${disabled ? "cursor-not-allowed" : ""}`}
        />
        {postfix && <span className="text-gray-500">{postfix}</span>}
      </div>
      {error && <p className="text-accent-1 text-sm">{error}</p>}
    </div>
  );
}
