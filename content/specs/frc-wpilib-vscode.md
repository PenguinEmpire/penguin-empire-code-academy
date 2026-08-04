# frc-wpilib-vscode · WPILib + VS Code
unit: 2 · The Toolchain   |   duration: 20 min   |   difficulty: Beginner
interactivity: NO-COMPILER (`checklist` widget + drag-to-order the project-creation flow + MCQ)

> Read `_shared-conventions.md` first.

INTRODUCES:
- `wpilib-install` — WPILib installs its **own dedicated copy of VS Code**
- `wpilib-w-menu` — the red "W" icon; the WPILib Command Palette
- `create-new-project` — the project creator and its fields
- `project-templates` — **command-based** (what the team uses) vs **timed**
- `build-deploy` — "Build Robot Code" / "Deploy Robot Code"
- `gradle-build` — the daemon, "BUILD SUCCESSFUL", "Java ready"
- `desktop-support` — a checkbox for simulation only; leave it off
- `no-onedrive` — keep robot projects out of synced folders

ASSUMES:
- `frc-game-tools`, `driver-station`, `windows-only-ds` (`frc-game-tools`)
- `roborio` (`frc-roborio-radio-can`)
- Java project/class basics from Phase 1.

GOAL:
Create a new command-based robot project from the WPILib template and deploy it to a RoboRIO,
knowing what each field in the project creator does.

HOOK: **The captain's laptop died** (`_shared-conventions.md` §6 story 5).
`callout--why`. Halfway through the season, the team captain's personal computer broke. He
spent the rest of the year writing robot code **on the driver-station laptop** — the same
Windows machine that goes to the field. The robot didn't notice. Neither did the code.

Use it exactly as the source intends: as reassurance. New members worry they don't have a
powerful enough machine. WPILib's VS Code, Gradle, and a deploy over Wi-Fi run on very
ordinary hardware, and the show goes on regardless. Pair it with story 21: the year the team
tried to get simulation working and never did — so they went back to waiting for the physical
robot. **The tooling is not always going to cooperate. That is normal and not your fault.**

EXPLAIN:

1. **WPILib is not a VS Code extension you add to your VS Code.**
   Analogy: it's a whole second workshop, pre-stocked. The WPILib installer places a
   *dedicated copy* of VS Code on your machine, already carrying the FRC tooling. Open that
   one. Students who open their normal VS Code and can't find the W icon have not done
   anything wrong — they're in the wrong building.
   Mark: [FROM PDF page 5, §2.2]

2. **The red "W" is the whole difference.**
   Top-right of the window (and per the intro notes, a WPILib item at the **bottom-left** for
   vendor dependencies — `frc-vendordeps` owns that one). Clicking the W opens the **WPILib
   Command Palette**: every FRC action lives there.
   Pitfall worth a `callout--pitfall`: **if you don't see the W icon, create or open any file
   first** — it appears once VS Code has a real editor context. Straight from the intro notes;
   it saves a genuinely baffling five minutes.
   Mark: [FROM INTRO NOTES page 1, step 1]

3. **The two commands you'll use for the next four months.**
   - **Create a new project**
   - **Build Robot Code / Deploy Robot Code** (the source calls it "Build/Deploy (Push)")
   Everything else in that palette is occasional. Say so — the palette is intimidating and
   this reduces it to two entries.
   Mark: [FROM PDF page 5, §2.2]

4. **The project creator, field by field.** This is the lesson's core reference block. Present
   it as a table with a "why it matters" column, taken from the intro notes:

| Field | Choose | Why |
|---|---|---|
| Project type | **Template** | Example projects are demos; templates are starting points |
| Language | **Java** | This whole course |
| Base / template | **Command Robot** (command-based) | What the team uses; Unit 3 explains the structure it generates |
| Folder | anything **not** synced by OneDrive/iCloud/Dropbox | Sync services corrupt Gradle builds mid-write |
| Project name | e.g. `PenguinBot` | Becomes the folder and the deploy artifact name |
| Desktop support | **off** | Only needed for simulation |

   Mark: [FROM INTRO NOTES page 1, §1] + [FROM PDF page 5, §2.2]
   Beat — **command-based vs timed.** Timed is simpler and more limiting: you write directly
   into a periodic loop. Command-based costs more structure up front and buys you sequencing,
   button bindings, and reusable behaviours. The team uses command-based, so this course does.
   Analogy: timed is one long `main` method; command-based is a program with classes. You
   already know why the second one wins on anything that grows.

