import React from "react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/main.scss";
import "tailwindcss/tailwind.css"
import { CosmWasmProvider } from "./context/CosmwasmContext";
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <CosmWasmProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </CosmWasmProvider>
  </React.StrictMode>
);
