# _shared-conventions · READ THIS BEFORE AUTHORING ANY FRC LESSON

Every `frc-*.md` spec in this folder assumes this file. It exists so 30 pages written by
6 parallel authors describe **one robot**, **one set of numbers**, and **one voice**.

Style contract: `site/lessons/frc/moving-a-motor.html`. Markup vocabulary: `README.md`.
Binding plan sections: `~/.claude/plans/quirky-gliding-sutton.md` §1, §3, §4, §7, §8.

---

## 1. Voice & structural rules

- Second person, present tense, short sentences. No hype, no emoji.
- Section order mirrors the built lesson: hero → goal → TOC → **1 Why this matters** →
  concept sections → challenges → common mistakes → exercise → checkpoint → mark-complete.
- **Do not re-teach Java.** Variables, loops, methods, classes, objects, inheritance,
  interfaces, enums, lambdas, exceptions are all assumed. When a Java idea resurfaces,
  link back to Phase 1 in one clause ("the same lambda you met in `j-lambdas`") and move on.
- **Never invent a team anecdote.** The sourced war stories are listed in §6. If none fits a
  lesson, hook on a *real mechanism* instead (intake, arm, flywheel, drivetrain). Fabricating
  a story is a hard fail at review.
- `//` line comments only inside `.code.with-lines` — the line numberer relies on it.
- Every code block that shows a WPILib/vendor class also shows its `import`.

## 2. PenguinBot — the one robot this whole track builds

Every FRC exercise adds one capability to **PenguinBot**. Describe it identically everywhere.

> PenguinBot is a teaching robot: a roller **intake**, a pivoting **arm** that lifts a game
> piece to a scoring setpoint, a **swerve drivetrain**, and a **Limelight** that finds the
> scoring tag.

### Canonical CAN ID map (use these exact numbers in every lesson)

| Device | CAN ID | Hardware | First appears |
|---|---|---|---|
| RoboRIO | 0 | reserved | `frc-can-ids` |
| PDH | 1 | reserved | `frc-can-ids` |
| Intake roller | **2** | SparkMax + Neo | `frc-moving-a-motor` (built) |
| Arm pivot | **3** | SparkMax + Neo | `frc-encoders` |
| Arm follower | 4 | SparkMax + Neo | `frc-subsystems` (optional bonus) |
| Swerve drive FL/FR/BL/BR | 10 / 11 / 12 / 13 | Kraken | `frc-swerve-generators` |
| Swerve steer FL/FR/BL/BR | 14 / 15 / **16** / 17 | Kraken | `frc-swerve-generators` |

Note the payoff: the sourced competition error **"CAN ID 16 timed out"** is PenguinBot's
back-left steer motor. `frc-can-ids` plants it; `frc-game-day` collects it.

### Canonical names & numbers

| Thing | Value | Notes |
|---|---|---|
| Driver controller | `CommandPS5Controller driver`, port **0** | operator would be port 1 (unused) |
| Intake speed | `0.7` | under the 80 % rule |
| Outtake speed | `-0.5` | |
| Arm stowed setpoint | `0.0` rotations | |
| Arm score setpoint | **`9.0` rotations** | used by every U6–U11 sample |
| Arm tolerance | `0.25` rotations | |
| Arm gains (final answer) | `kP = 0.2, kI = 0.0, kD = 0.0` | derived in `frc-pid-tuning` |
| Output clamp | `±0.8` | the 80 % rule, applied to every PID output |
| Flywheel target | `4000` RPM | the PDF's own teaching example |
| Aim tolerance | `1.0°` of TX | `frc-vision-pid` |

### The accumulating exercise spine

| Lesson | PenguinBot gains |
|---|---|
| `frc-moving-a-motor` (built) | `Intake` class — `intake()`, `stop()`, `outtake()` |
| `frc-encoders` | `Arm` class that *reports* position and velocity |
| `frc-relative-absolute` | `Arm.home()` — zero the encoder at the hard stop |
| `frc-pid-concept` | proof that open loop can't hold a setpoint |
| `frc-pid-tuning` | tuned gains for PenguinBot's arm |
| `frc-pid-syntax` | `Arm.goToScore()` — closed-loop arm |
| `frc-command-lifecycle` | `ArmToScoreCommand` with a real end condition |
| `frc-subsystems` | `Arm` → `ArmSubsystem extends SubsystemBase` |
| `frc-constants` | every literal moves into `Constants.java` |
| `frc-controllers` | the driver controller, ports, button semantics |
| `frc-robotcontainer` | bindings — a button press actually runs the arm |
| `frc-command-groups` | `ScoreSequence` — arm up, outtake, arm down |
| `frc-robot-java` | the scheduler runs in the right mode |
| `frc-swerve-concept/-generators` | a drivetrain |
| `frc-limelight` | `LimelightSubsystem` wrapper |
| `frc-vision-pid` | `AimAtTagCommand` — drive TX to zero |
| `frc-pathplanner` / `frc-auto-routines` | `ScoreAndLeaveAuto` |
| `frc-game-day` | the pre-match checklist for the finished robot |

