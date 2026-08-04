# frc-controllers · Controllers, Ports & the Driver Station
unit: 8 · Wiring It Together   |   duration: 25 min   |   difficulty: Intermediate
interactivity: SANDBOX (PenguinSim)

> Read `_shared-conventions.md` first (§3 sim contract; paste **real** output).
> This lesson is a plan §2 addition — it exists because `PS5Controller` vs
> `CommandPS5Controller` is a whole concept and the curriculum PDF skips straight past it.
> Its source is `frc-java-intro-notes.txt` §6 and §8. Mine those hard.

INTRODUCES:
- `ps5controller` — plain; reads **state**
- `commandps5controller` — command-based; **triggers commands** on state changes
- `controller-port` — the number in the constructor
- `driver-station-usb-mapping` — you drag a controller into a port in the DS app
- `button-methods-cross` — `.cross()`, `.circle()`, `.square()`, `.triangle()`
- `trigger-conditions` — `onTrue`, `onFalse`, `whileTrue`, `whileFalse`
- `axis-reading` — sticks give continuous values, not booleans
- `deadband` — named only, for Unit 9

ASSUMES:
- `constants-file-pattern`, `k-prefix-naming` (`frc-constants`)
- `command-class`, lifecycle, `command-scheduler` (`frc-command-lifecycle`)
- `subsystembase` (`frc-subsystems`)
- `driver-station`, `ds-status-indicators` (`frc-game-tools`)
- Java lambdas (Phase 1 — link to `j-lambdas`, do not re-teach).

GOAL:
Choose between `PS5Controller` and `CommandPS5Controller`, explain what a port number means, and
predict which of `onTrue` / `onFalse` / `whileTrue` fires when.

HOOK: **"Cross, not lacrosse"** (`_shared-conventions.md` §6 story 16). `callout--why`.
On the call where the team wired up the ChairBot's controller, there was genuine confusion about
the button called "the cross" — someone heard "lacrosse." It's a funny moment and it's also the
exact place the curriculum's narrator makes a real error: he says **`.x()`** for the X button.

On a PS5 controller the method is **`.cross()`**. `.x()` is Xbox vocabulary (`.a()`, `.b()`,
`.x()`, `.y()`), and it will not compile against a PS5 controller. That's the single most likely
line to be copied wrong out of a video, so it gets a `callout--verified` here:

> The narrator says `.x()`. The real PS5 method is **`.cross()`**. The face buttons are
> `cross()`, `circle()`, `square()`, `triangle()`.

Mark: [FROM PDF page 13, §8.1 verified note] + [FROM INTRO NOTES page 6, §8 side note]

EXPLAIN:

1. **Two controller classes, and the difference is the whole lesson.** Reproduce the intro
   notes' table — it is the clearest statement of this anywhere in either source:

| | `PS5Controller` (plain) | `CommandPS5Controller` |
|---|---|---|
| Gives you | the **state** of buttons — is cross pressed? how far is the trigger pulled? | **runs a command** when a button state changes |
| Returns | booleans and doubles | triggers you attach commands to |
| Runs commands? | **No** | Yes |
| Use when | you need to *read* state — "is the align button held? then reduce drive speed" | the common case in command-based robots |

   Mark: [FROM INTRO NOTES page 5, §6]
   Analogy: `PS5Controller` is a **light switch you look at**. `CommandPS5Controller` is a
   **doorbell that rings something**. Same hardware, two different questions.
   The practical guidance from the source: **`CommandPS5Controller` most of the time.** Use the
   plain one when you want a continuous or conditional read rather than an event.

2. **The number is the port.** `new CommandPS5Controller(0)` — that `0` is a **port**, and the
   intro notes are precise about what that means:
   - The port maps to a slot in the **FRC Driver Station application** — not a physical USB port
     on the laptop.
   - In the DS's controller/USB section you **drag and drop** your plugged-in controller into a
     port, usually **port 0**.
   - When your code constructs a controller on port 0, it reads whatever the DS has assigned to
     port 0.
   - **Ports identify the controller, not individual buttons.** Which button you read is decided
     in code.
   Mark: [FROM INTRO NOTES page 5, §6]
   Beat, practical: this is why the Joystick indicator in `frc-game-tools` matters, and why "the
   controller does nothing" is often a drag-and-drop away from fixed rather than a code bug.
   Beat: the port number belongs in `Constants` —
   `OperatorConstants.kDriverControllerPort` — exactly the case `frc-constants` argued for.

