# frc-pathplanner · The PathPlanner Workflow
unit: 11 · Autonomous   |   duration: 25 min   |   difficulty: Advanced
interactivity: NO-COMPILER (**pathplanner-storyboard** widget + drag-to-order + MCQ)

> Read `_shared-conventions.md` first, and **check `content/research/vision-pathplanner.md`**
> before finalising any API name. Unit 11 is last on purpose — the source is emphatic that auto
> can't be built until mechanics and vision work. Reinforce that framing, don't undercut it.

INTRODUCES:
- `pathplanner-app` — a desktop app with a visual field
- `path` — a drawn route from A to B
- `waypoint` — a point the route passes through
- `start-pose` — where the robot believes it begins: position **and** heading
- `robot-config-constants` — the same physical facts the swerve generator needed
- `named-command` — a registered behaviour the path can call by name
- `wait-command` — a timed pause inside a routine
- `approximation-and-correction` — why paths need vision to back them up

ASSUMES:
- `swerve-concept`, `swerve-generators`, `robot-physical-constants` (`frc-swerve-*`)
- `sequentialcommandgroup`, `waitcommand`, `command-composition` (`frc-command-groups`)
- `aim-with-tx`, `vision-as-error-source` (`frc-vision-pid`)
- `robot-modes`, `autonomous-mode` (`frc-robot-java`); `auto-chooser` mention
  (`frc-robotcontainer`)

GOAL:
Describe how a PathPlanner routine is built, and explain why a drawn path alone isn't enough to
score reliably.

HOOK: **PathPlanner is approximate** (`_shared-conventions.md` §6 story 18 — PDF page 17, §11.1).
`callout--why`.
PathPlanner shows you a field, you draw a route, and it computes the motor commands to follow it.
The source's description ends with one word doing enormous work: *it computes the motor power and
swerve commands to follow your route — **approximately**.*

Because it must. It's calculating from your typed-in weight, moment of inertia and dimensions —
which are close, not exact. It can't know that the carpet is more worn in front of the scoring
station, that your battery is at 12.1 V instead of 12.8, that a wheel tread is glazed, or that
someone bumped you in the first two seconds.

So a path gets you **close**. The source's prescription follows immediately: *pair it with
alignment / position-correction code — your PID and vision.* Which you built last unit.

That's the shape of a real autonomous routine: **drive approximately, then correct precisely.**
Drive to roughly the right place with a path, then let `AimAtTagCommand` finish the job. A team
that trusts the path alone scores in practice and misses at competition.

EXPLAIN:

1. **What autonomous is.** The first seconds of a match where the robot runs itself with nobody
   driving. Points are on the line and nobody can help.
   `[NEEDS RESEARCH / SEASON: the autonomous period's length and scoring for the 2026 game.
   Do not state a duration; wrap in callout--season.]`
   The dependency, once more and in bold: **you cannot build a reliable autonomous until mechanics
   and vision work**, because auto is literally a sequence of those commands. This is the fourth
   time the course says it. It's the source's most repeated point.

2. **PathPlanner is an app, not a library you write against.** A desktop application (the source
   notes it running on the driver station) showing a visual field. You place a **start pose** and
   draw the robot's route. It saves path files that your robot code loads by name.
   Analogy: **choreography software**. You draw where the dancer goes; something else makes their
   legs move.
   Mark: [FROM PDF page 17, §11.1]
   `[NEEDS RESEARCH: 2026 PathPlanner version, whether it is still a separate desktop app, its
   file format and where files live in the project — content/research/vision-pathplanner.md]`

3. **The start pose is a promise you have to keep.** A path begins at a stated position **and
   heading**. If the robot is placed on the field somewhere else, every subsequent movement is
   offset by that error, and it compounds.
   Practical consequence, and it's a real game-day item: **the robot has to be placed on the field
   the same way every match.** Teams mark the floor, use the field's own markings, and check it
   before every match. It's a programming problem solved with tape.
   Connect it explicitly: this is the *same* class of bug as an unhomed relative encoder (Unit 5)
   and a gyro zeroed facing sideways (Unit 9). **Three units, one lesson: a position means nothing
   until you know where zero is.** Make that connection out loud — it's the strongest recurring
   idea in the track.

4. **It needs the robot's physical facts.** Weight, moment of inertia, dimensions — the same list
   the swerve generator wanted, for the same reason: it's simulating your robot to work out what
   it can do. Wrong numbers produce a path the robot can't actually follow, and there's no error
   message, just a robot that overshoots corners.
   Mark: [FROM PDF page 17, §11.1]

