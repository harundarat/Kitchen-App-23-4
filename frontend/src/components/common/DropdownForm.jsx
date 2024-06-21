import React, { useEffect, useState } from "react";
import { Label, Select } from "flowbite-react";
// import {
//   Label,
//   Listbox,
//   ListboxButton,
//   ListboxOption,
//   ListboxOptions,
//   Transition,
// } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

const DropdownForm = ({
  items = ["null"],
  onChange,
  label,
  prefix,
  postfix,
  width,
  setSelect,
  selected,
  top,
  disabled,
}) => {
  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }
  const [value, setValue] = useState(items[0]);
  useEffect(() => {
    setValue(selected || items[0]);
  }, [selected]);

  const handleChange = (e) => {
    onChange(e.target.value);
    setValue(e.target.value);
  };

  return (
    <div className="flex flex-col gap-2">
      <h1>{label}</h1>
      <div
        className={`flex w-fit items-center gap-2 rounded border border-gray-500 px-2 py-[9px] shadow-sm ${disabled ? "cursor-not-allowed" : ""}`}
      >
        {prefix && <span className="text-gray-400">{prefix}</span>}
        <select
          className={`w-fit border-none bg-bg p-0 text-primary focus:outline-none focus:ring-0${disabled ? "cursor-not-allowed" : ""}`}
          onChange={handleChange}
          value={value}
          disabled={disabled}
          required
        >
          {items.map((item, index) => (
            <option className="bg-bg py-11 shadow" value={item} key={index}>
              {item}
            </option>
          ))}
        </select>
        {postfix && <span className="text-gray-400">{postfix}</span>}
      </div>
    </div>
  );
};

export default DropdownForm;
