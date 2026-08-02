import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeInit } from "../.flowbite-react/init";
import { ThemeProvider } from "flowbite-react";
import App from "./App";
import "./index.css";
import { flowbiteTheme } from "./theme/flowbiteTheme";
import { BrowserRouter as Router } from "react-router-dom";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ThemeInit />
    <ThemeProvider theme={flowbiteTheme}>
      <Router>
        <App />
      </Router>
    </ThemeProvider>
  </React.StrictMode>,
);
