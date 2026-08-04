# frc-pid-syntax · PIDController in Code
unit: 6 · Closed-Loop Control   |   duration: 25 min   |   difficulty: Intermediate
interactivity: SANDBOX (PenguinSim)

> Read `_shared-conventions.md` first (§3 sim contract; paste **real** output).

INTRODUCES:
- `pidcontroller-class` — `edu.wpi.first.math.controller.PIDController`
- `pid-calculate` — `calculate(measurement, setpoint)`
- `set-tolerance` — declaring what "close enough" means
- `at-setpoint` — asking the controller whether you've arrived
- `pid-reset` — clearing accumulated state before reusing a controller
- `motion-profiling-mention` — named as an alternative, deliberately not taught

ASSUMES:
- Everything from `frc-pid-concept` and `frc-pid-tuning`, including `kP = 0.2` as PenguinBot's
  tuned arm gain and the ±0.8 clamp habit
- `encoder-position` (`frc-encoders`), `homing` (`frc-relative-absolute`)
- Java: objects, constructors, imports, `final` fields.

GOAL:
Replace a hand-written P controller with WPILib's `PIDController` and use `atSetpoint()` to know
when the mechanism has arrived.

HOOK: **Motion profiling, skipped because the syntax changed**
(`_shared-conventions.md` §6 story 13). `callout--why`.
The source mentions motion profiling — a more sophisticated way to move a mechanism, planning a
smooth speed curve instead of reacting to error — and then says the team **skipped it, because
the syntax changed between seasons.** They didn't skip it because it was too hard or not worth
it. They skipped it because keeping up with a moving API cost more than it returned.

That's an unusually honest thing for a curriculum to admit, and it frames this whole lesson:
`PIDController` is worth learning because it is **small, stable, and used everywhere**. You will
type `new PIDController(kP, kI, kD)` for years. Motion profiling you can look up the year you
need it.

Secondary framing: you already wrote a working P controller by hand last lesson. This lesson
isn't teaching you control — it's teaching you **the class everyone else's code uses**, so you
can read your teammates' code and they can read yours.

EXPLAIN:

1. **What the class gives you that your four lines didn't.** Lead with this table, because
   "why bother" is the honest first question:

| Your hand-written version | `PIDController` |
|---|---|
| `kP * error` | all three terms, correctly time-scaled |
| you track the error yourself | it tracks previous error and the integral for you |
| you compare against a tolerance | `setTolerance()` + `atSetpoint()` |
| stale state if you reuse it | `reset()` |
| only you can read it | every FRC programmer recognises it instantly |

   Be honest in the prose: for a P-only controller, the hand-written version is genuinely fine.
   The class earns its place the moment you want I, D, tolerance, or a teammate.

2. **The verified syntax.** This is the source's green box; teach it line by line.
   Mark: [FROM PDF page 10, §6.3 verified box]
```java
import edu.wpi.first.math.controller.PIDController;

// PIDController takes three doubles: kP, kI, kD
PIDController pid = new PIDController(0.05, 0.0, 0.0);

double current = motor1.getEncoder().getPosition();
double output  = pid.calculate(current, 50.0);   // 2nd arg = setpoint
motor1.set(output);                              // feed the output straight into the motor
```
   Annotations, per line:
   - **Constructor**: three doubles in the order **kP, kI, kD**. Getting the order wrong compiles
     perfectly and behaves bizarrely — call that out.
   - **`calculate(current, setpoint)`**: measurement first, target second. The most common typo
     in FRC is swapping them, and it produces a controller that drives *away* from the target.
     Worth a `callout--pitfall`.
   - **The output goes straight into `set()`** — because it's a percent output, exactly like
     Unit 4. This is the moment Units 4, 5 and 6 join up: encoder in, percent output out.
   - The source notes the setpoint argument is optional and defaults to 0; there's also a
     `setSetpoint`-style form. Mention the two-argument form is what the team uses and stick to
     it. `[NEEDS RESEARCH: confirm the single-argument `calculate(measurement)` overload and
     `setSetpoint(double)` still exist in the current WPILib — content/research/toolchain-2026.md.
     Do not show them until confirmed.]`

3. **PenguinBot's version.** Immediately re-write the box with the team's real numbers so the
   student sees their own robot, and with the clamp that Unit 6 has drilled:
