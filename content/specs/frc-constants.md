# frc-constants · Constants
unit: 7 · Structuring Behavior   |   duration: 20 min   |   difficulty: Intermediate
interactivity: SANDBOX (PenguinSim)

> Read `_shared-conventions.md` first (§3 sim contract; paste **real** output).
> Short lesson, one idea, high payoff. Resist padding it.

INTRODUCES:
- `constants-file-pattern` — one home for every tunable number
- `nested-static-constants` — inner classes grouping constants per mechanism
- `k-prefix-naming` — `kDriverControllerPort`, the WPILib convention
- `single-source-of-truth` — change it once, it changes everywhere
- `static-vs-instance-recall` — why `Constants.ArmConstants.kP` needs no object

ASSUMES:
- `subsystembase`, `subsystem-anatomy` (`frc-subsystems`)
- `can-id`, `id-convention` (`frc-can-ids`); `constants-file` (`frc-src-tree`)
- `pidcontroller-class` (`frc-pid-syntax`)
- Java `static final`, nested classes, and `j-static-vs-instance` from Phase 1. **Link, don't
  re-teach.**

GOAL:
Move every hard-coded number in PenguinBot into `Constants.java`, organised so a teammate can
find any value in one guess.

HOOK: **Hunting down every hard-coded `0`** (`_shared-conventions.md` §6 story 15).
`callout--why`.
The template ships with `OperatorConstants.kDriverControllerPort` where a beginner would have
typed `0`. The source explains exactly why, and it's the least glamorous, most repeatedly-true
argument in software:

> If multiple controllers or files use that port and you later need to change it, you'd have to
> hunt down and edit every `0` by hand. With a constant, you change it once and it updates
> everywhere it's referenced.

Now make it concrete and slightly alarming. Search your own PenguinBot code for `0`:

```
new SparkMax(2, ...)          the intake's CAN ID
new SparkMax(3, ...)          the arm's CAN ID
new PIDController(0.2, 0, 0)  the tuned gain -- and two zeros that aren't the port
moveToward(9.0)               the scoring setpoint
Math.min(0.8, ...)            the team's power limit
new CommandPS5Controller(0)   the controller port
```

Six meanings. Which of those zeros is the controller port? At 9 a.m. on a Saturday, between
matches, with the drive team waiting — **that** is when you find out whether you did this.

EXPLAIN:

1. **What a constant is here.** From the intro notes: *a constant is just a stored value in
   `Constants.java`.* No new language feature — `public static final`, which you already know.
   The idea is organisational, not technical, and saying that keeps the lesson honest and short.

2. **The rule for what belongs there.** The source states the textbook case precisely: **a value
   used in multiple places that rarely changes.** Widen it slightly to the practical version:

| Put it in `Constants` | Leave it inline |
|---|---|
| CAN IDs, controller ports | A loop bound like `i < 4` |
| Speeds, setpoints, tolerances | An obvious `0` meaning "stop" |
| PID gains | Something used exactly once and self-explanatory |
| Physical dimensions, gear ratios | |
| Anything you'll change while tuning | |

   The strongest single test: **would you ever change this while standing next to the robot?**
   If yes, it goes in `Constants`.

3. **`k` for konstant.** WPILib's convention: constants get a `k` prefix —
   `kDriverControllerPort`, `kIntakeSpeed`, `kArmScorePosition`. It's a convention, not a rule,
   and the *reason* is worth one sentence: reading `kIntakeSpeed` in the middle of a method, you
   know instantly it's a configured value and not a local variable. Follow it, because the
   generated template does and your teammates will.

