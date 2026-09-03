import React from "react";
import type { PortfolioData } from "../../shared/src/model.js";
import { PortfolioLayout } from "../../shared/src/components/PortfolioLayout.js";
import "../../shared/src/base.css";
import "./theme.css";

export function CreativeVisualApp({ data }: { data: PortfolioData }) {
  return <PortfolioLayout data={data} template="creative-visual" masthead={<div className="creative-orbit" aria-hidden="true"><b>STRUCTURE</b><i /><b>SIMULATION</b></div>} />;
}
