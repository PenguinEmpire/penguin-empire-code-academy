# frc-auto-routines · Building an Auto Routine
unit: 11 · Autonomous   |   duration: 30 min   |   difficulty: Advanced
interactivity: SANDBOX (PenguinSim)

> Read `_shared-conventions.md` first (§3 sim contract; paste **real** output).
> This is the last code lesson in the track. It should feel like assembly, not invention — almost
> everything in it already exists. Say so.

INTRODUCES:
- `auto-routine` — the sequence that runs during autonomous
- `auto-chooser` — letting the drive team pick which routine runs
- `auto-sequencing` — composing paths, named commands and waits in order
- `auto-dependency-order` — why every piece must work in teleop first
- `auto-testing` — how you actually gain confidence in it

ASSUMES:
- `pathplanner-app`, `path`, `named-command`, `wait-command`, `start-pose`,
  `approximation-and-correction` (`frc-pathplanner`)
- `sequentialcommandgroup`, `parallelcommandgroup`, `command-composition` (`frc-command-groups`)
- `aim-with-tx`, `target-lost-handling` (`frc-vision-pid`)
- `robot-modes`, `init-vs-periodic`, `scheduler-run-in-robotperiodic` (`frc-robot-java`)
- `robotcontainer-structure`, `auto-chooser` mention (`frc-robotcontainer`)

GOAL:
Assemble an autonomous routine from existing commands, expose it through a chooser, and make sure
one stuck step can't cost the whole period.

HOOK: **You cannot build a reliable autonomous until mechanics and vision work**
(`_shared-conventions.md` §6 story 19 — PDF page 17). `callout--why`.
The source is more emphatic about this than about anything else in the curriculum, and this is the
last chance to say it: *you cannot build a reliable autonomous until mechanics and vision are
solid, because auto is literally a sequence of those commands.*

Now count what you're about to write. PenguinBot's autonomous needs: an arm that reaches a
setpoint, an intake that runs, a scoring sequence, a drivetrain, and a command that aims at a tag.
**Every single one already exists.** You built them in Units 4 through 10.

The new code in this lesson is a list, a chooser, and a timeout. That's it. Autonomous feels
impossible when you try it first and nearly trivial when you try it last, and the difference is
entirely ordering.

Second beat, the one that matters at competition: **autonomous is the most fragile code on the
robot.** Nobody can intervene. Fifteen seconds of a robot doing nothing looks identical, from the
stands, to a robot that wasn't programmed at all. That's what the timeout section is for.

EXPLAIN:

1. **A routine is a `SequentialCommandGroup`. You already know how to write one.**
   Lead with the reassurance and mean it. Autonomous is the same composition you did in
   `frc-command-groups`, with paths mixed in.
```
AutoRoutine (sequential)
  ├─ Path: start line -> in front of the goal      (approximate)
  ├─ AimAtTagCommand                               (precise)
  ├─ ScoreSequence                                 (already built and tested)
  ├─ WaitCommand(0.25)
  └─ Path: goal -> out of the way
```
   Every box except the two paths is a command already running in teleop.

2. **Parallel matters more here than anywhere else.** Autonomous is time-limited, so time saved is
   points scored. The arm can be raising **while** the robot drives to the goal — different
   subsystems, no conflict.
```
ParallelCommandGroup
  ├─ Path: drive to the goal        (2 s)
  └─ ArmToScoreCommand              (0.2 s)
```
   Costs 2 s instead of 2.2 s. Small — but chain four of these and it's a whole extra scoring
   cycle. The constraint from `frc-command-groups` still applies: same subsystem, no parallel.