4. **Nested classes, one per mechanism.** The template's own pattern —
   `OperatorConstants.kDriverControllerPort` — is a **nested static class**. Copy it per
   subsystem. Two payoffs:
   - Typing `Constants.ArmConstants.` and letting autocomplete list everything the arm has is a
     genuinely fast way to work.
   - Names can repeat across mechanisms without collision: `ArmConstants.kP` and
     `DriveConstants.kP` are two different, correctly-named things.
   Mark: [FROM INTRO NOTES page 5–6, §7] + [FROM PDF page 12, §7.3 — "WPILib's Create New Project
   scaffolds the Constants file for you — copy its pattern per subsystem"]

5. **Static, so no object needed.** `Constants.ArmConstants.kP` works with no `new` anywhere —
   these are class-level values, exactly like `Math.PI`. One clause linking to
   `j-static-vs-instance`, then stop. Contrast in a single line: your **subsystems** are
   instances because there's one real arm; your **constants** are static because there's one set
   of numbers.

6. **Where it does *not* help.** Be honest, or students cargo-cult it:
   - A constant used in exactly one place, with an obvious meaning, is fine inline. Moving it
     adds a hop for no benefit.
   - A constant does **not** make a number correct. `kArmScorePosition = 9.0` is still wrong if
     the arm scores at 11.
   - It does not replace the vendor client: `kIntakeCanId = 2` in your code and the device set
     to 5 is still the silent Unit 2 bug. The constant makes the number easy to change, not
     automatically true.

CODE:

**Sample — PenguinBot's `Constants.java`.** This is the file the exercise produces; show it
whole, because its *shape* is the lesson:
```java
// Constants.java
public final class Constants {

    public static final class OperatorConstants {
        public static final int kDriverControllerPort = 0;
    }

    public static final class IntakeConstants {
        public static final int    kRollerCanId  = 2;
        public static final double kIntakeSpeed  = 0.7;
        public static final double kOuttakeSpeed = -0.5;
    }

    public static final class ArmConstants {
        public static final int    kPivotCanId    = 3;
        public static final int    kFollowerCanId = 4;

        public static final double kP = 0.2;      // tuned in frc-pid-tuning
        public static final double kI = 0.0;
        public static final double kD = 0.0;

        public static final double kStowedRotations = 0.0;
        public static final double kScoreRotations  = 9.0;
        public static final double kToleranceRot    = 0.25;
        public static final double kHomingSpeed     = -0.15;
        public static final double kSafetyLimitRot  = 12.0;
    }

    public static final class RobotConstants {
        public static final double kMaxOutput = 0.8;   // the team's 80% rule
    }
}
```
Annotate: `final class` with no public constructor (nobody should instantiate it); nested
`static final class` per mechanism; `k` prefix throughout; **`kMaxOutput` lives at robot level,
not per mechanism, because it's a team-wide rule** — that placement decision is itself worth a
sentence.
Mark: [FROM INTRO NOTES page 5–6 pattern] + [structure derived from the WPILib generated
template]. `[NEEDS RESEARCH: confirm the 2026 template still generates a `Constants.java` with
an `OperatorConstants` nested class — content/research/toolchain-2026.md]`

**Before/after** for one subsystem, side by side — this contrast is more persuasive than any
paragraph:
```java
// BEFORE
private final SparkMax pivot = new SparkMax(3, MotorType.kBrushless);
private final PIDController pid = new PIDController(0.2, 0.0, 0.0);
public void goToScore() { moveToward(9.0); }

// AFTER
private final SparkMax pivot =
    new SparkMax(ArmConstants.kPivotCanId, MotorType.kBrushless);
private final PIDController pid =
    new PIDController(ArmConstants.kP, ArmConstants.kI, ArmConstants.kD);
public void goToScore() { moveToward(ArmConstants.kScoreRotations); }
```
Point out the honest cost: the "after" is longer. What you bought is that every number is now
named, and every one lives in a file you can open on a phone at a competition.

SANDBOX:

Banner: **"Simulated for teaching. The real classes come from WPILib and REVLib."**

**Exact starter code** — the demonstration is "change one line, change the robot":
```java
public class Main {

    // ===== Constants.java, as nested static classes =====
    static final class ArmConstants {
        static final int    kPivotCanId     = 3;
        static final double kP              = 0.2;    // <-- CHANGE ME
        static final double kScoreRotations = 9.0;    // <-- CHANGE ME
        static final double kToleranceRot   = 0.25;
    }
    static final class RobotConstants {
        static final double kMaxOutput = 0.8;         // <-- CHANGE ME
    }
    // ====================================================

    static class ArmSubsystem extends SubsystemBase {
        private final SparkMax pivot =
            new SparkMax(ArmConstants.kPivotCanId, MotorType.kBrushless);
        private final PIDController pid =
            new PIDController(ArmConstants.kP, 0.0, 0.0);

        ArmSubsystem() { pid.setTolerance(ArmConstants.kToleranceRot); }

        double  getPosition() { return pivot.getEncoder().getPosition(); }
        boolean atSetpoint()  { return pid.atSetpoint(); }

        void goToScore() {
            double out = pid.calculate(getPosition(), ArmConstants.kScoreRotations);
            double max = RobotConstants.kMaxOutput;
            pivot.set(Math.max(-max, Math.min(max, out)));
        }
        @Override public void periodic() { }
    }

    public static void main(String[] args) {
        ArmSubsystem arm = new ArmSubsystem();
        System.out.printf("target %.2f   kP %.2f   maxOut %.2f%n",
                          ArmConstants.kScoreRotations,
                          ArmConstants.kP,
                          RobotConstants.kMaxOutput);

        for (int tick = 1; tick <= 20; tick++) {
            arm.goToScore();
            if (tick % 5 == 0) {
                System.out.printf("tick %2d   pos %6.2f   atSetpoint %b%n",
                                  tick, arm.getPosition(), arm.atSetpoint());
            }
        }
    }
}
```
*Note for the sim engineer / author:* add `CommandScheduler.getInstance().run()` inside the loop
if the model requires it.

**What the student changes:** one constant at a time, and note that they never touch
`ArmSubsystem`:
1. `kScoreRotations` `9.0` → `4.5` — the arm goes to a different place.
2. `kP` `0.2` → `0.05` — it gets slower (the Unit 6 ladder, now driven from one line).
3. `kMaxOutput` `0.8` → `0.4` — everything slows down, robot-wide.

**Expected printed output** — run 1, defaults (computed from the §3 contract; the same
trajectory as `frc-pid-syntax`). **Author must re-run and paste real output.**
```
target 9.00   kP 0.20   maxOut 0.80
tick  5   pos   7.44   atSetpoint false
tick 10   pos   8.88   atSetpoint true
tick 15   pos   9.00   atSetpoint true
tick 20   pos   9.00   atSetpoint true
```
Run 2, `kScoreRotations = 4.5` — the error sequence halves, and with the clamp active for fewer
ticks the arm arrives sooner:
```
target 4.50   kP 0.20   maxOut 0.80
tick  5   pos   4.50   atSetpoint true
tick 10   pos   4.50   atSetpoint true
tick 15   pos   4.50   atSetpoint true
tick 20   pos   4.50   atSetpoint true
```
Run 3, `kMaxOutput = 0.4` — the clamp bites for twice as long:
```
target 9.00   kP 0.20   maxOut 0.40
tick  5   pos   4.00   atSetpoint false
tick 10   pos   8.00   atSetpoint false
tick 15   pos   8.94   atSetpoint true
tick 20   pos   9.00   atSetpoint true
```
*Author note:* runs 2 and 3 are more sensitive to the sim's exact constants than run 1. Re-run
all three and paste real output; if the numbers move, keep the **assertions** below.

**Output shape assertions** (must hold even if numbers differ):
1. The header line reflects whatever the constants currently say — the code below it is
   **untouched** in every run.
2. Changing `kScoreRotations` changes where the arm stops and nothing else.
3. Lowering `kP` makes it slower to arrive; lowering `kMaxOutput` makes it slower and delays
   `atSetpoint`.
4. **`ArmSubsystem` is byte-for-byte identical across all three runs.** This is the headline —
   say it under the sandbox in those words.

CHALLENGES:

1. **MCQ · does it belong?** — "Which of these should go in `Constants.java`?"
   - a) `for (int i = 0; i < 4; i++)` — "A loop bound with an obvious meaning. Leave it."
   - b) ✓ **`new SparkMax(3, …)` — the arm's CAN ID** — "Yes. It's a device address, referenced
     in more than one place eventually, and you *will* change it when a controller is swapped."
   - c) `pivot.set(0)` to stop — "Zero meaning 'stop' is universally readable."
   - d) `Math.abs(error)` — "That's a computation, not a value."

