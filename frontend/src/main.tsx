import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeInit } from "../.flowbite-react/init";
import App from "./App";
import "./index.css";
import { BrowserRouter as Router } from "react-router-dom";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ThemeInit />
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
);
