# frc-subsystems · Subsystem Anatomy
unit: 7 · Structuring Behavior   |   duration: 30 min   |   difficulty: Intermediate
interactivity: SANDBOX (PenguinSim)

> Read `_shared-conventions.md` first (§3 sim contract; paste **real** output).

INTRODUCES:
- `subsystembase` — `extends SubsystemBase`
- `subsystem-periodic` — `periodic()`, every ~20 ms, always
- `subsystem-anatomy` — hardware at the top, methods at the bottom
- `subsystem-registration` — a `SubsystemBase` registers itself with the scheduler
- `add-requirements` — declaring which mechanism a command needs
- `default-command` — named, briefly, as what runs when nothing else is

ASSUMES:
- `command-class`, `initialize`, `execute`, `is-finished`, `end-interrupted`,
  `command-scheduler`, `scheduler-order`, `twenty-ms-loop` (`frc-command-lifecycle`)
- `subsystem-role`, `hardware-ownership` (`frc-chain-of-command`)
- `src-tree`, `class-vs-filename` (`frc-src-tree`)
- The `Arm` and `Intake` classes the student has built. Java inheritance and `@Override`.

GOAL:
Turn a plain mechanism class into a real `SubsystemBase`, and explain what registration and
requirements buy you.

HOOK: **The ChairBot's four motors** (`_shared-conventions.md` §6 story 14). `callout--why`.
The ChairBot had two sides, two wheels per side, and **two motors driving each side** — four
motors for one drivetrain. The team's code declared four `SparkMax` variables at the top of one
class and exposed exactly two methods at the bottom: `setLeftMotors(double)` and
`setRightMotors(double)`.

That's the whole shape of a subsystem, and the source states it as a recap:
**variables (your motors) at the top → methods at the bottom that take a value sent from
`RobotContainer` and apply it to the motors.**

The payoff: nothing outside that class knows the ChairBot has four motors. Add a fifth, or swap
a SparkMax for a Kraken, and every caller is unchanged. You saw the same thing when your `Arm`
quietly gained a follower motor in Unit 6 — no caller noticed.

Second beat, from `frc-src-tree`'s story: the standard way to create one is to copy
`ExampleSubsystem` — and rename the **class**, not just the file.

EXPLAIN:

1. **The verified anatomy.** This is the source's own numbered structure; keep the numbering.
```java
// [FROM PDF page 11, §7.2 verified box]
public class IntakeSubsystem extends SubsystemBase {
    // 1) declare hardware/variables
    private final SparkMax roller = new SparkMax(2, MotorType.kBrushless);

    // 2) constructor initializes things
    public IntakeSubsystem() { /* setup */ }

    // 3) your own methods -- the ONLY place motors get touched
    public void runRoller(double speed) { roller.set(speed); }
    public void stop()                  { roller.set(0); }

    // 4) periodic() runs every ~20 ms
    @Override
    public void periodic() {
        // e.g. System.out.println(roller.getEncoder().getPosition());
    }
}
```
   Annotate each numbered section. Note `private final` on the motor: private so nothing outside
   can reach it (the ownership rule enforced by the language), final because the subsystem owns
   exactly one and never swaps it.

2. **What `extends SubsystemBase` actually gets you.** Three things, and students usually can't
   name any of them:
   - **Registration.** Constructing a `SubsystemBase` registers it with the `CommandScheduler`.
     That's why `periodic()` runs at all — nobody calls it; the scheduler does, every tick,
     forever, whether or not any command is scheduled.
   - **Requirements.** A command can declare `addRequirements(arm)`, and the scheduler then
     guarantees **only one command uses that mechanism at a time.** Schedule a second one and the
     first is *interrupted* — its `end(true)` runs. This is the framework enforcing Unit 3's
     ownership rule at runtime instead of by convention.
   - **Default commands.** A subsystem can name a command to run whenever nothing else is using
     it. Name it, one sentence, and move on — `frc-robotcontainer` is where it becomes useful.
   Mark: `[NEEDS RESEARCH: confirm SubsystemBase self-registers in its constructor, and confirm
   Command.addRequirements(Subsystem...) and Subsystem.setDefaultCommand(Command) signatures for
   the current WPILib — content/research/toolchain-2026.md]`