3. **The four trigger conditions.** From the intro notes, with the ones to ignore left out:

| Condition | Fires |
|---|---|
| `onTrue` | **once**, when the button becomes pressed (rising edge) |
| `onFalse` | **once**, when it's released (falling edge) |
| `whileTrue` | **runs while held**, and is interrupted on release |
| `whileFalse` | runs while **not** held |

   Mark: [FROM INTRO NOTES page 6, §8] + [FROM PDF page 13, §8.1 verified box]
   The pattern: `controller.button().condition(command)`.
   Beat — the distinction students get wrong: **`onTrue` starts a command once and walks away.**
   That command then runs to its own end condition, whether or not you're still holding the
   button. `whileTrue` ties the command's life to the button. Two very different behaviours from
   two very similar-looking lines.
   Worked contrast, worth its own small table:

| Binding | Hold the button 2 seconds | Release after 0.2 s |
|---|---|---|
| `cross().onTrue(armToScore)` | arm goes to the setpoint and finishes | arm **keeps going** to the setpoint |
| `cross().whileTrue(armToScore)` | arm goes to the setpoint and finishes | arm **stops where it is**, `end(true)` |

4. **Sticks are not buttons.** Face buttons are booleans; sticks are continuous. Reading them is
   a `PS5Controller`-style *state* read even on a command controller —
   `driver.getLeftY()` and friends give you a double from −1 to 1.
   Mark: `[NEEDS RESEARCH: confirm the axis getter names on CommandPS5Controller for the current
   WPILib — getLeftX/getLeftY/getRightX/getRightY — content/research/toolchain-2026.md. Do not
   show them in a verified box until confirmed.]`
   Beat: name **deadband** in one sentence — sticks rarely read exactly 0.0 at rest, so drive code
   ignores small values — and hand it to Unit 9. Do not implement it here.

5. **The plain controller's real use case.** From the source, and it's a good one: *"is the align
   button held? then lower drive speed by hand."* That's a continuous, conditional read, not an
   event, and a command trigger is the wrong shape for it. Nothing wrong with having both classes
   in one robot for different jobs.

CODE:

**Sample 1 — the two constructors.** [FROM INTRO NOTES page 5, §6]
```java
// Plain -- reads state:
PS5Controller joystick = new PS5Controller(0);

// Command-based -- triggers commands:
CommandPS5Controller joystick2 = new CommandPS5Controller(0);
```
Annotate: same port, two different jobs. `[NEEDS RESEARCH: confirm the import path for
`PS5Controller` (edu.wpi.first.wpilibj?) — the `CommandPS5Controller` path is verified in the PDF
as `edu.wpi.first.wpilibj2.command.button.CommandPS5Controller`.]`

**Sample 2 — the verified bindings.** [FROM PDF page 13, §8.1 verified box]
```java
import edu.wpi.first.wpilibj2.command.button.CommandPS5Controller;
import edu.wpi.first.wpilibj2.command.InstantCommand;

CommandPS5Controller controller = new CommandPS5Controller(0);

// PS5 face buttons: cross(), circle(), square(), triangle()
controller.cross().onTrue(intakeCommand);
controller.cross().onFalse(stopCommand);
controller.square().whileTrue(intakeCommand);   // runs only while held

// No full command? Wrap a subsystem call in an InstantCommand (runs once):
controller.triangle().onTrue(
    new InstantCommand(() -> intakeSub.runRoller(0.7))
);
```
Annotate every line. The `() ->` is the lambda from Phase 1 — one clause: "run this when
pressed." `InstantCommand` gets its full treatment in `frc-robotcontainer`; here it's just
"the smallest possible command."

**Sample 3 — PenguinBot's constants-driven version:**
```java
import static frc.robot.Constants.OperatorConstants;

private final CommandPS5Controller driver =
    new CommandPS5Controller(OperatorConstants.kDriverControllerPort);
```