```java
import edu.wpi.first.math.controller.PIDController;

private final PIDController armPid = new PIDController(0.2, 0.0, 0.0);   // tuned last lesson

public void moveToward(double setpoint) {
    double output = armPid.calculate(getPosition(), setpoint);
    setSpeed(output);           // setSpeed clamps to +/- 0.8 -- the controller won't
}
```
   Say the quiet part: **`PIDController` has no idea about the 80 % rule.** With `kP = 0.2` and
   an error of 9.0 it returns **1.8**. Your clamp is still mandatory. Nothing about adopting the
   class removes that responsibility.

4. **Tolerance and `atSetpoint()`.**
   `setTolerance(0.25)` tells the controller what counts as arrived; `atSetpoint()` then answers
   "am I there?" based on the most recent `calculate()` call.
   Mark: `[NEEDS RESEARCH: confirm `setTolerance(double)` and `atSetpoint()` signatures and
   semantics in the current WPILib PIDController — content/research/toolchain-2026.md]`. They
   are not in the PDF's green boxes. Present them in the lesson **inside a `callout--season`**
   until confirmed; PenguinSim provides them per §3.
   Beat, and it's the big one: **`atSetpoint()` is going to be your `isFinished()`.** Next unit,
   this exact call becomes a command's end condition, unchanged. Foreshadow it explicitly.
   Beat, honest caveat: `atSetpoint()` reflects the last `calculate()`. Calling it without having
   called `calculate()` this cycle gives you a stale answer.

5. **`reset()` and why stale state bites.**
   A `PIDController` remembers things between calls — the accumulated integral and the previous
   error. If you scheduled an arm command, interrupted it halfway, and re-scheduled it a few
   seconds later, that leftover state is still in there and the first output can jump.
   The rule: **`reset()` the controller when a behaviour starts.** Which, next unit, means: in
   `initialize()`. Another piece of Unit 7 arriving early.
   Mark: `[NEEDS RESEARCH: confirm `reset()` exists with no arguments in the current WPILib
   PIDController]`

6. **Where the controller object lives.** One `PIDController` per mechanism, created once as a
   field — **not** a new one every cycle. A controller constructed inside a periodic method has
   no memory at all, which silently disables I and D and makes `atSetpoint()` meaningless.
   Common, invisible, worth a `callout--pitfall`.

7. **Motion profiling: named, not taught.** Two sentences. What it is (planning a smooth
   speed curve rather than reacting purely to error), why it isn't here (the team skipped it;
   the API moves), and where to look when you need it. Then stop.

CODE: covered by the two blocks in EXPLAIN beats 2 and 3, plus the sandbox. Do not add more —
this is a small class and padding it out obscures how small.

SANDBOX:

Banner: **"Simulated for teaching. The real classes come from WPILib and REVLib."**
Show the real import commented above the code, as in Unit 5.

**Exact starter code:**
```java
// Real robot code would start with:
//   import edu.wpi.first.math.controller.PIDController;
//   import com.revrobotics.spark.SparkMax;
//   import com.revrobotics.spark.SparkLowLevel.MotorType;

public class Main {
    public static void main(String[] args) {
        final double TARGET  = 9.0;    // PenguinBot's arm scoring setpoint
        final double MAX_OUT = 0.8;    // the team's 80% rule -- the controller does NOT know it

        SparkMax arm = new SparkMax(3, MotorType.kBrushless);

        PIDController pid = new PIDController(0.2, 0.0, 0.0);   // kP, kI, kD  <-- CHANGE ME
        pid.setTolerance(0.25);                                 // rotations

        for (int tick = 1; tick <= 30; tick++) {
            double position = arm.getEncoder().getPosition();
            double raw      = pid.calculate(position, TARGET);          // (measurement, setpoint)
            double output   = Math.max(-MAX_OUT, Math.min(MAX_OUT, raw));
            arm.set(output);

            if (tick % 5 == 0 || pid.atSetpoint()) {
                System.out.printf("tick %2d   pos %6.2f   raw %6.2f   out %5.2f   atSetpoint %b%n",
                                  tick, position, raw, output, pid.atSetpoint());
            }
            if (pid.atSetpoint()) {
                arm.set(0);
                System.out.println("arrived -- stopping");
                break;
            }
        }
    }
}
```
*Note for the sim engineer / author:* add `CommandScheduler.getInstance().run()` at the top of
the loop body if the model requires it.