3. **`periodic()` vs `execute()`, made concrete.** The pair the source warns about. Now that
   both exist in the student's code, make the distinction physical:

| | `periodic()` | `execute()` |
|---|---|---|
| Belongs to | the **Subsystem** | the **Command** |
| Runs | **always**, every tick | only while that command is scheduled |
| Good for | telemetry, safety limits, housekeeping | doing the actual job |
| How many | one per subsystem | one per command |

   Rule of thumb worth a callout: **if it should happen whether or not anyone asked, it goes in
   `periodic()`.** Publishing the arm's position: `periodic()`. Driving the arm to a setpoint:
   `execute()`.
   Pitfall: **don't set motors in `periodic()`.** If `periodic()` writes to the motor every tick,
   it fights every command that also does. `periodic()` observes; commands act. (A guarded
   safety cut-off is the rare exception, and it should be obvious in the code.)

4. **The scheduler order, confirmed by the sandbox.** Repeat the ordered list from
   `frc-command-lifecycle` and highlight step 1, which is now yours:
```
run()  -- one 20 ms tick
  1. every registered Subsystem's periodic()    <-- YOURS NOW
  2. poll buttons                                (Unit 8)
  3. each scheduled Command: execute(), then isFinished()
```
   The sandbox prints this interleaving, so the student sees `periodic` before `execute` on every
   single tick.

5. **One instance, created once.** From the intro notes: subsystem methods are **not static**, so
   you need an instance — `mDrivetrain.setLeftMotors(...)`, never
   `DrivetrainSubsystem.setLeftMotors(...)`. Link to Phase 1's `j-static-vs-instance` in a
   clause; do not re-teach it.
   The rule that matters here: **exactly one instance per mechanism, created in `RobotContainer`,
   handed to every command that needs it.** Two `ArmSubsystem` objects means two `SparkMax(3,…)`
   objects fighting over one motor — and it compiles perfectly.

6. **Naming.** `subsystems/ArmSubsystem.java` contains `public class ArmSubsystem`. The folder
   should read like a parts list of the robot: `IntakeSubsystem`, `ArmSubsystem`,
   `DriveSubsystem`, `LimelightSubsystem`. If you can't tell what the robot does from the file
   listing, rename things.

CODE: EXPLAIN beat 1 (the verified box) plus the exercise's `ArmSubsystem`. One additional
two-line block to show requirements in context:
```java
public ArmToScoreCommand(ArmSubsystem arm) {
    this.arm = arm;
    addRequirements(arm);     // nobody else drives the arm while this runs
}
```
Mark: `[NEEDS RESEARCH: addRequirements signature — see beat 2]`. Keep it inside a
`callout--season` until confirmed.

SANDBOX:

Banner: **"Simulated for teaching. The real classes come from WPILib and REVLib."**

