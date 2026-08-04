# frc-command-groups · Sequential & Parallel Groups
unit: 8 · Wiring It Together   |   duration: 25 min   |   difficulty: Intermediate
interactivity: SANDBOX (PenguinSim)

> Read `_shared-conventions.md` first (§3 sim contract; paste **real** output).
> This lesson cashes the promise made in Unit 3: *commands have an end so that behaviours can be
> sequenced.* Everything since has been building the parts. Here they compose.

INTRODUCES:
- `sequentialcommandgroup` — run in order, each waiting for the previous
- `parallelcommandgroup` — run all at once
- `command-composition` — a group **is** a command, so groups nest
- `waitcommand` — a timed pause as a command
- `group-requirements` — why two commands needing the same subsystem can't be parallel

ASSUMES:
- `instantcommand`, `lambda-binding`, `configure-bindings` (`frc-robotcontainer`)
- `command-class` + full lifecycle, `command-scheduler` (`frc-command-lifecycle`)
- `add-requirements`, `subsystembase` (`frc-subsystems`)
- `command-end-condition` (`frc-chain-of-command`)

GOAL:
Compose existing commands into a scoring sequence, and decide correctly which steps run in order
and which run together.

HOOK: **The intake sequence** (`_shared-conventions.md` §6 story — the `InstantCommand` rationale
from the intro notes). `callout--why`.
The source explains `InstantCommand` with a specific motivation: *it runs once and immediately
ends. That makes it perfect for sequences — turn on the rollers (instant), then the next step
fires immediately after, like in a shoot or intake sequence.*

That sentence assumes something you now have. PenguinBot can raise its arm to a setpoint and stop
there. It can spin its intake. Scoring is those two things **in a specific order**:

> arm up → spit the piece out → wait for it to clear → arm back down

Try that with four button bindings and the driver has to time it by hand, mid-match, while
someone is defending them. Try it with four method calls in a row and all four happen in the same
20 ms — the intake fires while the arm is still at the bottom, and the piece lands on the floor.

**Order needs duration, and duration needs an end condition.** That's what commands have been for
all along.

EXPLAIN:

1. **The verified syntax.** The source's box, short and complete:
```java
// [FROM PDF page 13, §8.1 "Grouping commands"]
// Run in order, each waits for the previous to finish:
new SequentialCommandGroup(cmd1, cmd2, cmd3);

// Run all at the same time:
new ParallelCommandGroup(cmdA, cmdB);
```
   Mark: [FROM PDF page 13 verified box + Appendix A]
   `[NEEDS RESEARCH: confirm both class names and their imports
   (edu.wpi.first.wpilibj2.command.*) for the current WPILib; also confirm whether
   `Commands.sequence(...)` / `Commands.parallel(...)` factories are now preferred —
   content/research/toolchain-2026.md. Teach the class form (both sources verify it) and mention
   factories in flagged prose only.]`

2. **A group is itself a Command.** This is the idea that makes groups powerful rather than
   merely convenient. `SequentialCommandGroup` extends `Command`: it has `initialize`, `execute`,
   `isFinished`, `end`, and it can be bound to a button, put inside another group, or used as an
   autonomous routine.
   Analogy: a **playlist is a track**. You can play it, queue it, or put it inside another
   playlist.
   Consequence worth stating: your whole autonomous routine in Unit 11 will be one sequential
   group of the commands you already wrote.

3. **How a sequential group actually runs.** Students imagine something clever; it's simple:
```
initialize()  -> initialize the FIRST command
execute()     -> execute the current command
                 if it isFinished(): end it, and initialize the NEXT one
isFinished()  -> true when the last command has finished
```
   Two consequences the sandbox will show:
   - The group finishes when its **last** command finishes. Give it a command that never ends and
     the whole group never ends — and neither does the autonomous routine containing it.
   - An `InstantCommand` inside a sequence does its work the moment the previous step finishes,
     because `InstantCommand` runs its action in `initialize()`.
   `[NEEDS RESEARCH: confirm SequentialCommandGroup initializes the next command in the same tick
   the previous finishes, and that InstantCommand acts in initialize()]`

