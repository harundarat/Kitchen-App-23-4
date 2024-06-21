import React from "react";

export default function InputForm({
  type,
  name,
  value,
  onChange,
  placeholder,
  label,
  error,
  prefix,
  postfix,
  className,
  disabled,
  ...rest
}) {
  return (
    <div
      className={`${className} flex flex-col items-start gap-2 ${disabled ? "cursor-not-allowed" : ""}`}
    >
      <label htmlFor={name}>{label}</label>
      <div
        className={`flex w-full gap-2 rounded border border-gray-500 bg-bg px-3 py-2 shadow-sm ring-inset focus-within:ring-2 focus-within:ring-primary ${disabled ? "cursor-not-allowed" : ""}`}
      >
        {prefix && <span className="text-gray-500">{prefix}</span>}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          id={name}
          className={`w-full border-none p-0 focus:outline-none focus:ring-0 ${disabled ? "cursor-not-allowed" : ""}`}
          placeholder={placeholder}
          disabled={disabled}
          {...rest}
        />
        {postfix && <span className="text-gray-500">{postfix}</span>}
      </div>
    </div>
  );
}