5. **Then Gradle runs, and you wait.**
   Analogy: the first time you open the project, the build system downloads and warms up —
   like a compiler cold-start. You will see it "start a daemon." **Do not touch anything until
   you see `BUILD SUCCESSFUL` and `Java ready` at the bottom-left.** Editing during the first
   build is how people end up with a broken-looking project that was only half-created.
   Mark: [FROM INTRO NOTES page 1, step 6]

6. **Build vs Deploy.**
   - **Build** = compile on your laptop. Catches syntax and type errors. No robot needed.
   - **Deploy** = build, then push the result onto the RoboRIO over the network and restart the
     robot program. Needs comms (Unit 2's Driver Station lesson: Communication green).
   Beat: build early and often without a robot. You can write and compile PenguinBot's entire
   intake on a Mac in a coffee shop; you only need the robot to *watch it move*.

7. **Red squiggles vs yellow.** From the intro notes, worth stating once here and reinforcing
   in `frc-src-tree`: **red = error, it won't compile. Yellow = warning**, usually something
   declared and unused — annoying, not a blocker. New programmers panic at yellow.

CODE: none of your own. Optionally show the *generated* `Main.java`/`Robot.java` header in a
`.code` block purely to say "this appeared; don't touch it yet — Unit 3 gives you the map."
Do not annotate or explain generated code here; `frc-src-tree` owns that.

SANDBOX: none — NO-COMPILER lesson. Installing an IDE is not something a browser sandbox can
teach, and faking it would be theater.

Interactive load:
1. **`checklist`** widget (requested in `frc-game-tools`) — the install + first-project
   checklist, persistent so a student can install across sessions.
2. **Drag-to-order** (`data-kind="order"`) — the project-creation flow (challenge 1).

CHALLENGES:

1. **Drag-to-order · create and deploy.** Items (shuffled): *Click the W icon* · *Choose
   "Create a new project"* · *Pick Template → Java → Command Robot* · *Pick a folder outside
   OneDrive and name the project* · *Wait for `BUILD SUCCESSFUL` / `Java ready`* · *Write your
   code* · *Deploy Robot Code*.
   **Answer key:** exactly that order.
   Win: "That's the loop you'll run every time you start a project — and waiting for the first
   build is a real step, not a formality."
   Lose: "The W icon opens everything. Create the project *before* you write code, and let the
   first Gradle build finish before you touch a file."
   *Fallback: an MCQ over three candidate orderings.*

2. **MCQ · the missing W** — "You open VS Code and there's no W icon in the top-right. What's
   the most likely reason?"
   - a) WPILib failed to install — "Possible, but check the two likelier things first."
   - b) ✓ **You're in your normal VS Code, not the dedicated WPILib copy — or you haven't
     opened a file yet** — "Both are real and both are common. WPILib installs its own VS Code,
     and the icon only appears once there's an editor context."
   - c) You need to enable the robot first — "The Driver Station has nothing to do with the IDE."
   - d) You need to install Java separately — "WPILib brings its own JDK."

3. **MCQ · build vs deploy** — "You're on a plane with no robot. Which can you still do?"
   - a) Deploy — "Deploy pushes to the RoboRIO over the network. No robot, no deploy."
   - b) ✓ **Build** — "Yes — build compiles locally. Write and compile all you like; you only
     need the robot to watch it move."
   - c) Neither — "You can absolutely build."
   - d) Both — "Deploy needs an actual RoboRIO to push to."

4. **Fill-in-the-blank** — `data-kind="fib"`:
   `Template: ` blank(`data-answer="Command Robot|command-based|command robot|Command"`)
   `  ·  Desktop support: ` blank(`data-answer="off|no|unchecked|false"`)
   `  ·  Folder: not inside ` blank(`data-answer="OneDrive|onedrive|a synced folder|iCloud"`)
   Win: "Those three answers are the ones people get wrong on their first project."
   Lose: "Command Robot is the team's template; desktop support is only for simulation; and a
   sync service editing your files mid-build will corrupt the project."

MISCONCEPTIONS:
- *"I'll add the WPILib extension to my existing VS Code."*
  → "WPILib ships its own copy of VS Code, already set up. Open that one."
- *"Desktop support sounds useful, I'll tick it."*
  → "It's only for simulation. Leave it off — the team's simulation attempts never worked
  reliably anyway."
