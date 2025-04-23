import { createRoot } from "react-dom/client";
import { PrimeReactProvider } from "primereact/api";

import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <PrimeReactProvider>
    <App />
  </PrimeReactProvider>
);
