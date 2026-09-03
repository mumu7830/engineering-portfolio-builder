import React from "react";
import type { PortfolioData } from "../../shared/src/model.js";
import { PortfolioLayout } from "../../shared/src/components/PortfolioLayout.js";
import "../../shared/src/base.css";
import "./theme.css";

export function ProfessionalLightApp({ data }: { data: PortfolioData }) {
  return <PortfolioLayout data={data} template="professional-light" masthead={<p className="issue-line">Portfolio / Engineering Practice</p>} />;
}