4. **Parallel: what it's for, and what it costs.**
   Good: raise the arm **while** driving to the scoring position. Two subsystems, no conflict,
   half the time.
   The constraint, and it's a hard one: **two commands requiring the same subsystem cannot be in
   the same parallel group.** They'd both be driving one mechanism, which is precisely what
   requirements exist to prevent.
   `[NEEDS RESEARCH: confirm the current WPILib behaviour when a parallel group is given two
   commands with overlapping requirements — an exception at construction, or an interruption at
   runtime?]` Describe it as "not allowed" and flag the exact mechanism until confirmed.
   Beat: a parallel group ends when **all** its commands end. One slow member sets the pace, and
   one member that never ends means the group never ends.

5. **`WaitCommand` — a pause you can sequence.**
   `new WaitCommand(0.5)` does nothing for half a second and then finishes. It looks trivial and
   it's essential: physical things take time that no sensor is measuring. The game piece needs a
   moment to clear the roller before the arm comes down.
   Mark: [FROM PDF page 17, §11.2 — "wait commands: pause N seconds before continuing", named
   there in the PathPlanner context]
   `[NEEDS RESEARCH: confirm WaitCommand's constructor takes seconds as a double in the current
   WPILib]`
   Honest caveat worth a `callout--tip`: a wait is a **guess**. Where a sensor can tell you the
   piece has cleared, use the sensor. Waits are what you use when you have no sensor, and every
   one is a small bet on the robot behaving the same way twice.

6. **Designing PenguinBot's `ScoreSequence` out loud.** Walk the decision, step by step — the
   reasoning is the transferable skill:

| Step | Sequential or parallel? | Why |
|---|---|---|
| `ArmToScoreCommand` | first, alone | the piece must be up before it's released |
| outtake on | immediately after | `InstantCommand`, no duration |
| wait 0.5 s | after | give the piece time to clear |
| outtake off | after | `InstantCommand` |
| `ArmToStowCommand` | last | only safe once the piece is gone |

   Then the counter-example that makes the point: *could steps 1 and 2 be parallel?* No — you'd
   spit the piece out at floor level. *Could the arm stow while the intake stops?* Yes, and that's
   a legitimate optimisation — a small `ParallelCommandGroup` for the last two steps. Show it as a
   bonus so the student sees composition nesting.

CODE:

**Sample — PenguinBot's `ScoreSequence`:**
```java
import edu.wpi.first.wpilibj2.command.SequentialCommandGroup;
import edu.wpi.first.wpilibj2.command.InstantCommand;
import edu.wpi.first.wpilibj2.command.WaitCommand;
import static frc.robot.Constants.IntakeConstants;

public class ScoreSequence extends SequentialCommandGroup {

    public ScoreSequence(ArmSubsystem arm, IntakeSubsystem intake) {
        addCommands(
            new ArmToScoreCommand(arm),                                        // takes time
            new InstantCommand(() -> intake.runRoller(IntakeConstants.kOuttakeSpeed), intake),
            new WaitCommand(0.5),                                              // let it clear
            new InstantCommand(intake::stop, intake),
            new ArmToStowCommand(arm)                                          // takes time
        );
    }
}
```
Annotate: extending the group class and calling `addCommands` in the constructor is the standard
pattern; `intake::stop` is a method reference, the same idea as the lambda; the group *is* a
command, so `new ScoreSequence(arm, intake)` binds straight to a button.
`[NEEDS RESEARCH: confirm `addCommands(Command...)` is the current API on
SequentialCommandGroup]`

**Sample — binding it**, one line in `RobotContainer`:
```java
driver.cross().onTrue(new ScoreSequence(arm, intake));
```
Point out what just happened: the binding got *simpler* while the behaviour got more
sophisticated. One button, five steps, correct order.

SANDBOX:

Banner: **"Simulated for teaching. The real classes come from WPILib."**

