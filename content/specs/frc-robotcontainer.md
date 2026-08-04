# frc-robotcontainer · RobotContainer & Button Bindings
unit: 8 · Wiring It Together   |   duration: 30 min   |   difficulty: Intermediate
interactivity: SANDBOX (PenguinSim)

> Read `_shared-conventions.md` first (§3 sim contract; paste **real** output).
> The source calls `RobotContainer` **"the most important file."** This is the lesson where
> every layer of the chain of command finally exists at once.

INTRODUCES:
- `robotcontainer-structure` — declarations at the top, wiring in the constructor
- `configure-bindings` — the method where inputs meet commands
- `instantcommand` — a command that runs once and immediately ends
- `lambda-binding` — `() -> subsystem.method()`
- `subsystem-instantiation` — the one place each subsystem object is created
- `auto-chooser` — named, briefly; `frc-auto-routines` owns it

ASSUMES:
- `ps5controller`, `commandps5controller`, `controller-port`, `trigger-conditions`,
  `button-methods-cross` (`frc-controllers`)
- `subsystembase`, `add-requirements` (`frc-subsystems`)
- `command-class` + lifecycle (`frc-command-lifecycle`)
- `constants-file-pattern` (`frc-constants`); `robotcontainer-role` (`frc-chain-of-command`)
- Java: lambdas, `static` vs instance (Phase 1 — link, don't re-teach).

GOAL:
Write a `RobotContainer` that owns one instance of each subsystem and binds controller buttons to
commands.

HOOK: **Six steps from a thumb to a motor** (the intro notes' "Full Signal Flow", §9).
`callout--why`. Unit 3 promised this trace. Everything in it now exists in your code:

```
1. CommandPS5Controller, mapped to Driver Station port 0.
2. Button pressed -> its state changes to true.
3. onTrue fires an InstantCommand.
4. The InstantCommand's lambda calls mDrivetrain.setLeftMotors(1).
5. Inside setLeftMotors, .set(1) is applied to each left motor.
6. The motors run at that speed until something changes it.
```
Mark: [FROM INTRO NOTES page 7, §9]

And then the hardware path from Unit 1 takes over — RIO → CAN → controller → motor → spin. The
source's summary is worth quoting: *that's the whole fundamental loop. The advanced stuff sits on
top of this.*

Second beat, the gotcha the intro notes stop to explain: **you cannot call subsystem methods off
the class name.** They aren't static. You need an instance, created here, in `RobotContainer`.
That's why this file exists at all — it's where the robot's objects live.

EXPLAIN:

1. **The three sections of the file.** From the source:
   - **Top:** declare the subsystems, the controller, and any commands you want to reuse.
   - **Constructor:** set up dashboard widgets and an optional autonomous picker, then call
     `configureBindings()`.
   - **`configureBindings()`:** map controller buttons to commands.
   Mark: [FROM PDF page 13, §8.1]
   Analogy: a **patch bay**. Nothing is generated here and nothing is processed here — everything
   is *connected* here. It runs once at startup and then mostly sits still.

2. **This is where instances are born.** One `ArmSubsystem`. One `IntakeSubsystem`. One
   controller. Created as fields, handed into every command's constructor.
   Mark: [FROM INTRO NOTES page 6, §8 — "Initialize the subsystem first"]
   Restate the failure from `frc-subsystems`: two `ArmSubsystem` objects means two
   `SparkMax(3, …)` objects fighting over one motor, and it compiles perfectly. `RobotContainer`
   being the single place they're constructed is what prevents that.
   One clause to Phase 1: this is why `mDrivetrain.setLeftMotors(...)` works and
   `DrivetrainSubsystem.setLeftMotors(...)` doesn't — see `j-static-vs-instance`.

3. **`InstantCommand` — the bridge you've been waiting for.**
   Unit 3 said some behaviour is instantaneous and doesn't need a command class.
   `InstantCommand` is how that behaviour gets to *be* a command anyway, so it can be bound to a
   button and dropped into a sequence.
   From the source: *commands normally need an ending condition. An `InstantCommand` runs once
   and immediately ends. That makes it perfect for sequences* — turn on the rollers (instant),
   and the next step fires immediately after.
   Mark: [FROM INTRO NOTES page 7, §8] + [FROM PDF page 13 verified box]
   Analogy: a full command is a *task*; an `InstantCommand` is an *errand*. Both can be scheduled;
   one just finishes the moment it starts.
   `[NEEDS RESEARCH: confirm InstantCommand runs its Runnable in initialize() and reports
   isFinished() true immediately — content/research/toolchain-2026.md]` The sandbox's output
   asserts this.

4. **The lambda.** `() -> intakeSub.runRoller(0.7)` is the Phase 1 lambda. The source's framing is
   the right one for a beginner: *"run this line when pressed."* One clause of explanation and
   move on — over-explaining lambdas here is the main way this lesson bloats.
   Beat worth keeping: the lambda **captures** `intakeSub`, which is why the subsystem instance
   has to exist before the binding is written. That's not a Java lesson; it's the reason for the
   file's ordering.

5. **Choosing the binding — a decision, not a habit.** Reuse the table from `frc-controllers`,
   compressed to a rule:
   - Behaviour that should finish on its own → a full Command + **`onTrue`**.
   - Behaviour that should live and die with the button → **`whileTrue`**.
   - A single instantaneous action → **`InstantCommand`** + `onTrue`.
   Then apply it to PenguinBot's four bindings, out loud.

6. **The autonomous picker.** One paragraph, no code: `RobotContainer` also holds a chooser that
   lets the drive team pick which auto routine runs, and exposes a `getAutonomousCommand()` that
   `Robot.java` calls. Named here because the source names it here; built in
   `frc-auto-routines`.
   `[NEEDS RESEARCH: SendableChooser API and how getAutonomousCommand() is wired in the 2026
   template — content/research/vision-pathplanner.md or toolchain-2026.md]` Do not show code.

7. **What does *not* go here.** Short and useful:
   - No motor objects. Those belong to subsystems.
   - No PID gains or setpoints. Those belong to `Constants`.
   - No per-cycle logic. Nothing in this file runs every 20 ms; `configureBindings()` runs once.
   Students routinely put a `while` loop or a motor call in `RobotContainer` because it feels
   like "the main file." It isn't. It's a patch bay.

CODE:

**Sample — PenguinBot's `RobotContainer`**, whole, because its shape is the lesson:
```java
package frc.robot;

import edu.wpi.first.wpilibj2.command.Command;
import edu.wpi.first.wpilibj2.command.InstantCommand;
import edu.wpi.first.wpilibj2.command.button.CommandPS5Controller;

import frc.robot.subsystems.ArmSubsystem;
import frc.robot.subsystems.IntakeSubsystem;
import frc.robot.commands.ArmToScoreCommand;
import static frc.robot.Constants.OperatorConstants;
import static frc.robot.Constants.IntakeConstants;

public class RobotContainer {

    // ---- TOP: the robot's objects. One instance each. -------------------
    private final ArmSubsystem    arm    = new ArmSubsystem();
    private final IntakeSubsystem intake = new IntakeSubsystem();

    private final CommandPS5Controller driver =
        new CommandPS5Controller(OperatorConstants.kDriverControllerPort);

    // ---- CONSTRUCTOR: wire it up, once, at startup ----------------------
    public RobotContainer() {
        configureBindings();
    }

    // ---- BINDINGS: inputs in, commands out ------------------------------
    private void configureBindings() {

        // A behaviour with an end -> full Command, fire and forget.
        driver.cross().onTrue(new ArmToScoreCommand(arm));

        // Lives and dies with the button.
        driver.square().whileTrue(
            new InstantCommand(() -> intake.runRoller(IntakeConstants.kIntakeSpeed), intake));

        driver.circle().whileTrue(
            new InstantCommand(() -> intake.runRoller(IntakeConstants.kOuttakeSpeed), intake));

        // One instantaneous action, latched on a single press.
        driver.triangle().onTrue(new InstantCommand(() -> {
            intake.stop();
            arm.stop();
        }, intake, arm));
    }

    public Command getAutonomousCommand() {
        return null;   // Unit 11
    }
}
```
Annotations to call out by line: the two subsystem fields are **the** instances for the whole
robot; the controller port comes from `Constants`; each binding's *condition* is a decision with a
reason; `getAutonomousCommand()` is a stub with a forward pointer.
`[NEEDS RESEARCH: confirm the InstantCommand(Runnable, Subsystem...) overload; if unconfirmed,
drop the trailing requirements and note them in prose.]`

SANDBOX:

Banner: **"Simulated for teaching. The real classes come from WPILib."**
Honesty note: PenguinSim has no controller, so the sandbox drives `configureBindings`'s effects
through the same faked-press loop as `frc-controllers`. The `RobotContainer` structure itself is
real.

**Exact starter code:**
```java
public class Main {

    static class IntakeSubsystem extends SubsystemBase {
        private final SparkMax roller = new SparkMax(2, MotorType.kBrushless);
        void runRoller(double s) { roller.set(s); }
        void stop()              { roller.set(0); }
        double commanded()       { return roller.get(); }
        @Override public void periodic() { }
    }

    static class ArmSubsystem extends SubsystemBase {
        private final SparkMax pivot = new SparkMax(3, MotorType.kBrushless);
        private final PIDController pid = new PIDController(0.2, 0.0, 0.0);
        ArmSubsystem() { pid.setTolerance(0.25); }
        double  getPosition() { return pivot.getEncoder().getPosition(); }
        boolean atSetpoint()  { return pid.atSetpoint(); }
        void    startMove()   { pid.reset(); }
        void    stop()        { pivot.set(0); }
        void    goToScore()   {
            double o = pid.calculate(getPosition(), 9.0);
            pivot.set(Math.max(-0.8, Math.min(0.8, o)));
        }
        @Override public void periodic() { }
    }

    static class ArmToScoreCommand extends Command {
        private final ArmSubsystem arm;
        ArmToScoreCommand(ArmSubsystem arm) { this.arm = arm; addRequirements(arm); }
        @Override public void initialize()    { arm.startMove();
                                                System.out.println("    ArmToScore: initialize"); }
        @Override public void execute()       { arm.goToScore(); }
        @Override public boolean isFinished() { return arm.atSetpoint(); }
        @Override public void end(boolean interrupted) {
            arm.stop();
            System.out.printf("    ArmToScore: end(interrupted=%b) at %.2f%n",
                              interrupted, arm.getPosition());
        }
    }

    // ---------------- the real subject of the lesson ----------------
    static class RobotContainer {
        final ArmSubsystem    arm    = new ArmSubsystem();
        final IntakeSubsystem intake = new IntakeSubsystem();

        // PenguinSim has no controller, so bindings are stored as Runnables
        // and fired by the fake-press loop in main().
        Runnable onCrossPressed;
        Runnable onSquarePressed;
        Runnable onSquareReleased;

        RobotContainer() { configureBindings(); }

        void configureBindings() {
            // driver.cross().onTrue(new ArmToScoreCommand(arm));
            onCrossPressed = () -> CommandScheduler.getInstance()
                                       .schedule(new ArmToScoreCommand(arm));

            // driver.square().whileTrue(intake at 0.7)
            onSquarePressed  = () -> CommandScheduler.getInstance()
                                       .schedule(new InstantCommand(() -> intake.runRoller(0.7)));
            onSquareReleased = () -> CommandScheduler.getInstance()
                                       .schedule(new InstantCommand(() -> intake.stop()));
        }
    }

    public static void main(String[] args) {
        RobotContainer container = new RobotContainer();

        final int CROSS_AT   = 2;    // <-- CHANGE ME
        final int SQUARE_AT  = 4;    // <-- CHANGE ME
        final int SQUARE_OFF = 8;    // <-- CHANGE ME

        for (int tick = 1; tick <= 15; tick++) {
            if (tick == CROSS_AT)   { System.out.println("tick " + tick + "  CROSS pressed");
                                      container.onCrossPressed.run(); }
            if (tick == SQUARE_AT)  { System.out.println("tick " + tick + "  SQUARE pressed");
                                      container.onSquarePressed.run(); }
            if (tick == SQUARE_OFF) { System.out.println("tick " + tick + "  SQUARE released");
                                      container.onSquareReleased.run(); }

            CommandScheduler.getInstance().run();

            System.out.printf("tick %2d   arm %5.2f   roller %4.2f%n",
                              tick, container.arm.getPosition(), container.intake.commanded());
        }
    }
}
```

**What the student changes:**
1. `CROSS_AT` / `SQUARE_AT` / `SQUARE_OFF` — press both at once and watch two mechanisms run
   simultaneously with no interference. Different subsystems, no shared requirement.
2. Add a second `ArmToScoreCommand` schedule at tick 5 — watch the first one's
   `end(interrupted=true)`. That's `addRequirements` from Unit 7, now visible through bindings.
3. Move `new ArmSubsystem()` *inside* `ArmToScoreCommand`'s constructor and observe the arm never
   moving from `RobotContainer`'s point of view — two objects, one motor.

**Expected printed output** (arm trajectory from the §3 contract, `kP = 0.2`, clamp ±0.8,
setpoint 9.0 — the same trajectory as `frc-pid-syntax` and `frc-subsystems`, started at tick 2).
**Author must re-run and paste real output.**
```
tick  1   arm  0.00   roller 0.00
tick  2  CROSS pressed
    ArmToScore: initialize
tick  2   arm  1.60   roller 0.00
tick  3   arm  3.20   roller 0.00
tick  4  SQUARE pressed
tick  4   arm  4.80   roller 0.70
tick  5   arm  6.40   roller 0.70
tick  6   arm  7.44   roller 0.70
tick  7   arm  8.06   roller 0.70
tick  8  SQUARE released
tick  8   arm  8.44   roller 0.00
tick  9   arm  8.66   roller 0.00
tick 10   arm  8.80   roller 0.00
    ArmToScore: end(interrupted=false) at 8.88
tick 11   arm  8.88   roller 0.00
tick 12   arm  8.88   roller 0.00
tick 13   arm  8.88   roller 0.00
tick 14   arm  8.88   roller 0.00
tick 15   arm  8.88   roller 0.00
```

**Output shape assertions** (must hold even if numbers differ):
1. `ArmToScore: initialize` prints on the tick the button is pressed — `schedule()` initializes
   immediately.
2. The arm moves on every tick from the press until it finishes, and then **stops changing**.
3. The roller turns on and off on exactly the press and release ticks — independent of the arm.
4. Both mechanisms run **at the same time** with no interference, because they're different
   subsystems with different requirements.
5. `ArmToScore` ends with `interrupted=false` — it finished on its own.
6. In experiment 2, the second schedule produces `end(interrupted=true)` on the first.

Teaching text must land assertion 4: *nothing in `RobotContainer` coordinates the arm and the
intake. They don't conflict because they don't share a subsystem — the requirements system does
the coordinating for you.*

CHALLENGES:

1. **Fill-in-the-blank · the three sections** — `data-kind="fib"`:
   ```
   public class RobotContainer {
       private final ArmSubsystem arm = new <blank>();
       private final CommandPS5Controller driver =
           new CommandPS5Controller(OperatorConstants.<blank>);

       public RobotContainer() { <blank>(); }

       private void configureBindings() {
           driver.cross().onTrue(new ArmToScoreCommand(<blank>));
       }
   }
   ```
   answers: `ArmSubsystem`, `kDriverControllerPort`, `configureBindings`, `arm`
   Win: "Declarations at the top, `configureBindings()` from the constructor, and the *existing*
   subsystem instance handed to the command."
   Lose: "One `ArmSubsystem` instance at the top; the port from `Constants`; the constructor calls
   `configureBindings()`; and the binding passes the `arm` field — not a new one."

2. **MCQ · `InstantCommand`** — "Why wrap `intake.runRoller(0.7)` in an `InstantCommand` instead
   of just calling it?"
   - a) It's faster — "Identical speed."
   - b) ✓ **A button binding takes a Command, and an `InstantCommand` makes a one-off call into
     one — which also lets it sit in a sequence** — "Exactly the source's reasoning."
   - c) `runRoller` is static — "It isn't; that's why you need the instance."
   - d) It prevents the motor exceeding 0.8 — "The clamp does that, inside the subsystem."

