/* stylecheck.mjs — enforce the lesson prose style rules mechanically.
 *
 *   node stylecheck.mjs site/lessons/frc/pid-concept.html [...]
 *
 * Prose only: <pre> blocks, <script> blocks and HTML attributes are stripped
 * first, so code keeps its semicolons and its dashes.
 */
import { readFileSync } from "node:fs";

const BANNED = [
  [/—/g, "em dash"],
  [/–/g, "en dash"],
  [/;/g, "semicolon in prose"],
];

let bad = 0;

for (const file of process.argv.slice(2)) {
  const raw = readFileSync(file, "utf8");

  // Strip everything that is legitimately code or markup.
  const prose = raw
    .replace(/<pre[\s\S]*?<\/pre>/g, " ")
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<code[\s\S]*?<\/code>/g, " ")
    .replace(/<svg[\s\S]*?<\/svg>/g, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[a-zA-Z/][^>]*>/g, (tag) => {
      // Keep attribute text (data-explain, data-win…) — it is prose the student reads.
      const attrs = [...tag.matchAll(/(?:data-explain|data-win|data-lose|data-title|title|alt|content)="([^"]*)"/g)];
      return attrs.map((m) => " " + m[1] + " ").join("");
    })
    .replace(/&[a-z]+;/g, " ");   // entities are not semicolons in prose

  const hits = [];
  for (const [re, label] of BANNED) {
    const found = [...prose.matchAll(re)];
    if (found.length) hits.push(`${found.length} × ${label}`);
  }

  if (hits.length) {
    bad++;
    console.log(`✗ ${file}\n    ${hits.join("\n    ")}`);
    // Show a little context for each offence.
    for (const [re, label] of BANNED) {
      for (const m of prose.matchAll(re)) {
        const s = Math.max(0, m.index - 60);
        console.log(`      ${label}: …${prose.slice(s, m.index + 60).replace(/\s+/g, " ").trim()}…`);
      }
    }
  } else {
    console.log(`✓ ${file}`);
  }
}

process.exit(bad ? 1 : 0);
