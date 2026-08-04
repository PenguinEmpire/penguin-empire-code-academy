# Penguin Empire 2551 · Code Academy

An interactive tutorial website that takes a new FRC Team 2551 programmer from **zero coding
experience** to **programming a competition robot** in Java + WPILib.

Every season, a rookie shows up wanting to write robot code and gets handed a 40-page PDF and
a "just read the WPILib docs." This is the replacement: a sequenced, 68-lesson curriculum where
you write and run real Java in the browser on the very first page, and end up shipping a swerve
drivetrain with vision-assisted autonomous.

**Status:** 47 of 68 lessons written and live. Both phases are fully outlined; the remaining
lessons are drafted as specs and render as "coming soon" in the sidebar.

---

## The curriculum

**Phase 1 · Java & Object-Oriented Programming** — 6 units, no robot yet. Starts at
"what even is a variable" and ends with interfaces, polymorphism, and a multi-stage capstone
project. This exists because most FRC programming tutorials assume Java you don't have.

| Unit | |
|---|---|
| J1 | Getting Started — first program, variables, operators, strings, reading errors |
| J2 | Logic & Flow — booleans, if/else, switch, loops, nested loops |
| J3 | Methods — parameters, return values, scope, overloading |
| J4 | Data Structures — arrays, 2D arrays, ArrayList, exceptions & null |
| J5 | Object-Oriented Programming — classes, fields, encapsulation, inheritance, interfaces, enums, lambdas |
| J6 | Capstone — a four-stage project built up across the whole phase |

**Phase 2 · FRC Robot Programming** — 13 units, real hardware. What the roboRIO/radio/CAN bus
actually are, the WPILib toolchain, project anatomy, motors, encoders, PID, the command-based
framework, swerve, Limelight vision, autonomous routines, and game day.

---

## What makes it more than a pile of HTML

The lessons are interactive, not just prose. Everything below is a custom widget in
[widgets.js](site/assets/js/widgets.js) — no framework, no dependencies:

- **A live Java compiler.** Code blocks marked `data-compiler` run real Java against
  OneCompiler and print real output, including real compiler errors. Robot-shaped lessons add
  `data-sim`, which prepends **PenguinSim** — a small fake-WPILib shim
  ([penguinsim.java.txt](site/assets/js/sim/penguinsim.java.txt)) so `TalonFX`, `CANSparkMax`,
  and `XboxController` code compiles and behaves plausibly without a robot on the bench.
- **Signal path diagram** — click any part of the battery → breaker → PDP → motor controller →
  motor chain to learn what it does; cut a wire and everything downstream goes dark.
- **Driver Station trainer** — you're shown three status lights and have to diagnose the fault.
- **CAN ID assigner** — hands you a device list and catches duplicates, reserved IDs, and
  out-of-range values, which is the single most common rookie wiring mistake.
- **File tree explorer**, drag-to-order, match-pairs, fill-in-the-blank code, predict-the-output,
  multiple choice, and scored end-of-unit checkpoints.
- **Progress tracking** in localStorage, so the sidebar and syllabus remember where you were.

Lessons also carry "war story" callouts — `--pitfall`, `--season`, `--verified` — for the
things that only get learned by losing a match to them.

---

## Tech

Deliberately a **static site**: plain HTML, CSS, and vanilla JS. No build step, no framework,
no npm install to read a lesson. That's a design decision, not laziness — this has to be
maintainable by the next student who inherits it, and "learn React first" would kill it.

- ~3,000 lines of hand-written CSS/JS across 5 stylesheets and 3 scripts
- Design tokens + the team's real brand colors and logo in [brand.css](site/assets/css/brand.css)
- Mobile-first; every lesson is checked for horizontal overflow at 390 px
- One manifest file drives the sidebar, syllabus, progress %, and prev/next links

Node is used only for local tooling (dev server, screenshots, QA), never to build the site.

### QA gates

Two Puppeteer harnesses run against every live lesson before a batch ships:

```bash
node audit.mjs    # markup contract, broken links, console errors, 390px overflow
node smoke.mjs    # clicks every "Check" button with right AND wrong answers
```

---

## Running it locally