3. **Predict / short answer** — "You press square (intake, `whileTrue`) while `ArmToScoreCommand`
   is still running. What happens to the arm?"
   `data-answer="nothing|it keeps going|carries on|continues|keeps moving|unaffected"`
   Win: "Nothing — it carries on. Different subsystems, different requirements, no conflict."
   Lose: "The arm keeps going. The intake command requires the intake; the arm command requires
   the arm. They never compete, so both run."

4. **MCQ · one instance** — "Where should `new ArmSubsystem()` appear in the whole project?"
   - a) In each command that uses the arm — "Then each has its own motor object on CAN ID 3."
   - b) In `Constants.java` — "That holds values, not objects."
   - c) ✓ **Exactly once, as a field in `RobotContainer`** — "Correct — the single place the
     robot's objects are born."
   - d) In `Robot.java` — "`Robot.java` creates the `RobotContainer`; the container creates the
     subsystems."

5. **MCQ · what belongs here** — "Which of these does **not** belong in `RobotContainer`?"
   - a) The controller object — "It belongs here."
   - b) One instance of each subsystem — "Belongs here."
   - c) ✓ **`new SparkMax(3, MotorType.kBrushless)`** — "Right — motors belong to subsystems, and
     only to subsystems."
   - d) `configureBindings()` — "That's the file's main method."

