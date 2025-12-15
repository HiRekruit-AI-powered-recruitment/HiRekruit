import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import TagManager from "react-gtm-module";
import { AuthProvider } from "./Context/AuthContext";

const gtmId = import.meta.env.VITE_GTM_ID;

// GTM config
if (gtmId) {
  TagManager.initialize({ gtmId });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