5. **The three building blocks of a routine.** This is the core reference block:

| Block | What it is | Example |
|---|---|---|
| **Path** | Point A → point B, drawn on the field | drive from the start line to the scoring position |
| **Named command** | One of *your* commands, registered under a name so a path can call it | `"scoreGamePiece"`, `"lowerIntake"` |
| **Wait command** | Pause for N seconds | wait 0.5 s for the piece to settle |

   Mark: [FROM PDF page 17, §11.2]
   The key realisation, and it should land as a relief: **named commands are the commands you
   already wrote.** `ScoreSequence`, `AimAtTagCommand`, `ArmToScoreCommand` — you register them
   under names, and the routine calls them. Autonomous adds almost no new code. That's what "auto
   is a sequence of the commands you already wrote" actually means in practice.

6. **The workflow, end to end.**
```
1. Enter the robot's physical constants into PathPlanner.
2. Place the start pose on the field, matching where the robot will really be placed.
3. Draw the path(s).
4. In your code, REGISTER your commands as named commands.
5. Assemble paths + named commands + waits into a routine.
6. Expose the routine through the autonomous picker in RobotContainer.
7. Test it. On the actual floor. Repeatedly.
8. Add vision correction where precision matters.
```
   Mark: [FROM PDF page 17, §11.1–11.2]
   Step 7 deserves a `callout--tip`: an auto routine that has been run twice is not tested. Battery
   voltage, carpet, and starting position all vary, and a routine that works once can fail in a
   way that scores zero.

7. **Where vision comes in.** Concretely, and it's the design pattern worth taking away:
```
Path: drive to roughly in front of the goal   (approximate, fast)
      -> AimAtTagCommand                       (precise, slow, small correction)
      -> ScoreSequence                         (the commands you already had)
```
   The path covers three metres in two seconds without needing precision. Vision covers the last
   few degrees, where precision is the whole point. Using vision for the long haul would be slow;
   using the path for the final alignment would miss.

CODE:
**None until `content/research/vision-pathplanner.md` lands.**
The source names the concepts (paths, named commands, wait commands, the auto picker) but gives no
PathPlanner API at all. Registering named commands and building a routine both require a real
API, and guessing would fail the Verifier.

If the factsheet **is** available, add at most **two** cited samples inside `callout--verified`
**and** `callout--season`: (a) registering named commands at startup, (b) obtaining a built auto
routine as a `Command` for `getAutonomousCommand()`. Nothing more.
`[NEEDS RESEARCH: how named commands are registered; how an auto routine is loaded as a Command;
whether AutoBuilder-style configuration is required and what it needs from the drive subsystem —
content/research/vision-pathplanner.md]`

Until then, show the **shape** as comments only:
```java
// SHAPE ONLY -- see content/research/vision-pathplanner.md for the verified API.
//
// At startup, register the commands PathPlanner may call by name:
//     "scoreGamePiece"  -> new ScoreSequence(arm, intake)
//     "aimAtTag"        -> new AimAtTagCommand(drive, limelight)
//
// Then RobotContainer.getAutonomousCommand() returns the routine you assembled,
// and Robot.autonomousInit() schedules it -- exactly as in Unit 8.
```

SANDBOX: none — NO-COMPILER lesson. This is a desktop app and a field. `frc-auto-routines` puts
the *sequencing* in a sandbox, which is the part that can honestly be simulated.

Interactive load: the **pathplanner-storyboard** widget (see WIDGET-REQUEST) plus challenges.

CHALLENGES:

1. **Drag-to-order · the workflow.** Items (shuffled): *Enter the robot's weight and dimensions* ·
   *Place the start pose where the robot will really be placed* · *Draw the path* · *Register your
   existing commands as named commands* · *Assemble paths, named commands and waits into a
   routine* · *Expose it in the autonomous picker* · *Test it repeatedly on the real floor*.
   **Answer key:** that order.
   Win: "Physical facts, then the route, then your existing commands, then the routine — and then
   a lot of testing."
   Lose: "PathPlanner needs the robot's physical facts before it can compute anything, and a start
   pose before it can draw a route. Your named commands already exist — you're registering, not
   writing. And testing is a step, not a formality."
   *Fallback: MCQ over three orderings.*