MISCONCEPTIONS:
- *"`RobotContainer` is where the robot runs."*
  → "It's where the robot is *wired*. It runs once at startup; nothing in it happens every 20 ms."
- *"Each command should create the subsystem it needs."*
  → "One instance, created in `RobotContainer`, handed in. Two instances means two motor objects
  on one CAN ID."
- *"`InstantCommand` is a workaround."*
  → "It's the intended tool for instantaneous behaviour, and it's what makes a one-line action
  usable inside a sequence."
- *"I need a full Command class for everything."*
  → "For behaviour with duration, yes. For 'set the roller to 0.7', an `InstantCommand` and a
  lambda is the right amount of code."
- *"Two commands pressed at once will conflict."*
  → "Only if they require the *same* subsystem. Different subsystems run happily in parallel."
- *"I can call `ArmSubsystem.goToScore()` directly."*
  → "Subsystem methods aren't static — you need the instance, which is precisely why
  `RobotContainer` exists."

EXERCISE: **PenguinBot becomes drivable.**
*Where we are:* every layer exists separately — subsystems, commands, constants, a binding plan
(`frc-controllers`). Nothing has ever connected them.

Task: write the complete `RobotContainer` for PenguinBot.
1. Fields: one `ArmSubsystem`, one `IntakeSubsystem`, one `CommandPS5Controller` on the port from
   `Constants`.
