# frc-pid-concept · What P, I and D Do
unit: 6 · Closed-Loop Control   |   duration: 25 min   |   difficulty: Intermediate
interactivity: SANDBOX (PenguinSim)

> Read `_shared-conventions.md` first (§3 sim contract; paste **real** output).
> The source frames PID as *"a powerful ally and a dangerous foe."* Students **do not need
> calculus** — they need to know what each term does and how to tune safely. Any derivation,
> transfer function, or integral notation on this page is a defect.

INTRODUCES:
- `closed-loop-control` — using a measurement to decide the next output
- `open-vs-closed-loop` — the distinction, demonstrated rather than asserted
- `error` — `setpoint − current`
- `setpoint` — where you want the mechanism to be
- `proportional-term` — output proportional to error
- `integral-term` — accumulates over time to beat friction and gravity
- `derivative-term` — damps the approach using the rate of change
- `steady-state-error` — the small gap P alone can't close
- `oscillation` — what too much gain looks like

ASSUMES:
- `encoder`, `encoder-position`, `get-encoder` (`frc-encoders`)
- `homing`, `relative-encoder` (`frc-relative-absolute`)
- `percent-output`, `motor-set`, `eighty-percent-rule` (`frc-moving-a-motor`)
- Java: `double`, loops, `Math.abs`, `Math.min`/`Math.max`.

GOAL:
Explain what P, I and D each contribute, and show why open-loop control can't hold a position.

