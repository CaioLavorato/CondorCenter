import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AppProvider } from "./context/app-provider";
import { initApp } from "./lib/capacitor";

// Inicializa a aplicação Capacitor (quando executado como app nativo)
document.addEventListener('DOMContentLoaded', () => {
  initApp().catch(console.error);
});

createRoot(document.getElementById("root")!).render(
  <AppProvider>
    <App />
  </AppProvider>
);