2. **MCQ · why vision** — "Your path puts the robot in front of the goal. Why add
   `AimAtTagCommand` after it?"
   - a) The path might crash into something — "Collision is a separate concern."
   - b) ✓ **PathPlanner is approximate, so the robot lands close but not precisely — vision closes
     the last few degrees** — "Exactly the source's own prescription: pair the path with position
     correction."
   - c) Vision is faster than driving — "Vision is slower; that's why it's used only for the
     final correction."
   - d) It's required by PathPlanner — "Nothing requires it except wanting to score reliably."

3. **MCQ · the start pose** — "The routine is tested and perfect. At competition, the robot is
   placed 30 cm further left than usual. What happens?"
   - a) PathPlanner detects it and corrects — "It has no idea where the robot actually is."
   - b) ✓ **Every movement is offset by roughly that error, and it compounds along the route** —
     "Right, and it's why teams mark the floor and check placement before every match."
   - c) Nothing; paths are relative — "They start from a stated pose. Get the pose wrong and
     everything after it is wrong."
   - d) The robot won't move — "It moves confidently, to the wrong places."

4. **MCQ · named commands** — "What's a named command?"
   - a) A command PathPlanner writes for you — "It writes paths, not behaviours."
   - b) ✓ **One of your existing commands, registered under a name so a routine can call it** —
     "Yes — which is why auto adds so little new code."
   - c) A command with a `getName()` method — "Naming a class isn't registering it."
   - d) A wait with a label — "Waits are a separate block."

5. **Predict / short answer** — "Autonomous fails at competition. It worked in the workshop all
   week. Name the two most likely non-code causes."
   `data-answer="starting position and battery|placement and battery|start pose and battery|placement and voltage|starting position and voltage|battery and placement"`
   Win: "Starting position and battery voltage. Both change what the same code does, and neither
   is visible in the code."
   Lose: "Where the robot was placed (the start pose it assumes) and the battery's voltage. Carpet
   condition is a good third. All three change the robot's behaviour without changing a line of
   code."

MISCONCEPTIONS:
- *"PathPlanner drives the robot exactly where I drew."*
  → "It gets close. It's calculating from your approximate physical constants and can't see the
  carpet, the battery or a bump. Close, then correct."
- *"Autonomous needs its own set of commands."*
  → "It reuses the commands you already wrote for teleop. That's the whole reason it's built last
  and why it's so little extra code."
- *"The robot knows where it is on the field."*
  → "It knows where it *thinks* it is, starting from the pose you declared and integrating from
  there. Vision is how it checks."
- *"I can build autonomous while the arm is still being tuned."*
  → "Auto is a sequence of those mechanism commands. Until they work, there's nothing to
  sequence — the source repeats this more than any other point."
- *"If it worked once, it works."*
  → "Run it ten times, on a fresh battery and a flat one, from a slightly-off starting position.
  Auto is the most fragile code on the robot."
- *"Wait commands are the way to sequence steps."*
  → "Use them for physical settling time. For 'has the previous step finished?', that's what
  `isFinished()` is for."

EXERCISE: **PenguinBot's autonomous, designed.**
*Where we are:* PenguinBot can drive field-centrically, aim at a tag, and score from one button.
Every command an autonomous routine needs already exists. Nothing sequences them without a human.

Task — the design document. `frc-auto-routines` builds it.
1. Write PenguinBot's routine as an ordered list: paths, named commands and waits, in order, with
   a one-line justification each.
2. State the start pose in words — where on the field, facing which way — and how the team will
   guarantee the robot is placed there.
3. List which of your **existing** commands need registering as named commands. Note how many new
   command classes you have to write. (The answer should be small; if it isn't, something earlier
   went wrong.)
4. Mark which steps are *approximate* (a path) and which are *precise* (vision), and say why the
   split is where it is.
5. Write the test plan: what you'd vary between runs, and how many runs before you'd trust it.