3. **The chooser.** A dropdown on the dashboard lets the drive team pick a routine before the
   match — a two-piece auto, a simple leave-the-line auto, or do-nothing.
   Why it earns its place: alliance strategy changes match to match, and *"do nothing"* is a
   legitimate, sometimes correct choice when you'd otherwise collide with a partner. It lives in
   `RobotContainer` and is read by `getAutonomousCommand()`, which `Robot.autonomousInit()`
   schedules — the wiring you already saw in `frc-robot-java`.
   `[NEEDS RESEARCH: SendableChooser API and how it's published to the dashboard in 2026 —
   content/research/toolchain-2026.md. No code sample until confirmed.]`

4. **Timeouts are not optional here.** In teleop, a stuck command means the driver presses another
   button. In autonomous **nobody can intervene**, so a command that never finishes means the rest
   of the routine never runs — silently, for the whole period.
   Three things that can hang, all of which the student has already met:
   - `ArmToScoreCommand` if the arm jams (`frc-command-lifecycle` gave it a timeout — this is why).
   - `AimAtTagCommand` if the tag is never seen or the robot hunts around tolerance
     (`frc-vision-pid` bonus 2).
   - A path if the robot is blocked by another robot.
   The rule: **every command in an autonomous routine has a way to end that doesn't depend on
   succeeding.** Make it a `callout--pitfall`. It is the single most valuable sentence in Unit 11.

5. **Design for the ordinary case, degrade gracefully.** A routine that scores two pieces when
   everything works and zero when anything doesn't is worse than one that scores one piece
   reliably. Order the routine so the most valuable, most reliable action happens **first**, and
   the ambitious part last — so a failure late costs you the bonus, not the baseline.
   That's a genuinely strategic idea and worth a paragraph. It's also how you should order the
   sandbox experiments.

6. **Testing.** Reprise from `frc-pathplanner` with specifics:
   - Run it **ten times**, not twice.
   - Vary the battery — a flat battery accelerates differently and paths are computed from
     physics.
   - Vary the starting position slightly — does vision recover it?
   - Block the tag on one run — does the routine hang, or degrade?
   - Watch the console every run. `frc-game-day` is about doing exactly this at competition.

CODE:

**Sample — the routine as a command group.** Paths appear as comments until the factsheet lands:
```java
import edu.wpi.first.wpilibj2.command.SequentialCommandGroup;
import edu.wpi.first.wpilibj2.command.ParallelCommandGroup;
import edu.wpi.first.wpilibj2.command.WaitCommand;

public class ScoreAndLeaveAuto extends SequentialCommandGroup {

    public ScoreAndLeaveAuto(DriveSubsystem drive, LimelightSubsystem limelight,
                             ArmSubsystem arm, IntakeSubsystem intake) {
        addCommands(
            // Drive to the goal WHILE raising the arm -- different subsystems.
            new ParallelCommandGroup(
                /* PathPlanner path: start line -> scoring position */
                new ArmToScoreCommand(arm)
            ),

            new AimAtTagCommand(drive, limelight),   // precise: close the last few degrees
            new ScoreSequence(arm, intake),          // already built, already tested
            new WaitCommand(0.25),                   // settle before moving off

            /* PathPlanner path: scoring position -> out of the way */
            new ArmToStowCommand(arm)
        );
    }
}
```
Annotate: the parallel block and why; the aim step and why it isn't part of the path; that
`ScoreSequence` is unchanged from Unit 8; that every path is a comment because the API isn't
verified yet.
`[NEEDS RESEARCH: how to obtain a PathPlanner path as a Command to drop into this group —
content/research/vision-pathplanner.md]`

**Sample — wiring it in**, shape only:
```java
// RobotContainer
public Command getAutonomousCommand() {
    return new ScoreAndLeaveAuto(drive, limelight, arm, intake);
    // With a chooser: return autoChooser.getSelected();
}
```
Point back to `frc-robot-java`: `autonomousInit()` calls this and schedules the result. Nothing
new — the plumbing has been there since Unit 8.

SANDBOX:

