# frc-robot-java · Robot.java Modes
unit: 8 · Wiring It Together   |   duration: 25 min   |   difficulty: Intermediate
interactivity: SANDBOX (PenguinSim)

> Read `_shared-conventions.md` first (§3 sim contract; paste **real** output).
> **This lesson exists primarily to correct an error.** The narrator garbled init vs. periodic
> ("init is what happens when it stops"). The correction is not a footnote — it is the lesson.

INTRODUCES:
- `robot-modes` — teleoperated, autonomous, test, practice
- `init-vs-periodic` — Init once at mode start; Periodic every ~20 ms while in that mode
- `robotperiodic` — runs in **every** mode, always
- `scheduler-run-in-robotperiodic` — where `CommandScheduler.getInstance().run()` lives
- `teleop-mode`, `autonomous-mode`, `test-mode`
- `when-to-edit-robot-java` — the one real example from the source

ASSUMES:
- `command-scheduler`, `twenty-ms-loop`, `scheduler-order` (`frc-command-lifecycle`)
- `robotcontainer-structure`, `configure-bindings` (`frc-robotcontainer`)
- `sequentialcommandgroup` (`frc-command-groups`)
- `driver-station`, `robot-modes-selector`, `enable-disable` (`frc-game-tools`)
- `src-tree`, `robot-java-file` (`frc-src-tree`)

GOAL:
Explain what runs in each robot mode and when, and name the rare circumstances that justify
editing `Robot.java`.

HOOK: **The one time the team touched this file** (`_shared-conventions.md` §6 story, PDF page
14). `callout--why`.
`Robot.java` is the file every guide tells you to leave alone — including this one. So it's worth
knowing what happened the one time the team edited it: **they changed `testInit` to run a
PathPlanner routine**, so they could trigger an autonomous path from the Driver Station's test
mode without waiting for a real autonomous period.

That's a good reason. Notice its shape: not "I needed to add robot logic," but "I needed a
different *entry point* for testing." That's what this file is for.

Now the correction, and it needs a `callout--verified` right at the top of the lesson:

> The narrator says *"init is what happens when it stops."* **That is wrong.**
> **Init runs once when the mode starts. Periodic runs every ~20 ms while you're in that mode.**

Mark: [FROM PDF page 14, verified syntax note]
Get this wrong and you'll put your setup code somewhere that runs fifty times a second, or your
per-cycle logic somewhere that runs once. Both fail quietly.

EXPLAIN:

1. **Four modes, chosen at the Driver Station.** Teleoperated, autonomous, test, practice. **You
   pick the mode in the Driver Station, not in code.** Your code has a *handler* for each; the DS
   decides which one is live.
   Mark: [FROM PDF page 13, §8.2]
   Focus on **teleop and autonomous**; test and practice are optional. Say that plainly — the
   source does.
   `[NEEDS RESEARCH: confirm the 2026 Driver Station still offers exactly these four modes and
   these names — content/research/toolchain-2026.md]`

2. **Every mode has an Init and a Periodic.** Reproduce the pattern as a table; the symmetry is
   the point:

| Method | Runs |
|---|---|
| `robotInit()` | **once**, when the robot program starts |
| `robotPeriodic()` | every ~20 ms, in **every** mode, always |
| `autonomousInit()` | **once**, when autonomous begins |
| `autonomousPeriodic()` | every ~20 ms while in autonomous |
| `teleopInit()` | **once**, when teleop begins |
| `teleopPeriodic()` | every ~20 ms while in teleop |
| `testInit()` / `testPeriodic()` | same shape, for test mode |
| `disabledInit()` / `disabledPeriodic()` | same shape, while disabled |

   Mark: [FROM PDF page 13, §8.2 + Appendix A]
   Analogy: **Init is the whistle; Periodic is the game.** Init runs once when the referee blows
   to start a period. Periodic is every moment of play until the period ends.
   `[NEEDS RESEARCH: confirm disabledInit/disabledPeriodic exist and are generated in the 2026
   template]`