Needs [Node.js](https://nodejs.org) — only for the dev server and QA tools.

```bash
npm install       # only if you want to run audit.mjs / smoke.mjs
node serve.mjs    # → http://localhost:4321
```

There is nothing to build. To deploy, upload the contents of `site/` to any static host.

---

## Layout

```
site/                           ← everything that gets deployed
  index.html                    ← landing page
  syllabus.html                 ← full curriculum, rendered from the manifest
  lessons/java/*.html           ← Phase 1
  lessons/frc/*.html            ← Phase 2
  assets/css/  brand.css        ← design tokens, colors, fonts, buttons
               layout.css       ← header / sidebar / footer shell
               lesson.css       ← reading view + every interactive widget
               pages.css        ← landing + syllabus
               hero.css         ← landing hero
  assets/js/   course.js        ← THE CURRICULUM MANIFEST (single source of truth)
               site.js          ← header/sidebar/footer, progress tracking
               widgets.js       ← all interactive widgets
               sim/             ← PenguinSim fake-WPILib shim
content/                        ← authoring material (not deployed)
  source/                       ← extracted text of 2551's onboarding curriculum
  specs/                        ← one spec per lesson, written before the page
  research/                     ← verified notes on hardware + PID behavior
serve.mjs  audit.mjs  smoke.mjs  shot.mjs  inspect.mjs   ← dev tooling
```

### The course manifest (`site/assets/js/course.js`)

This one file defines every track, unit, and lesson. **To add a lesson:** add it to the
manifest, then set `ready: true` with an `href` once the page exists.

```js
{ id: "j-variables", t: "Variables & Data Types",
  ready: true, href: "/lessons/java/variables", dur: "20 min" }
```

---

## Adding a new lesson page

1. Write the spec in `content/specs/` first — it's what keeps the technical claims honest.
2. Copy an existing lesson (e.g. [first-program.html](site/lessons/java/first-program.html)).
3. Set `<body data-page="lesson" data-lesson="THE-ID-FROM-THE-MANIFEST">`.
4. Build the content out of the blocks below.
5. Flip that lesson to `ready: true` in `course.js`.
6. Run `node audit.mjs` and `node smoke.mjs` — both must be green.

### Interactive building blocks

Just write the HTML; `widgets.js` finds and wires it up.

| Block | What it is |
|-------|-----------|
| `<div class="sandbox" data-compiler>` + `<script type="text/x-java" class="sb-src">` | **Live Java compiler** (runs real code via OneCompiler) |
| `<div class="sandbox" data-compiler data-sim>` | Same, with **PenguinSim** prepended so robot-shaped code runs |
| `<div class="challenge" data-kind="fib">` with `<span class="blank" data-answer="...">` | Fill-in-the-blank code |
| `<div class="challenge" data-kind="text">` with `<input class="answer-input" data-answer="a\|b">` | Predict-the-output / short answer |
| `<div class="challenge" data-kind="mcq">` with `<label class="option" data-correct>` | Multiple choice |
| `<div class="challenge" data-kind="match">` with `.match-item[data-match]` / `[data-key]` | Match pairs (several left items may share one right key) |
| `<div class="checkpoint">` with several `.cp-q` | Scored end-of-lesson quiz |
| `<div class="sigpath">` with `.sp-node` / `.sp-wire` | **Signal path** — click a part to explain it, cut a wire and downstream goes dark |
| `<div class="dspanel">` with `.ds-case` | **Driver Station trainer** — read the three lights, name the fault |
| `<div class="canid" data-reserved="0,1">` with `.ci-row` | **CAN ID assigner** — checks duplicates, reserved IDs, 0–63 range |
| `<div class="ftree">` with `.ft-row` | **File tree** — click a file to see what belongs in it |
| `<ol class="checklist" data-key="...">` | Install checklist whose ticks persist in localStorage |
| `<ul class="order-list">` with `.order-item[data-pos]` | Drag-to-order |
| `<details class="reveal">` | Hint / reveal-solution accordion |
| `.callout--why / --verified / --pitfall / --season / --tip / --note` | War-story & syntax sidebars |
| `.code` / `.code.with-lines` | Syntax-highlighted code block with copy button |
| `<div class="tablewrap"><table class="data">` | Comparison table that scrolls itself, not the page |

> **Code-sample convention:** use `//` line comments, not `/* */` block comments, inside
> `.code.with-lines` — the line numbering relies on single-line tokens.

---

## Content sources

Lessons are built from Team 2551's own onboarding curriculum and verified against the official
[WPILib](https://docs.wpilib.org/), [REV](https://docs.revrobotics.com/),
[CTRE/Phoenix](https://pro.docs.ctr-electronics.com/), [Limelight](https://docs.limelightvision.io/),
and [PathPlanner](https://pathplanner.dev/) docs. WPILib changes every year — anything
season-specific is flagged **"verify for current season"** rather than silently going stale.

---

Built for **FRC Team 2551 · Penguin Empire Robotics**.