- *"Yellow squiggles mean my code is broken."*
  → "Red is an error and stops the build. Yellow is a warning — usually something declared and
  not used yet — and it will still compile and deploy."
- *"Deploy failed, so my code is wrong."*
  → "Deploy failing is usually a *connection* problem. Build first: if it builds and won't
  deploy, look at Communication on the Driver Station."
- *"I need a good laptop to be useful on this team."*
  → "One captain wrote a whole season's code on the driver-station laptop after his own died."

EXERCISE: **Create the PenguinBot project.**
*Where we are:* you know what the hardware is and how to enable the robot. Now make the place
where all of it will live — the project every remaining lesson in this phase adds to.

Task (real, on their machine, using the `checklist`):
1. Open the **WPILib** copy of VS Code.
2. W icon → Create a new project → Template · Java · **Command Robot**.
3. Folder: somewhere local and unsynced. Name: **`PenguinBot`**.
4. Desktop support: **off**. Generate. Open it.
5. Wait for `BUILD SUCCESSFUL` and `Java ready`.
6. Run **Build Robot Code** and confirm it succeeds with zero changes.
7. Screenshot or note the folders you see under `src/main/java/frc/robot`.

**Reference solution / expected result** (`details.reveal`):
> A `PenguinBot` folder with a Gradle project inside. Under `src/main/java/frc/robot` you'll
> find `Main.java`, `Robot.java`, `RobotContainer.java`, `Constants.java`, and folders
> `subsystems/` and `commands/` containing example files. Build Robot Code prints
> `BUILD SUCCESSFUL`. You have not written a line yet and the project already compiles — that
> baseline matters: if a later build fails, you changed something.
>
> If you can't do this on your own machine yet (no Windows, no install), read on anyway. Unit 3
> maps every one of those files, and everything after Unit 3 can be practised in this site's
> sandboxes without a robot.

Tease: "That project has one thing missing before it can talk to a SparkMax: the REV library
isn't in it. That's the next lesson."

CHECKPOINT: (4 questions, every option explained)

**Q1.** What does the WPILib installer give you?
- a) An extension for your existing VS Code — "It gives you a whole dedicated copy instead."
- b) ✓ **Its own copy of VS Code with the FRC tooling built in** — "Right, and that's the copy
  you open."
- c) The Driver Station — "That's FRC Game Tools, a separate install."
- d) The vendor libraries — "Those are installed per-project; next lesson."

**Q2.** Which template does this team use, and why?
- a) Timed, because it's simpler — "Simpler, but more limiting; the team doesn't use it."
- b) ✓ **Command-based, because it supports sequencing and button bindings as first-class
  ideas** — "Yes — that structure is what Units 3, 7 and 8 are about."
- c) Whichever the creator defaults to — "Choose deliberately; the default may not be it."
- d) A blank project — "You'd be rebuilding the framework by hand."

**Q3.** Your project won't deploy but it builds fine. Where do you look?
- a) Your Java syntax — "A successful build already proved the syntax is fine."
- b) ✓ **The connection to the robot — Communication on the Driver Station** — "Correct.
  Build is local; deploy needs the network."
- c) The template you chose — "The template compiled successfully."
- d) The CAN IDs — "Wrong IDs stop a motor from moving; they don't stop a deploy."

**Q4.** Why keep the project out of OneDrive?
- a) It's against the rules — "There's no rule; it's a practical hazard."
- b) The files are too large — "Robot projects are small."
- c) ✓ **A sync service writing files during a Gradle build can corrupt the project** — "Yes —
  the intro notes call this out specifically."
- d) OneDrive can't store `.java` files — "It can; that isn't the problem."

SEASON-FLAGS:
- `callout--season` covering the *entire* installation section. Every one of these can move
  between seasons: the WPILib download location and version, the installer's steps, where the W
  icon sits, the exact wording of the palette commands ("Build Robot Code" vs "Build/Deploy"),
  and the list of project templates.
  `[NEEDS RESEARCH: 2026 WPILib installer flow, the exact palette command labels, and the
  current project-creator field list — content/research/toolchain-2026.md]`
- Do not print a WPILib version number in prose; reference "this season's WPILib."

WIDGET-REQUEST: none new. Uses `checklist` (requested in `frc-game-tools`) and drag-to-order
(in-flight per plan §6); fallbacks stated above.