**Exact starter code** — the interleaving is the whole demonstration:
```java
// Real robot code would start with:
//   import edu.wpi.first.wpilibj2.command.SubsystemBase;
//   import edu.wpi.first.wpilibj2.command.Command;
//   import edu.wpi.first.wpilibj2.command.CommandScheduler;

public class Main {

    static class ArmSubsystem extends SubsystemBase {
        private final SparkMax pivot = new SparkMax(3, MotorType.kBrushless);
        private final PIDController pid = new PIDController(0.2, 0.0, 0.0);

        ArmSubsystem() {
            pid.setTolerance(0.25);
        }

        double getPosition() { return pivot.getEncoder().getPosition(); }
        boolean atSetpoint() { return pid.atSetpoint(); }
        void    stop()       { pivot.set(0); }
        void    startMove()  { pid.reset(); }

        void moveToward(double setpoint) {
            double out = pid.calculate(getPosition(), setpoint);
            pivot.set(Math.max(-0.8, Math.min(0.8, out)));      // the 80% rule
        }

        // Runs EVERY tick, whether or not a command is scheduled.
        @Override public void periodic() {
            System.out.printf("  periodic()  pos = %6.2f%n", getPosition());
        }
    }

    static class ArmToScoreCommand extends Command {
        private final ArmSubsystem arm;
        ArmToScoreCommand(ArmSubsystem arm) {
            this.arm = arm;
            addRequirements(arm);            // only one command may drive the arm
        }
        @Override public void initialize() { arm.startMove(); System.out.println("initialize()"); }
        @Override public void execute()    { arm.moveToward(9.0);
                                             System.out.println("  execute()"); }
        @Override public boolean isFinished() { return arm.atSetpoint(); }
        @Override public void end(boolean interrupted) {
            arm.stop();
            System.out.println("end(interrupted=" + interrupted + ")");
        }
    }

    public static void main(String[] args) {
        ArmSubsystem arm = new ArmSubsystem();     // registers itself with the scheduler

        System.out.println("--- 3 ticks with NO command scheduled ---");
        for (int t = 1; t <= 3; t++) {
            System.out.println("tick " + t);
            CommandScheduler.getInstance().run();
        }

        System.out.println("--- now schedule the command ---");
        CommandScheduler.getInstance().schedule(new ArmToScoreCommand(arm));
        for (int t = 4; t <= 15; t++) {
            System.out.println("tick " + t);
            CommandScheduler.getInstance().run();
        }
    }
}
```

**What the student changes:**
1. Nothing, first run — read the interleaving.
2. Schedule a **second** `ArmToScoreCommand` at tick 8 and watch the first one's
   `end(interrupted=true)` fire. That's `addRequirements` doing its job, visibly.
3. Delete `addRequirements(arm)` and repeat experiment 2 — now both commands run and fight.
4. Move `pivot.set(...)` into `periodic()` and watch it fight the command.

**Expected printed output** (computed from the §3 contract: `position += output × 2.0` per tick,
output clamped to ±0.8, `kP = 0.2`, setpoint 9.0, tolerance 0.25 — the same trajectory as
`frc-pid-syntax`). **Author must re-run and paste real output.**
```
--- 3 ticks with NO command scheduled ---
tick 1
  periodic()  pos =   0.00
tick 2
  periodic()  pos =   0.00
tick 3
  periodic()  pos =   0.00
--- now schedule the command ---
initialize()
tick 4
  periodic()  pos =   0.00
  execute()
tick 5
  periodic()  pos =   1.60
  execute()
tick 6
  periodic()  pos =   3.20
  execute()
tick 7
  periodic()  pos =   4.80
  execute()
tick 8
  periodic()  pos =   6.40
  execute()
tick 9
  periodic()  pos =   7.44
  execute()
tick 10
  periodic()  pos =   8.06
  execute()
tick 11
  periodic()  pos =   8.44
  execute()
tick 12
  periodic()  pos =   8.66
  execute()
tick 13
  periodic()  pos =   8.80
  execute()
end(interrupted=false)
tick 14
  periodic()  pos =   8.88
tick 15
  periodic()  pos =   8.88
```

**Output shape assertions** (must hold even if numbers differ):
1. `periodic()` prints on **every** tick, including the three before any command exists and the
   two after the command has ended. **This is the headline.**
2. Within a tick, `periodic()` always prints **before** `execute()`.
3. `initialize()` prints when the command is **scheduled**, before the next tick's `periodic()`.
4. `end(interrupted=false)` prints once, after the last `execute()`; `periodic()` keeps going
   afterwards.
5. Position stops changing after `end()` — because `end()` called `stop()`, and `periodic()`
   only observes.
6. In experiment 2, scheduling a second command prints the first one's `end(interrupted=true)`.

Teaching text must land assertions 1 and 5 explicitly: *the subsystem is always awake. The
command is a visitor.*

CHALLENGES:

