import { useState, type ReactNode } from "react";

type SelectValue = string | number;

interface DropdownFormProps {
  items?: SelectValue[];
  onChange: (value: string) => void;
  label?: ReactNode;
  prefix?: ReactNode;
  postfix?: ReactNode;
  selected?: SelectValue;
  disabled?: boolean;
}

export default function DropdownForm({
  items = ["--pilih--"],
  onChange,
  label,
  prefix,
  postfix,
  selected,
  disabled = false,
}: DropdownFormProps) {
  const [internalValue, setInternalValue] = useState<SelectValue>(
    () => selected ?? items[0] ?? "",
  );
  const value = selected ?? internalValue;

  return (
    <div className="flex flex-col gap-2">
      {label && <span>{label}</span>}
      <div
        className={`flex w-fit items-center gap-2 rounded border border-gray-500 px-2 py-[9px] shadow-xs ${disabled ? "cursor-not-allowed" : ""}`}
      >
        {prefix && <span className="text-gray-400">{prefix}</span>}
        <select
          className={`bg-bg text-primary w-fit border-none p-0 focus:ring-0 focus:outline-hidden ${disabled ? "cursor-not-allowed" : ""}`}
          onChange={(event) => {
            if (selected === undefined) {
              setInternalValue(event.currentTarget.value);
            }
            onChange(event.currentTarget.value);
          }}
          value={value}
          disabled={disabled}
          required
        >
          {items.map((item) => (
            <option className="bg-bg py-11 shadow" value={item} key={item}>
              {item}
            </option>
          ))}
        </select>
        {postfix && <span className="text-gray-400">{postfix}</span>}
      </div>
    </div>
  );
}
