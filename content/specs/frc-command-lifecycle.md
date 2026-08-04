# frc-command-lifecycle · The Command Lifecycle
unit: 7 · Structuring Behavior   |   duration: 30 min   |   difficulty: Intermediate
interactivity: SANDBOX (PenguinSim) + **scheduler timeline** widget

> Read `_shared-conventions.md` first (§3 sim contract; paste **real** output).
> Plan §4 names this as the payoff of building PenguinSim at all: *"the hardest concept in the
> course becomes observable."* The sandbox is the lesson. Everything else supports it.

INTRODUCES:
- `command-class` — a behaviour with a defined end
- `initialize` — runs **once**, when the command begins
- `execute` — runs **repeatedly**, every ~20 ms, while active
- `is-finished` — checked every cycle; return `true` to end
- `end-interrupted` — `end(boolean interrupted)`, once, when the command stops
- `twenty-ms-loop` — the tick everything runs on
- `command-scheduler` — the thing that calls all of the above
- `scheduler-order` — what happens, in what order, inside one tick

ASSUMES:
- `chain-of-command`, `command-role`, `command-end-condition` (`frc-chain-of-command`)
- `pidcontroller-class`, `at-setpoint`, `pid-reset` (`frc-pid-syntax`)
- `encoder-velocity` (`frc-encoders`), `eighty-percent-rule` (`frc-moving-a-motor`)
- **Not** `SubsystemBase` — that's the next lesson. Commands here talk to the plain `Arm` and
  `Flywheel` classes the student already has.
- Java: inheritance, `@Override`, abstract methods (Phase 1).

GOAL:
Write a Command with all four lifecycle methods, and predict exactly which one runs on which
tick.

HOOK: **The flywheel, finally** (`_shared-conventions.md` §6 story 11 — set up in
`frc-chain-of-command`, cashed here). `callout--why`.
Unit 3 promised you'd watch this run. Here it is.

A flywheel has high moment of inertia: hard to start, and it holds its speed once moving. You
can't shoot until it reaches 4000 RPM. Ram it to 100 % to get there fast and you fry the motor
(Unit 4). Ease it up and you have to *know* when it's ready.

You now have every piece: an encoder that reports velocity (Unit 5), a safe output limit (Unit
4), and the idea of a behaviour with an end (Unit 3). What's been missing is the thing that
calls your code every 20 ms and asks, over and over, *"are you done yet?"*

That's the **CommandScheduler**, and in the sandbox below you'll watch it do exactly that,
tick by tick, and see with your own eyes that the flywheel takes **eighteen ticks** — 360
milliseconds — to reach speed.

EXPLAIN:

1. **The four methods.** Reproduce the source's table, which exists specifically to correct the
   narrator's spoken names. **The right-hand column is the truth.**

| Narrator said | Real method | Runs… |
|---|---|---|
| start | `initialize()` | **once**, when the command begins |
| periodic | `execute()` | **repeatedly**, every ~20 ms, while active |
| end | `end(boolean interrupted)` | **once**, when the command stops |
| isFinished | `isFinished()` | **every cycle**; return `true` to end |

   Mark: [FROM PDF page 11, §7.1 verified box]
   `callout--verified`: the narrator's names are informal shorthand. Use the real ones.

2. **Analogy: a recipe step.**
   `initialize()` — get the pan out and turn the heat on. Once.
   `execute()` — stir. Again. Again. Again.
   `isFinished()` — glance at it: is it done? Every time round.
   `end()` — take it off the heat and turn the hob off. Once, whether it finished or someone
   grabbed the pan off you.
   That last clause is `interrupted`, and it matters — see beat 5.

3. **`isFinished()` is the whole point.** From the source's verified note: returning `true` ends
   the command **immediately**; returning `false` means it **never ends on its own**.
   Both are legitimate:
   - `return armPid.atSetpoint();` — ends when the arm arrives.
   - `return false;` — runs until something else stops it. That's correct for a
     "hold this while the button is held" behaviour.
   Beat: `isFinished()` is checked **every cycle**, including immediately after `execute()`. A
   command that finishes on its first check still gets one `execute()`.

