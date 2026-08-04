# frc-src-tree · The src Tree
unit: 3 · Project Anatomy   |   duration: 20 min   |   difficulty: Beginner
interactivity: NO-COMPILER (**file-tree** widget + drag-to-order + fill-in-blank + MCQ)

> Read `_shared-conventions.md` first. The source calls Unit 3 "the single most important
> conceptual lesson — everything later hangs on it." Treat this page and `frc-chain-of-command`
> as the hinge of the whole track.

INTRODUCES:
- `src-tree` — the only folder you usually touch, and its shape
- `robot-java-file` — lifecycle/modes; mostly leave alone
- `robotcontainer-file` — bindings + autonomous; the most important file
- `constants-file` — every tunable number in one place
- `subsystems-folder` — one file per mechanism; the only place motors are touched
- `commands-folder` — behaviours with a defined end
- `gradle-ignore` — build files you can safely not understand yet
- `class-vs-filename` — a Java class must match its file name

ASSUMES:
- `create-new-project`, `project-templates`, `gradle-build` (`frc-wpilib-vscode`)
- Java packages, classes, files (Phase 1 — link to `j-classes-objects`)
- Everything from Unit 2. Nothing from Unit 4 onward.

GOAL:
Open a brand-new command-based project and say, for any file, what belongs in it and whether
you should be editing it.

HOOK: **The duplicated `ExampleSubsystem`** (`_shared-conventions.md` §6 story 10).
`callout--why`. The standard way to make your first subsystem is to copy `ExampleSubsystem`
and rename it. The team did exactly that on the ChairBot, renamed the *file* to
`DrivetrainSubsystem.java`, and the editor filled with red squiggles — because the **class
inside** still said `ExampleSubsystem`, and in Java a public class must match its file name.

The detail the source adds, and it's the humanising one: **on some laptops VS Code's rename
extension fixed it automatically, and on the older laptops it didn't.** The same instructions
produced two different experiences in the same room. Nobody's fault, and the fix was thirty
seconds once someone said it out loud.

Payoff sentence: **red means it won't compile; yellow is a warning you can usually ignore for
now.** New members treat both as catastrophes.

EXPLAIN:

1. **Almost none of this project is yours.** A generated project has dozens of files. You will
   routinely touch **six things**. Say that before showing the tree, so it reads as
   reassurance instead of a wall.

2. **The tree.** Use a `.diagram` block, adapted from the source (ASCII redrawn cleanly):

```
PenguinBot/
├── build.gradle          ← build config. Ignore unless you know why.
├── vendordeps/           ← installed vendor libraries (Unit 2)
└── src/main/java/frc/robot/
    ├── Main.java             ← starts the program. Never touch.
    ├── Robot.java            ← robot lifecycle / modes. Mostly leave alone.  → Unit 8
    ├── RobotContainer.java   ← bindings + autonomous. MOST important.        → Unit 8
    ├── Constants.java        ← all your tunable numbers in one place.        → Unit 7
    ├── subsystems/           ← one file per mechanism; talks to motors.      → Unit 7
    └── commands/             ← tells subsystems what to do; has an end.      → Unit 7
```
   Mark: [FROM PDF page 7, §3.1] + [FROM INTRO NOTES page 2, project structure table]
   Note the source's own navigation phrasing — `src → main → java → frc → robot` — and the
   instruction to **ignore everything else unless you're doing advanced/low-level work.**

3. **File by file, with the "should I edit this?" verdict.** This table is the page's core
   artifact:

| File / folder | What it's for | Do you edit it? | Owned by |
|---|---|---|---|
| `Main.java` | Entry point that starts the robot program | **No.** Ever. | — |
| `Robot.java` | Mode lifecycle: robotInit/Periodic, teleop, autonomous, test | **Rarely** — the team edited `testInit` once | `frc-robot-java` |
| `RobotContainer.java` | Controller bindings, subsystem instances, autonomous setup | **Constantly** | `frc-robotcontainer` |
| `Constants.java` | Ports, CAN IDs, speeds, setpoints, gains | **Constantly** | `frc-constants` |
| `subsystems/` | One class per mechanism; owns the motors | **Constantly** | `frc-subsystems` |
| `commands/` | One class per behaviour that has an end | **Often** | `frc-command-lifecycle` |
| `build.gradle`, `gradlew`, `.wpilib/` | Build machinery | **No** | — |
| `vendordeps/` | Vendor library records | Only via the installer | `frc-vendordeps` |

   Beat, from the intro notes and worth stating plainly: for a *simple* project you don't even
   need `commands/` — subsystems plus `RobotContainer` can do everything. Commands earn their
   place when behaviours need to be sequenced. That's honest, it lowers the barrier, and it
   sets up `frc-chain-of-command` to answer "so why bother?"

4. **One file per mechanism, one class per file.** The naming convention the whole team relies
   on: `ArmSubsystem.java` contains `public class ArmSubsystem`. Two rules follow:
   - Renaming a file means renaming the class inside it (the hook).
   - The `subsystems/` folder should read like a parts list of the robot. If you can't tell
     what the robot does from the folder listing, the names are wrong.