2. Constructor calls `configureBindings()`.
3. Bindings: cross → `ArmToScoreCommand` (`onTrue`); square → intake (`whileTrue`); circle →
   outtake (`whileTrue`); triangle → panic stop (`onTrue`).
4. A `getAutonomousCommand()` stub returning `null`, with a comment pointing at Unit 11.
5. Below the code, write the **six-step trace** for pressing square — from thumb to roller —
   naming the class involved at each step.
Bonus: bind `cross().onFalse(...)` to an `InstantCommand` that stows the arm, so tapping cross
raises it and releasing lowers it. Then explain why that's a *bad* binding for a scoring
mechanism.

**Full reference solution** (`details.reveal`): the full `RobotContainer` from the CODE section
above, plus:
> **The six-step trace for square:**
> 1. The driver presses square on the controller assigned to Driver Station **port 0**.
> 2. `CommandPS5Controller` (created in `RobotContainer` with `kDriverControllerPort`) sees the
>    state change to true.
> 3. The `whileTrue` binding in `configureBindings()` schedules the `InstantCommand`.
> 4. The `InstantCommand`'s lambda runs: `intake.runRoller(IntakeConstants.kIntakeSpeed)`.
> 5. `IntakeSubsystem.runRoller` — the only code that touches this motor — calls
>    `roller.set(0.7)`.
> 6. The SparkMax on **CAN ID 2** drives the Neo, and the roller spins until something changes it.
>    Steps 5→6 hand off to the hardware path from Unit 1: RIO → CAN → SparkMax → Neo → spin.
>
> **Bonus, and why it's bad:** `cross().onFalse(stowArm)` means the arm drops the instant the
> driver's thumb leaves the button. During a scoring cycle the driver's hand is moving between
> buttons constantly, and the arm would slam down mid-score. Raising and lowering are two
> deliberate actions and deserve two deliberate buttons — or better, one `ScoreSequence` that
> does the whole cycle in order. Which is the next lesson.

