import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import data from "./generated/portfolio-data.json";
import { ProfessionalLightApp } from "./App.js";

createRoot(document.getElementById("root")!).render(<StrictMode><ProfessionalLightApp data={data} /></StrictMode>);