5. **Where PenguinBot's code will live.** Make it concrete and forward-looking — this is the
   map the student will fill in over the next five units:

```
subsystems/
    IntakeSubsystem.java     ← Unit 7 (the Intake class from Unit 4, promoted)
    ArmSubsystem.java        ← Unit 7
    DriveSubsystem.java      ← Unit 9
    LimelightSubsystem.java  ← Unit 10
commands/
    ArmToScoreCommand.java   ← Unit 7
    AimAtTagCommand.java     ← Unit 10
    ScoreSequence.java       ← Unit 8
```
   This single block is the strongest coherence device in the track. Every later lesson can
   point back at it.

6. **Red vs yellow, one more time.** Red squiggle = error, won't compile, must fix. Yellow =
   warning, usually "declared but never used", which is *normal* while you're building
   something up. `callout--tip`.

CODE:
Show the generated class *shape* only — no logic, nothing to learn yet:
```java
// [FROM INTRO NOTES page 2] — the generated example, before you change anything
public class ExampleSubsystem extends SubsystemBase {

    public ExampleSubsystem() {
    }

    @Override
    public void periodic() {
        // runs every 20 ms
    }

    @Override
    public void simulationPeriodic() {
        // simulation only — ignore
    }
}
```
Annotate: the class name must match the file name; `periodic()` runs every 20 ms (`frc-subsystems`
explains it properly); `simulationPeriodic()` can be ignored — the team's simulation attempts
never worked reliably. Explicitly tell the author: **do not explain `SubsystemBase` here.** Say
"Unit 7" and move on. Resisting that explanation is what keeps this lesson 20 minutes.

SANDBOX: none — NO-COMPILER lesson. Navigating a real project tree is the skill; a sandbox
would show a fake tree.

Interactive load: the **file-tree** widget (see WIDGET-REQUEST) plus the challenges.

CHALLENGES:

1. **Fill-in-the-blank · where does it go?** — `data-kind="fib"`. Four one-liners, each with a
   blank for the destination file/folder:
   - "The CAN ID of the intake roller" → blank(`data-answer="Constants.java|Constants|constants"`)
   - "The code that calls `roller.set(0.7)`" → blank(`data-answer="subsystems|subsystems/|IntakeSubsystem.java"`)
   - "Binding the cross button to a command" → blank(`data-answer="RobotContainer.java|RobotContainer|robotcontainer"`)
   - "A behaviour that runs until the arm reaches its setpoint" → blank(`data-answer="commands|commands/|a command"`)
   Win: "That's the whole map. Everything you write this season goes in one of those four
   places."
   Lose: "Numbers → `Constants.java`. Motors → a subsystem. Button bindings → `RobotContainer`.
   Behaviour with an end → a command."

2. **Drag-to-order · make a new subsystem.** Items (shuffled): *Copy `ExampleSubsystem.java`* ·
   *Rename the file to `ArmSubsystem.java`* · *Rename the class inside to `ArmSubsystem`* ·
   *Fix any remaining red references* · *Build and confirm it compiles*.
   **Answer key:** that order.
   Win: "Renaming the class is the step everyone forgets — and it's the one that fills your
   screen with red."
   Lose: "Copy, rename the file, then rename the **class inside it** — Java requires a public
   class to match its file name. Then clean up and build."
   *Fallback: MCQ over three orderings.*

3. **MCQ · should I edit this?** — "Which file do you edit most as a new programmer?"
   - a) `Main.java` — "Never. It only starts the program."
   - b) `Robot.java` — "Rarely. The team edited it once all season, to run a test routine."
   - c) ✓ **`RobotContainer.java`** — "Yes — the source calls it the most important file. It's
     where controller bindings and autonomous live."
   - d) `build.gradle` — "Build machinery. Leave it alone unless you know exactly why."

4. **MCQ · the red squiggles** — "You copied `ExampleSubsystem.java`, renamed the file to
   `ArmSubsystem.java`, and the file is now full of red. Why?"
   - a) You need to reinstall REVLib — "The library has nothing to do with a rename."
   - b) ✓ **The class inside is still called `ExampleSubsystem`, and Java requires it to match
     the file name** — "Exactly — and on some machines the editor fixes this for you, which is
     why the same instructions confuse different people differently."
   - c) You must rebuild before renaming — "Order doesn't matter; the mismatch is the problem."
   - d) Subsystems can't be copied — "Copying is the normal way to make one."

MISCONCEPTIONS:
- *"I need to understand every file before I start."*
  → "You will touch six things. Everything else is build machinery you can ignore for a year."
- *"`Robot.java` is where my code goes — it's named after the robot."*
  → "It's the mode lifecycle, and you mostly leave it alone. Your code goes in subsystems,
  commands, and `RobotContainer`."
- *"Yellow squiggles mean I broke something."*
  → "Yellow is a warning — usually something declared but not used yet. Red is the one that
  stops the build."