3. **`robotPeriodic()` is the one that always runs — and it's the important one.**
   It runs in every mode, in every state, including disabled. And it contains **one line that
   makes the entire command framework work**:
```java
@Override
public void robotPeriodic() {
    CommandScheduler.getInstance().run();
}
```
   That call is what runs every subsystem's `periodic()`, polls the buttons, and executes every
   scheduled command — everything you built in Units 7 and 8. Take that line out and the robot
   compiles, deploys, connects, enables, and does absolutely nothing.
   Make this a genuine reveal. The student has been calling `CommandScheduler.getInstance().run()`
   by hand in every sandbox since `frc-command-lifecycle`, in a `for` loop, wondering who does it
   on a real robot. **This is who.**
   `[NEEDS RESEARCH: confirm the 2026 generated Robot.java calls CommandScheduler.getInstance().run()
   in robotPeriodic() — content/research/toolchain-2026.md]`

4. **How autonomous actually gets started.** The generated pattern:
   - `autonomousInit()` asks `RobotContainer` for the autonomous command
     (`getAutonomousCommand()` — the stub you wrote last lesson) and **schedules it**.
   - `autonomousPeriodic()` is usually empty, because the scheduler in `robotPeriodic()` is
     already running the command.
   - `teleopInit()` typically **cancels** the autonomous command, so a routine still running at
     the buzzer doesn't fight the driver.
   That third point is a real bug source and worth calling out: without the cancel, an unfinished
   auto keeps driving during teleop.
   `[NEEDS RESEARCH: confirm the generated pattern — m_autonomousCommand field, schedule() in
   autonomousInit, cancel() in teleopInit — for the 2026 template]`

5. **Why you leave it alone.** Because everything you want to change lives somewhere better:

| You want to… | Edit |
|---|---|
| Change what a button does | `RobotContainer` |
| Change how a mechanism behaves | its subsystem |
| Change a number | `Constants` |
| Add a behaviour | a new command in `commands/` |
| **Run a routine from test mode for debugging** | **`Robot.java` (`testInit`)** |

   The last row is the source's real example. Everything above it is a reason *not* to be in this
   file.

6. **Disabled is a mode too.** While disabled, `robotPeriodic()` — and therefore the scheduler,
   and therefore every subsystem's `periodic()` — still runs. Your telemetry keeps updating on the
   dashboard while the robot sits disabled on the field. What *doesn't* happen is motors moving.
   That's a genuinely useful fact between matches, and it explains why the arm's position still
   shows on Glass when nothing can move.
   `[NEEDS RESEARCH: confirm subsystem periodic() runs while the robot is disabled in the current
   WPILib]`

CODE:

**Sample — `Robot.java`, essentially as generated:**
```java
package frc.robot;

import edu.wpi.first.wpilibj.TimedRobot;
import edu.wpi.first.wpilibj2.command.Command;
import edu.wpi.first.wpilibj2.command.CommandScheduler;

public class Robot extends TimedRobot {

    private Command autonomousCommand;
    private RobotContainer robotContainer;

    @Override
    public void robotInit() {
        robotContainer = new RobotContainer();   // ONCE -- builds subsystems + bindings
    }

    @Override
    public void robotPeriodic() {
        CommandScheduler.getInstance().run();    // EVERY 20 ms, EVERY mode. The whole framework.
    }

    @Override
    public void autonomousInit() {
        autonomousCommand = robotContainer.getAutonomousCommand();
        if (autonomousCommand != null) {
            autonomousCommand.schedule();        // ONCE, at the start of auto
        }
    }

    @Override
    public void autonomousPeriodic() {
        // usually empty -- the scheduler above is already running the command
    }

    @Override
    public void teleopInit() {
        if (autonomousCommand != null) {
            autonomousCommand.cancel();          // don't let auto fight the driver
        }
    }

    @Override
    public void teleopPeriodic() {
        // usually empty -- bindings and the scheduler do the work
    }
}
```
Annotate heavily — this is the one file the student reads rather than writes:
- `robotInit` constructs `RobotContainer`, which is what creates every subsystem and binding.
- `robotPeriodic`'s single line is the engine.
- `autonomousInit` **schedules**; `autonomousPeriodic` is empty and that's correct.
- `teleopInit`'s cancel is the bug you'd otherwise ship.
- Both `Periodic` methods being empty is the mark of a well-structured command-based robot.
`[NEEDS RESEARCH: confirm the base class is `TimedRobot` in the current WPILib and that
`Command.schedule()` / `.cancel()` are the current instance methods]`