HOOK: **"A powerful ally and a dangerous foe."** (The source's own framing — quote it.)
`callout--why`.
Every mechanism you've written so far *pushes*. `set(0.7)` and hope. That's **open loop**: the
output has no idea what's happening.

Try to raise PenguinBot's arm to the scoring position with it. Full power sails past and slams
into the top. Gentle power might not lift the arm at all — and if it does, it keeps going and
still slams into the top, just later. There is no value of `set()` that means "arrive at 9.0
rotations and stop."

Closed-loop control fixes that by doing something almost embarrassingly simple: **look at how
far away you are, and push proportionally to that.** Far away, push hard. Close, push gently.
At the target, stop pushing.

And the foe half, which the tuning lesson collects: *every season this team has broken something
from bad PID* — bent parts, a mechanism falling off the robot. The same feedback that makes an
arm arrive gently makes it hammer itself apart when the numbers are wrong.

EXPLAIN:

1. **Error is the whole idea.**
   `error = setpoint − current`. The setpoint is where you want to be; current comes from the
   encoder you learned to read last unit. The controller's only job is **driving error toward
   zero**.
   Mark: [FROM PDF page 10, §6.1 — note the PDF writes `e(t) = |target − current|`; teach the
   **signed** version, because the sign is what tells the motor which way to move. Say so
   explicitly: the absolute-value form in the source describes the *size* of the error, but a
   controller needs the direction too.]
   Analogy: steering toward a parking space. You don't decide "turn the wheel 30°"; you look at
   how far off you are and correct by that much, continuously.

2. **P — proportional.** `output = kP × error`.
   Plain-language job, from the source: *as you get closer, push less. Often enough on its own.*
   Analogy: braking for a red light by how far away it is. A block out, ease off. A metre out,
   barely touching.
   Watch out for: **too small near the end to overcome friction.** The arm creeps to within a
   hair of the setpoint and stops there, because a tiny error times a small `kP` is less push
   than the mechanism's own stiction. That gap is **steady-state error**, and the sandbox shows
   it.
   Mark: [FROM PDF page 10, §6.1 table]

3. **I — integral.**
   Job: *slowly builds added power over time to overcome friction or gravity when P is too
   weak.*
   Analogy: leaning harder and harder on a stuck door. Each moment you're still not through, you
   add a bit more.
   Watch out for: **overshoot, then oscillation, if tuned too high** — the accumulated push
   doesn't vanish the instant you arrive, so it carries you past.
   Mark: [FROM PDF page 10, §6.1 table]

4. **D — derivative.**
   Job: *uses the rate of change × K to damp the approach so you don't fly past.*
   Analogy: a door closer. It isn't fighting the door's position, it's fighting the door's
   *speed* — the faster the door swings, the harder it resists.
   Watch out for: **tighter but faster oscillation, and it can leave a small offset.**
   Mark: [FROM PDF page 10, §6.1 table]

5. **The one-line summary, and it's worth a callout:**
   > **P** looks at where you are. **D** looks at how fast you're getting there.
   > **I** looks at how long you've been failing to arrive.

6. **You will usually only need P.** Say this plainly. The source says P is "often enough on its
   own," the recipe starts with P alone, and the value the source shows is
   `new PIDController(0.05, 0.0, 0.0)` — I and D both zero. Students arrive expecting all three
   terms to be mandatory. They aren't. Starting with P alone is the professional default, not a
   simplification for beginners.

7. **What this lesson deliberately does not cover.** One honest paragraph:
   - **Motion profiling** — an alternative the team skipped because the syntax changed between
     seasons. Named, not taught. (`frc-pid-syntax` carries the season flag.)
   - **Feedforward** — flagged in the intro notes as a future topic. Named, not taught.
   - Any maths beyond multiplication.

CODE:

**Sample 1 — the whole idea in four lines**, no library at all. This runs in the student's head:
```java
// Closed loop, by hand. This is all a P controller is.
double error  = 9.0 - arm.getPosition();   // how far away am I?
double output = 0.05 * error;              // push proportionally to that
output = Math.max(-0.8, Math.min(0.8, output));   // the team's 80% rule
arm.setSpeed(output);
```
Mark: [derived from PDF page 10 §6.3 verified box — same arithmetic, spelled out]
Annotate every line. Line 2: the encoder from Unit 5 finally earns its keep. Line 3: `0.05` is
`kP`, and it's the only number you'll tune for a while. Line 4: **the controller does not know
about the 80 % rule** — it will happily ask for 1.8, and clamping is your job.

That clamp is not decoration. It appears in every PID sample in Units 6–11, and Unit 6's tuning
lesson shows what happens without it.

**Sample 2 — the same thing with WPILib's class**, shown only so the student recognises it next
lesson. Do **not** explain it here:
```java
// [FROM PDF page 10, §6.3 verified box] -- frc-pid-syntax teaches this properly
import edu.wpi.first.math.controller.PIDController;

PIDController pid = new PIDController(0.05, 0.0, 0.0);   // kP, kI, kD
double output = pid.calculate(arm.getPosition(), 9.0);   // (current, setpoint)
```

SANDBOX:

Banner: **"Simulated for teaching. The real classes come from WPILib and REVLib."**

**Exact starter code** — open loop and P control racing side by side. This comparison is the
lesson:
```java
public class Main {
    public static void main(String[] args) {
        final double TARGET = 9.0;      // PenguinBot's arm scoring setpoint, in rotations

        SparkMax openLoop = new SparkMax(3, MotorType.kBrushless);
        SparkMax pControl = new SparkMax(4, MotorType.kBrushless);

        double kP = 0.05;               // <-- CHANGE ME (try 0.01, 0.05, 0.20)

        openLoop.set(0.5);              // just push. no feedback. ever.

        System.out.println("tick   open-loop   P-control   (target 9.00)");
        for (int tick = 1; tick <= 30; tick++) {

            // closed loop: measure, decide, push
            double error  = TARGET - pControl.getEncoder().getPosition();
            double output = kP * error;
            output = Math.max(-0.8, Math.min(0.8, output));   // the 80% rule
            pControl.set(output);

            if (tick % 5 == 0) {
                System.out.printf("%4d   %9.2f   %9.2f%n",
                                  tick,
                                  openLoop.getEncoder().getPosition(),
                                  pControl.getEncoder().getPosition());
            }
        }
    }
}
```
*Note for the sim engineer / author:* add `CommandScheduler.getInstance().run()` at the top of
the loop body if the model requires it, with the same one-line explanation used in Unit 5.

**What the student changes:** `kP`. Suggested sequence in the lesson text: run as-is, then
`0.01`, then `0.20`. Do **not** send them further than that here — the full ladder is
`frc-pid-tuning`'s job, and stepping on it flattens the next lesson.

**Expected printed output** at `kP = 0.05` (computed from the §3 contract: `position += output
* 2.0` per tick; open loop at `0.5` gains `1.00`/tick; P control follows
`pos_n = 9 × (1 − 0.9ⁿ)`). **Author must re-run and paste real output.**
```
tick   open-loop   P-control   (target 9.00)
   5        5.00        3.69
  10       10.00        5.86
  15       15.00        7.15
  20       20.00        7.90
  25       25.00        8.35
  30       30.00        8.62
```

**Output shape assertions** (must hold even if the numbers differ):
1. The open-loop column is a **straight line** — equal gain every tick, no awareness of the
   target. It passes 9.00 somewhere around tick 9 and **keeps going**.
2. The P-control column **decelerates**: big early gains, smaller and smaller ones.
3. P-control gets close to 9.00 and **never quite arrives** in 30 ticks — the steady-state gap.
4. Lower `kP` → slower approach, same shape. Higher `kP` → faster approach.
5. Nothing overshoots at `kP = 0.05` or below.

Teaching text under the sandbox must make three points:
- Point at the open-loop column passing 9.00 and say: *on a real robot this column is the arm
  hitting the top of its travel.*
- Point at the P column's deceleration: *nobody wrote "slow down near the end." It falls out of
  multiplying by the error.*
- Point at assertion 3: *this is steady-state error, and it's what I is for. In the sim there's
  no friction, so it closes eventually. On a real arm with gravity, it just stops short.*

CHALLENGES:

1. **Predict the output** — `data-kind="text"`. "In the sandbox at `kP = 0.05`, the P column
   reads 3.69 at tick 5. Will it ever read higher than 9.00?"
   `data-answer="no|nope|never|no it wont|no it won't"`
   Win: "No. As it gets closer the error shrinks, so the push shrinks. At `kP = 0.05` it
   approaches 9.00 and stops there — it can't overshoot without a much bigger gain."
   Lose: "No — not at this gain. Every tick the error is smaller, so the output is smaller. It
   creeps in. Overshoot needs a `kP` big enough to jump *past* the target in one tick, which is
   the next lesson."

2. **MCQ · which term?** — "The arm gets to within a hair of the setpoint and then just sits
   there, slightly short, forever. Which term is designed to fix that?"
   - a) P, increase it — "That helps a bit, but a bigger `kP` also makes the whole approach more
     aggressive and risks overshoot."
   - b) ✓ **I** — "Right — the integral builds up over time precisely to push through friction
     or gravity when P has gone too small to."
   - c) D — "D damps motion. There's no motion here to damp."
   - d) None; it's a broken encoder — "The encoder is reporting correctly. The controller has
     just run out of push."