2. **Fill-in-the-blank · the pattern** — `data-kind="fib"`:
   ```
   public final class Constants {
       public static final class ArmConstants {
           public static final double <blank> = 9.0;
       }
   }
   // used as:
   moveToward(Constants.<blank>.kScoreRotations);
   ```
   answers: `data-answer="kScoreRotations"`, `data-answer="ArmConstants"`
   Win: "`k`-prefixed name, grouped in a nested class named for the mechanism. That's the whole
   convention."
   Lose: "The `k` prefix marks it as a configured constant, and nested classes let you type
   `Constants.ArmConstants.` and see everything the arm has."

3. **Predict / short answer** — "PenguinBot's controller moves from port 0 to port 1. Your code
   uses `Constants.OperatorConstants.kDriverControllerPort` everywhere. How many lines do you
   change?"
   `data-answer="1|one|1 line|one line"`
   Win: "One. That's the entire argument for this lesson."
   Lose: "One — the constant's definition. Without it you'd be searching for `0` across every
   file and trying to tell which zeros are ports."

4. **MCQ · the limit of the idea** — "You move `kIntakeCanId = 2` into `Constants.java`, but the
   physical SparkMax is still set to ID 5. What have you fixed?"
   - a) The motor now works — "Nothing about the device changed."
   - b) The compiler will catch the mismatch — "It never has and never will."
   - c) ✓ **Nothing yet — but the number is now in one place, so fixing it is a one-line change**
     — "Right. Constants make numbers easy to change, not automatically correct."
   - d) The CAN ID is now assigned automatically — "IDs are set in the vendor client, always."

