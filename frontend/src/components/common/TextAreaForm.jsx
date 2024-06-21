import React, { useState, useEffect } from "react";

export default function TextAreaForm({
  name,
  onChange,
  label,
  placeholder,
  value,
  ...rest
}) {
  return (
    <div className="flex w-full flex-col items-start gap-2">
      {label && (
        <label className="text-primary" htmlFor={name}>
          {label}
        </label>
      )}
      <textarea
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        className="h-40 min-h-40 w-full rounded border border-gray-500 bg-bg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary focus:outline-none"
        placeholder={placeholder}
      />
    </div>
  );
}