**What the student changes:**
1. `kP` — confirm 0.2 behaves as tuned; try 0.05 and watch `atSetpoint` never turn true within
   30 ticks.
2. **Swap the arguments** to `calculate(TARGET, position)` and run it. This is the single most
   valuable experiment on the page — the arm drives the wrong way.
3. Remove the clamp and watch `raw` exceed 1.0 while `out` no longer protects the motor.

**Expected printed output** at `kP = 0.2`, tolerance 0.25 (computed from the §3 contract:
`position += output × 2.0`, output clamped to ±0.8; error sequence
9.00, 7.40, 5.80, 4.20, 2.60, 1.56, 0.936, 0.562, 0.337, 0.202 …).
**Author must re-run and paste real output.**
```
tick  5   pos   6.40   raw   0.52   out  0.52   atSetpoint false
tick 10   pos   8.80   raw   0.04   out  0.04   atSetpoint true
arrived -- stopping
```
Note for the author: the `raw` column at tick 1 is **1.80** — worth printing every tick once in
the lesson body to show the controller asking for 1.8 and the clamp cutting it to 0.8. That
single line justifies the clamp better than a paragraph.

**Output shape assertions** (must hold even if the numbers differ):
1. On the first tick, `raw` is **greater than 1.0** and `out` is exactly **0.80**.
2. `raw` shrinks monotonically as the arm approaches.
3. `atSetpoint` is `false` until the error is inside 0.25, then `true`, and the loop stops.
4. With the arguments swapped, the position goes **negative** and `atSetpoint` never becomes
   true — the arm runs away from the target.
5. With `kP = 0.05`, the loop runs all 30 ticks and `atSetpoint` never becomes true.

CHALLENGES:

1. **Fill-in-the-blank · the verified syntax** — `data-kind="fib"`:
   ```
   PIDController pid = new PIDController(<blank>, 0.0, 0.0);
   double output = pid.<blank>(arm.getPosition(), <blank>);
   ```
   answers: `data-answer="0.2|0.20"`, `data-answer="calculate"`, `data-answer="9.0|9|9.00"`
   Win: "Tuned gain, `calculate(measurement, setpoint)`, and PenguinBot's scoring setpoint.
   That's the whole API you need this season."
   Lose: "`kP` is the 0.2 you tuned last lesson. The method is `calculate`, and its arguments are
   **measurement first, setpoint second** — 9.0 rotations for the arm."

2. **Predict the output** — `data-kind="text"`. "You swap the arguments to
   `pid.calculate(TARGET, position)`. The arm starts at 0.0 and the target is 9.0. Which way does
   the arm move?"
   `data-answer="down|the wrong way|backwards|negative|wrong direction|away"`
   Win: "Down — away from the target, forever. The controller is now driving the *target* toward
   the *arm*, which it can't do, so the output never reverses."
   Lose: "The wrong way. `calculate` computes `setpoint − measurement`; swapping them flips the
   sign of every output. It compiles perfectly, which is what makes it nasty."

3. **MCQ · the clamp, again** — "With `kP = 0.2` and the arm at 0.0, what does `calculate` return
   on the first tick?"
   - a) 0.8 — "That's what your *clamp* produces. The controller returned something bigger."
   - b) 1.0 — "`PIDController` doesn't clamp to the motor's range at all."
   - c) ✓ **1.8** — "Yes: 0.2 × 9.0. The controller has no idea what a motor can accept, which is
     why you clamp."
   - d) 9.0 — "That's the error, before the gain is applied."

4. **MCQ · where does the controller live?** — "Where should the `PIDController` object be
   created?"
   - a) Inside the method that runs every 20 ms — "Then it's brand new every cycle, with no
     memory — I and D stop working and `atSetpoint()` is meaningless."
   - b) ✓ **As a field on the subsystem, created once** — "Correct — one controller per
     mechanism, constructed once."
   - c) In `RobotContainer` — "The subsystem owns the mechanism, so it owns its controller."
   - d) In `Constants.java` — "The *gains* can live there. The controller object is behaviour."