Banner: **"Simulated for teaching. The real classes come from WPILib."**
Honesty note: PenguinSim has no drivetrain and no field, so **paths are represented by a
`FakePathCommand` defined in the student's own file** — a command that simply takes a fixed number
of ticks. That's an honest stand-in: what matters for sequencing is that a path *takes time and
then finishes*.

**Exact starter code** (reusing `ArmSubsystem`, `IntakeSubsystem`, `ArmToScoreCommand`,
`ArmToStowCommand` and `ScoreSequence` from the previous lessons verbatim):
```java
public class Main {
    // ... subsystems and commands from Units 7-8, unchanged ...

    // Stands in for a PathPlanner path: takes time, then finishes.
    static class FakePathCommand extends Command {
        private final String name;
        private final int    ticks;
        private int elapsed = 0;
        FakePathCommand(String name, int ticks) { this.name = name; this.ticks = ticks; }
        @Override public void initialize() { elapsed = 0;
                                             System.out.println("  PATH  " + name + " started"); }
        @Override public void execute()    { elapsed++; }
        @Override public boolean isFinished() { return elapsed >= ticks; }
        @Override public void end(boolean interrupted) {
            System.out.println("  PATH  " + name + " done (" + elapsed + " ticks)");
        }
    }

    static class ScoreAndLeaveAuto extends SequentialCommandGroup {
        ScoreAndLeaveAuto(ArmSubsystem arm, IntakeSubsystem intake) {
            addCommands(
                new ParallelCommandGroup(
                    new FakePathCommand("to-goal", 40),      // <-- CHANGE ME
                    new ArmToScoreCommand(arm)
                ),
                new ScoreSequence(arm, intake),
                new WaitCommand(0.25),
                new FakePathCommand("leave", 25)
            );
        }
    }

    public static void main(String[] args) {
        ArmSubsystem    arm    = new ArmSubsystem();
        IntakeSubsystem intake = new IntakeSubsystem();

        final int AUTO_TICKS = 150;   // 3 seconds of simulated autonomous

        System.out.println("=== AUTONOMOUS START ===");
        Command auto = new ScoreAndLeaveAuto(arm, intake);
        CommandScheduler.getInstance().schedule(auto);

        for (int tick = 1; tick <= AUTO_TICKS; tick++) {
            CommandScheduler.getInstance().run();
            if (tick % 25 == 0) {
                System.out.printf("tick %3d   arm %5.2f   roller %5.2f%n",
                                  tick, arm.getPosition(), intake.commanded());
            }
        }
        System.out.println("=== AUTONOMOUS END ===");
    }
}
```

**What the student changes:**
1. Swap the `ParallelCommandGroup` for a `SequentialCommandGroup` and compare total ticks. That
   difference is the value of parallelism, measured.
2. Set the `to-goal` path to 200 ticks (longer than the whole period) — the routine never reaches
   the scoring step. **Nothing errors.** This is the hang, made visible.
3. Give `ArmToScoreCommand` an unreachable setpoint — same silent hang, different cause.
4. Add the timeout from `frc-command-lifecycle` to `ArmToScoreCommand` and re-run experiment 3 —
   the routine now degrades instead of freezing.
5. Reorder so `ScoreSequence` comes **before** the path, and reason about which ordering scores
   more when something goes wrong.

**Expected printed output** (arm trajectory from the §3 contract, `kP = 0.2`, clamp ±0.8;
`ArmToScoreCommand` ≈ 10 ticks, `ArmToStowCommand` ≈ 10 ticks, `WaitCommand(0.25)` ≈ 13 ticks,
`ScoreSequence` ≈ 47 ticks as computed in `frc-command-groups`). **Author must re-run and paste
real output — the step boundaries are the numbers most likely to shift.**
```
=== AUTONOMOUS START ===
  PATH  to-goal started
tick  25   arm  8.88   roller  0.00
  PATH  to-goal done (40 ticks)
tick  50   arm  8.88   roller -0.50
tick  75   arm  8.88   roller -0.50
tick 100   arm  0.89   roller  0.00
  PATH  leave started
tick 125   arm  0.12   roller  0.00
  PATH  leave done (25 ticks)
tick 150   arm  0.12   roller  0.00
=== AUTONOMOUS END ===
```