SANDBOX:

Banner: **"Simulated for teaching. The real classes come from WPILib."**
Honesty note: PenguinSim has no Driver Station, so `main` plays the part — switching modes on
chosen ticks the way a human would at the field.

**Exact starter code:**
```java
public class Main {

    // ... ArmSubsystem, IntakeSubsystem, ArmToScoreCommand as in the previous lessons ...

    static class RobotContainer {
        final ArmSubsystem arm = new ArmSubsystem();
        Command getAutonomousCommand() { return new ArmToScoreCommand(arm); }
    }

    static class Robot {
        RobotContainer container;
        Command autonomousCommand;

        void robotInit() {
            container = new RobotContainer();
            System.out.println("robotInit()          <-- ONCE, at program start");
        }
        void robotPeriodic() {
            CommandScheduler.getInstance().run();     // every 20 ms, EVERY mode
        }
        void autonomousInit() {
            System.out.println("autonomousInit()     <-- ONCE, when auto starts");
            autonomousCommand = container.getAutonomousCommand();
            CommandScheduler.getInstance().schedule(autonomousCommand);
        }
        void autonomousPeriodic() { }
        void teleopInit() {
            System.out.println("teleopInit()         <-- ONCE, when teleop starts");
            if (autonomousCommand != null) {
                CommandScheduler.getInstance().cancel(autonomousCommand);
                System.out.println("  cancelled the autonomous command");
            }
        }
        void teleopPeriodic() { }
        void disabledInit()     { System.out.println("disabledInit()       <-- ONCE"); }
        void disabledPeriodic() { }
    }

    public static void main(String[] args) {
        Robot robot = new Robot();
        robot.robotInit();

        String mode = "disabled";
        robot.disabledInit();

        final int AUTO_AT   = 3;    // <-- CHANGE ME
        final int TELEOP_AT = 8;    // <-- CHANGE ME

        for (int tick = 1; tick <= 15; tick++) {
            if (tick == AUTO_AT)   { mode = "auto";   robot.autonomousInit(); }
            if (tick == TELEOP_AT) { mode = "teleop"; robot.teleopInit(); }

            robot.robotPeriodic();                                  // ALWAYS
            if (mode.equals("auto"))   robot.autonomousPeriodic();  // only in auto
            if (mode.equals("teleop")) robot.teleopPeriodic();      // only in teleop
            if (mode.equals("disabled")) robot.disabledPeriodic();

            System.out.printf("tick %2d  [%-8s]  arm %5.2f%n",
                              tick, mode, robot.container.arm.getPosition());
        }
    }
}
```

**What the student changes:**
1. `AUTO_AT` / `TELEOP_AT` — watch the arm's motion start when auto begins and **stop dead** when
   teleop cancels the command mid-move.
2. **Delete `CommandScheduler.getInstance().run()` from `robotPeriodic()`.** The arm never moves.
   Nothing errors. This is the single most instructive experiment in Unit 8.
3. Remove the `cancel()` from `teleopInit()` — the auto command keeps running into teleop.
4. Move the scheduler call into `teleopPeriodic()` — nothing works in autonomous, and the reason
   why is now obvious.