4. **`execute()` and `periodic()` are not the same method.** The source flags this explicitly and
   students confuse them constantly.
   - `execute()` belongs to a **Command**, and runs only while that command is **scheduled**.
   - `periodic()` belongs to a **Subsystem**, and runs **always**, scheduled or not.
   Both on the same ~20 ms loop. Different owners, different lifetimes.
   Mark: [FROM PDF page 11, §7.1 verified note]
   Next lesson makes this concrete by printing both.

5. **`end(boolean interrupted)` — the argument is information.**
   - `interrupted == false` — you finished normally; `isFinished()` returned `true`.
   - `interrupted == true` — something stopped you: the button was released, another command
     took the mechanism, the robot was disabled.
   Why care? Because "arm reached the setpoint" and "the driver let go halfway" should often
   behave differently, and `end()` is the single place you can tell them apart. The universal
   rule: **`end()` is where you stop the motor**, regardless — it is the only method guaranteed
   to run when the command stops.

6. **What the scheduler does in one tick.** Present as an ordered list; it's the mental model
   the sandbox will confirm:
```
CommandScheduler.getInstance().run()   -- one 20 ms tick
  1. every registered Subsystem's periodic()          (next lesson)
  2. poll the controller buttons / triggers           (Unit 8)
  3. for each scheduled Command:
        execute()
        if (isFinished()) { end(false); unschedule it; }
  4. schedule default commands for unused subsystems   (next lesson)
```
   And separately: `schedule(command)` calls `initialize()` **at once**, not on the next tick.
   Mark: `[NEEDS RESEARCH: confirm the exact ordering inside CommandScheduler.run() for the
   current WPILib — specifically that subsystem periodic() runs before command execute(), and
   that schedule() calls initialize() immediately — content/research/toolchain-2026.md]`
   This ordering is asserted in the sandbox's output, so it must be verified before publication.

7. **The shape you've already written twice.** Call it out, because it's true and it's
   satisfying: in `frc-relative-absolute` you wrote `startHoming()` / `isAtHardStop()` /
   `finishHoming()`. In `frc-pid-syntax` you wrote `startMove()` / `moveToward()` /
   `atSetpoint()`. Both times you invented this lifecycle by hand. All the framework does is
   agree on the names and call them for you.

CODE:

**Sample 1 — the skeleton.**
```java
// [FROM PDF page 11, §7.1 verified box + Appendix A]
import edu.wpi.first.wpilibj2.command.Command;

public class SpinUpFlywheel extends Command {

    private final Flywheel flywheel;
    private static final double TARGET_RPM = 4000.0;

    public SpinUpFlywheel(Flywheel flywheel) {
        this.flywheel = flywheel;
    }

    @Override
    public void initialize() {
        // once, at the start
    }

    @Override
    public void execute() {
        flywheel.setSpeed(0.8);          // every ~20 ms while scheduled
    }

    @Override
    public boolean isFinished() {
        return flywheel.getVelocity() >= TARGET_RPM;   // checked every cycle
    }

    @Override
    public void end(boolean interrupted) {
        // once, when it stops -- normally OR interrupted
    }
}
```
Annotate: the constructor takes the mechanism it needs (that's how a command reaches hardware —
never by creating a motor itself); `0.8` is the 80 % rule, not a coincidence; `isFinished`
returns the velocity check, which is why Unit 5 had to come first.
Mark: `[NEEDS RESEARCH: confirm the base class is `Command` (not the older `CommandBase`) in the
current WPILib — content/research/toolchain-2026.md]`. The PDF gives the method names but not
the class name; do not present the `extends Command` line as verified until confirmed. Prose
note: older code may say `extends CommandBase`.

