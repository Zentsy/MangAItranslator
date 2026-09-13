import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { APP_LOGO } from "./assets/logoBase64";
import "./index.css";
import App from "./App";

const favicon = document.querySelector<HTMLLinkElement>("link[rel*='icon']") || document.createElement("link");
favicon.type = "image/png";
favicon.rel = "shortcut icon";
favicon.href = APP_LOGO;
document.head.appendChild(favicon);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