3. **MCQ · which term?** — "The arm charges at the setpoint and flies past it every time. Which
   term damps the approach?"
   - a) P — "P is what's causing the charge."
   - b) I — "I would add *more* push. Wrong direction."
   - c) ✓ **D** — "Yes — D reacts to how fast the error is changing and resists, like a door
     closer."
   - d) The clamp — "The clamp caps the maximum push; it doesn't ease the approach."

4. **Fill-in-the-blank · the four lines** — `data-kind="fib"`:
   ```
   double error  = 9.0 - arm.<blank>();
   double output = kP * <blank>;
   output = Math.max(-0.8, Math.min(0.8, output));
   arm.setSpeed(<blank>);
   ```
   answers: `data-answer="getPosition"`, `data-answer="error"`, `data-answer="output"`
   Win: "That's a complete P controller. Everything after this is choosing the number."
   Lose: "Measure where you are, multiply the error by `kP`, clamp it to the team's limit, and
   send it to the motor. Four lines."

5. **MCQ · open vs closed** — "What makes the second column 'closed loop'?"
   - a) It uses a `PIDController` object — "It doesn't — it's four lines of arithmetic. The class
     is convenience, not the concept."
   - b) It runs in a loop — "Both columns run in the same loop."
   - c) ✓ **Its output depends on a measurement of what actually happened** — "Exactly. The loop
     is *closed* by the sensor. That's the whole definition."
   - d) It has a setpoint — "Open loop can have a target too; it just can't tell whether it
     reached it."

MISCONCEPTIONS:
- *"PID is three things and I need all three."*
  → "Most FRC mechanisms run on P alone. The source's own example is `(0.05, 0.0, 0.0)`."
- *"PID needs calculus."*
  → "It needs multiplication. You need to know what each term *does*, and how to raise a number
  slowly."
- *"The PID output is a speed."*
  → "It's a percent output, exactly like Unit 4 — which is why it goes straight into
  `motor.set()` and why it still needs clamping to 0.8."
- *"The controller knows the motor's limits."*
  → "It has no idea. A `kP` of 0.2 at an error of 9 asks for 1.8. Clamping is your job, every
  time."
- *"Error is always positive."*
  → "The source writes it with absolute-value bars to describe its *size*, but a controller
  needs the sign — it's what tells the motor which direction to move."
- *"Once I set the gains, it works everywhere."*
  → "Gains are specific to one mechanism, its weight, its gearing, and its friction. The arm's
  numbers are not the drivetrain's numbers."

EXERCISE: **PenguinBot's arm reaches for the setpoint.**
*Where we are:* your `Arm` class can read position, and after `frc-relative-absolute` it can
home so that `0.0` means stowed. It still can't stop anywhere on purpose.

Task: add closed-loop control to `Arm` **by hand** — no `PIDController` class yet, that's two
lessons away. Write:
1. `private static final double SCORE_POSITION = 9.0;` and `private double kP = 0.05;`
2. `moveToward(double setpoint)` — one cycle of the loop: measure, compute, clamp, set.
   Call this **every 20 ms**, not once. Make sure the reference solution's comments say so.
3. `getError(double setpoint)` and `atSetpoint(double setpoint)` — within 0.25 rotations.
4. Refuse to run if `isHomed()` is false — a setpoint means nothing without a known zero.