**Sample 2 — PenguinBot's arm command**, the one the exercise builds:
```java
public class ArmToScoreCommand extends Command {

    private final Arm arm;

    public ArmToScoreCommand(Arm arm) {
        this.arm = arm;
    }

    @Override
    public void initialize() {
        arm.startMove();                  // pid.reset() -- clear stale state
    }

    @Override
    public void execute() {
        arm.goToScore();                  // one PID cycle toward 9.0 rotations
    }

    @Override
    public boolean isFinished() {
        return arm.atSetpoint();          // the controller decides
    }

    @Override
    public void end(boolean interrupted) {
        arm.stop();                       // ALWAYS stop, finished or interrupted
    }
}
```
Annotate every method against beat 5's rule. This is the exact class the exercise asks for, so
show it as a *walkthrough* here and have the exercise rebuild it with extra requirements.

SANDBOX:

Banner: **"Simulated for teaching. The real classes come from WPILib."**

**Exact starter code:**
```java
// Real robot code would start with:
//   import edu.wpi.first.wpilibj2.command.Command;
//   import edu.wpi.first.wpilibj2.command.CommandScheduler;

public class Main {

    // The mechanism. A plain class for now -- next lesson makes it a Subsystem.
    static class Flywheel {
        private final SparkMax motor = new SparkMax(5, MotorType.kBrushless);
        void setSpeed(double s) { motor.set(s); }
        void stop()             { motor.set(0); }
        double getVelocity()    { return motor.getEncoder().getVelocity(); }
    }

    static class SpinUpFlywheel extends Command {
        private final Flywheel flywheel;
        private static final double TARGET_RPM = 4000.0;   // <-- CHANGE ME
        private int executeCount = 0;

        SpinUpFlywheel(Flywheel flywheel) { this.flywheel = flywheel; }

        @Override public void initialize() {
            System.out.println("initialize()      <-- once, at the start");
        }

        @Override public void execute() {
            executeCount++;
            flywheel.setSpeed(0.8);                        // <-- CHANGE ME
            System.out.printf("  execute() #%-2d   velocity = %8.2f RPM%n",
                              executeCount, flywheel.getVelocity());
        }

        @Override public boolean isFinished() {
            boolean done = flywheel.getVelocity() >= TARGET_RPM;
            if (done) System.out.println("  isFinished() -> TRUE");
            return done;
        }

        @Override public void end(boolean interrupted) {
            flywheel.stop();
            System.out.println("end(interrupted=" + interrupted + ")   <-- once, at the stop");
            System.out.println("execute() ran " + executeCount + " times.");
        }
    }

    public static void main(String[] args) {
        Flywheel flywheel = new Flywheel();
        CommandScheduler.getInstance().schedule(new SpinUpFlywheel(flywheel));

        for (int tick = 1; tick <= 25; tick++) {
            CommandScheduler.getInstance().run();          // one 20 ms tick
        }
    }
}
```

**What the student changes:**
1. `TARGET_RPM` — try `2000` (finishes sooner), then `5000` (never finishes in 25 ticks; the
   command is still running when the loop ends and `end()` **never prints**). That second
   experiment is the best one on the page.
2. The `0.8` in `execute()` — try `0.4` and watch it take far longer, or never arrive.
3. Change `isFinished()` to `return false;` and watch `execute()` run all 25 times with no
   `end()`.

**Expected printed output** (computed from the §3 contract: `velocity += (output × 6000 −
velocity) × 0.1`, so with output 0.8 the ceiling is 4800 RPM and
`v_n = 4800 × (1 − 0.9ⁿ)`). **Author must re-run and paste real output.**
```
initialize()      <-- once, at the start
  execute() #1    velocity =   480.00 RPM
  execute() #2    velocity =   912.00 RPM
  execute() #3    velocity =  1300.80 RPM
  execute() #4    velocity =  1650.72 RPM
  execute() #5    velocity =  1965.65 RPM
  execute() #6    velocity =  2249.08 RPM
  execute() #7    velocity =  2504.17 RPM
  execute() #8    velocity =  2733.76 RPM
  execute() #9    velocity =  2940.38 RPM
  execute() #10   velocity =  3126.34 RPM
  execute() #11   velocity =  3293.71 RPM
  execute() #12   velocity =  3444.34 RPM
  execute() #13   velocity =  3579.90 RPM
  execute() #14   velocity =  3701.91 RPM
  execute() #15   velocity =  3811.72 RPM
  execute() #16   velocity =  3910.55 RPM
  execute() #17   velocity =  3999.50 RPM
  execute() #18   velocity =  4079.55 RPM
  isFinished() -> TRUE
end(interrupted=false)   <-- once, at the stop
execute() ran 18 times.
```
*Author note:* the velocity printed by `execute() #n` is the value **after** that tick's
`set()`, so `isFinished()` on tick 18 sees 4079.55. Tick 17's 3999.50 missing 4000 by half an
RPM is a genuinely useful accident — point at it. On a real robot you'd never target an exact
value; you'd use a tolerance.