**Exact starter code** (abbreviated — reuse the `ArmSubsystem` / `IntakeSubsystem` /
`ArmToScoreCommand` definitions from `frc-robotcontainer`'s sandbox verbatim so the student
recognises them, and add `ArmToStowCommand` as the same class targeting `0.0`):
```java
public class Main {
    // ... ArmSubsystem, IntakeSubsystem, ArmToScoreCommand, ArmToStowCommand as before ...

    static class ScoreSequence extends SequentialCommandGroup {
        ScoreSequence(ArmSubsystem arm, IntakeSubsystem intake) {
            addCommands(
                new ArmToScoreCommand(arm),
                new InstantCommand(() -> {
                    intake.runRoller(-0.5);
                    System.out.println("  [2] outtake ON");
                }),
                new WaitCommand(0.5),            // <-- CHANGE ME
                new InstantCommand(() -> {
                    intake.stop();
                    System.out.println("  [4] outtake OFF");
                }),
                new ArmToStowCommand(arm)
            );
        }
    }

    public static void main(String[] args) {
        ArmSubsystem    arm    = new ArmSubsystem();
        IntakeSubsystem intake = new IntakeSubsystem();

        System.out.println("ScoreSequence scheduled");
        CommandScheduler.getInstance().schedule(new ScoreSequence(arm, intake));

        for (int tick = 1; tick <= 55; tick++) {
            CommandScheduler.getInstance().run();
            if (tick % 5 == 0) {
                System.out.printf("tick %2d   arm %5.2f   roller %5.2f%n",
                                  tick, arm.getPosition(), intake.commanded());
            }
        }
    }
}
```
The `ArmToScoreCommand` / `ArmToStowCommand` classes print `[1] arm at score` and `[5] arm
stowed` from their `end()` methods so the step boundaries are visible.

**What the student changes:**
1. `WaitCommand(0.5)` → `WaitCommand(0.1)` and `WaitCommand(2.0)` — watch the whole sequence's
   length change, and think about the game piece.
2. **Reorder** the commands: put the outtake `InstantCommand` first. The piece is released at
   floor level. This is the most instructive mistake in the lesson — make them make it.
3. Replace the whole thing with `ParallelCommandGroup` and observe everything happening at once.
4. Give `ArmToScoreCommand` an unreachable setpoint (say `50.0`) and watch the entire sequence
   hang forever at step 1.

**Expected printed output** (arm trajectory from the §3 contract, `kP = 0.2`, clamp ±0.8;
`ArmToScoreCommand` finishes at tick 10 at 8.88, `ArmToStowCommand` takes 10 ticks from 8.88 back
toward 0.0, `WaitCommand(0.5)` = 25 ticks). **Author must re-run and paste real output — the
exact tick boundaries around the wait and the instants are the numbers most likely to shift.**
```
ScoreSequence scheduled
tick  5   arm  6.40   roller  0.00
  [1] arm at score (8.88)
  [2] outtake ON
tick 10   arm  8.88   roller -0.50
tick 15   arm  8.88   roller -0.50
tick 20   arm  8.88   roller -0.50
tick 25   arm  8.88   roller -0.50
tick 30   arm  8.88   roller -0.50
tick 35   arm  8.88   roller -0.50
  [4] outtake OFF
tick 40   arm  5.68   roller  0.00
tick 45   arm  0.89   roller  0.00
  [5] arm stowed (0.12)
tick 50   arm  0.12   roller  0.00
tick 55   arm  0.12   roller  0.00
ScoreSequence finished
```
Approximate step boundaries the author should verify: score = ticks 1–10; outtake-on fires at
tick 10 (an `InstantCommand` acts in `initialize()`, which the group calls the moment the
previous step finishes); wait = ticks 12–36; outtake-off at 37; stow = ticks 38–47.

