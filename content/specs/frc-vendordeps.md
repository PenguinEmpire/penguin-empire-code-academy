# frc-vendordeps · Vendor Libraries (installing REVLib)
unit: 2 · The Toolchain   |   duration: 15 min   |   difficulty: Beginner
interactivity: NO-COMPILER (`checklist` widget + predict-the-error + MCQ)

> Read `_shared-conventions.md` first. This lesson exists because the curriculum PDF omits it
> entirely — it comes from `content/source/frc-java-intro-notes.txt` §4. Mine that section
> hard; it is the only source for this page.

INTRODUCES:
- `vendor-library` — code a hardware vendor ships so their devices are usable from Java
- `vendordeps-json` — the per-project file that records which vendor libraries are installed
- `install-vendordep` — the WPILib "Manage Vendor Libraries" flow
- `revlib` — REV's library; where `SparkMax` and `MotorType` come from
- `phoenix-lib` — CTRE's library; where Kraken support comes from
- `removed-api` — classes disappear between seasons (the Jaguar story)
- `autocomplete-import` — typing `SparkMax` and letting the IDE add the import

ASSUMES:
- `wpilib-install`, `wpilib-w-menu`, `create-new-project`, `gradle-build` (`frc-wpilib-vscode`)
- `sparkmax`, `neo`, `kraken`, `vendor-docs-matching` (`frc-motors`)
- Java `import` and packages (Phase 1).

GOAL:
Install REVLib into a robot project and explain why `SparkMax` does not exist until you do.

HOOK: **The discontinued Jaguars** (`_shared-conventions.md` §6 story 6).
`callout--why`. The team sat down to program the ChairBot with the Jaguar motor controllers
they already had, wrote the import — and it wouldn't resolve. Jaguars had been
**discontinued and removed from current WPILib**. The class was simply gone. Not deprecated,
not renamed: gone.

