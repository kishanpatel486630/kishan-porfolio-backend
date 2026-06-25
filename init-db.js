import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  personalInfo,
  navLinks,
  clientLogos,
  projects,
  caseStudies,
  skills,
  experience,
  education,
  stats,
} from "../client/src/data/portfolio.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const portfolioData = {
  personalInfo,
  navLinks,
  clientLogos,
  projects,
  caseStudies,
  skills,
  experience,
  education,
  stats,
};

fs.writeFileSync(
  path.join(dataDir, "portfolio.json"),
  JSON.stringify(portfolioData, null, 2),
  "utf8"
);

console.log("✅ server/data/portfolio.json initialized successfully!");