**Expected printed output** (arm trajectory from the §3 contract, `kP = 0.2`, clamp ±0.8, setpoint
9.0; auto starts at tick 3, teleop cancels at tick 8). **Author must re-run and paste real
output.**
```
robotInit()          <-- ONCE, at program start
disabledInit()       <-- ONCE
tick  1  [disabled]  arm  0.00
tick  2  [disabled]  arm  0.00
autonomousInit()     <-- ONCE, when auto starts
tick  3  [auto    ]  arm  1.60
tick  4  [auto    ]  arm  3.20
tick  5  [auto    ]  arm  4.80
tick  6  [auto    ]  arm  6.40
tick  7  [auto    ]  arm  7.44
teleopInit()         <-- ONCE, when teleop starts
  cancelled the autonomous command
tick  8  [teleop  ]  arm  7.44
tick  9  [teleop  ]  arm  7.44
tick 10  [teleop  ]  arm  7.44
...
tick 15  [teleop  ]  arm  7.44
```

**Output shape assertions** (must hold even if numbers differ):
1. `robotInit()` prints **once**, before everything.
2. Each `Init` prints **exactly once**, at its mode transition — never repeatedly.
3. The arm moves only while the auto command is scheduled.
4. On the teleop transition the command is cancelled and the arm **stops where it is**, partway
   to its setpoint.
5. With the scheduler call deleted (experiment 2), the arm **never moves in any mode** and nothing
   errors.
6. With `cancel()` removed (experiment 3), the arm **carries on moving into teleop**.

Teaching text must land assertions 5 and 6. Assertion 5 is the reveal: *that one line in
`robotPeriodic()` is the whole framework.* Assertion 6 is the bug: *an autonomous routine still
running while the driver is trying to drive.*

CHALLENGES:

1. **Fill-in-the-blank · init vs periodic** — `data-kind="fib"`:
   ```
   robotInit()          runs <blank>, when the program starts
   robotPeriodic()      runs every ~20 ms, in <blank> mode
   teleopInit()         runs <blank>, when teleop begins
   teleopPeriodic()     runs every ~20 ms while in <blank>
   ```
   answers: `data-answer="once"`, `data-answer="every|all|every single"`,
   `data-answer="once"`, `data-answer="teleop|teleoperated"`
   Win: "Init once at the start of a mode; Periodic every 20 ms while in it. `robotPeriodic` is
   the one that runs in all of them."
   Lose: "Init runs **once** when a mode starts — not when it stops. Periodic runs every ~20 ms
   while you're in that mode, and `robotPeriodic` runs in every mode including disabled."

2. **MCQ · the one line** — "You delete `CommandScheduler.getInstance().run()` from
   `robotPeriodic()`. What happens?"
   - a) A compile error — "It compiles perfectly."
   - b) The robot won't deploy — "It deploys and connects fine."
   - c) ✓ **Everything still works except that no command, binding or subsystem `periodic()` ever
     runs — the robot does nothing, silently** — "Exactly. One line, the entire framework."
   - d) Only autonomous breaks — "Teleop bindings go through the same scheduler."

3. **MCQ · the cancel** — "You remove `autonomousCommand.cancel()` from `teleopInit()`. Auto
   hasn't finished when the buzzer goes. What happens?"
   - a) It's automatically cancelled — "Nothing cancels it for you."
   - b) ✓ **It keeps running, fighting the driver for the same subsystems** — "Right, and it's a
     confusing failure because the driver's own bindings partly work."
   - c) The robot errors out — "No error at all."
   - d) It restarts from the beginning — "It just carries on from where it was."

4. **Predict / short answer** — "The narrator says init is 'what happens when it stops.' In one
   word, when does `teleopInit()` actually run?"
   `data-answer="start|at the start|beginning|when teleop starts|once at the start|when it starts"`
   Win: "At the **start**. Init runs once when the mode begins. There's no 'when it stops' method
   — the closest thing is the *next* mode's Init."
   Lose: "At the start of teleop, exactly once. The narrator has this backwards and it's the one
   correction this lesson exists to make."

5. **MCQ · where does it go?** — "You want the arm's position on the dashboard whether the robot
   is enabled, disabled, in auto, or in teleop. Where?"
   - a) `teleopPeriodic()` — "Nothing in disabled or autonomous."
   - b) `robotInit()` — "Once, at startup. One value forever."
   - c) ✓ **The subsystem's `periodic()`, which the scheduler runs from `robotPeriodic()` in
     every mode** — "Yes — and that's why telemetry keeps updating while the robot sits disabled."
   - d) `autonomousPeriodic()` — "Only during auto."