Tease: "Four buttons, four behaviours. But scoring is really *arm up, then outtake, then arm
down* — three things in order, from one press. Next lesson: command groups."

CHECKPOINT: (5 questions, every option explained)

**Q1.** What are the three sections of `RobotContainer`?
- a) Motors, sensors, commands — "Motors belong to subsystems."
- b) ✓ **Declarations, constructor, `configureBindings()`** — "Yes — objects at the top, wiring in
  the constructor, bindings in their own method."
- c) init, periodic, end — "That's a Command's lifecycle."
- d) Teleop, autonomous, test — "Those are `Robot.java`'s modes."

**Q2.** What does `InstantCommand` do?
- a) Runs faster than other commands — "Same loop; it just ends immediately."
- b) ✓ **Runs its action once and ends straight away** — "Right, which is what makes it usable in
  a sequence — the next step fires immediately after."
- c) Runs continuously while held — "That's a `whileTrue` binding on a command that never
  finishes."
- d) Cancels other commands — "Requirements do that, not the command type."

**Q3.** How many `IntakeSubsystem` objects should exist on the robot?
- a) One per command — "Each would create its own motor object on CAN ID 2."
- b) ✓ **Exactly one, in `RobotContainer`** — "Correct — one mechanism, one owner, one object."
- c) One per mode — "Modes don't own hardware."
- d) One per button binding — "Bindings reference the shared instance."