**Output shape assertions** (must hold even if numbers differ):
1. `initialize()` prints **exactly once**, and **before** any `execute()`.
2. `execute()` prints many times, once per tick.
3. `isFinished() -> TRUE` prints **once**, immediately before `end`.
4. `end(interrupted=false)` prints **exactly once**, and **last**.
5. With `TARGET_RPM = 5000`, `end()` **never prints** and `execute()` runs all 25 times — because
   the command never finished, and the loop just stopped.
6. Velocity climbs, decelerating — it approaches its ceiling and never exceeds it.

Teaching text under the sandbox must land assertion 5 hard: *the command didn't fail, and it
didn't error. It's still running. On a real robot it runs forever, holding the mechanism, and
nothing after it in a sequence ever starts. A command with an end condition that can't be met is
one of the hardest bugs in FRC to spot, because nothing goes wrong — things just stop happening.*

**Scheduler timeline widget** (plan §6, U7 — this is its home lesson): an animated 20 ms loop
showing `initialize → execute ×N → isFinished → end`, scrubbable, with the current tick's method
highlighted and the velocity value alongside. It should be driven by the **same numbers as the
sandbox above** so the animation and the printed trace agree exactly.
*Fallback:* the printed trace already shows the lifecycle; ship without the animation if needed.

CHALLENGES:

1. **Predict the output** — `data-kind="text"`. "You set `isFinished()` to `return true;`
   unconditionally. How many times does `execute()` run?"
   `data-answer="1|once|one|1 time"`
   Win: "Once. The scheduler runs `execute()` and *then* checks `isFinished()` — so even an
   instantly-finished command gets one execute."
   Lose: "Once. Within a single tick the scheduler calls `execute()` first, then `isFinished()`.
   So it executes once, reports finished, and ends."

2. **MCQ · which method?** — "Where do you stop the motor?"
   - a) `isFinished()` — "That method answers a question; it shouldn't have side effects."
   - b) `execute()` — "That's where you keep it *going*."
   - c) ✓ **`end(boolean interrupted)`** — "Yes — it's the only method guaranteed to run when the
     command stops, whether it finished or was interrupted."
   - d) `initialize()` — "That's the beginning."

3. **MCQ · the interrupted flag** — "A driver releases the button halfway through
   `ArmToScoreCommand`. What runs?"
   - a) Nothing; the command just stops — "Something always gets to clean up."
   - b) `isFinished()` returns true, then `end(false)` — "`isFinished()` never returned true; the
     arm never arrived."
   - c) ✓ **`end(true)`** — "Correct — interrupted, and that's exactly what the flag is for."
   - d) `initialize()` again — "Initialize only runs when a command *starts*."

4. **Fill-in-the-blank · the lifecycle** — `data-kind="fib"`:
   ```
   <blank>()      // once, when the command begins
   <blank>()      // every ~20 ms while active
   <blank>()      // return true to end
   <blank>(boolean interrupted)   // once, when it stops
   ```
   answers: `initialize`, `execute`, `isFinished`, `end`
   Win: "Four methods. Every command you ever write uses these and only these."
   Lose: "`initialize` (once at the start), `execute` (every cycle), `isFinished` (the end
   condition), `end` (once, on the way out)."

5. **MCQ · `execute()` vs `periodic()`** — "What's the difference?"
   - a) They're the same thing with two names — "Different owners and different lifetimes."
   - b) ✓ **`execute()` belongs to a command and runs only while it's scheduled; `periodic()`
     belongs to a subsystem and always runs** — "Right — the source flags this specifically
     because it's the most-confused pair in the framework."
   - c) `periodic()` is faster — "Same 20 ms loop for both."
   - d) `execute()` runs once — "That's `initialize()`."