5. **MCQ · `reset()`** — "Why call `reset()` when an arm command starts?"
   - a) To zero the encoder — "That's `setPosition(0)`, a different thing entirely."
   - b) ✓ **To clear accumulated integral and previous-error state from a past run** — "Yes —
     stale state makes the first output of a re-run jump unexpectedly."
   - c) To set the setpoint — "The setpoint is an argument to `calculate`."
   - d) It's required by WPILib — "Nothing requires it; it's a correctness habit."

MISCONCEPTIONS:
- *"`PIDController` moves the motor."*
  → "It returns a number. You still call `set()` yourself — and you still clamp it."
- *"`calculate(setpoint, measurement)` — the target comes first, surely."*
  → "Measurement first, setpoint second. Swapping them compiles and drives the mechanism away
  from the target."
- *"Using the class means I don't need to tune."*
  → "The class does the arithmetic. The numbers are still yours, and they still describe *your*
  mechanism."
- *"The controller respects the motor's limits."*
  → "It returns whatever the maths says — 1.8, 12.0, whatever. Clamping is your job, every time."
- *"I'll make a new controller each cycle to keep it clean."*
  → "That throws away exactly the state that makes I, D and `atSetpoint()` work."
- *"`atSetpoint()` means the mechanism has stopped."*
  → "It means the last `calculate()` saw an error inside tolerance. A fast-moving arm can be
  inside tolerance while sailing straight through."

EXERCISE: **PenguinBot's arm goes closed-loop for real.**
*Where we are:* `Arm` has a hand-written P controller with a tuned `kP = 0.2`, a homing routine,
and an `atSetpoint` helper you wrote yourself.

Task: rewrite `Arm` to use `PIDController`.
1. One `PIDController` field, `(0.2, 0.0, 0.0)`, with `setTolerance(0.25)`.
2. `moveToward(double setpoint)` — `calculate`, clamp to ±0.8, `set`. One cycle.
3. `goToScore()` and `goToStowed()` — convenience wrappers over `moveToward`.
4. `atSetpoint()` — delegate to the controller instead of computing it by hand.
5. `startMove()` — call `reset()`, ready for Unit 7's `initialize()`.
6. Keep the `isHomed()` guard.
Bonus: add a follower motor on **CAN ID 4** that always mirrors the pivot, so the arm has two
motors — and notice that the controller doesn't change at all.

**Full reference solution** (`details.reveal`):
```java
import com.revrobotics.spark.SparkMax;
import com.revrobotics.spark.SparkLowLevel.MotorType;
import edu.wpi.first.math.controller.PIDController;

public class Arm {
    private final SparkMax pivot    = new SparkMax(3, MotorType.kBrushless);
    private final SparkMax follower = new SparkMax(4, MotorType.kBrushless);   // bonus

    public  static final double SCORE_POSITION  = 9.0;    // rotations
    public  static final double STOWED_POSITION = 0.0;
    private static final double TOLERANCE       = 0.25;
    private static final double MAX_OUTPUT      = 0.8;    // the team's 80% rule

    // One controller, created once. Tuned in frc-pid-tuning.
    private final PIDController pid = new PIDController(0.2, 0.0, 0.0);

    private boolean homed = false;

    public Arm() {
        pid.setTolerance(TOLERANCE);
    }

    public double getPosition() { return pivot.getEncoder().getPosition(); }
    public boolean isHomed()    { return homed; }
    public boolean atSetpoint() { return pid.atSetpoint(); }

    public void setSpeed(double speed) {
        double safe = Math.max(-MAX_OUTPUT, Math.min(MAX_OUTPUT, speed));
        pivot.set(safe);
        follower.set(safe);       // bonus: two motors, one command
    }

    public void stop() {
        pivot.set(0);
        follower.set(0);
    }

    // Call once when a move BEGINS -- clears stale integral / previous error.
    public void startMove() {
        pid.reset();
    }

    // Call EVERY 20 ms while the arm should be holding a setpoint.
    public void moveToward(double setpoint) {
        if (!homed) { stop(); return; }
        double output = pid.calculate(getPosition(), setpoint);   // measurement, setpoint
        setSpeed(output);                                          // setSpeed clamps to 0.8
    }

    public void goToScore()  { moveToward(SCORE_POSITION);  }
    public void goToStowed() { moveToward(STOWED_POSITION); }
}
```
Solution notes for the author:
- Compare against the hand-written version from `frc-pid-concept` side by side. Almost nothing
  changed. That's the point — the class is a small convenience, not a new idea, and understanding
  it deeply is why you wrote it by hand first.