SANDBOX:

Banner: **"Simulated for teaching. The real classes come from WPILib."**
Extra honesty note, prominent: **PenguinSim has no controller.** The sandbox fakes the press with
a plain boolean so the *trigger semantics* — rising edge, falling edge, held — are visible in
ordinary Java. On a real robot, `CommandPS5Controller` and the scheduler do this for you.

**Exact starter code:**
```java
// Real robot code would start with:
//   import edu.wpi.first.wpilibj2.command.button.CommandPS5Controller;
//   import edu.wpi.first.wpilibj2.command.InstantCommand;

public class Main {

    static class IntakeSubsystem extends SubsystemBase {
        private final SparkMax roller = new SparkMax(2, MotorType.kBrushless);
        void runRoller(double s) { roller.set(s); System.out.printf("        roller -> %.2f%n", s); }
        void stop()              { runRoller(0.0); }
        @Override public void periodic() { }
    }

    // Stands in for whileTrue's command: runs until interrupted.
    static class RunIntakeCommand extends Command {
        private final IntakeSubsystem intake;
        RunIntakeCommand(IntakeSubsystem intake) { this.intake = intake; addRequirements(intake); }
        @Override public void initialize()    { System.out.println("      whileTrue cmd: initialize"); }
        @Override public void execute()       { intake.runRoller(0.7); }
        @Override public boolean isFinished() { return false; }   // never ends on its own
        @Override public void end(boolean interrupted) {
            intake.stop();
            System.out.println("      whileTrue cmd: end(interrupted=" + interrupted + ")");
        }
    }

    public static void main(String[] args) {
        IntakeSubsystem intake = new IntakeSubsystem();

        final int PRESS_AT   = 5;    // <-- CHANGE ME
        final int RELEASE_AT = 12;   // <-- CHANGE ME

        boolean crossPressed = false;
        boolean wasPressed   = false;
        Command whileTrueCmd = null;

        for (int tick = 1; tick <= 16; tick++) {
            if (tick == PRESS_AT)   crossPressed = true;
            if (tick == RELEASE_AT) crossPressed = false;

            // This block is what CommandPS5Controller + the scheduler do for you.
            if (crossPressed && !wasPressed) {                    // RISING EDGE
                System.out.println("tick " + tick + "  cross PRESSED");
                System.out.println("    onTrue    -> InstantCommand: intake on");
                CommandScheduler.getInstance().schedule(
                    new InstantCommand(() -> intake.runRoller(0.7)));
                whileTrueCmd = new RunIntakeCommand(intake);
                CommandScheduler.getInstance().schedule(whileTrueCmd);
            }
            if (!crossPressed && wasPressed) {                    // FALLING EDGE
                System.out.println("tick " + tick + "  cross RELEASED");
                System.out.println("    onFalse   -> InstantCommand: intake off");
                CommandScheduler.getInstance().schedule(
                    new InstantCommand(() -> intake.stop()));
                if (whileTrueCmd != null) CommandScheduler.getInstance().cancel(whileTrueCmd);
            }
            wasPressed = crossPressed;

            CommandScheduler.getInstance().run();
        }
    }
}
```
*Note for the sim engineer:* this needs `CommandScheduler.cancel(Command)` (or an equivalent) to
demonstrate `whileTrue`'s interruption. See SIM-REQUEST.

**What the student changes:**
1. `PRESS_AT` / `RELEASE_AT` — watch the rising and falling edges move; confirm `onTrue` fires
   exactly once regardless of how long the button is held.
2. Set `RELEASE_AT = 99` (never released) — `whileTrue`'s command runs to the end of the loop and
   its `end()` never prints. That's the honest behaviour.
3. Change `isFinished()` in `RunIntakeCommand` to `return true;` — now it ends on its own, and
   releasing the button has nothing left to interrupt.