6. **Predict / short answer** — "Your `isFinished()` returns
   `flywheel.getVelocity() >= 6000;` and the flywheel's ceiling at 0.8 output is 4800 RPM. What
   happens?"
   `data-answer="never finishes|it never ends|runs forever|never ends|it never finishes|nothing"`
   Win: "It never finishes. No error, no crash — the command just runs forever, and anything
   sequenced after it never starts."
   Lose: "The command never ends. It can't reach 6000 at that output, so `isFinished()` is never
   true. Nothing errors — the robot just quietly stops making progress."

MISCONCEPTIONS:
- *"`initialize()` runs every cycle."*
  → "Once, when the command starts. `execute()` is the every-cycle one."
- *"`end()` means the command succeeded."*
  → "`end()` runs whenever the command stops. The `interrupted` flag is how you tell the two
  cases apart."
- *"`isFinished()` returning false is a bug."*
  → "It's a valid design: a command that never ends on its own runs until something else stops
  it — which is exactly right for 'hold while held'."
- *"`execute()` is the subsystem's `periodic()`."*
  → "Different methods, different owners. `periodic()` always runs; `execute()` only while its
  command is scheduled."
- *"The scheduler calls `initialize()` on the first tick."*
  → "`schedule()` calls it immediately. By the first `run()`, initialization has already
  happened."
- *"If the command doesn't finish, something will error."*
  → "Nothing errors. That's what makes an unreachable end condition so hard to find."

EXERCISE: **PenguinBot's arm gets a command.**
*Where we are:* your `Arm` class from `frc-pid-syntax` has `startMove()`, `goToScore()`,
`atSetpoint()`, `stop()` and `isHomed()`. Something has to call them on the right ticks.

Task: write `ArmToScoreCommand extends Command`:
1. Constructor takes an `Arm` and stores it. **Do not create a motor inside the command.**
2. `initialize()` — `arm.startMove()` to clear stale PID state.
3. `execute()` — one PID cycle toward the scoring setpoint.
4. `isFinished()` — true when the arm is at the setpoint.
5. `end(boolean interrupted)` — stop the arm, and print a different message for interrupted vs
   normal completion.
Bonus 1: refuse to run if the arm isn't homed — finish immediately rather than driving to a
meaningless setpoint.
Bonus 2: add a **timeout** — if the arm hasn't arrived within 100 ticks (2 seconds), finish
anyway. Something is jammed, and a command that runs forever is worse than one that gives up.

**Full reference solution** (`details.reveal`):
```java
import edu.wpi.first.wpilibj2.command.Command;

public class ArmToScoreCommand extends Command {

    private final Arm arm;
    private static final int TIMEOUT_TICKS = 100;   // 2 seconds
    private int ticks = 0;

    // The command is HANDED the mechanism. It never creates hardware itself.
    public ArmToScoreCommand(Arm arm) {
        this.arm = arm;
    }

    @Override
    public void initialize() {
        ticks = 0;
        arm.startMove();          // pid.reset() -- stale integral / previous error cleared
    }

    @Override
    public void execute() {
        ticks++;
        arm.goToScore();          // ONE PID cycle toward 9.0 rotations
    }

    @Override
    public boolean isFinished() {
        if (!arm.isHomed()) {
            return true;          // Bonus 1: no known zero, no setpoint. Don't guess.
        }
        if (ticks >= TIMEOUT_TICKS) {
            System.out.println("ArmToScoreCommand: TIMED OUT -- is something jammed?");
            return true;          // Bonus 2: give up rather than run forever
        }
        return arm.atSetpoint();
    }

    @Override
    public void end(boolean interrupted) {
        arm.stop();               // ALWAYS. This is the only guaranteed exit.
        if (interrupted) {
            System.out.println("ArmToScoreCommand interrupted at " + arm.getPosition());
        } else {
            System.out.println("ArmToScoreCommand finished at " + arm.getPosition());
        }
    }
}
```
Solution notes for the author:
- **The constructor takes the `Arm`; it doesn't build one.** If every command made its own
  `SparkMax(3, …)`, you'd have several objects fighting over one motor. This is dependency
  injection, from Phase 1, doing real work.
