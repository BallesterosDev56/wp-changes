import React from "react";
import ReactDOM from "react-dom/client";
import "../index.wordpress.css";
import "../../translations/I18n";
import { DashboardApp } from "./Dashboard.wordpress";

const rootElement = document.getElementById("wizybot-dashboard-app");

if (rootElement) {
  rootElement.className = "tw-class";
  ReactDOM.createRoot(rootElement).render(<DashboardApp />);
}
