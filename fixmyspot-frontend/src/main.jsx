import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ReportsProvider } from "./context/ReportsContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ReportsProvider>
          <App />
        </ReportsProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