**Expected printed output** (structure is determined by the scheduler contract in §3, not by the
motion model — so the shape here is firm; the exact interleaving of the `roller ->` lines must be
confirmed). **Author must re-run and paste real output.**
```
tick 5  cross PRESSED
    onTrue    -> InstantCommand: intake on
        roller -> 0.70
      whileTrue cmd: initialize
        roller -> 0.70
tick 6
        roller -> 0.70
...  (ticks 7-11 the same)
tick 12  cross RELEASED
    onFalse   -> InstantCommand: intake off
        roller -> 0.00
      whileTrue cmd: end(interrupted=true)
        roller -> 0.00
tick 13
tick 14
tick 15
tick 16
```

**Output shape assertions** (must hold even if the interleaving differs):
1. `onTrue` fires **once**, on the press tick — never again while held.
2. The `whileTrue` command's `execute()` runs **every tick from press to release**, and not
   before or after.
3. `onFalse` fires **once**, on the release tick.
4. The `whileTrue` command ends with **`interrupted=true`** — it never finished on its own.
5. After release, the roller stays at 0.00 and nothing further runs.
6. With `RELEASE_AT = 99`, no `end()` line ever prints.

Teaching text must land assertion 4: *`whileTrue` commands are almost always interrupted rather
than finished, which is why `end()` must stop the motor and why the `interrupted` flag exists.*

CHALLENGES:

1. **MCQ · which class?** — "You want: while the align button is held, the drivetrain moves at
   half speed. Which controller class?"
   - a) `CommandPS5Controller` with `onTrue` — "That fires once and walks away; you need a
     continuous condition."
   - b) ✓ **`PS5Controller` — read the button's state each cycle and scale the speed** — "Right.
     That's the source's own example of when the plain class is the correct tool."
   - c) Neither; put it in `Constants` — "A constant can't read a button."
   - d) `CommandPS5Controller` with `onFalse` — "That's an event on release, not a continuous
     read."

2. **Predict the behaviour** — `data-kind="text"`. "You bind
   `driver.cross().onTrue(armToScoreCommand)` and tap the button for one tick. The arm takes 10
   ticks to reach the setpoint. Where does the arm end up?"
   `data-answer="at the setpoint|the setpoint|9.0|9|at 9.0|it finishes|all the way"`
   Win: "At the setpoint. `onTrue` starts the command and lets go — the command runs to its own
   end condition, button or no button."
   Lose: "It goes all the way to the setpoint. `onTrue` fires once and the command then lives its
   own life. If you wanted it to stop on release, that's `whileTrue`."

3. **Fill-in-the-blank · the verified bindings** — `data-kind="fib"`:
   ```
   CommandPS5Controller driver = new CommandPS5Controller(<blank>);
   driver.<blank>().onTrue(scoreSequence);       // the PS5 "X" button
   driver.square().<blank>(runIntakeCommand);    // only while held
   ```
   answers: `data-answer="0|OperatorConstants.kDriverControllerPort"`,
   `data-answer="cross"`, `data-answer="whileTrue"`
   Win: "Port 0, `cross()` — not `x()` — and `whileTrue` for hold-to-run."
   Lose: "Port 0 (or the constant for it). The PS5 X button method is **`cross()`**; `.x()` is
   Xbox. And hold-to-run is `whileTrue`."

4. **MCQ · the port** — "Your code says `new CommandPS5Controller(0)`, the controller is plugged
   in, and nothing responds. The Joystick indicator in the Driver Station is dark. What do you
   fix?"
   - a) Change the constructor to port 1 — "Guessing at ports; fix the assignment instead."
   - b) ✓ **Drag the controller into port 0 in the Driver Station's USB section** — "Yes — the
     port number refers to a DS slot, and an unassigned controller reaches no port at all."
   - c) Reinstall REVLib — "Nothing to do with vendor libraries."
   - d) Rebuild the code — "The code is fine; the assignment isn't."

5. **MCQ · onTrue vs whileTrue** — "A `whileTrue` command's `isFinished()` returns `false`
   forever. When does it stop?"
   - a) Never — "Something does stop it."
   - b) ✓ **When the button is released — it's interrupted, and `end(true)` runs** — "Exactly.
     That's what `whileTrue` means, and it's why `end()` has to stop the motor."
   - c) After 20 ms — "It runs for as long as you hold it."
   - d) When the mechanism reaches its setpoint — "There's no setpoint check; `isFinished()`
     returns false."

