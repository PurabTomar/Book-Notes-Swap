import { readFileSync, writeFileSync } from "node:fs";

const file = process.argv[2];
let src = readFileSync(file, "utf8");

function removeSecondOccurrence(re, label) {
  const matches = [...src.matchAll(re)];
  if (matches.length > 1) {
    const dupe = matches[1];
    src = src.slice(0, dupe.index) + src.slice(dupe.index + dupe[0].length);
    console.log("removed second " + label);
  } else if (matches.length === 1) {
    console.log(label + ": exactly 1 occurrence (ok)");
  } else {
    console.log(label + ": 0 occurrences (ok)");
  }
}

removeSecondOccurrence(/^import AskAiPage from "\.\/pages\/AskAiPage\.jsx";[ \t]*\r?\n/gm, "AskAiPage import");
removeSecondOccurrence(/<Route path="\/ask" element={<AskAiPage \/>} \/>/g, "AskAiPage route");

const navRe = /<NavLink to="\/ask"[^>]*>[\s\S]*?<\/NavLink>/g;
removeSecondOccurrence(navRe, "Ask AI nav link");

writeFileSync(file, src);
console.log("wrote " + file);