**Output shape assertions** (must hold even if tick numbers shift):
1. The arm reaches its setpoint (≈10 ticks) **long before** the 40-tick path finishes — they ran
   in parallel, and the parallel group took as long as its **slowest** member.
2. `ScoreSequence` only begins after the whole parallel group has finished.
3. The steps happen strictly in order; nothing overlaps except inside the parallel block.
4. With sequential instead of parallel (experiment 1), the total is **about 10 ticks longer**.
5. With a 200-tick path (experiment 2), **nothing after the parallel group ever runs** and no
   error appears.
6. With the timeout added (experiment 4), the routine continues past a jammed arm.

Teaching text must land assertions 5 and 6 side by side. Assertion 5 is what losing an autonomous
period looks like from the code's point of view: nothing. Assertion 6 is the fix, and it's four
lines the student already wrote in Unit 7.

CHALLENGES:

1. **Drag-to-order · the routine.** Items (shuffled): *Path: drive out of the way* · *Aim at the
   tag* · *Path: drive to the scoring position* · *Score the game piece* · *Wait for the piece to
   settle*.
   **Answer key:** path to scoring position → aim at the tag → score → wait → path out of the way.
   Win: "Approximate first, then precise, then the behaviour you already had. That's every
   autonomous routine you'll ever write."
   Lose: "Drive there with a path (fast, approximate), correct with vision (slow, precise), score
   with the sequence you already built, let it settle, then clear the space."
   *Fallback: MCQ over three orderings.*

2. **MCQ · parallel** — "Driving to the goal takes 2 s and raising the arm takes 0.2 s. In
   parallel, how long?"
   - a) 2.2 s — "That's sequential."
   - b) ✓ **2 s — the slowest member sets the pace** — "Right, and that 0.2 s saved is real when
     you're chaining scoring cycles."
   - c) 0.2 s — "The group waits for everything to finish."
   - d) 1.1 s — "Parallel isn't an average."

3. **Predict / short answer** — "A path in your routine can never finish because another robot is
   blocking you, and it has no timeout. What does the rest of the routine do?"
   `data-answer="nothing|never runs|doesn't run|it never runs|nothing runs|never happens"`
   Win: "Nothing, for the whole period. No error, no warning — just fifteen seconds of a robot
   that looks unprogrammed."
   Lose: "None of it runs. A sequential group waits forever on a step that never finishes, and
   nobody can intervene during autonomous. That's why every step needs a way to end that doesn't
   depend on succeeding."

4. **MCQ · ordering for failure** — "Your routine can score two pieces if everything works. How do
   you order it?"
   - a) The harder second piece first, while there's time — "Then a failure costs you both."
   - b) ✓ **The reliable first piece first, the ambitious second piece after** — "Right. A failure
     late costs the bonus; a failure early costs everything."
   - c) In parallel — "You can't score two pieces with one arm at once; same subsystem."
   - d) Whichever is closer — "Distance matters less than protecting the baseline score."

5. **MCQ · the chooser** — "Why have a 'do nothing' option in the autonomous chooser?"
   - a) For testing only — "It's a real match choice."
   - b) ✓ **Sometimes not moving is correct — an alliance partner may be running a path through
     your space** — "Exactly, and having to redeploy code to achieve that would be far worse."
   - c) It's required by the rules — "No rule requires it."
   - d) To save battery — "Battery isn't the consideration."

MISCONCEPTIONS:
- *"Autonomous needs new commands."*
  → "It reuses everything you already built. If you're writing a lot of new commands for auto,
  something earlier in the season was skipped."