**Full reference solution** (`details.reveal`):
```java
import com.revrobotics.spark.SparkMax;
import com.revrobotics.spark.SparkLowLevel.MotorType;

public class Arm {
    private final SparkMax pivot = new SparkMax(3, MotorType.kBrushless);

    public static final double SCORE_POSITION = 9.0;    // rotations
    public static final double STOWED_POSITION = 0.0;
    private static final double TOLERANCE = 0.25;       // rotations
    private static final double MAX_OUTPUT = 0.8;       // the team's 80% rule

    private double kP = 0.05;                           // tuned properly next lesson
    private boolean homed = false;

    public double getPosition() { return pivot.getEncoder().getPosition(); }
    public void   stop()        { pivot.set(0); }
    public boolean isHomed()    { return homed; }

    public void setSpeed(double speed) {
        pivot.set(Math.max(-MAX_OUTPUT, Math.min(MAX_OUTPUT, speed)));
    }

    public double getError(double setpoint) {
        return setpoint - getPosition();                // signed: sign = direction to move
    }

    public boolean atSetpoint(double setpoint) {
        return Math.abs(getError(setpoint)) < TOLERANCE;
    }

    // Call this EVERY 20 ms while you want the arm to hold a setpoint.
    // Calling it once does almost nothing -- closed loop means repeatedly.
    public void moveToward(double setpoint) {
        if (!homed) {
            stop();                                     // no known zero, no setpoint
            return;
        }
        double output = kP * getError(setpoint);
        setSpeed(output);                               // setSpeed already clamps to 0.8
    }
}
```
Solution notes for the author:
- **`moveToward` is one cycle, not a journey.** The most common misreading of closed-loop code
  is expecting a single call to move the arm. Say it in the comment *and* in the prose.
- `atSetpoint` exists now because in Unit 7 it becomes a command's `isFinished()` — verbatim.
  Point that out.
- `kP` is deliberately a field, not a constant: you're about to spend a whole lesson changing it.
- The `isHomed()` guard is the payoff of the previous lesson. A setpoint of 9.0 with an unknown
  zero is not a target, it's a hazard.

Tease: "`kP = 0.05` gets the arm to about 8.6 in half a second and then crawls. Too slow to
score with. Next lesson: how to find the number that actually works — and what happens when you
find the wrong one."

CHECKPOINT: (5 questions, every option explained)

**Q1.** What is "error" in a PID controller?
- a) A bug — "Nothing has gone wrong; it's a measurement."
- b) ✓ **Setpoint minus current position** — "Yes — how far you are from where you want to be,
  with a sign that says which way."
- c) The tolerance — "Tolerance is how close counts as arrived."
- d) The output — "The output is computed *from* the error."

**Q2.** What does the P term do?
- a) Pushes at a constant power until it arrives — "That's open loop, and it overshoots."
- b) ✓ **Pushes proportionally to how far away you are — hard when far, gently when close** —
  "Correct, and that deceleration is free; nobody codes it."
- c) Predicts the future — "That's closer to D's job."
- d) Accumulates over time — "That's I."

**Q3.** The arm stops just short of the setpoint every time and sits there. What's happening?
- a) The encoder is broken — "It's reading correctly; the push has just gone too small."
- b) ✓ **Steady-state error — the remaining error is too small for P alone to overcome friction**
  — "Right, and that's exactly what the I term exists for."
- c) `kP` is too large — "Too large causes overshoot, the opposite symptom."
- d) The setpoint is wrong — "The setpoint is fine; the controller just can't finish the journey."

**Q4.** Why does every PID sample in this course clamp the output to ±0.8?
- a) WPILib requires it — "WPILib is happy with anything in ±1.0."
- b) ✓ **The controller doesn't know the team's 80 % rule and will ask for far more than 1.0** —
  "Exactly — `kP = 0.2` at an error of 9 asks for 1.8. Clamping is your job."
- c) It makes the maths simpler — "It complicates it slightly; it's a safety measure."
- d) It prevents overshoot — "It caps speed, but a bad gain still overshoots."

**Q5.** What makes control "closed loop"?
- a) It runs in a loop — "Open-loop code runs in the same loop."
- b) It uses PID — "PID is one way to do it, not the definition."
- c) ✓ **The output is computed from a measurement of the actual result** — "Yes — the sensor
  closes the loop."
- d) It has a target value — "You can have a target and no way to know if you hit it."

SEASON-FLAGS:
- Minimal. P, I, D are control theory, not API — they don't change between seasons.
- The `PIDController` constructor preview carries `frc-pid-syntax`'s season flag; keep it brief
  and cross-link rather than repeating the callout.
- `[NEEDS RESEARCH: none for this page]` — it is deliberately API-light. If an author finds
  themselves needing a citation here, they have drifted into `frc-pid-syntax`'s territory.

SIM-REQUEST: none beyond the §3 contract. This sandbox uses only `SparkMax`, `MotorType`,
`getEncoder().getPosition()` and `set()` — all already exercised in Unit 5.