**Output shape assertions** (must hold even if tick numbers shift):
1. The steps happen **strictly in order** — nothing from step 3 before step 2 is done.
2. The roller is **only** negative between outtake-on and outtake-off.
3. The arm does **not** move during the wait — one subsystem idle while another step runs.
4. The arm goes back down **only after** the outtake stops.
5. The whole group reports finished after its **last** command finishes.
6. In experiment 4, the group **never finishes** and steps 2–5 never happen. Nothing errors.

Teaching text must land assertions 4 and 6. Assertion 6 especially: *one command that can't
finish freezes everything downstream of it. In Unit 11 that's a whole autonomous routine doing
nothing for fifteen seconds while the crowd watches.*

CHALLENGES:

1. **Drag-to-order · build the sequence.** Items (shuffled): *Stop the intake* · *Raise the arm to
   the scoring setpoint* · *Wait 0.5 s for the piece to clear* · *Lower the arm to stowed* · *Run
   the intake in reverse*.
   **Answer key:** raise → reverse → wait → stop → lower.
   Win: "That's `ScoreSequence`. Every step waits for the one before it, which is only possible
   because each has an end condition."
   Lose: "Raise the arm first — releasing at floor level drops the piece. Then reverse the intake,
   wait for the piece to clear, stop the intake, and only then lower."
   *Fallback: MCQ over three orderings.*

2. **MCQ · sequential or parallel?** — "Driving to the scoring position takes 2 s; raising the arm
   takes 1 s. They use different subsystems. Which group?"
   - a) Sequential — safer — "It's safe and it wastes a second every cycle. Different subsystems
     don't conflict."
   - b) ✓ **Parallel — different subsystems, so both can run, and the group ends when the slower
     one does** — "Right, and the group takes 2 s rather than 3."
   - c) Neither; use two bindings — "Then the driver has to time it, which is what you're trying
     to avoid."
   - d) Parallel, and it takes 1 s — "It takes as long as the *slowest* member: 2 s."

3. **MCQ · the requirements constraint** — "You put `ArmToScoreCommand` and `ArmToStowCommand` in
   the same `ParallelCommandGroup`. Why is that wrong?"
   - a) Parallel groups only take two commands — "They take any number."
   - b) ✓ **Both require the arm, and two commands can't drive one subsystem at once** — "Exactly
     — and they'd be commanding opposite setpoints, which is the clearest possible case of why
     requirements exist."
   - c) One is longer than the other — "Different durations are fine in parallel."
   - d) You need a `WaitCommand` between them — "You need them to be *sequential*."

4. **Predict the behaviour** — `data-kind="text"`. "`ArmToScoreCommand`'s setpoint is unreachable,
   so it never finishes. Your `ScoreSequence` runs it first. What does the intake do?"
   `data-answer="nothing|never runs|doesn't run|never starts|it never runs|nothing at all"`
   Win: "Nothing, ever. A sequential group doesn't start step 2 until step 1 finishes, and step 1
   never will. No error, no warning — just a robot that quietly does nothing."
   Lose: "The intake never runs. The sequence is stuck on step 1 forever. Nothing errors, which is
   why this class of bug is so hard to spot — put timeouts on commands that could hang."

5. **Fill-in-the-blank** — `data-kind="fib"`:
   ```
   new <blank>(cmd1, cmd2, cmd3);   // in order, each waiting for the last
   new <blank>(cmdA, cmdB);         // both at once
   new <blank>(0.5);                // pause half a second
   ```
   answers: `SequentialCommandGroup`, `ParallelCommandGroup`, `WaitCommand`
   Win: "Three building blocks. Every autonomous routine you'll ever write is made of these plus
   the commands you already have."
   Lose: "`SequentialCommandGroup` for order, `ParallelCommandGroup` for together, `WaitCommand`
   for a timed pause."

MISCONCEPTIONS:
- *"A group is a special thing, not a command."*
  → "A group **is** a command. Bind it to a button, nest it in another group, use it as your
  autonomous routine — all the same."
- *"Parallel means faster, so use it wherever possible."*
  → "Only where the commands need different subsystems, and only where doing them together is
  physically safe. Two arm commands in parallel is not faster; it's broken."