1. **Predict the output** — `data-kind="text"`. "Before the command is scheduled, how many times
   does `periodic()` run in three ticks?"
   `data-answer="3|three|3 times|once per tick"`
   Win: "Three — once per tick. A registered subsystem's `periodic()` runs whether or not any
   command wants it."
   Lose: "Three, one per tick. Registration happens in the `SubsystemBase` constructor, so from
   the moment the object exists the scheduler is calling its `periodic()`."

2. **MCQ · where does it go?** — "You want the arm's position published to the dashboard at all
   times, even when nothing is driving it. Which method?"
   - a) `execute()` — "That only runs while a command is scheduled, so telemetry would vanish
     whenever the arm is idle — exactly when you most want to see it."
   - b) ✓ **`periodic()`** — "Right — always-on housekeeping belongs to the subsystem."
   - c) `initialize()` — "Once at the start; you'd get one value."
   - d) The constructor — "Runs once, before the robot has done anything."

3. **MCQ · requirements** — "Two commands both `addRequirements(arm)`. You schedule the second
   while the first is running. What happens?"
   - a) They both run — "That's what happens *without* requirements, and it's the bug."
   - b) The second is rejected — "The scheduler favours the newly scheduled one."
   - c) ✓ **The first is interrupted — its `end(true)` runs — and the second takes over** —
     "Exactly. The framework enforcing single ownership at runtime."
   - d) The robot errors — "No error; it's designed behaviour."

4. **Fill-in-the-blank · anatomy** — `data-kind="fib"`:
   ```
   public class ArmSubsystem extends <blank> {
       private final SparkMax pivot = new SparkMax(3, MotorType.kBrushless);
       public void setSpeed(double s) { pivot.set(s); }
       @Override
       public void <blank>() { }   // every ~20 ms, always
   }
   ```
   answers: `SubsystemBase`, `periodic`
   Win: "Hardware at the top, methods at the bottom, `periodic()` for whatever should always
   happen."
   Lose: "`extends SubsystemBase` is what registers it with the scheduler; `periodic()` is the
   method the scheduler then calls every tick."

5. **MCQ · one instance** — "You create `new ArmSubsystem()` in `RobotContainer` *and* inside
   `ArmToScoreCommand`. What breaks?"
   - a) It won't compile — "It compiles perfectly. That's the problem."
   - b) ✓ **Two objects each hold a `SparkMax(3, …)` and fight over one physical motor** —
     "Right, and requirements won't save you: the scheduler sees two different subsystems."
   - c) The CAN ID becomes invalid — "The ID is fine; two objects are using it."
   - d) `periodic()` stops running — "It runs twice, once per instance."

MISCONCEPTIONS:
- *"`periodic()` only runs when a command is using the subsystem."*
  → "It runs every tick from the moment the subsystem is constructed. The sandbox proves it
  before any command exists."
- *"I should set motors in `periodic()` — it runs every cycle, which is convenient."*
  → "Then it fights every command that also sets that motor. `periodic()` observes; commands act."
- *"`addRequirements` is optional boilerplate."*
  → "It's how the framework stops two commands driving one mechanism. Without it, they both run
  and the mechanism judders."
- *"Each command should make its own subsystem object."*
  → "One instance per mechanism, created in `RobotContainer`, handed to every command. Two
  objects means two motor objects on one CAN ID."
- *"Subsystem methods can be called on the class name."*
  → "They aren't static. You need the instance — `arm.goToScore()`, not
  `ArmSubsystem.goToScore()`."
- *"Renaming the file renames the class."*
  → "Only if your editor does it. Some setups don't, and you get a screenful of red."

EXERCISE: **PenguinBot's mechanisms become real subsystems.**
*Where we are:* `Intake` (Unit 4) and `Arm` (Units 5–6) are plain classes, and
`ArmToScoreCommand` (last lesson) drives the arm with no protection against a second command
grabbing it.