MISCONCEPTIONS:
- *"Init runs when the mode ends."*
  → "Init runs **once at the start** of a mode. This is the narrator's error and the reason this
  lesson exists."
- *"`teleopPeriodic()` is where I write my driving code."*
  → "In a command-based robot it's usually empty. Your bindings and commands do the work, driven
  by the scheduler in `robotPeriodic()`."
- *"`robotPeriodic()` only runs when enabled."*
  → "Every mode, including disabled. Which is why telemetry keeps updating on a robot that can't
  move."
- *"Autonomous logic goes in `autonomousPeriodic()`."*
  → "`autonomousInit()` schedules a command; the scheduler runs it. `autonomousPeriodic()` stays
  empty."
- *"Empty Periodic methods mean I've forgotten something."*
  → "They mean your structure is right. The work is in subsystems and commands, where it belongs."
- *"I should never touch `Robot.java`."*
  → "Almost never. The real exception is exactly the source's: an entry point for testing, like
  running a routine from `testInit`."

EXERCISE: **PenguinBot's `Robot.java`, read and reasoned about.**
*Where we are:* PenguinBot has subsystems, commands, a scoring sequence, constants, and a
`RobotContainer` full of bindings. Nothing has ever called any of it on a real robot.

Task — mostly reading and reasoning, because that's the honest use of this file:
1. Open your project's generated `Robot.java`. Find the `CommandScheduler.getInstance().run()`
   call and write down which method it's in and why that matters.
2. Write out what happens, in order, from powering on the robot to the driver pressing cross in
   teleop. Name the method at each step.
3. Add a `testInit()` that schedules your `ScoreSequence`, so you can trigger a full scoring cycle
   from the Driver Station's test mode without a driver. Explain why this is a legitimate edit.
4. State one change you were tempted to make in `Robot.java` and where it should actually go.
Bonus: what breaks if `robotInit()` doesn't create the `RobotContainer`?

**Full reference solution** (`details.reveal`):
> **1.** It's in `robotPeriodic()`. That matters because `robotPeriodic()` runs in **every mode
> and while disabled** — so subsystem `periodic()` methods, button polling, and command execution
> all keep working regardless of mode. If it were in `teleopPeriodic()`, autonomous would do
> nothing at all.
>
> **2. Power-on to a button press:**
> 1. `robotInit()` — once. Constructs `RobotContainer`, which constructs `ArmSubsystem` and
>    `IntakeSubsystem` (each registering itself with the scheduler) and calls
>    `configureBindings()`.
> 2. `disabledInit()` — once. `robotPeriodic()` starts running every 20 ms, so subsystem
>    `periodic()` methods run and telemetry updates even though nothing can move.
> 3. The DS is set to Teleoperated and **Enabled**. `teleopInit()` runs once and cancels any
>    autonomous command.
> 4. Every 20 ms, `robotPeriodic()` calls `CommandScheduler.getInstance().run()`, which runs
>    subsystem `periodic()`s and polls the buttons.
> 5. The driver presses cross. The trigger's rising edge schedules `ScoreSequence`, whose
>    `initialize()` runs immediately.
> 6. On each subsequent tick the scheduler executes the sequence's current command, and
>    `ArmToScoreCommand.execute()` calls `arm.goToScore()`, which runs one PID cycle and calls
>    `pivot.set(...)`.
> 7. RIO → CAN → SparkMax (ID 3) → Neo → the arm rises.
>
> **3.**
> ```java
> @Override
> public void testInit() {
>     // Legitimate edit: an entry point for testing, not robot logic.
>     // Lets us run a full scoring cycle from the DS without a driver or an auto period.
>     CommandScheduler.getInstance().schedule(
>         new ScoreSequence(robotContainer.arm, robotContainer.intake));
> }
> ```
> This is legitimate because it adds no behaviour — every command it runs already exists and is
> defined elsewhere. `Robot.java` is only being used as a *trigger*. It's the same reason the team
> edited `testInit` to fire a PathPlanner routine.
>
> **4.** The common temptation is "make the arm hold its position whenever the robot is enabled" —
> and putting that in `teleopPeriodic()`. It belongs in the `ArmSubsystem` (as a default command,
> or as behaviour inside the subsystem), not in `Robot.java`. `Robot.java` decides *when modes
> start*; it does not decide what mechanisms do.
>
> **Bonus:** if `robotInit()` doesn't create the `RobotContainer`, no subsystems are ever
> constructed, so nothing registers with the scheduler, no bindings are configured, and no
> `periodic()` runs. The robot boots, connects, shows Robot Code green, enables — and every button
> does nothing. Exactly the same silent failure as deleting the scheduler line.