- **`setSpeed` still clamps.** Adopting `PIDController` did not remove the 80 % rule.
- The bonus follower shows the ownership rule paying off: two motors, one subsystem method, and
  no caller anywhere needs to know the arm gained a motor.
- Look at what this class now has: `startMove()` (once, at the beginning), `moveToward()` (every
  cycle), `atSetpoint()` (are we done?). That is `initialize()`, `execute()`, `isFinished()` —
  you have written a Command by hand, twice now. Unit 7 finally gives it its name.

Tease: "Unit 6 is done — PenguinBot's arm arrives where you tell it. But *something* has to call
`moveToward()` every 20 ms, and *something* has to notice when it's finished so the next step can
begin. That's Unit 7."

CHECKPOINT: (5 questions, every option explained)

**Q1.** What order are `PIDController`'s constructor arguments?
- a) kD, kI, kP — "Reversed. It compiles and behaves strangely."
- b) ✓ **kP, kI, kD** — "Yes, and getting it wrong is silent — there's no error, just odd
  behaviour."
- c) setpoint, tolerance, gain — "Those aren't constructor arguments at all."
- d) It doesn't matter; they're named — "They're positional doubles. Order is everything."

**Q2.** What does `calculate(current, setpoint)` return?
- a) The new position — "It doesn't move anything or predict position."
- b) The error — "The error is an input to the calculation."
- c) ✓ **A percent output to feed into `motor.set()`** — "Correct — and it may well be outside
  ±1.0, so clamp it."
- d) Whether you've arrived — "That's `atSetpoint()`."

**Q3.** `kP = 0.2`, arm at 0.0, setpoint 9.0. What does the controller return on the first call?
- a) 0.8 — "That's after *your* clamp."
- b) 1.0 — "It doesn't clamp at all."
- c) ✓ **1.8** — "0.2 × 9.0. Which is exactly why the clamp is mandatory."
- d) 9.0 — "That's the error before the gain."

**Q4.** Why create the `PIDController` once as a field?
- a) Constructing objects is slow — "Object creation isn't the issue."
- b) ✓ **A controller created each cycle has no memory, so I, D and `atSetpoint()` stop working**
  — "Right, and nothing errors — it just quietly behaves like a P-only controller with an
  unreliable arrival check."
- c) WPILib forbids it — "It's legal and compiles fine."
- d) It has to live in `Constants.java` — "Gains can; the controller object is behaviour and
  belongs to the subsystem."

**Q5.** Why does the source say the team skipped motion profiling?
- a) It didn't work — "It works; teams use it."
- b) It was too advanced for students — "Not the stated reason."
- c) ✓ **The syntax changed between seasons and keeping up cost more than it returned** —
  "Exactly — and it's a real engineering trade-off, not a lack of ability."
- d) It requires extra hardware — "It's purely software."

SEASON-FLAGS:
- `callout--season` on `setTolerance()`, `atSetpoint()` and `reset()` until the WPILib factsheet
  confirms them. The three-argument constructor and `calculate(measurement, setpoint)` are in
  the PDF's green box and can be presented as verified.
- `[NEEDS RESEARCH: confirm PIDController.setTolerance(double), atSetpoint(), reset(), and
  whether a single-argument calculate(measurement) overload with setSetpoint() still exists —
  content/research/toolchain-2026.md]`
- Motion profiling is explicitly flagged as season-volatile; that is the source's own reason for
  omitting it, and the lesson should say so.
- `[NEEDS RESEARCH: whether REV's SparkMax closed-loop controller (on-board PID on the
  controller itself) should be mentioned as an alternative to WPILib's PIDController for 2026 —
  the team's source doesn't cover it. Prose mention only, if at all.]`

SIM-REQUEST: `PIDController.setTolerance(double)`, `.atSetpoint()`, `.reset()` (already in
`_shared-conventions.md` §3). *Fallback if not shipped:* the sandbox compares
`Math.abs(TARGET − position) < 0.25` inline and the lesson notes that WPILib provides
`atSetpoint()` for exactly this. The teaching survives; only the convenience is lost.