That's the lesson in one incident. Two different things can make a class "not exist":
1. **It was removed** from the library (Jaguars — nothing you can do but change hardware or
   pin an old season's code).
2. **You haven't installed the library it lives in** (SparkMax — fixable in thirty seconds).

Both produce the same red squiggle, and telling them apart is the skill.

Epilogue worth keeping, it's a nice piece of real engineering: the team's actual ChairBot went
ahead using **last year's GitHub code**, which still had working Jaguar support, edited for the
new robot. The SparkMax version they built that night was for learning. Old code is a valid
answer to a removed API.

EXPLAIN:

1. **WPILib doesn't know what a SparkMax is.**
   Analogy: WPILib is the FRC standard library — RoboRIO, scheduler, math, the framework.
   REV, CTRE and Limelight are third parties. They each ship their own Java library, and it is
   **not** in your project until you put it there. This is exactly the dependency idea from
   Phase 1, just with a WPILib-specific installer instead of a build file you edit by hand.

2. **What "installing a vendordep" actually does.**
   It adds a small **JSON file** to your project's `vendordeps/` folder recording the library
   name, version, and where to fetch it. Gradle reads that on the next build and pulls the
   library down. Two consequences students must know:
   - It's **per project**. Installing REVLib in `ChairBot` does nothing for `PenguinBot`.
   - It's **version-pinned**. A project from last season pulls last season's REVLib — which is
     precisely why the same class can be `CANSparkMax` in one repo and `SparkMax` in another.
     (Direct callback to the season callout in the built `frc-moving-a-motor` lesson.)

3. **The flow.** From the intro notes:
   - Click the WPILib item at the **bottom-left** — "WPILib Vendor Dependencies."
   - Under **Available dependencies**, scroll to **REVLib** and install it.
   - Confirm it now appears under **installed** dependencies at the top.
   - Rebuild.
   Mark: [FROM INTRO NOTES page 3, §4]
   `[NEEDS RESEARCH: the 2026 vendor-dependency UI — command name, whether it's still the
   bottom-left item or has moved into the W palette, and whether offline install / URL install
   is still needed. Also the current REVLib and Phoenix vendordep names. Do NOT print a
   vendordep URL or version in the lesson until content/research/toolchain-2026.md lands.]`
   Until then, describe the flow in prose + `callout--season`, and put the *concept* (a JSON
   file per library, per project) in the permanent part of the page.

4. **Then the import writes itself.**
   Once REVLib is in, type `SparkMax`, take the autocomplete, and **the import is added for
   you**. Same for `MotorType` — and if it doesn't auto-import, retype `Mo…` and pick
   `MotorType` from the list. This tiny detail is in the source because it genuinely trips
   people up.
   Mark: [FROM INTRO NOTES page 3]

5. **Diagnosing "cannot resolve symbol".** The transferable checklist:

| Symptom | Cause | Fix |
|---|---|---|
| `SparkMax` unresolved, REVLib not in the vendordeps list | Library not installed | Install REVLib, rebuild |
| Unresolved right after installing | Gradle hasn't rebuilt | Rebuild; wait for `BUILD SUCCESSFUL` |
| Resolves in one project, not another | Vendordeps are per project | Install it there too |
| The class exists in old code but not yours | Renamed or removed between seasons | Check the vendor's docs for the current name |
| The class exists nowhere in current docs | **Removed** (the Jaguar case) | Change hardware, or reuse an older season's project |

CODE:
```java
// [FROM PDF page 8 verified box] — these two lines only compile AFTER REVLib is installed
import com.revrobotics.spark.SparkMax;
import com.revrobotics.spark.SparkLowLevel.MotorType;

SparkMax leftMotor1 = new SparkMax(2, MotorType.kBrushless);
```
Annotate lines 2–3: **the package name is `com.revrobotics`, not `edu.wpi.first`** — that
prefix is how you tell a vendor class from a WPILib class at a glance. Make that an explicit
teaching point; it's a genuinely useful reading skill.

Contrast block (prose, not a compilable sample):
```
edu.wpi.first.…        ← WPILib. Ships with the project.
com.revrobotics.…      ← REV. Needs REVLib installed.
com.ctre.phoenix6.…    ← CTRE. Needs the Phoenix vendordep installed.
```
Mark: [NEEDS RESEARCH: confirm the current CTRE package root for 2026 — shown here as an
illustration of the *shape* only; do not present as verified until the factsheet confirms it.]

The Jaguar import as a **broken** example (this one is allowed to be wrong — that's the point):
```java
// [FROM INTRO NOTES page 3] — this will not resolve. The class was removed.
import edu.wpi.first.wpilibj.motorcontrol.Jaguar;
```
Mark: [FROM INTRO NOTES, paraphrased — the notes give the path as
`edu.wpi.first...motorcontrol.Jaguar`]. Show it in a `callout--pitfall`, clearly labelled as
code that does **not** work, so nobody copies it.

SANDBOX: none — NO-COMPILER lesson. Installing a dependency into a Gradle project cannot be
faked in a browser, and pretending otherwise would teach a false workflow.

Interactive load: the `checklist` widget (requested in `frc-game-tools`) for the install steps,
plus the challenges below. This is a short lesson by design — 15 minutes, one idea.

CHALLENGES:

1. **Predict the error** — `data-kind="text"`. Show:
   ```java
   SparkMax roller = new SparkMax(2, MotorType.kBrushless);
   ```
   "You typed this into a brand-new project and both class names are underlined in red. In a
   few words, what's missing?"
   `data-answer="revlib|rev lib|the rev library|vendordep|the vendor library|revlib isn't installed|rev library"`
   Win: "REVLib. `SparkMax` isn't part of WPILib — it arrives with REV's vendor library, per
   project."
   Lose: "Nothing's wrong with the code. `SparkMax` lives in REVLib, which isn't installed in
   this project yet."

2. **MCQ · which of these is a WPILib class?** Show four import lines:
   - a) `com.revrobotics.spark.SparkMax` — "`com.revrobotics` is REV's package; a vendor class."
   - b) ✓ **`edu.wpi.first.math.controller.PIDController`** — "Yes — `edu.wpi.first` is
     WPILib's package root. No vendordep needed."
   - c) `com.ctre.phoenix6.…` — "`com.ctre` is CTRE; a vendor class."
   - d) `com.revrobotics.RelativeEncoder` — "Still REV."
   (Teaching point in the win text: read the package root first.)

3. **MCQ · two kinds of missing** — "Your import won't resolve. Which of these means the class
   is gone for good, not just uninstalled?"
   - a) The library isn't in `vendordeps/` — "That's the fixable kind: install it."
   - b) You haven't rebuilt since installing — "Also fixable: rebuild."
   - c) ✓ **The class doesn't appear anywhere in the vendor's current documentation** — "Right.
     That's the Jaguar case — removed from the library entirely."
   - d) You typed the class name in lowercase — "That's a typo, and the IDE will suggest the
     fix."

4. **Fill-in-the-blank** — `data-kind="fib"`:
   `Vendor libraries are installed ` blank(`data-answer="per project|per-project|by project"`)
   `, recorded in a ` blank(`data-answer="json|JSON|json file|vendordep"`) ` file, and pinned to
   a ` blank(`data-answer="version|season|specific version"`) `.`
   Win: "Those three facts explain why the same class has different names in two of your team's
   repos."
   Lose: "Per project, recorded as a JSON file in `vendordeps/`, pinned to a version — that's
   why an old repo still compiles against an old API."

MISCONCEPTIONS:
- *"SparkMax is part of WPILib."*
  → "It's REV's class, from REV's library. WPILib knows nothing about SparkMaxes until you
  install REVLib."
