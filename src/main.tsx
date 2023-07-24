import React from "react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/main.scss";
import "tailwindcss/tailwind.css"
import { SigningCosmWasmProvider } from "./context/CosmwasmContext";
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <SigningCosmWasmProvider>
        <App />
      </SigningCosmWasmProvider>
    </BrowserRouter>
  </React.StrictMode>
);