MISCONCEPTIONS:
- *"`.x()` is the X button."*
  → "On a PS5 controller it's `.cross()`. `.x()` belongs to the Xbox class. The narrator says
  `.x()`; the verified syntax says `.cross()`."
- *"The port number is a USB port on the laptop."*
  → "It's a slot in the Driver Station app. You drag the controller into it, usually port 0."
- *"Ports select which button you're reading."*
  → "Ports identify the *controller*. Buttons are chosen in code."
- *"`onTrue` runs the command while I hold the button."*
  → "`onTrue` fires once and lets the command finish on its own terms. Hold-to-run is
  `whileTrue`."
- *"`CommandPS5Controller` can tell me how far the trigger is pulled."*
  → "For continuous state, read the axes or use the plain `PS5Controller`. The command controller's
  job is turning state *changes* into commands."
- *"A `whileTrue` command that never finishes is a bug."*
  → "It's the normal design. Releasing the button interrupts it, and `end(true)` cleans up."

EXERCISE: **PenguinBot gets a driver.**
*Where we are:* PenguinBot has `IntakeSubsystem`, `ArmSubsystem`, `ArmToScoreCommand`, and a
`Constants.java` (`frc-constants`). Nothing is connected to a human.

Task: write the binding plan and the code for it (the full `RobotContainer` is next lesson; this
is the controller half).
1. Create a `CommandPS5Controller` using `OperatorConstants.kDriverControllerPort`.
2. Bind `cross()` → `ArmToScoreCommand` with **`onTrue`**. Justify the choice in a comment.
3. Bind `square()` → run the intake, with **`whileTrue`**. Justify it.
4. Bind `circle()` → outtake, with `whileTrue`.
5. Bind `triangle()` → an `InstantCommand` that stops both mechanisms — a panic button.
6. Write a table: for each binding, what happens if the driver taps it vs. holds it for two
   seconds.
Bonus: explain why the panic button uses `onTrue` and not `whileTrue`.

**Full reference solution** (`details.reveal`):
```java
import edu.wpi.first.wpilibj2.command.button.CommandPS5Controller;
import edu.wpi.first.wpilibj2.command.InstantCommand;
import static frc.robot.Constants.OperatorConstants;
import static frc.robot.Constants.IntakeConstants;

private final CommandPS5Controller driver =
    new CommandPS5Controller(OperatorConstants.kDriverControllerPort);

private void configureBindings() {

    // CROSS -- onTrue: fire and forget. The arm should finish its move to the
    // scoring setpoint even if the driver's thumb has already moved on.
    driver.cross().onTrue(new ArmToScoreCommand(arm));

    // SQUARE -- whileTrue: intake only while held. Release and it stops, because
    // an intake left running eats the next game piece too.
    driver.square().whileTrue(new RunIntakeCommand(intake));

    // CIRCLE -- whileTrue: outtake only while held, same reasoning.
    driver.circle().whileTrue(
        new InstantCommand(() -> intake.runRoller(IntakeConstants.kOuttakeSpeed), intake));

    // TRIANGLE -- onTrue: panic stop. One press, everything stops, and it must NOT
    // depend on the driver keeping a finger down in an emergency.
    driver.triangle().onTrue(new InstantCommand(() -> {
        intake.stop();
        arm.stop();
    }, intake, arm));
}
```
> **Tap vs hold**
>
> | Binding | Tap (1 tick) | Hold (2 s) |
> |---|---|---|
> | `cross().onTrue(ArmToScore)` | arm still goes all the way to 9.0 | same — holding changes nothing |
> | `square().whileTrue(RunIntake)` | intake runs one tick, then stops | intake runs the whole 2 s, then stops |
> | `circle().whileTrue(outtake)` | one tick of outtake | 2 s of outtake |
> | `triangle().onTrue(panic)` | everything stops | everything stops, once |
>
> **Why the panic button is `onTrue`:** in an emergency the one thing you cannot rely on is a
> human holding a button steadily. A panic stop must latch on a single press. `whileTrue` would
> mean the mechanism resumes the instant a startled thumb slips.