- *"A parallel group ends when the first command ends."*
  → "It ends when **all** of them do. The slowest member sets the pace."
- *"`WaitCommand` blocks the robot."*
  → "It blocks its own sequence. Everything else — other subsystems' `periodic()`, other
  commands, the whole scheduler — carries on."
- *"If a step hangs, the group will time out."*
  → "Nothing times out on its own. Give commands that could hang their own timeout, as you did in
  `frc-command-lifecycle`."
- *"I should replace my individual commands with one big one."*
  → "Composition is the opposite move: keep small commands that do one thing, and build big
  behaviours by combining them. Those same small commands become your autonomous routine."

EXERCISE: **PenguinBot scores from one button.**
*Where we are:* `RobotContainer` binds four buttons to four separate behaviours. The driver has to
sequence a scoring cycle by hand.

Task:
1. Write `ArmToStowCommand` — the same shape as `ArmToScoreCommand`, targeting the stowed setpoint
   from `Constants`.
2. Write `ScoreSequence extends SequentialCommandGroup`: arm up → outtake on → wait → outtake off
   → arm down.
3. Rebind `cross()` in `RobotContainer` to `new ScoreSequence(arm, intake)`, replacing the bare
   `ArmToScoreCommand`.
4. Write one sentence per step explaining why it can't move earlier in the order.
Bonus 1: make the last two steps a `ParallelCommandGroup` nested inside the sequence — the intake
stops *while* the arm stows — and say how much time that saves.
Bonus 2: add a timeout to `ArmToScoreCommand` so a jammed arm can't freeze the whole sequence.
(You wrote one in `frc-command-lifecycle` — reuse it.)

**Full reference solution** (`details.reveal`):
```java
// commands/ArmToStowCommand.java
public class ArmToStowCommand extends Command {
    private final ArmSubsystem arm;
    public ArmToStowCommand(ArmSubsystem arm) { this.arm = arm; addRequirements(arm); }
    @Override public void initialize()    { arm.startMove(); }
    @Override public void execute()       { arm.goToStowed(); }
    @Override public boolean isFinished() { return arm.atSetpoint(); }
    @Override public void end(boolean interrupted) { arm.stop(); }
}
```
```java
// commands/ScoreSequence.java
import edu.wpi.first.wpilibj2.command.SequentialCommandGroup;
import edu.wpi.first.wpilibj2.command.ParallelCommandGroup;
import edu.wpi.first.wpilibj2.command.InstantCommand;
import edu.wpi.first.wpilibj2.command.WaitCommand;
import static frc.robot.Constants.IntakeConstants;

public class ScoreSequence extends SequentialCommandGroup {

    public ScoreSequence(ArmSubsystem arm, IntakeSubsystem intake) {
        addCommands(
            // 1. Raise first. Releasing the piece at floor level drops it on the floor.
            new ArmToScoreCommand(arm),

            // 2. Now release. Instant -- there is nothing to wait for.
            new InstantCommand(() -> intake.runRoller(IntakeConstants.kOuttakeSpeed), intake),

            // 3. Give the piece time to physically clear the roller. No sensor for this,
            //    so it is a timed guess -- keep it as short as reliably works.
            new WaitCommand(0.5),

            // 4 + 5 (Bonus 1). The intake can stop WHILE the arm comes down: different
            //    subsystems, no conflict. Saves the ~20 ms the separate step would cost.
            new ParallelCommandGroup(
                new InstantCommand(intake::stop, intake),
                new ArmToStowCommand(arm)
            )
        );
    }
}
```
```java
// RobotContainer.configureBindings() -- one line changes
driver.cross().onTrue(new ScoreSequence(arm, intake));
```
> **Why each step can't move earlier**
> 1. **Arm up** — everything after it assumes the piece is at scoring height.
> 2. **Outtake on** — before the arm is up, this releases the piece onto the floor.
> 3. **Wait** — stopping the roller immediately would trap the piece half out.
> 4. **Outtake off** — before the wait, the piece hasn't cleared.
> 5. **Arm down** — before the piece is clear, the arm carries it back down with it.
>
> **Bonus 1 saving:** roughly one scheduler tick (20 ms). Small — but the *pattern* is what
> matters: in Unit 11 you'll run a whole drivetrain path in parallel with an arm movement, and
> that saves seconds, not milliseconds.
>
> **Bonus 2:** the timeout matters more than it looks. Without it, a jammed arm means
> `ScoreSequence` never gets past step 1 — during a match, for the whole match, silently.