- *"A routine that works once is done."*
  → "Run it ten times, varying battery and starting position. Auto is the most fragile code on the
  robot and nobody can save it mid-match."
- *"Parallel is always faster."*
  → "Only across different subsystems. Two arm commands in parallel isn't fast, it's broken."
- *"If a step fails, the routine will move on."*
  → "It waits. Forever. Give every step a way to end that doesn't depend on succeeding."
- *"Ambitious autos are better."*
  → "One piece scored reliably beats two pieces attempted and missed. Order so a late failure
  costs the bonus, not the baseline."
- *"Autonomous code runs in `autonomousPeriodic()`."*
  → "`autonomousInit()` schedules the command; the scheduler in `robotPeriodic()` runs it.
  `autonomousPeriodic()` stays empty."

EXERCISE: **PenguinBot's autonomous, built.**
*Where we are:* everything. Intake (U4), encoders (U5), PID (U6), commands and subsystems (U7),
bindings and sequences (U8), a drivetrain (U9), vision (U10), and the design document from
`frc-pathplanner`. This is the last thing PenguinBot needs.

Task:
1. Write `ScoreAndLeaveAuto extends SequentialCommandGroup` implementing your design: parallel
   drive-and-raise, aim, score, wait, leave.
2. Add a **timeout to every step that could hang** — the arm command, the aim command, and each
   path. State each timeout's value and why.
3. Add a second, simpler routine: `LeaveLineAuto` — just drive off the line. This is your
   fallback when the mechanism is broken or the alliance strategy calls for it.
4. Wire a chooser in `RobotContainer` with three options: `ScoreAndLeaveAuto`, `LeaveLineAuto`, and
   do-nothing. Have `getAutonomousCommand()` return the selection.
5. Write the ten-run test plan with what you vary on each run.
Bonus: what would you change to score **two** pieces, and what's the argument against attempting
it in your first competition?

**Full reference solution** (`details.reveal`): the `ScoreAndLeaveAuto` from the CODE section,
plus:
> **2. Timeouts**
>
> | Step | Timeout | Why |
> |---|---|---|
> | `ArmToScoreCommand` | 2 s (100 ticks) | It normally takes 0.2 s. Anything beyond 2 s means it's jammed, and waiting won't fix it. |
> | `AimAtTagCommand` | 1.5 s | Aiming normally takes under 0.5 s. Longer means no tag, or hunting around tolerance. Better to score slightly off than not at all. |
> | Each path | its expected duration + 1 s | Blocked by another robot. Give up and let the next step try. |
>
> Every timeout ends the command *successfully* from the group's point of view, so the routine
> continues. Failing forward beats freezing.
>
> **3.**
> ```java
> public class LeaveLineAuto extends SequentialCommandGroup {
>     public LeaveLineAuto(DriveSubsystem drive) {
>         addCommands(/* PathPlanner path: start line -> just past the line */);
>     }
> }
> ```
> One step, almost nothing to go wrong. This is the routine you run when the arm broke in the
> previous match — and it still scores the leave-the-line points.
>
> **4.** A chooser in `RobotContainer` with three entries — Score and Leave (default), Leave Line,
> and Do Nothing (`null` or an empty command) — published to the dashboard, with
> `getAutonomousCommand()` returning the selected one. `Robot.autonomousInit()` already schedules
> whatever it returns; that wiring hasn't changed since Unit 8.
> *(Show the chooser as commented shape until `content/research/toolchain-2026.md` confirms the
> API.)*
>
> **5. Ten-run test plan**
>
> | Runs | Vary | Looking for |
> |---|---|---|
> | 1–3 | Nothing — fresh battery, marked start | Does the baseline work at all? |
> | 4–5 | Half-drained battery | Does slower acceleration break the path timing? |
> | 6–7 | Start 10 cm off the mark | Does vision recover it, or does it miss? |
> | 8 | Tag covered | Does the aim command time out and continue, or hang? |
> | 9 | Arm physically blocked | Does the timeout fire and the routine continue? |
> | 10 | Everything nominal again | Confirm nothing was broken by the fixes |
>
> Trust it at nine successes out of ten **with the one failure understood**. Watch the console
> every run — that habit is Unit 12.
>
> **Bonus — two pieces:** add a path back to a pickup position, an intake command, and a second
> score cycle, all after the first score. **Argument against it at your first competition:** every
> added step is another thing that can hang, and the two-piece attempt puts the robot in a busier
> part of the field where a collision is likelier. A one-piece auto that works in ten matches out
> of ten is worth more than a two-piece auto that works in six. Add the second piece once the
> first is boring.