**Reference solution** (`details.reveal`):
> **1. The routine**
>
> | # | Block | Why |
> |---|---|---|
> | 1 | **Path** — start line → in front of the scoring position | Fast, covers most of the distance. Approximate is fine here. |
> | 2 | **Named command** — `aimAtTag` (`AimAtTagCommand`) | Closes the last few degrees precisely. The path can't. |
> | 3 | **Named command** — `scoreGamePiece` (`ScoreSequence`) | Arm up, outtake, wait, arm down — already built and tested in teleop. |
> | 4 | **Wait** — 0.25 s | Let the robot settle before moving off, so the piece isn't dragged. |
> | 5 | **Path** — scoring position → out of the way | Clears the space and positions us for teleop. |
>
> **2. Start pose.** On the start line, at the left-hand marking, facing the far end of the field.
> Guaranteed by: floor tape lined up with the field's own markings, a photo in the pit as
> reference, and one person whose pre-match job is to check the placement and say it out loud.
> This is the same "what does zero mean?" problem as homing an encoder and zeroing the gyro — and
> like both of those, it's solved before the match, not during it.
>
> **3. Named commands to register:** `scoreGamePiece` → `ScoreSequence`; `aimAtTag` →
> `AimAtTagCommand`. **New command classes to write: zero.** Everything is already built and
> already tested in teleop, which is exactly what "build auto last" buys you.
>
> **4. Approximate vs precise.**
> - Steps 1 and 5 (paths) are **approximate**: covering metres, where being 10 cm off doesn't
>   matter because step 2 will fix it.
> - Step 2 (vision) is **precise**: closing a few degrees, where 10 cm *does* matter.
> The split is at the point where the cost of error starts to exceed the cost of time. Vision for
> the whole route would be slow and would need a tag in view the entire way; the path for the
> final alignment would miss.
>
> **5. Test plan.** Ten runs minimum, varying deliberately:
> - Three on a fresh battery, three on a half-drained one — voltage changes acceleration.
> - Two from a deliberately mis-placed start (5–10 cm off) — does vision recover it?
> - Two with the tag partially blocked — does `isTargetValid()` do its job, or does the routine
>   hang?
> Trust it when it scores in at least nine, **and** when the one failure is understood rather than
> shrugged at.

Tease: "You've designed it. Next lesson: build the routine, watch it run step by step, and make
sure a jammed mechanism can't cost you the whole autonomous period."

CHECKPOINT: (4 questions, every option explained)

**Q1.** Why is autonomous the last unit in this course?
- a) It's the hardest — "PathPlanner does the hard maths; the constraint is dependency."
- b) ✓ **It's a sequence of mechanism and vision commands, so those must work first** — "Yes, and
  the source repeats this more than any other point."
- c) It's the least important — "It's worth a lot of match points."
- d) The rules change annually — "They do, but that's not why it's last."

**Q2.** What does PathPlanner need from you before it can generate anything?
- a) Just the drawn route — "It also needs to know what your robot is."
- b) ✓ **The robot's physical constants — weight, moment of inertia, dimensions — plus a start
  pose** — "Right, the same facts the swerve generator wanted, for the same reason."
- c) The tag IDs — "Vision is separate."
- d) Your PID gains — "It computes its own following behaviour."

**Q3.** What is a named command?
- a) A path with a label — "Paths and named commands are different blocks."
- b) ✓ **An existing command of yours, registered under a name so a routine can call it** —
  "Exactly, and it's why auto needs almost no new code."
- c) A command that runs only in autonomous — "The same commands run in teleop."
- d) A PathPlanner built-in — "PathPlanner supplies paths and waits; the behaviours are yours."

**Q4.** Why pair a path with vision correction?
- a) Paths don't work — "They work well, over distance."
- b) Vision is more fun — "Not an engineering reason."
- c) ✓ **Paths are approximate, and the last few degrees need precision the path can't provide** —
  "Correct — drive approximately, then correct precisely."
- d) The rules require it — "No rule requires vision."

SEASON-FLAGS: **Heavy.**
- `callout--season` on: the autonomous period's length and scoring (game-specific), the field
  layout, PathPlanner's version and file format, and every API name.
- `[NEEDS RESEARCH: 2026 PathPlanner — app or plugin, file format, named-command registration API,
  how a routine becomes a Command, AutoBuilder configuration requirements —
  content/research/vision-pathplanner.md]`
- `[NEEDS RESEARCH: 2026 autonomous period duration]` — the source says ~20 s; do not repeat a
  number without checking.
- The **workflow** and the **approximate-then-correct pattern** are stable and safe to teach.

WIDGET-REQUEST: **`pathplanner-storyboard`** — a top-down field where the lesson declares a
routine as a list of blocks (path / named command / wait). Stepping through highlights the current
block and moves a robot marker along the route, with the block's "why" text alongside. Crucially it
should show a **second, offset ghost robot** representing where the approximate path actually put
it, with the vision step snapping the two together — making "approximate, then correct" visible in
one image.
*Fallback:* a static annotated field diagram with the five numbered blocks and the ghost-offset
drawn in, plus challenge 1's drag-to-order. The teaching survives; the widget makes it click
faster.
