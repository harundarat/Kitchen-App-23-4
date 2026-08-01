import type { ReactNode, TextareaHTMLAttributes } from "react";

interface TextAreaFormProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
}

export default function TextAreaForm({
  name,
  label,
  className = "",
  ...props
}: TextAreaFormProps) {
  return (
    <div className="flex w-full flex-col items-start gap-2">
      {label && (
        <label className="text-primary" htmlFor={name}>
          {label}
        </label>
      )}
      <textarea
        {...props}
        name={name}
        id={name}
        className={`bg-bg focus-within:ring-primary h-40 min-h-40 w-full rounded border border-gray-500 px-3 py-2 shadow-sm focus-within:ring-2 focus:outline-none ${className}`}
      />
    </div>
  );
}
