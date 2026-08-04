// Full-page screenshots via the system Chrome (no browser download).
// Usage: node shot.mjs <url> <label> [width] [mobile]
//   node shot.mjs http://localhost:4321/ home 1440
//   node shot.mjs http://localhost:4321/ home-mobile 390 mobile
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
// Repo-relative by default so screenshots always land somewhere that exists.
// Override with SHOT_DIR=/some/path when you want them elsewhere.
const OUT = process.env.SHOT_DIR || join(process.cwd(), ".shots");
mkdirSync(OUT, { recursive: true });

const [url, label = "shot", width = "1440", mobile = ""] = process.argv.slice(2);
const w = parseInt(width, 10);

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--hide-scrollbars", "--force-color-profile=srgb"],
});
const page = await browser.newPage();
await page.setViewport({ width: w, height: 900, deviceScaleFactor: mobile ? 2 : 1, isMobile: !!mobile });
await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 }).catch(() => {});
await new Promise((r) => setTimeout(r, 600));
const path = `${OUT}/${label}.png`;
await page.screenshot({ path, fullPage: true });
console.log("saved", path);
await browser.close();