Solution notes for the author:
- The `InstantCommand(runnable, requirements...)` overload is used above. `[NEEDS RESEARCH:
  confirm InstantCommand accepts trailing Subsystem requirements in the current WPILib.]` If not
  confirmed, use the plain single-argument form and note that requirements would normally be
  declared.
- The comments explaining *why* each condition was chosen are the actual deliverable. A student
  who can justify `onTrue` vs `whileTrue` per binding has understood this lesson; one who
  produced four correct lines by pattern-matching hasn't.

Tease: "You have bindings. They need a home — the file the source calls the most important one in
the project. Next: `RobotContainer`."

CHECKPOINT: (5 questions, every option explained)

**Q1.** What does `CommandPS5Controller` give you that `PS5Controller` doesn't?
- a) Access to the sticks — "Both can read axes."
- b) ✓ **Triggers that run commands when a button's state changes** — "Yes — that's the whole
  distinction, and it's why it's the common choice in command-based robots."
- c) A higher polling rate — "Same 20 ms loop."
- d) Rumble support — "Not the distinction the source draws."

**Q2.** What is the `0` in `new CommandPS5Controller(0)`?
- a) The first button — "Buttons are chosen by method, not by number."
- b) ✓ **A port — a slot in the Driver Station app that a controller is dragged into** — "Right,
  and that's why an unassigned controller does nothing."
- c) A USB port on the laptop — "It's the DS's slot, not the hardware port."
- d) The controller's CAN ID — "Controllers aren't on the CAN bus."

**Q3.** Which method is the PS5 "X" button?
- a) `.x()` — "That's Xbox vocabulary. The narrator says this; it's wrong for PS5."
- b) `.a()` — "Also Xbox."
- c) ✓ **`.cross()`** — "Correct — with `circle()`, `square()` and `triangle()` alongside it."
- d) `.button(1)` — "A generic form may exist, but the readable, verified name is `cross()`."

**Q4.** You tap a button bound with `onTrue` to a 10-tick command. What happens?
- a) The command runs one tick — "That's `whileTrue` behaviour."
- b) ✓ **The command runs all 10 ticks to its own end condition** — "Yes — `onTrue` starts it and
  lets go."
- c) Nothing; the tap is too short — "A single tick is enough to trigger a rising edge."
- d) The command runs twice — "One rising edge, one schedule."

**Q5.** A `whileTrue` command's `end()` receives `interrupted = true`. Why?
- a) Something went wrong — "Nothing went wrong."
- b) ✓ **It was stopped by the button release rather than finishing on its own** — "Exactly, and
  that's the normal case for `whileTrue`."
- c) The subsystem was busy — "Requirements would cause that, but here it's the release."
- d) `isFinished()` returned true — "Then `interrupted` would be `false`."

SEASON-FLAGS:
- `callout--season`: `CommandPS5Controller`'s import path is verified in the PDF, but the plain
  `PS5Controller`'s path and the axis getter names are not.
  `[NEEDS RESEARCH: PS5Controller import path; axis getters on CommandPS5Controller; whether
  InstantCommand takes trailing requirements — content/research/toolchain-2026.md]`
- `[NEEDS RESEARCH: whether the team should be using `CommandXboxController` instead in 2026 —
  the source's team uses PS5. Keep PS5 as the course default and note the Xbox equivalents exist
  with `.a()`/`.b()`/`.x()`/`.y()`.]`
- The `onTrue`/`onFalse`/`whileTrue`/`whileFalse` names are verified in both sources; light flag
  only.

SIM-REQUEST: `CommandScheduler.cancel(Command)` (or equivalent) — needed to show `whileTrue`
being interrupted. **Not in the §3 contract; add it.**
*Fallback if not shipped:* have `RunIntakeCommand.isFinished()` consult the same
`crossPressed` boolean the loop maintains, so it ends itself on release. The lesson then notes
that on a real robot the scheduler cancels it for you, and `end()` receives
`interrupted = true`. Assertions 1–3, 5 and 6 all survive; only assertion 4 changes.