- *"I installed REVLib last time, so it's there."*
  → "Vendordeps are per project. Every new project starts empty."
- *"The red squiggle means I typed it wrong."*
  → "Check whether the library is installed before you doubt your spelling — and check the
  package root: `com.revrobotics` versus `edu.wpi.first`."
- *"If it worked in last year's code it'll work in mine."*
  → "Last year's project pins last year's library. Class names change and classes get removed —
  `CANSparkMax` became `SparkMax`, and Jaguar support disappeared altogether."
- *"Installing a vendordep downloads it into my code folder to edit."*
  → "It writes a small JSON record; Gradle fetches the library at build time. You never edit
  vendor code."

EXERCISE: **Make `SparkMax` resolve in PenguinBot.**
*Where we are:* you created the `PenguinBot` project last lesson and it builds clean. It cannot
talk to a single REV motor yet.

Task:
1. Open `PenguinBot`. In `RobotContainer.java`, type `SparkMax` somewhere temporary. Confirm
   it does **not** resolve. (Look at the failure first — that's the point.)
2. Open WPILib Vendor Dependencies and install **REVLib**.
3. Confirm REVLib now appears in the installed list, and that a new file has appeared in the
   project's `vendordeps/` folder. Open it and read it — it's short.
4. Rebuild. Retype `SparkMax`, take the autocomplete, and confirm the import appears at the top
   of the file by itself.
5. Delete your temporary line. Build again — clean.

**Reference solution / expected result** (`details.reveal`):
> Before: `SparkMax` is red — "cannot be resolved to a type."
> After installing REVLib and rebuilding: the same word autocompletes, and this line appears at
> the top of the file without you typing it:
> ```java
> import com.revrobotics.spark.SparkMax;
> ```
> The `vendordeps/` folder now contains a JSON file naming the library, its version, and where
> Gradle fetches it from. That file is what makes the difference — it's the entire installation.
>
> You deleted the test line on purpose. PenguinBot's motors get created inside a **subsystem**,
> not in `RobotContainer` — Unit 3 shows you where things belong, and Unit 4 writes the real one.

Tease: "Next: the desktop apps that talk to those motors directly — where you set the CAN IDs
your code is about to depend on."

CHECKPOINT: (4 questions, every option explained)

**Q1.** Why doesn't `SparkMax` exist in a brand-new WPILib project?
- a) You need to import it — "You can't import a class that isn't in the project."
- b) ✓ **It's in REV's vendor library, which isn't installed yet** — "Correct — install REVLib
  and it appears."
- c) It only exists when a real SparkMax is connected — "Code doesn't know what's plugged in."
- d) It was removed from WPILib — "That's the Jaguar story, a different case."

**Q2.** Where is the record of an installed vendor library kept?
- a) In `Constants.java` — "That's for your tunable numbers."
- b) ✓ **A JSON file in the project's `vendordeps/` folder** — "Yes, and Gradle reads it at
  build time."
- c) In a global WPILib setting — "It's per project, which is why each new project starts empty."
- d) Inside `Robot.java` — "Nothing about dependencies lives there."

**Q3.** Reading `com.revrobotics.spark.SparkMax`, how do you know it's a vendor class?
- a) It ends in `Max` — "Naming tells you nothing reliable."
- b) It's in `subsystems/` — "That's your folder, not a package root."
- c) ✓ **The package root is `com.revrobotics`, not `edu.wpi.first`** — "Exactly — that prefix
  is the tell, every time."
- d) It takes a CAN ID — "Plenty of WPILib classes take device numbers."

**Q4.** An import worked in last season's repo and fails in yours. Most likely?
- a) Your Java version is wrong — "WPILib brings its own JDK; that's rarely it."
- b) ✓ **The two projects pin different vendor library versions, and the class was renamed or
  removed** — "Right — `CANSparkMax` → `SparkMax` is the live example, and Jaguar is the
  removed one."
- c) You need to enable the robot — "Compilation happens long before the robot is involved."
- d) Old code is always broken — "It compiles fine against the library it pins."

SEASON-FLAGS:
- **The entire install flow** goes in `callout--season`. UI location, command name, the
  available-dependencies list, and REVLib's version all move yearly.
- **Class names**: `SparkMax` vs `CANSparkMax`, and the `com.revrobotics.spark.*` package
  layout. Cross-link the identical season callout in the built `frc-moving-a-motor` lesson so
  the two pages agree.
- `[NEEDS RESEARCH: 2026 vendordep manager UI + current REVLib / Phoenix vendordep names and
  package roots — content/research/toolchain-2026.md]`
- The Jaguar removal is now a *historical* fact and safe to state as history.

WIDGET-REQUEST: none new. Uses `checklist` (requested in `frc-game-tools`), with a plain
`<ol class="task-list">` fallback.
