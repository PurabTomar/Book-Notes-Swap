/**
 * generate-subject-covers.mjs
 *
 * Systematic, topic-relatable cover generator.
 * Every subject heading in the catalog gets its own cover:
 *   - the actual subject name inside the safe-zone band (y 450-560),
 *   - a topic glyph drawn on a subject hue,
 *   - so a card visually "relates to" the heading/topic it represents.
 *
 * Run:  node scripts/generate-subject-covers.mjs
 * Out:  public/images/subjects/<slug>.svg  (800x600)
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "images", "subjects");

const GLYPHS = {
  atom: `<circle cx="50" cy="50" r="14" fill="#fff"/>
         <ellipse cx="50" cy="50" rx="42" ry="16" fill="none" stroke="#fff" stroke-width="7"/>
         <ellipse cx="50" cy="50" rx="42" ry="16" fill="none" stroke="#fff" stroke-width="7" transform="rotate(60 50 50)"/>
         <ellipse cx="50" cy="50" rx="42" ry="16" fill="none" stroke="#fff" stroke-width="7" transform="rotate(-60 50 50)"/>`,
  flask: `<path d="M40 22h24M40 28v22l-14 24a6 6 0 0 0 5 9h34a6 6 0 0 0 5-9L56 50V28" fill="none" stroke="#fff" stroke-width="7" stroke-linejoin="round"/>
          <path d="M42 50h22" stroke="#fff" stroke-width="7"/><circle cx="50" cy="60" r="4" fill="#fff"/><circle cx="58" cy="72" r="4" fill="#fff"/>`,
  math: `<path d="M26 26v50M26 40h6M32 26v16h-6" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
         <path d="M44 26c7 12 15 20 22 26H44v24" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`,
  vector: `<g stroke="#fff" stroke-width="7" stroke-linecap="round"><line x1="18" y1="78" x2="82" y2="22"/><line x1="82" y1="22" x2="60" y2="22"/><line x1="82" y1="22" x2="82" y2="44"/></g>
           <circle cx="82" cy="22" r="10" fill="#fff"/>`,
  bolt: `<path d="M56 14 30 58h16l-6 30 30-46H54l8-28z" fill="#fff"/>`,
  wave: `<path d="M12 34c10-14 20-14 30 0s20 14 30 0 20-14 30 0M12 58c10-14 20-14 30 0s20 14 30 0 20-14 30 0" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`,
  chip: `<rect x="22" y="22" width="60" height="60" rx="8" fill="none" stroke="#fff" stroke-width="7"/>
         <g stroke="#fff" stroke-width="7" stroke-linecap="round"><path d="M36 82v14M52 82v14M68 82v14M22 52H8M22 68H8M82 52h14M82 68h14"/></g>
         <rect x="36" y="36" width="32" height="32" rx="4" fill="#fff"/>`,
  gear: `<circle cx="50" cy="50" r="20" fill="none" stroke="#fff" stroke-width="9"/>
         <g stroke="#fff" stroke-width="9" stroke-linecap="round"><line x1="50" y1="12" x2="50" y2="26"/><line x1="50" y1="62" x2="50" y2="88"/><line x1="12" y1="50" x2="26" y2="50"/><line x1="62" y1="50" x2="88" y2="50"/><line x1="23" y1="23" x2="33" y2="33"/><line x1="55" y1="55" x2="77" y2="77"/><line x1="23" y1="77" x2="33" y2="67"/><line x1="55" y1="45" x2="77" y2="23"/></g>`,
  flow: `<g stroke="#fff" stroke-width="7" stroke-linecap="round"><path d="M12 40c10-14 20-14 28 0s20 14 28 4 18-12 24-10"/></g>
         <path d="M86 26l6 8 8-12" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`,
  db: `<ellipse cx="50" cy="28" rx="34" ry="12" fill="none" stroke="#fff" stroke-width="7"/>
        <path d="M16 28v34c0 7 15 12 34 12s34-5 34-12V28M16 62v34c0 7 15 12 34 12s34-5 34-12V62" fill="none" stroke="#fff" stroke-width="7"/>`,
  code: `<path d="M28 30 12 50l16 20M72 30l16 20-16 20" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
         <path d="M58 24 42 76" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`,
  layers: `<path d="M16 44 50 28l34 16-34 16z" fill="none" stroke="#fff" stroke-width="7" stroke-linejoin="round"/>
           <path d="M16 60 50 44l34 16-34 16z" fill="none" stroke="#fff" stroke-width="7" stroke-linejoin="round"/>
           <path d="M16 76 50 60l34 16-34 16z" fill="none" stroke="#fff" stroke-width="7" stroke-linejoin="round"/>`,
  network: `<circle cx="30" cy="30" r="12" fill="#fff"/><circle cx="70" cy="30" r="12" fill="#fff"/><circle cx="50" cy="72" r="12" fill="#fff"/>
            <path d="M39 40 44 62M61 40l-6 22" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`,
  tree: `<path d="M50 78V40M50 40 26 62M50 40l30 16" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
         <circle cx="50" cy="30" r="9" fill="#fff"/><circle cx="26" cy="70" r="9" fill="#fff"/><circle cx="80" cy="64" r="9" fill="#fff"/>`,
  signal: `<path d="M14 84 30 50l12 8 16-38 13 22 15-28" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`,
  control: `<path d="M12 40c14-16 24-16 38 0" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
            <circle cx="72" cy="26" r="10" fill="#fff"/><circle cx="28" cy="72" r="10" fill="#fff"/>
            <path d="M78 32l20 30M24 82l24 0" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`,
  flame: `<path d="M50 14c0 12-20 16-20 40a22 22 0 0 0 44 0c0-8-4-14-8-20-2 6-6 8-6 8-4-10 2-24 2-24z" fill="#fff"/>`,
  lift: `<path d="M16 40c10-18 10-18 18 0s10 18 18 0M30 28v28" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
         <circle cx="66" cy="28" r="14" fill="none" stroke="#fff" stroke-width="6"/><path d="M80 88c0-12 16-14 16-26" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`,
  pillar: `<rect x="44" y="18" width="16" height="64" fill="#fff"/><rect x="30" y="14" width="44" height="8" fill="#fff"/><rect x="30" y="78" width="44" height="8" fill="#fff"/>`,
  strength: `<path d="M14 78 40 22l24 40 14-24 26 40" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
             <path d="M14 82h76" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`,
  motor: `<circle cx="50" cy="50" r="20" fill="#fff"/><path d="M50 12v16M50 72v16M12 50h16M72 50h16M24 24l12 12M64 64l12 12M24 76l12-12M64 36l12-12" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`,
  bulb: `<path d="M50 12a26 26 0 0 1 0 52M50 44l3 28M44 70h12" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
         <circle cx="50" cy="26" r="9" fill="#fff"/>`,
  mathIc: `<g stroke="#fff" stroke-width="7" stroke-linecap="round"><path d="M16 20h68M16 40h40M16 60h56M16 80h24"/></g>`,
  wb: `<rect x="18" y="24" width="64" height="56" rx="4" fill="none" stroke="#fff" stroke-width="7"/>
       <path d="M18 36h64M34 24v56" stroke="#fff" stroke-width="7"/>`,
  ai: `<path d="M30 80c10-20 16-30 16-44a16 16 0 0 1 32 0c0 8-4 14-8 20M50 46v14" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
       <circle cx="50" cy="36" r="12" fill="#fff"/>`,
  cpu: `<rect x="16" y="16" width="68" height="68" rx="8" fill="none" stroke="#fff" stroke-width="7"/>
        <g stroke="#fff" stroke-width="7" stroke-linecap="round"><path d="M30 84v12M50 84v12M70 84v12M16 34H4M16 54H4M84 34h12M84 54h12"/></g>
        <rect x="32" y="32" width="36" height="36" rx="5" fill="#fff"/>`,
  curve: `<path d="M14 70C34 70 40 26 60 26s20 44 34 44" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
          <path d="M14 64h76" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`,
};

function esc(t) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function cover(name, glyph, from, to) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#bg)"/>
  <rect x="0" y="0" width="800" height="600" fill="url(#bg)" opacity="0.35"/>
  <circle cx="120" cy="80" r="220" fill="#ffffff" opacity="0.05"/>
  <circle cx="700" cy="540" r="260" fill="#000000" opacity="0.06"/>
  <g transform="translate(400,285)" opacity="0.97">
    <g transform="translate(-60,-60) scale(1.20)">${glyph}</g>
  </g>
  <rect x="36" y="452" width="728" height="112" rx="18" fill="#000000" opacity="0.28"/>
  <text x="400" y="524" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="42" font-weight="bold">${esc(name)}</text>
</svg>
`;
}

const SUBJECTS = [
  ["Engineering Physics", "atom", "#0f2027", "#2c5364"],
  ["Engineering Chemistry", "flask", "#134e4a", "#0f766e"],
  ["Mathematics I", "math", "#1e3a8a", "#3b82f6"],
  ["Mathematics II", "math", "#312e81", "#6366f1"],
  ["Mathematics III", "math", "#37206f", "#8b5cf6"],
  ["Discrete Mathematics", "mathIc", "#4c1d95", "#a855f7"],
  ["Numerical Methods", "curve", "#155e75", "#06b6d4"],
  ["Programming for Problem Solving", "code", "#1b2735", "#3b82f6"],
  ["Computer Programming", "code", "#1b2735", "#0891b2"],
  ["Object Oriented Programming", "layers", "#4a044e", "#d946ef"],
  ["Data Structures", "tree", "#14532d", "#22c55e"],
  ["Engineering Graphics", "vector", "#78350f", "#f59e0b"],
  ["Basic Electrical Engineering", "bolt", "#7c2d12", "#f97316"],
  ["Basic Electronics", "chip", "#164e63", "#06b6d4"],
  ["Basic Electrical Engineering", "bolt", "#7c2d12", "#f97316"],
  ["Digital Logic Design", "chip", "#312e81", "#818cf8"],
  ["Computer Organization", "cpu", "#1e293b", "#64748b"],
  ["Operating Systems", "flow", "#064e3b", "#10b981"],
  ["Computer Networks", "network", "#0c4a6e", "#0ea5e9"],
  ["Database Management Systems", "db", "#1e3a8a", "#2563eb"],
  ["Web Technologies", "layers", "#1e1b4b", "#6366f1"],
  ["Software Engineering", "flow", "#164e63", "#0d9488"],
  ["Theory of Computation", "ai", "#1e1b4b", "#7c3aed"],
  ["Compiler Design", "code", "#1b2735", "#e11d48"],
  ["Machine Learning", "ai", "#3b0764", "#a855f7"],
  ["Artificial Intelligence", "ai", "#500724", "#db2777"],
  ["Internet of Things", "network", "#14532d", "#4ade80"],
  ["Signals and Systems", "signal", "#0c4a6e", "#38bdf8"],
  ["Communication Systems", "wave", "#7c2d12", "#f97316"],
  ["Control Systems", "control", "#92400e", "#fbbf24"],
  ["Thermodynamics", "flame", "#7f1d1d", "#ef4444"],
  ["Fluid Mechanics", "wave", "#082f49", "#0284c7"],
  ["Strength of Materials", "strength", "#7c2d12", "#fdba74"],
  ["Engineering Mechanics", "gear", "#3730a3", "#818cf8"],
  ["Electrical Machines", "motor", "#78350f", "#facc15"],
  ["Microprocessors", "cpu", "#1e293b", "#38bdf8"],
  ["Microcontrollers", "chip", "#134e4a", "#22d3ee"],
  ["Analog Electronics", "wave", "#5b21b6", "#a78bfa"],
  ["Engineering Materials", "pillar", "#44403c", "#a8a29e"],
  ["Analog Electronics", "wave", "#5b21b6", "#a78bfa"],
  ["Engineering Mechanics", "gear", "#3730a3", "#818cf8"],
];

mkdirSync(OUT, { recursive: true });
let n = 0;
for (const [name, glyph, from, to] of SUBJECTS) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  writeFileSync(join(OUT, `${slug}.svg`), cover(name, GLYPHS[glyph], from, to));
  n++;
}
console.log(`wrote ${n} covers -> ${OUT}`);