Tease: "Unit 8 is done. PenguinBot has mechanisms, sensors, closed-loop control, commands,
bindings, sequences, and a mode lifecycle. It still can't move across the field. Unit 9: driving."

CHECKPOINT: (5 questions, every option explained)

**Q1.** When does `autonomousInit()` run?
- a) Every 20 ms during autonomous — "That's `autonomousPeriodic()`."
- b) ✓ **Once, when autonomous begins** — "Yes — Init means start, always."
- c) When autonomous ends — "That's the narrator's error, and there's no such method."
- d) Once when the robot is powered on — "That's `robotInit()`."

**Q2.** Which method runs in every mode, including disabled?
- a) `teleopPeriodic()` — "Teleop only."
- b) `autonomousPeriodic()` — "Autonomous only."
- c) ✓ **`robotPeriodic()`** — "Right, and that's why the scheduler call lives there."
- d) `robotInit()` — "Once, at startup."

**Q3.** What single line makes the command framework work?
- a) `new RobotContainer()` in `robotInit()` — "Necessary, but it only builds things."
- b) ✓ **`CommandScheduler.getInstance().run()` in `robotPeriodic()`** — "Yes — remove it and the
  robot does nothing, silently."
- c) `configureBindings()` — "It registers bindings; something still has to poll them."
- d) `extends TimedRobot` — "That gives you the mode methods; it doesn't run commands."

**Q4.** Why does `teleopInit()` cancel the autonomous command?
- a) To free memory — "Not a concern here."
- b) ✓ **So an unfinished auto routine doesn't keep driving while the human is driving** —
  "Exactly, and without it you get a robot fighting its own driver."
- c) Because autonomous commands can't run in teleop — "They can, which is the problem."
- d) To reset the encoders — "Unrelated; cancelling doesn't touch sensors."

**Q5.** Which is a legitimate reason to edit `Robot.java`?
- a) To change what the cross button does — "`RobotContainer`."
- b) To change the arm's PID gains — "`Constants`."
- c) ✓ **To schedule a routine from `testInit` so you can trigger it from the Driver Station** —
  "Right — that's the source's own example, and it's an entry point, not logic."
- d) To add a new mechanism — "A new subsystem in `subsystems/`."

SEASON-FLAGS:
- `callout--season` on the whole generated-file structure — base class, method names, and the
  generated autonomous pattern all come from the template and can change.
  `[NEEDS RESEARCH: TimedRobot base class; the generated Robot.java's autonomous pattern
  (m_autonomousCommand, schedule/cancel); whether CommandScheduler.run() is still called in
  robotPeriodic(); whether disabledInit/disabledPeriodic are generated; the four DS mode names —
  content/research/toolchain-2026.md]`
- The **init-vs-periodic correction** is framework-stable and needs no flag. It is the one thing
  on this page that will still be true in ten years.

SIM-REQUEST: `CommandScheduler.cancel(Command)` — shared with `frc-controllers`.
*Fallback:* demonstrate mode transitions without the cancel, and teach the cancel from the static
`Robot.java` sample. Assertions 1–3 and 5 survive; 4 and 6 depend on cancel.
