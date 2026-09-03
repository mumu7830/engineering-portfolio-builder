import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import data from "./generated/portfolio-data.json";
import { TechDarkApp } from "./App.js";

createRoot(document.getElementById("root")!).render(<StrictMode><TechDarkApp data={data} /></StrictMode>);
