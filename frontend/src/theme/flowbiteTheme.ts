import { createTheme } from "flowbite-react";

export const flowbiteTheme = createTheme({
  modal: {
    root: {
      show: {
        on: "flex bg-black/65",
      },
    },
  },
  checkbox: {
    color: {
      default: "text-cyan-600 focus:ring-cyan-600",
    },
  },
  textInput: {
    field: {
      input: {
        colors: {
          gray: "border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500",
        },
      },
    },
  },
  textarea: {
    colors: {
      gray: "border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500",
    },
  },
  select: {
    field: {
      select: {
        colors: {
          gray: "border-gray-300 bg-gray-50 text-gray-900 focus:border-cyan-500 focus:ring-cyan-500",
        },
      },
    },
  },
});