5. **MCQ · static** — "Why can you write `Constants.ArmConstants.kP` without creating an object?"
   - a) Because it's `final` — "`final` means it can't be reassigned; that's a different thing."
   - b) ✓ **Because it's `static` — it belongs to the class, not to an instance** — "Exactly, the
     same reason `Math.PI` needs no `new Math()`."
   - c) Because it's in `Constants.java` — "The filename grants nothing."
   - d) Because it's a `double` — "Type has nothing to do with it."

MISCONCEPTIONS:
- *"Constants are just tidiness."*
  → "They're the difference between a one-line change and a search-and-replace across four files
  while a match is being called."
- *"Every number should be a constant."*
  → "A number used once with an obvious meaning is clearer inline. The test is whether you'd ever
  change it standing next to the robot."
- *"A constant makes the value correct."*
  → "It makes it easy to change. `kScoreRotations = 9.0` is still wrong if the arm scores at 11."
- *"I need an instance of `Constants`."*
  → "It's all `static`. That's why the class has no public constructor — instantiating it would
  be meaningless."
- *"Putting the CAN ID in `Constants` means I don't need the REV client."*
  → "Your code still only *requests* an ID. The device is still told its ID in the client."

EXERCISE: **PenguinBot's numbers move into one file.**
*Where we are:* `IntakeSubsystem` and `ArmSubsystem` are real subsystems (`frc-subsystems`) with
CAN IDs, gains, setpoints, tolerances and limits scattered through them.

Task:
1. Write `Constants.java` with nested classes for `OperatorConstants`, `IntakeConstants`,
   `ArmConstants` and `RobotConstants`.
2. Refactor **both** subsystems and `ArmToScoreCommand` to reference it. When you're done,
   neither subsystem should contain a bare number except an obvious `0`.
3. Verify: search your subsystem files for the digits `2`, `3`, `9` and `0.8`. Nothing should
   turn up except constant *references*.
4. Write the one-line change you'd make if the arm's gearbox were swapped and the scoring
   position became 14.0 rotations.
Bonus: add a `DriveConstants` block with placeholder CAN IDs 10–17 for the swerve motors you'll
add in Unit 9 — and note that `DriveConstants.kP` and `ArmConstants.kP` coexist happily.