Each spec's EXERCISE section opens with one sentence naming what PenguinBot could do at the
end of the previous lesson, and closes with one sentence teasing the next. That chain is the
course's spine — do not break it.

## 3. PenguinSim — the requested behavioural contract

PenguinSim (plan §4) is being built in parallel at
`site/assets/js/sim/penguinsim.java.txt`. Every SANDBOX spec below computes its expected
output from **this contract**:

```
TICK        one CommandScheduler.getInstance().run() == 20 ms of simulated time.
            Nothing is real-time. Students step the loop with a plain for-loop.

SparkMax(int canId, MotorType type)
  .set(double)            clamps to [-1, 1]; prints ONE warning per motor per run when
                          |value| > 0.8:
                          [PenguinSim] WARNING: motor 3 commanded to 0.95 — team limit is 0.8
  .get() .stopMotor() .getEncoder()

MOTION MODEL (per tick, per motor, deterministic, no friction, no inertia)
  position += output * 2.0          // "rotations"; full output == 6000 RPM equivalent
  velocity += (output * 6000 - velocity) * 0.1     // first-order lag, "RPM"

RelativeEncoder   .getPosition() .getVelocity() .setPosition(double)
PIDController(kP,kI,kD)
                  .calculate(measurement, setpoint) .setTolerance(double)
                  .atSetpoint() .reset() .getPositionError()
SubsystemBase     registers itself with the scheduler in its constructor; its periodic()
                  is called once per tick
Command           initialize() / execute() / isFinished() / end(boolean)
                  + addRequirements(Subsystem...)
InstantCommand(Runnable)
CommandScheduler.getInstance()
                  .schedule(Command)  -> calls initialize() immediately
                  .run()              -> 1) every subsystem periodic()
                                         2) every scheduled command execute()
                                         3) isFinished() -> if true end(false), unschedule
Timer             .reset() .start() .get()  (simulated seconds = ticks * 0.02)
```

**SIM-REQUESTS raised by these specs** (beyond the shim list in the plan). Each has a
documented fallback so no lesson is blocked:

| Requested | Wanted by | Fallback if not shipped |
|---|---|---|
| `SequentialCommandGroup`, `ParallelCommandGroup` | `frc-command-groups`, `frc-auto-routines` | student hand-rolls a `Sequence` Command — arguably better teaching; spec includes both |
| `WaitCommand(double seconds)` | `frc-command-groups`, `frc-auto-routines` | hand-rolled `WaitCommand` using `Timer` |
| `PIDController.setTolerance` / `.atSetpoint()` | all U6–U10 sandboxes | compare `Math.abs(target - pos) < 0.25` inline |
| `RelativeEncoder.setPosition(double)` | `frc-relative-absolute` | construct a fresh `SparkMax` to simulate a power cycle |
| `Command.addRequirements(...)` | `frc-subsystems` onward | omit; mention requirements as real-robot-only |
| per-motor warning text exactly as above | `frc-pid-tuning` | any warning wording; spec asserts the *shape* |

**Author obligation.** Every "expected output" block in a spec is *computed*, not observed.
Run the starter code in the shipped PenguinSim and paste the **real** output into the lesson.
If the numbers differ, the spec's **output shape** assertions are what must still hold —
report the delta to the Architect rather than silently changing the teaching point.

**Honesty banner** (plan §4, non-negotiable) on every sim sandbox:

> Simulated for teaching. The real class comes from WPILib.

and the real `import` line shown beside the sim code, every time.

## 4. Widget vocabulary

Shipping today (`widgets.js`): `.sandbox[data-compiler]`, `.challenge[data-kind="fib"]`,
`[data-kind="text"]`, `[data-kind="mcq"]`, `.checkpoint`, `details.reveal`, `.callout--*`,
`.code`, `.code.with-lines`, `.diagram`, `.vocab`, `.exercise`, `.mark-complete`.

Being built for this track (plan §6): `signal-path` (U1), `scheduler-timeline` (U7),
`field-centric-toy` (U9), `tx-ty-visualizer` (U10), `data-kind="order"` (drag-to-order),
"Try it Yourself", line annotator.

If a spec names a widget not on either list it appears under a `WIDGET-REQUEST:` line
**with a stated fallback**. Authors ship the fallback if the widget isn't ready.