- *"Renaming a file renames the class."*
  → "Only if your editor does it for you, and not every setup does. Check the class declaration
  by hand."
- *"Constants are for people who like tidiness."*
  → "They're for the day a port number changes and it's referenced in four files. Unit 7 has
  the story."

EXERCISE: **Map PenguinBot's project.**
*Where we are:* you generated the `PenguinBot` project in Unit 2 and installed REVLib into it.
You have never opened its folders. Do that now, and write the map you'll build against.

Task:
1. Open `PenguinBot` and navigate `src → main → java → frc → robot`. List what's actually there.
2. For each file/folder, write one sentence: what it's for, and whether you'll be editing it.
3. Then write the *target* tree — the files that will exist when PenguinBot is finished — using
   the mechanism list from `_shared-conventions.md` §2 (intake, arm, drivetrain, Limelight).
4. Name one file you're confident you will never open all season, and why that's fine.

**Reference solution** (`details.reveal`):
> **What's there now:** `Main.java` (never touch), `Robot.java` (mode lifecycle, rarely),
> `RobotContainer.java` (bindings + auto, constantly), `Constants.java` (numbers, constantly),
> `subsystems/ExampleSubsystem.java` and `commands/ExampleCommand.java` (templates to copy).
>
> **The target tree:**
> ```
> src/main/java/frc/robot/
> ├── Robot.java                  (Unit 8 — mostly untouched)
> ├── RobotContainer.java         (Unit 8 — bindings, auto chooser)
> ├── Constants.java              (Unit 7 — IDs, speeds, setpoints, PID gains)
> ├── subsystems/
> │   ├── IntakeSubsystem.java    (Unit 7)
> │   ├── ArmSubsystem.java       (Unit 7)
> │   ├── DriveSubsystem.java     (Unit 9)
> │   └── LimelightSubsystem.java (Unit 10)
> └── commands/
>     ├── ArmToScoreCommand.java  (Unit 7)
>     ├── AimAtTagCommand.java    (Unit 10)
>     └── ScoreSequence.java      (Unit 8)
> ```
> **Never opening:** `Main.java`. It exists to start the robot program and there is nothing in
> it you can usefully change. Not understanding it costs you nothing — that's what a good
> framework is for.

Tease: "You have the map. Next: the rule that decides which of those files a given line of code
belongs in — the chain of command."

CHECKPOINT: (4 questions, every option explained)

**Q1.** Which folder holds the only code allowed to touch a motor?
- a) `commands/` — "Commands tell subsystems what to do; they don't touch motors themselves."
- b) ✓ **`subsystems/`** — "Correct — subsystems own the hardware. Next lesson explains why that
  rule is load-bearing."
- c) `Robot.java` — "That's the mode lifecycle."
- d) `Constants.java` — "That stores numbers, not behaviour."

**Q2.** What is `RobotContainer.java` for?
- a) Starting the robot program — "That's `Main.java`."
- b) ✓ **Wiring controller buttons to commands, and setting up autonomous** — "Yes — the source
  calls it the most important file."
- c) Holding the CAN IDs — "That's `Constants.java`."
- d) Defining the 20 ms loop — "The framework does that; you don't write the loop."

**Q3.** You renamed a subsystem file and the editor is full of red. Most likely fix?
- a) Rebuild — "The mismatch will still be there."
- b) Reinstall the vendordep — "Unrelated to a rename."
- c) ✓ **Rename the class declaration inside the file to match the new file name** — "Exactly.
  Some editors do it for you; don't assume yours did."
- d) Move the file to `commands/` — "The folder isn't the problem."

**Q4.** Why can you ignore `build.gradle`?
- a) It isn't used — "It's used on every single build."
- b) ✓ **It's build machinery that WPILib configures for you; you have no reason to change it
  yet** — "Right — and vendor libraries are added through the installer, not by hand-editing it."
- c) It's only for simulation — "No, it drives every build and deploy."
- d) It's generated fresh each build — "It persists; you just don't need to touch it."

SEASON-FLAGS:
- The generated project's exact file set and the example class names can change between
  WPILib versions. `callout--season` on the tree diagram.
- `[NEEDS RESEARCH: does the 2026 Command Robot template still generate `ExampleSubsystem` /
  `ExampleCommand`, and is `simulationPeriodic()` still in the generated subsystem? —
  content/research/toolchain-2026.md]`
- The advice "you don't even need `commands/` for a simple project" is a source opinion — attribute
  it to the team rather than stating it as universal best practice.

WIDGET-REQUEST: **`file-tree`** — a clickable rendering of the project tree. Clicking a node
shows its "what it's for / do you edit it" card in a side panel; nodes carry an
edit-frequency badge (never / rarely / often / constantly). One instance shows *today's*
generated tree, a second shows PenguinBot's *finished* tree.
*Fallback:* the static `.diagram` tree plus the file table in EXPLAIN beat 3, plus challenge 1 —
these already carry the full teaching. Ship the fallback if the widget isn't ready.