**Full reference solution** (`details.reveal`):
```java
// Constants.java
public final class Constants {

    private Constants() { }        // never instantiated -- it's all static

    public static final class OperatorConstants {
        public static final int kDriverControllerPort = 0;
    }

    public static final class IntakeConstants {
        public static final int    kRollerCanId  = 2;
        public static final double kIntakeSpeed  = 0.7;
        public static final double kOuttakeSpeed = -0.5;
    }

    public static final class ArmConstants {
        public static final int    kPivotCanId    = 3;
        public static final int    kFollowerCanId = 4;

        public static final double kP = 0.2;       // tuned in frc-pid-tuning
        public static final double kI = 0.0;
        public static final double kD = 0.0;

        public static final double kStowedRotations = 0.0;
        public static final double kScoreRotations  = 9.0;
        public static final double kToleranceRot    = 0.25;
        public static final double kHomingSpeed     = -0.15;
        public static final double kSafetyLimitRot  = 12.0;
        public static final int    kTimeoutTicks    = 100;
    }

    // Bonus -- placeholders for Unit 9
    public static final class DriveConstants {
        public static final int kFrontLeftDriveCanId  = 10;
        public static final int kFrontRightDriveCanId = 11;
        public static final int kBackLeftDriveCanId   = 12;
        public static final int kBackRightDriveCanId  = 13;
        public static final int kFrontLeftSteerCanId  = 14;
        public static final int kFrontRightSteerCanId = 15;
        public static final int kBackLeftSteerCanId   = 16;
        public static final int kBackRightSteerCanId  = 17;

        public static final double kP = 0.0;   // not tuned yet -- and it is NOT the arm's kP
    }

    public static final class RobotConstants {
        public static final double kMaxOutput = 0.8;   // the team's 80% rule, robot-wide
    }
}
```
```java
// subsystems/ArmSubsystem.java -- the top of the class, after refactoring
import static frc.robot.Constants.ArmConstants;
import static frc.robot.Constants.RobotConstants;

public class ArmSubsystem extends SubsystemBase {

    private final SparkMax pivot =
        new SparkMax(ArmConstants.kPivotCanId, MotorType.kBrushless);
    private final SparkMax follower =
        new SparkMax(ArmConstants.kFollowerCanId, MotorType.kBrushless);

    private final PIDController pid =
        new PIDController(ArmConstants.kP, ArmConstants.kI, ArmConstants.kD);

    public ArmSubsystem() {
        pid.setTolerance(ArmConstants.kToleranceRot);
    }

    public void setSpeed(double speed) {
        double max = RobotConstants.kMaxOutput;
        double safe = Math.max(-max, Math.min(max, speed));
        pivot.set(safe);
        follower.set(safe);
    }

    public void goToScore()  { moveToward(ArmConstants.kScoreRotations);  }
    public void goToStowed() { moveToward(ArmConstants.kStowedRotations); }
    // ... rest unchanged
}
```
> **The gearbox change:** one line —
> `public static final double kScoreRotations = 14.0;`
> Nothing in `ArmSubsystem`, `ArmToScoreCommand`, or `RobotContainer` is touched.

Solution notes for the author:
- The `private Constants() { }` is a small professional touch worth one sentence: the class is
  never meant to be instantiated, so say so in code.
- `DriveConstants.kP` next to `ArmConstants.kP` is the clearest possible justification for
  nesting. Two mechanisms, two gains, same correct name, no collision.
- `kMaxOutput` lives in `RobotConstants` because the 80 % rule is a *team* rule, not the arm's
  rule. Where a constant lives is a design decision, and it's worth making that explicit.

Tease: "Unit 7 is done: PenguinBot has subsystems that own hardware, commands with real end
conditions, and every number in one file. It still can't be driven — nothing is connected to a
controller. Unit 8 wires it up."

CHECKPOINT: (4 questions, every option explained)

**Q1.** What's the main argument for `Constants.java`?
- a) It makes code shorter — "It makes it slightly longer."
- b) ✓ **A value used in several places can be changed in exactly one** — "Yes — the source's own
  reason, and it's the one that saves you at a competition."
- c) It makes the code faster — "No runtime difference at all."
- d) WPILib requires it — "It's a convention the template encourages, not a requirement."

**Q2.** What does the `k` in `kScoreRotations` mean?
- a) Kilo — "Nothing to do with units."
- b) Constant of proportionality — "That's `kP`'s `k`, in a different context."
- c) ✓ **A naming convention marking it as a configured constant** — "Right — so you can tell at
  a glance it isn't a local variable."
- d) It's required by the compiler — "The compiler doesn't care about names."

**Q3.** Why nested classes instead of one flat list?
- a) It's faster — "No performance difference."
- b) ✓ **It groups values by mechanism and lets the same name exist for two mechanisms** —
  "Exactly — `ArmConstants.kP` and `DriveConstants.kP` are two different, correctly-named
  things."
- c) Java requires nesting for `static final` — "It doesn't."
- d) It hides the values — "They're all public; grouping isn't hiding."

**Q4.** Which of these still isn't fixed by using constants?
- a) Changing the controller port in one place — "That's exactly what it fixes."
- b) ✓ **The CAN ID in your code not matching the ID set on the device** — "Right. Constants make
  the number easy to change; only the vendor client makes it true."
- c) Finding the arm's tuned gain — "It's now one obvious place."
- d) Knowing which `0.7` is the intake speed — "It's now `kIntakeSpeed`."

SEASON-FLAGS:
- `[NEEDS RESEARCH: confirm the 2026 Command Robot template still generates `Constants.java`
  with an `OperatorConstants` nested class and `kDriverControllerPort` —
  content/research/toolchain-2026.md]`
- The `k` prefix and nested-class pattern are stable WPILib conventions; a light season note is
  enough.

SIM-REQUEST: none beyond §3 — this sandbox reuses `SparkMax`, `PIDController` and
`SubsystemBase`, all already exercised.
