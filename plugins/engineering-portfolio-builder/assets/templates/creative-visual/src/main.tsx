import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import data from "./generated/portfolio-data.json";
import { CreativeVisualApp } from "./App.js";

createRoot(document.getElementById("root")!).render(<StrictMode><CreativeVisualApp data={data} /></StrictMode>);