## 5. Season policy (target: **2026**)

Wrap in `callout--season` anything that is: a WPILib/vendor class name, an import path, a
RoboRIO or radio model, a dashboard recommendation, a vendordep version or URL, a tool's
UI location, or a game-specific claim. Each spec's `SEASON-FLAGS` section lists its own.

`[NEEDS RESEARCH: x]` in a spec means: **do not put it in a code block** until the matching
`content/research/*.md` factsheet confirms it with a citation. Prose may mention it hedged
("current REVLib also offers a configuration object — check the season's REV docs").

Terminology corrections applied track-wide (the sources get these wrong):
- **AprilTag**, one word, capital T — not "April Tag".
- The PS5 face button method is **`.cross()`**, never `.x()`.
- **Init runs once when the mode starts; Periodic runs every ~20 ms while in that mode.**
  The narrator's "init is what happens when it stops" is wrong and must never appear.
- `execute()` (a Command) and `periodic()` (a Subsystem) are different methods on the same
  20 ms loop. Never call `execute()` "the subsystem's periodic".
- Do not attribute the Limelight to any company or team — the source's attribution is
  unverified. Call it "a smart camera used across FRC."

## 6. The sourced war stories and where each one lives

| # | Story | Owner lesson (HOOK) | May be recalled by |
|---|---|---|---|
| 1 | Fried motor / 2 lost days / stay under 80 % | `frc-moving-a-motor` (built) | `frc-vendor-clients`, `frc-pid-tuning` |
| 2 | Voice-command ChairBot shelved for safety | `frc-what-programmers-do` | — |
| 3 | One broken CAN wire kills the whole loop | `frc-roborio-radio-can` | `frc-can-ids`, `frc-game-day` |
| 4 | Macs can't run the Driver Station | `frc-game-tools` | `frc-game-day` |
| 5 | The captain's laptop died; he coded on the driver-station laptop all season | `frc-wpilib-vscode` | `frc-game-day` |
| 6 | Jaguars discontinued — the import that will never resolve | `frc-vendordeps` | `frc-motors` |
| 7 | Sticky faults + "apply a test voltage" to isolate code vs wiring vs build | `frc-vendor-clients` | `frc-game-day` |
| 8 | "CAN ID 16 timed out" at competition | `frc-can-ids` | `frc-game-day`, built lesson |
| 9 | SmartDashboard banned; team moved to Glass; AdvantageScope caught an amperage cutout | `frc-dashboards` | — |
| 10 | Duplicated `ExampleSubsystem`, renamed the file but not the class — red squiggles everywhere | `frc-src-tree` | `frc-subsystems` |
| 11 | The flywheel: high inertia, needs a command with an end | `frc-chain-of-command` | `frc-command-lifecycle` |
| 12 | Every season something breaks from bad PID — bent parts, a mechanism falling off | `frc-pid-tuning` | `frc-vision-pid` |
| 13 | Motion profiling skipped: the syntax changed between seasons | `frc-pid-syntax` | — |
| 14 | ChairBot: 4 motors, 2 per side, one method per side | `frc-subsystems` | — |
| 15 | Hunting down every hard-coded `0` when a port changed | `frc-constants` | — |
| 16 | "Cross, not lacrosse" — the call where the button name confused everyone | `frc-controllers` | — |
| 17 | Re-tune the Limelight for every venue's lighting | `frc-limelight` | `frc-game-day` |
| 18 | PathPlanner is only approximate — pair it with vision correction | `frc-pathplanner` | — |
| 19 | You cannot build a reliable auto until mechanics and vision work | `frc-auto-routines` | — |
| 20 | Your job is not to coach the driver — watch the console | `frc-game-day` | — |
| 21 | Simulation never worked reliably; the team waits for the physical robot | `frc-what-programmers-do` | `frc-wpilib-vscode` |
| 22 | OneDrive sync corrupts a Gradle project | `frc-wpilib-vscode` (pitfall) | — |

## 7. Quality gates (plan §8) — a lesson is done when

1. Every FRC sample is API-verified against the PDF green box or a cited research factsheet.
2. Zero forward references (checked against `content/concept-ledger.frc.json`).
3. Sandbox present unless the spec says NO-COMPILER.
4. ≥3 challenges spanning ≥2 kinds, all answer keys correct.
5. Checkpoint 3–5 questions, **every option** carrying an explanation.
6. Exercise is a PenguinBot increment with a full reference solution.
7. Hook is a §6 story or a real mechanism — never invented.
8. Clean at 1440 px and 390 px, zero console errors.
9. Season-dependent claims wrapped in `callout--season`.
10. Manifest flipped to `ready:true` with `dur` + `diff` matching the spec header.