Task: promote both.
1. `IntakeSubsystem extends SubsystemBase` — roller on CAN ID 2; `runRoller(double)`,
   `intake()`, `outtake()`, `stop()`; `periodic()` publishes nothing yet but prints the roller's
   commanded speed.
2. `ArmSubsystem extends SubsystemBase` — everything your `Arm` class does, plus a `periodic()`
   that prints position and whether it's homed.
3. Update `ArmToScoreCommand` to take an `ArmSubsystem` and call `addRequirements(arm)`.
4. In your notes, write where the single instance of each subsystem will be created, and why
   there must be exactly one.
Bonus: add a **safety guard** in `ArmSubsystem.periodic()` that stops the motor if the position
goes beyond 12.0 rotations — and explain in a comment why this is the rare acceptable case of
`periodic()` touching a motor.

**Full reference solution** (`details.reveal`):
```java
// subsystems/ArmSubsystem.java
import com.revrobotics.spark.SparkMax;
import com.revrobotics.spark.SparkLowLevel.MotorType;
import edu.wpi.first.math.controller.PIDController;
import edu.wpi.first.wpilibj2.command.SubsystemBase;

public class ArmSubsystem extends SubsystemBase {

    // 1) hardware at the top
    private final SparkMax pivot    = new SparkMax(3, MotorType.kBrushless);
    private final SparkMax follower = new SparkMax(4, MotorType.kBrushless);

    public  static final double SCORE_POSITION  = 9.0;
    public  static final double STOWED_POSITION = 0.0;
    private static final double TOLERANCE       = 0.25;
    private static final double MAX_OUTPUT      = 0.8;
    private static final double SAFETY_LIMIT    = 12.0;   // bonus

    private final PIDController pid = new PIDController(0.2, 0.0, 0.0);
    private boolean homed = false;

    // 2) constructor
    public ArmSubsystem() {
        pid.setTolerance(TOLERANCE);
    }

    // 3) methods -- the ONLY place these motors get touched
    public double  getPosition() { return pivot.getEncoder().getPosition(); }
    public boolean isHomed()     { return homed; }
    public boolean atSetpoint()  { return pid.atSetpoint(); }
    public void    startMove()   { pid.reset(); }

    public void setSpeed(double speed) {
        double safe = Math.max(-MAX_OUTPUT, Math.min(MAX_OUTPUT, speed));
        pivot.set(safe);
        follower.set(safe);
    }

    public void stop() {
        pivot.set(0);
        follower.set(0);
    }

    public void moveToward(double setpoint) {
        if (!homed) { stop(); return; }
        setSpeed(pid.calculate(getPosition(), setpoint));
    }

    public void goToScore()  { moveToward(SCORE_POSITION);  }
    public void goToStowed() { moveToward(STOWED_POSITION); }

    public void finishHoming() {
        stop();
        pivot.getEncoder().setPosition(0);
        homed = true;
    }

    // 4) periodic -- every ~20 ms, always, command or no command
    @Override
    public void periodic() {
        System.out.printf("  arm: pos %6.2f  homed %b%n", getPosition(), homed);

        // BONUS -- the rare case where periodic() may touch a motor.
        // This is a hard safety limit, not control. It only ever STOPS the
        // mechanism, it never drives it, so it cannot fight a command for
        // position -- it can only overrule one that has gone wrong.
        if (getPosition() > SAFETY_LIMIT) {
            stop();
        }
    }
}
```
```java
// commands/ArmToScoreCommand.java  -- now with requirements
public class ArmToScoreCommand extends Command {
    private final ArmSubsystem arm;

    public ArmToScoreCommand(ArmSubsystem arm) {
        this.arm = arm;
        addRequirements(arm);        // no other command may drive the arm while this runs
    }

    @Override public void initialize()    { arm.startMove(); }
    @Override public void execute()       { arm.goToScore(); }
    @Override public boolean isFinished() { return !arm.isHomed() || arm.atSetpoint(); }
    @Override public void end(boolean interrupted) { arm.stop(); }
}
```
Solution notes for the author:
- **Where the instances live:** exactly one `ArmSubsystem` and one `IntakeSubsystem`, both
  created as fields in `RobotContainer` (Unit 8), and handed into every command's constructor.
  One mechanism, one owner, one object.
