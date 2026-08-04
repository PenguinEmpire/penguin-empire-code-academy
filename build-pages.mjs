/* ============================================================================
   build-pages.mjs · produce a deployable copy of site/ for a sub-path host.

   The site is written with root-absolute URLs ("/assets/...", "/lessons/...")
   because that is what serve.mjs serves and what a root-domain host wants.
   GitHub Pages project sites live under "/<repo>/", so this rebuilds the tree
   into _site/ with every absolute URL prefixed.

     node build-pages.mjs                 -> base "", a straight copy
     node build-pages.mjs /my-repo        -> base "/my-repo"

   Nothing here touches site/ — the source stays host-agnostic.
   ========================================================================= */
import { cp, readFile, writeFile, rm, readdir } from "node:fs/promises";
import { join, extname } from "node:path";

const BASE = (process.argv[2] || process.env.SITE_BASE || "").replace(/\/$/, "");
const SRC = "site";
const OUT = "_site";

/* Absolute URLs in markup: href="/x" src="/x" — but not "//host" or "/". */
const ABS_ATTR = /((?:href|src)=")\/(?!\/)/g;

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

function rewriteHtml(src) {
  let out = src.replace(ABS_ATTR, `$1${BASE}/`);
  // Tell site.js where the site is mounted so manifest-driven links resolve.
  out = out.replace(
    /<script([^>]*\bsrc="[^"]*\/assets\/js\/course\.js")/,
    `<script>window.SITE_BASE=${JSON.stringify(BASE)};</script>\n  <script$1`
  );
  return out;
}

/* The JS files need no rewriting: every path they build goes through
   window.SITE_BASE, which the HTML sets. */

let n = 0;

await rm(OUT, { recursive: true, force: true });
await cp(SRC, OUT, { recursive: true });

for (const file of await walk(OUT)) {
  if (extname(file) !== ".html") continue;
  const src = await readFile(file, "utf8");
  const out = rewriteHtml(src);
  if (out !== src) {
    await writeFile(file, out);
    n++;
  }
}

console.log(`built ${OUT}/ with base ${BASE ? `"${BASE}"` : "(root)"} — ${n} html rewritten`);