Tease: "PenguinBot is finished. It intakes, senses, controls, sequences, drives, sees, and runs
itself. One lesson left — the day you take it to a field and find out."

CHECKPOINT: (5 questions, every option explained)

**Q1.** How much genuinely new code does a well-prepared autonomous routine need?
- a) A full new set of commands — "If so, they should have existed for teleop already."
- b) ✓ **Very little — a list of existing commands, a chooser, and timeouts** — "Exactly, and
  that's the payoff of building auto last."
- c) None at all — "You still write the routine, the chooser, and the timeouts."
- d) More than teleop — "Far less, if the units before it were done properly."

**Q2.** A step in your sequential routine can never finish. What happens?
- a) It's skipped after a while — "Nothing skips anything on its own."
- b) An error is logged — "No error at all."
- c) ✓ **Every subsequent step never runs, silently, for the whole period** — "Right, and that's
  why every auto step needs a timeout."
- d) The robot disables — "It stays enabled and does nothing."

**Q3.** Which pair can safely run in a parallel group?
- a) `ArmToScoreCommand` and `ArmToStowCommand` — "Both require the arm. Not allowed, and they'd
  disagree anyway."
- b) ✓ **A drivetrain path and `ArmToScoreCommand`** — "Different subsystems, no conflict, and it
  saves time."
- c) Two `AimAtTagCommand`s — "Both require the drivetrain."
- d) `ScoreSequence` and `ArmToStowCommand` — "`ScoreSequence` already uses the arm."

**Q4.** Why include a do-nothing option in the chooser?
- a) To disable the robot — "Do-nothing in auto still leaves you enabled for teleop."
- b) ✓ **Sometimes staying put is the right call, and choosing it shouldn't require a redeploy** —
  "Exactly — alliance strategy changes between matches."
- c) To test the chooser — "A useful side effect, not the reason."
- d) It's required — "No rule requires it."

**Q5.** You can score one piece reliably or attempt two. What do you run at your first
competition?
- a) Two — more points — "Only if it works, and every added step is another way to score zero."
- b) ✓ **One, reliably; add the second once the first is boring** — "Right. Nine reliable scores
  beat six ambitious ones, and you can upgrade between events."
- c) Neither; do nothing — "You'd be leaving certain points on the field."
- d) Alternate between matches — "You'd learn nothing conclusive about either."

SEASON-FLAGS:
- `callout--season` on the chooser API, the PathPlanner routine-loading API, the autonomous
  period's length, and the field layout.
- `[NEEDS RESEARCH: SendableChooser and dashboard publishing (content/research/toolchain-2026.md);
  loading a PathPlanner routine as a Command (content/research/vision-pathplanner.md);
  2026 autonomous period duration and scoring]`
- Command composition, timeouts, and the testing discipline are stable.

SIM-REQUEST: `SequentialCommandGroup`, `ParallelCommandGroup`, `WaitCommand` — shared with
`frc-command-groups`, listed in `_shared-conventions.md` §3.
*Fallback if not shipped:* the hand-rolled `Sequence` from `frc-command-groups`'s fallback works
here unchanged, and the `FakePathCommand` is already the student's own code. The lesson's core
demonstrations — parallel saving time, and a hanging step freezing everything — both survive.
