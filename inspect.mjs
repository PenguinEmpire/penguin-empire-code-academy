import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
const CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
// See shot.mjs — repo-relative by default, override with SHOT_DIR.
const OUT = process.env.SHOT_DIR || join(process.cwd(), ".shots");
mkdirSync(OUT, { recursive: true });
const url=process.argv[2], label=process.argv[3], sel=process.argv[4];
const b=await puppeteer.launch({executablePath:CHROME,headless:"new",args:["--no-sandbox","--force-color-profile=srgb"]});
const p=await b.newPage();
await p.setViewport({width:1440,height:1000,deviceScaleFactor:2});
await p.goto(url,{waitUntil:"networkidle2",timeout:60000}).catch(()=>{});
await new Promise(r=>setTimeout(r,1400));
if(sel){ const el=await p.$(sel); if(el){ await el.screenshot({path:`${OUT}/${label}.png`}); console.log("el shot",label); } else {console.log("NO SEL",sel);} }
else { await p.screenshot({path:`${OUT}/${label}.png`}); console.log("viewport",label); }
await b.close();