- `end()` stops the arm on **both** paths. Forgetting this is how a mechanism keeps driving
  after its command is interrupted.
- The timeout is not decoration. The sandbox showed you a command that never finished and never
  complained; the timeout is how you make that visible.
- Bonus 1 returns `true` from `isFinished()` rather than throwing. A command that can't safely
  do its job should end quietly, not crash the robot mid-match.

Tease: "Your command works — but `Arm` is still a plain class. Nothing stops two commands from
grabbing it at once, and nothing runs its housekeeping when no command is scheduled. Next
lesson: `SubsystemBase`."

CHECKPOINT: (5 questions, every option explained)

**Q1.** How often does `initialize()` run?
- a) Every 20 ms — "That's `execute()`."
- b) ✓ **Once, when the command begins** — "Yes — and it happens the moment the command is
  scheduled, not on the next tick."
- c) Once per match — "Once per *scheduling*. Schedule it again and it initializes again."
- d) Only in autonomous — "Commands behave identically in every mode."

**Q2.** What does returning `false` from `isFinished()` forever mean?
- a) The command errors out — "Nothing errors."
- b) The command restarts — "It just keeps going."
- c) ✓ **The command never ends on its own; something else must stop it** — "Correct, and that's
  a legitimate design for 'run while held'."
- d) `end()` runs immediately — "`end()` runs only when the command actually stops."

**Q3.** Which method is guaranteed to run when a command stops, however it stops?
- a) `isFinished()` — "It may never have returned true, if the command was interrupted."
- b) `initialize()` — "That's the start."
- c) ✓ **`end(boolean interrupted)`** — "Yes — which is why it's where you stop the motor."
- d) `execute()` — "It stops running at that point."

**Q4.** Inside one scheduler tick, what's the order for a scheduled command?
- a) `isFinished()`, then `execute()` — "Backwards — you'd check whether you're done before doing
  anything."
- b) ✓ **`execute()`, then `isFinished()`, then `end(false)` if finished** — "Right, which is why
  even an instantly-finished command gets one `execute()`."
- c) `initialize()`, `execute()`, `end()` every tick — "`initialize` and `end` are once each."
- d) They run in parallel — "Sequentially, in one thread, every 20 ms."

**Q5.** Your flywheel command's `isFinished()` requires 6000 RPM but the mechanism tops out at
4800. What do you observe?
- a) A crash — "Nothing crashes."
- b) A warning in the console — "Nothing warns you."
- c) ✓ **Nothing at all — the command runs forever and everything sequenced after it never
  starts** — "Exactly, and that silence is what makes it hard to find. A timeout turns it into a
  visible failure."
- d) The command restarts every tick — "It never stopped, so it never restarts."

SEASON-FLAGS:
- `callout--season` on the base class name: `[NEEDS RESEARCH: `Command` vs the older
  `CommandBase` for the current WPILib]`. Method names (`initialize`/`execute`/`isFinished`/
  `end`) are in the PDF's verified box and are stable.
- `[NEEDS RESEARCH: exact CommandScheduler.run() ordering; confirm schedule() calls initialize()
  synchronously — content/research/toolchain-2026.md]`. The sandbox's output asserts this.
- Mention, flagged, that modern WPILib also offers command *factories* (`Commands.run`,
  `subsystem.runOnce`) as a shorter way to build simple commands.
  `[NEEDS RESEARCH: confirm current factory method names before mentioning them by name.]`
  Do not teach them here — writing the class by hand is what makes the lifecycle visible.

SIM-REQUEST: `Command` (with the four overridable methods), `CommandScheduler.getInstance()`
with `schedule()` and `run()` — all in `_shared-conventions.md` §3. **This sandbox is the single
highest-value thing PenguinSim does**; if any part of the shim gets cut, this must not be it.
