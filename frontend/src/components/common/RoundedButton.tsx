import type { ButtonHTMLAttributes } from "react";

interface RoundedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  btnStroke?: boolean;
  name?: string;
}

export default function RoundedButton({
  btnStroke = false,
  className = "",
  name = "",
  type = "button",
  ...props
}: RoundedButtonProps) {
  const appearance = btnStroke
    ? "border-primary bg-transparent text-primary"
    : "border-primary bg-primary text-bg hover:bg-opacity-90";

  return (
    <button
      {...props}
      type={type}
      className={`outline-primary rounded-full border px-4 py-1 font-medium transition-all duration-75 hover:outline hover:outline-2 active:scale-95 ${appearance} ${className}`}
    >
      {name}
    </button>
  );
}