**Q4.** Pressing two buttons that command two *different* subsystems does what?
- a) The second interrupts the first — "Only with a shared requirement."
- b) ✓ **Both run at the same time** — "Yes — no shared subsystem, no conflict."
- c) Throws an error — "Perfectly legal and common."
- d) Queues the second — "Nothing queues; they simply coexist."

**Q5.** Why can't you write `ArmSubsystem.goToScore()`?
- a) The method is private — "It's public."
- b) ✓ **It isn't static — you need the instance created in `RobotContainer`** — "Exactly, and the
  intro notes stop to make this point specifically."
- c) The arm isn't homed — "A runtime concern, not a compile one."
- d) You need to import it — "Importing a class doesn't make its instance methods static."

SEASON-FLAGS:
- `callout--season` on the `InstantCommand(Runnable, Subsystem...)` overload and on
  `SendableChooser` / `getAutonomousCommand()` wiring.
  `[NEEDS RESEARCH: InstantCommand requirements overload; SendableChooser API; how the 2026
  template wires getAutonomousCommand() — content/research/toolchain-2026.md]`
- `[NEEDS RESEARCH: whether modern WPILib prefers subsystem command factories
  (`intake.runOnce(...)`, `Commands.runOnce(...)`) over `new InstantCommand(...)` — if so,
  mention as an alternative in prose, keeping `InstantCommand` as the taught form since both
  sources verify it.]`
- The `RobotContainer` structure itself is stable; light flagging.

SIM-REQUEST: `InstantCommand(Runnable)` and `CommandScheduler.schedule/run` — already in §3.
`SparkMax.get()` (returning the last commanded output) is used by the sandbox's `commanded()`
helper; it's in the §3 contract. *Fallback:* track the commanded value in a field on the
subsystem instead.