- The safety guard is the honest exception to "don't set motors in `periodic()`", and the comment
  says exactly why: it can only *stop*, never drive, so it can't compete for position. Teach the
  reasoning, not just the rule.
- `IntakeSubsystem` is left as the student's own work — it's the same shape with less in it, and
  writing the second one is where the pattern sticks.

Tease: "Your subsystems are full of numbers — 2, 3, 4, 9.0, 0.25, 0.8, 0.2, 12.0. Every one of
them will need changing at some point, and right now they're scattered across two files. Next
lesson: `Constants.java`."

CHECKPOINT: (5 questions, every option explained)

**Q1.** When does a subsystem's `periodic()` run?
- a) Only while a command is using it — "That's `execute()`."
- b) ✓ **Every ~20 ms, from the moment the subsystem is constructed** — "Yes — registration
  happens in the `SubsystemBase` constructor."
- c) Once at robot startup — "That's more like the constructor itself."
- d) Only in teleop — "Every mode, and while disabled the scheduler still runs it."

**Q2.** What does `addRequirements(arm)` do?
- a) Checks the arm is connected — "It doesn't look at hardware at all."
- b) ✓ **Tells the scheduler this command needs the arm, so only one arm command runs at a time**
  — "Right, and a newly scheduled one interrupts the old one."
- c) Creates the arm subsystem — "You pass in an existing one."
- d) Adds the arm to the dashboard — "Unrelated."

**Q3.** Why shouldn't `periodic()` normally set motors?
- a) It's too slow — "Same loop as everything else."
- b) ✓ **It runs every tick regardless, so it would fight any command that also sets that motor**
  — "Exactly. `periodic()` observes; commands act."
- c) It can't access private fields — "It's inside the class; it can access everything."
- d) WPILib blocks it — "Nothing blocks it, which is what makes it a real hazard."

**Q4.** How many `ArmSubsystem` objects should a robot have?
- a) One per command that uses it — "Then each has its own motor object on CAN ID 3."
- b) ✓ **Exactly one, created in `RobotContainer` and passed to every command** — "Correct — one
  mechanism, one owner."
- c) One per mode — "Modes don't own hardware."
- d) As many as you like; they share the motor — "They don't share; they each construct their
  own and fight."

**Q5.** Within one scheduler tick, which runs first?
- a) The command's `execute()` — "It runs after."
- b) ✓ **Every registered subsystem's `periodic()`** — "Right, and the sandbox's interleaved
  output shows it on every tick."
- c) `isFinished()` — "Checked after `execute()`."
- d) They run simultaneously — "Sequentially, in one thread."

SEASON-FLAGS:
- `callout--season` on `SubsystemBase`, `addRequirements`, `setDefaultCommand`, and the
  self-registration claim, until confirmed.
  `[NEEDS RESEARCH: SubsystemBase self-registration; addRequirements(Subsystem...) signature;
  setDefaultCommand — content/research/toolchain-2026.md]`
- The verified anatomy box (PDF page 11) is safe as verified, except that `SparkMax` vs
  `CANSparkMax` carries the same REVLib flag as everywhere else.
- `[NEEDS RESEARCH: whether the 2026 generated template still uses `SubsystemBase` or has moved
  to the `Subsystem` interface with default methods]`

SIM-REQUEST: `SubsystemBase` (self-registering, with `periodic()` called by the scheduler) and
`Command.addRequirements(Subsystem...)` — both in `_shared-conventions.md` §3.
*Fallback if `addRequirements` isn't shipped:* drop sandbox experiments 2 and 3, teach
requirements from the static code sample, and keep challenge 3 as an MCQ. The core
demonstration — `periodic()` running on every tick, before `execute()`, whether or not a
command exists — needs only `SubsystemBase` and must not be cut.
