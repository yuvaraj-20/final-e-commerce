// src/app/App.jsx
import { BrowserRouter } from "react-router-dom";
import AppProviders from "./AppProviders";
import AppRoutes from "../routes";

export default function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </BrowserRouter>
  );
}