Tease: "One button now runs five commands in order. Something still has to call
`CommandScheduler.run()` every 20 ms, and something has to decide whether you're in teleop or
autonomous. That's `Robot.java` — the file you mostly leave alone, explained."

CHECKPOINT: (5 questions, every option explained)

**Q1.** When does a `SequentialCommandGroup` finish?
- a) When the first command finishes — "That's when the *second* one starts."
- b) ✓ **When the last command finishes** — "Yes — and if any member can't finish, the group
  can't either."
- c) After a fixed time — "There's no built-in time limit."
- d) When the button is released — "Only if it was bound with `whileTrue`."

**Q2.** When does a `ParallelCommandGroup` finish?
- a) When the first member finishes — "That's a different variant; the plain parallel group waits
  for everything."
- b) ✓ **When all its members have finished** — "Right, so the slowest one sets the duration."
- c) Immediately — "Only if every member happens to be instantaneous."
- d) When any member is interrupted — "Interruption affects the group differently; the normal end
  condition is all-finished."

**Q3.** Why can't two commands that both require the arm run in parallel?
- a) Parallel groups take only one command per type — "Type isn't the constraint."
- b) ✓ **Two commands can't drive one subsystem at once — that's exactly what requirements
  prevent** — "Correct, and it's the runtime enforcement of Unit 3's ownership rule."
- c) It would be too slow — "It's a correctness problem, not a performance one."
- d) The arm can only run in autonomous — "Mode has nothing to do with it."

**Q4.** What makes a group composable — nestable inside another group?
- a) It's in the `commands/` folder — "Folders don't confer behaviour."
- b) ✓ **A group *is* a Command, with the same four lifecycle methods** — "Exactly — which is also
  why you can bind one straight to a button."
- c) Groups have a special `nest()` method — "No such thing; you just pass one in."
- d) Only sequential groups nest — "Both do."

**Q5.** What's the honest weakness of `WaitCommand`?
- a) It stops the whole robot — "It only pauses its own sequence."
- b) It's inaccurate — "It's accurate about *time*; that's not the problem."
- c) ✓ **It's a guess about the physical world that no sensor is confirming** — "Right. Where a
  sensor can tell you the piece cleared, use the sensor; a wait is what you use when you can't."
- d) It can't be used in autonomous — "It's most commonly used *in* autonomous."

SEASON-FLAGS:
- `callout--season` on the group class names, `addCommands`, and `WaitCommand`, until confirmed.
  `[NEEDS RESEARCH: SequentialCommandGroup / ParallelCommandGroup / WaitCommand class names,
  imports and constructors; addCommands(Command...); whether Commands.sequence()/parallel()
  factories are now preferred; behaviour on overlapping requirements in a parallel group —
  content/research/toolchain-2026.md]`
- The *concepts* (order, together, composition, requirements) are framework-stable.

SIM-REQUEST: `SequentialCommandGroup`, `ParallelCommandGroup`, `WaitCommand(double)` — **not in
the plan's shim list; requested in `_shared-conventions.md` §3.**
*Fallback if not shipped:* have the student hand-roll a `Sequence extends Command` that holds an
array of commands and an index, advancing when the current one reports finished — roughly fifteen
lines. This is arguably **better teaching** (it makes EXPLAIN beat 3 literal rather than
described) and the spec should include it as an optional "build it yourself" reveal regardless.
A hand-rolled `WaitCommand` using `Timer` is five lines. Show the real WPILib classes statically
in either case.
