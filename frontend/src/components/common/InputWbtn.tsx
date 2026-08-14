import { Icon } from "@iconify/react";
import { useState, type FocusEventHandler } from "react";

interface InputWithButtonProps {
  value?: string;
  onClick: (value: string) => void;
  onChange?: (value: string) => void;
  clearOnSubmit?: boolean;
  className?: string;
  type?: "text" | "search" | "email";
  placeholder?: string;
  ariaLabel?: string;
  buttonLabel?: string;
  onFocus?: FocusEventHandler<HTMLInputElement | HTMLButtonElement>;
  onBlur?: FocusEventHandler<HTMLInputElement | HTMLButtonElement>;
  required?: boolean;
  iconify: string;
}

export default function InputWbtn({
  value,
  onClick,
  onChange,
  clearOnSubmit = false,
  className = "",
  type = "text",
  placeholder,
  ariaLabel,
  buttonLabel = "Kirim",
  onFocus,
  onBlur,
  required,
  iconify,
}: InputWithButtonProps) {
  const [internalInput, setInternalInput] = useState("");
  const input = value ?? internalInput;

  const submit = () => {
    onClick(input);
    if (clearOnSubmit) {
      if (value === undefined) setInternalInput("");
      onChange?.("");
    }
  };

  return (
    <div
      className={`${className} bg-bg outline-primary flex h-10 min-w-40 items-center rounded-full outline outline-[1.5px] focus-within:outline-2 hover:outline-2`}
    >
      <input
        className="bg-bg h-10 w-full rounded-l-full pr-1 pl-4 outline-hidden"
        type={type}
        placeholder={placeholder}
        aria-label={ariaLabel}
        value={input}
        onChange={(event) => {
          const nextValue = event.currentTarget.value.trimStart();
          if (value === undefined) setInternalInput(nextValue);
          onChange?.(nextValue);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            submit();
          }
        }}
        onFocus={onFocus}
        onBlur={onBlur}
        required={required}
      />
      <button
        type="button"
        aria-label={buttonLabel}
        className="group bg-primary text-bg flex h-full w-14 items-center justify-center rounded-r-full"
        onClick={submit}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <Icon
          icon={iconify}
          className="text-[18px] transition-all group-hover:text-[20px] group-active:text-[18px]"
        />
      </button>
    </div>
  );
}
