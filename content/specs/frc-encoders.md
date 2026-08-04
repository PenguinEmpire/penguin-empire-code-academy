# frc-encoders · Reading Position & Velocity
unit: 5 · Sensing   |   duration: 25 min   |   difficulty: Intermediate
interactivity: SANDBOX (PenguinSim)

> Read `_shared-conventions.md` first — especially §3, the PenguinSim contract, and the
> obligation to re-run the starter code and paste **real** output. This is the first sandbox
> lesson in Phase 2; the honesty banner and the real WPILib import must appear beside the
> sim code.

INTRODUCES:
- `encoder` — a sensor reporting a motor's rotational position and velocity
- `get-encoder` — `motor.getEncoder()`
- `encoder-position` — `getPosition()`, in rotations
- `encoder-velocity` — `getVelocity()`, in RPM
- `built-in-encoder` — SparkMax and Kraken have one inside
- `external-encoder` — you can also clamp one onto a shaft
- `units-and-conversion` — what the number actually means, and the conversion-factor caveat

ASSUMES:
- `percent-output`, `motor-set`, `sparkmax-object`, `motortype-kbrushless`, `eighty-percent-rule`
  (`frc-moving-a-motor`)
- `chain-of-command`, `subsystem-role` (`frc-chain-of-command`)
- `can-id` (`frc-can-ids`); `dashboard`, `telemetry-over-time` (`frc-dashboards`)
- Java: `double`, method chaining, `for` loops, `printf`/string formatting (Phase 1).

GOAL:
Read a mechanism's position and velocity in code, and say what the numbers mean and what they
don't.

HOOK: **The flywheel and the arm — two questions a motor can't answer.** (Real mechanism; no
invented anecdote.) `callout--why`.
After Unit 4 you can spin a motor. Now try to write two very ordinary things:
- *"Shoot once the flywheel reaches 4000 RPM."*
- *"Raise the arm to the scoring position and stop there."*

Neither is possible. `motor.set(0.7)` is you *pushing*. It tells you nothing about what
happened. The motor could be spinning at 3000 RPM, or stalled against a game piece, or spinning
freely because the belt snapped — `set(0.7)` looks identical in all three cases.

Recall the trace shapes from `frc-dashboards`: the reason a graph of velocity over time is
useful is that something is *measuring* velocity. This lesson is that something. **An encoder
turns "I pushed" into "here's what happened."** Everything in Units 6, 10 and 11 depends on it.

EXPLAIN:

1. **What an encoder measures.** It reports the motor's **rotational position** — how far the
   shaft has turned — and its **velocity** — how fast it's turning right now.
   Analogy: an odometer and a speedometer on the same shaft. Position accumulates; velocity is
   instantaneous.
   Mark: [FROM PDF page 9, §5.1]

2. **You already have one.** SparkMaxes and Krakens have encoders **built in**. You don't wire
   anything, buy anything, or configure anything to start reading position — it's already
   there, behind a method call on the motor object you created in Unit 4. That is a genuinely
   delightful fact and worth landing as one.
   Beat: you can also clamp a **separate physical encoder** onto a shaft, which matters when the
   thing you want to measure isn't the motor (a jointed arm, an output shaft after a gearbox).
   Mention it; `frc-relative-absolute` picks it up.

3. **Two readings, two jobs.** Table — and this framing is the whole reason the lesson exists:

| Reading | Call | Units | What it's for |
|---|---|---|---|
| Position | `motor.getEncoder().getPosition()` | rotations | "Where is the arm?" → the **current position** a PID drives toward a setpoint |
| Velocity | `motor.getEncoder().getVelocity()` | RPM | "How fast is the flywheel?" → PID-tune to a target **RPM** |

   Mark: [FROM PDF page 9, §5.1 verified box]
   Beat, explicit forward link: *position feeds your PID's "current position"; velocity lets you
   PID-tune a flywheel to a target RPM.* That sentence is the source's own, and it is the bridge
   into Unit 6. Say it out loud in the lesson.

4. **Read the chained call.** `motor.getEncoder().getPosition()` is two calls, not one:
   `getEncoder()` hands you the encoder object; `getPosition()` asks it for a number. Same
   dot-chaining from Phase 1 — one clause, no re-teaching. Worth noting you can hold onto the
   encoder in a variable if you use it repeatedly; both forms are fine and the chained version
   is what the source shows.

5. **What the number actually means — be honest here.**
   `getPosition()` returns **rotations of the motor shaft** by default. Not degrees of arm
   travel. If the arm turns through a 100:1 gearbox, 100 motor rotations is one arm revolution.
   Two consequences:
   - **The raw number is only meaningful relative to itself.** "9.0" isn't an angle; it's "9
     motor rotations from wherever zero is." That's fine — a PID works in whatever units you
     give it, as long as you're consistent.
   - Teams often apply a **conversion factor** so the encoder reports degrees or metres
     directly.
   `[NEEDS RESEARCH: the current REVLib API for setting an encoder position/velocity conversion
   factor on a SparkMax (configuration-object based in recent REVLib?) —
   content/research/toolchain-2026.md. Do NOT put a conversion-factor code sample in the lesson
   until this is confirmed; describe it in prose inside a callout--season.]`
   Beat: throughout this course, PenguinBot's arm setpoints are **in raw rotations**
   (`ARM_SCORE = 9.0`). Say so, once, so nobody thinks 9.0 is degrees.

6. **Publish it.** Callback to `frc-dashboards`: a position you can't see is a position you
   can't debug. `System.out.println` gets you started; a named published value gets you a graph.
   Keep to one sentence — the sandbox does the demonstrating.

CODE:

**Sample 1 — the verified reading.** [FROM PDF page 9, §5.1 verified box]
```java
import com.revrobotics.spark.SparkMax;
import com.revrobotics.spark.SparkLowLevel.MotorType;

SparkMax armPivot = new SparkMax(3, MotorType.kBrushless);   // PenguinBot's arm, CAN ID 3

double pos = armPivot.getEncoder().getPosition();   // rotations
double vel = armPivot.getEncoder().getVelocity();   // RPM
```
Annotate lines: 4 — the arm joins the intake on the CAN map; 6 — `getEncoder()` returns the
built-in encoder, `getPosition()` reads it; 7 — velocity is RPM, and it's what a flywheel needs.

**Sample 2 — the pattern you'll actually write.** [FROM PDF page 9 + PDF page 11 §7.2 pattern]
```java
// A subsystem-shaped read (Unit 7 makes this a real Subsystem)
public double getArmPosition() {
    return armPivot.getEncoder().getPosition();
}
```
Annotate: the mechanism's *position* is what the subsystem exposes; nothing outside the
subsystem should be reaching for the motor object to get it.

SANDBOX:

Banner: **"Simulated for teaching. The real classes come from WPILib and REVLib."**
Show the real imports above the sim code, commented, exactly as the built lesson does.

**Exact starter code** (single file, class `Main`, PenguinSim shim beneath):
```java
// Real robot code would start with:
//   import com.revrobotics.spark.SparkMax;
//   import com.revrobotics.spark.SparkLowLevel.MotorType;
// PenguinSim provides stand-ins with the same names.

public class Main {
    public static void main(String[] args) {
        SparkMax armPivot = new SparkMax(3, MotorType.kBrushless);

        double speed = 0.3;          // <-- CHANGE ME
        armPivot.set(speed);

        for (int tick = 1; tick <= 25; tick++) {
            if (tick % 5 == 0) {
                double pos = armPivot.getEncoder().getPosition();
                double vel = armPivot.getEncoder().getVelocity();
                System.out.printf("tick %2d   position = %6.2f rot   velocity = %8.2f RPM%n",
                                  tick, pos, vel);
            }
        }
    }
}
```
*Note for the sim engineer / author:* this loop needs the motion model to advance once per
iteration. If PenguinSim advances only on `CommandScheduler.getInstance().run()`, add that call
as the first line of the loop body and show it — commands haven't been taught yet, so introduce
it as one line: "this is the 20 ms tick; Unit 7 explains it."

**What the student changes:** the value of `speed`. Suggested experiments, in the lesson text:
`0.3` → `0.6` → `-0.3` → `0.9`.

**Expected printed output** (computed from the §3 contract: `position += output * 2.0` per
tick; `velocity += (output * 6000 - velocity) * 0.1`). **Author must re-run and paste real
output.**
```
tick  5   position =   3.00 rot   velocity =   737.12 RPM
tick 10   position =   6.00 rot   velocity =  1172.38 RPM
tick 15   position =   9.00 rot   velocity =  1429.40 RPM
tick 20   position =  12.00 rot   velocity =  1581.16 RPM
tick 25   position =  15.00 rot   velocity =  1670.78 RPM
```

**Output shape assertions** (these must hold even if the numbers differ):
1. Position climbs by a **constant amount** each tick — it accumulates.
2. Velocity climbs **fast at first, then flattens** — it approaches a ceiling set by the output
   and never quite reaches it.
3. Doubling `speed` doubles the position increment and roughly doubles the velocity ceiling.
4. A **negative** speed makes position go negative — position is signed, not a distance.
5. `speed = 0.9` prints the PenguinSim over-80 % warning **before** any data lines.

Teaching text under the sandbox must draw out #2 explicitly: *velocity flattens because the
mechanism takes time to get up to speed. That lag is exactly why the flywheel needs a command
with an end — and why you can't just check the velocity on the first tick.*

CHALLENGES:

1. **Predict the output** — `data-kind="text"`. "In the sandbox, set `speed = 0.6` and predict
   the position at tick 25 before you run it. (Hint: look at how much position gained per tick
   at 0.3.)"
   `data-answer="30|30.00|30 rot|30.0"`
   Win: "30.00. Position is an accumulator — double the push, double the gain per tick."
   Lose: "At 0.3 the arm gained 3.00 rotations every 5 ticks, so 0.6 gains 6.00 every 5 ticks —
   30.00 by tick 25. Run it and check."

2. **Fill-in-the-blank** — `data-kind="fib"`:
   ```
   double pos = armPivot.<blank>().<blank>();   // rotations
   double vel = armPivot.<blank>().<blank>();   // RPM
   ```
   answers: `getEncoder`, `getPosition`, `getEncoder`, `getVelocity`
   Win: "That's the verified syntax — one call to reach the encoder, one to read it."
   Lose: "`getEncoder()` hands you the built-in encoder; then `getPosition()` or `getVelocity()`
   asks it for a number."

3. **MCQ · which reading?** — "You want to shoot only once the flywheel is up to speed. Which
   reading do you check?"
   - a) `getPosition()` — "That tells you how far it's turned in total, which for a flywheel is
     a meaningless ever-growing number."
   - b) ✓ **`getVelocity()`** — "Right — RPM is the flywheel's readiness. Position would just
     keep counting."
   - c) `motor.get()` — "That returns what you *commanded*, not what's happening."
   - d) Neither; time it with a stopwatch — "That's what teams do before they have encoders, and
     it fails the moment the battery sags."

4. **MCQ · what the number means** — "`getPosition()` on the arm returns `9.0`. What is that?"
   - a) 9 degrees of arm travel — "Not unless someone set a conversion factor. By default it's
     motor rotations."
   - b) 9 cm — "Encoders count rotation, not distance, unless you convert."
   - c) ✓ **9 rotations of the motor shaft, measured from wherever zero currently is** — "Yes,
     both halves matter: motor rotations, and relative to a zero you need to know about."
   - d) 9 % of full travel — "Nothing in the reading knows the mechanism's range."

5. **Predict / short answer** — "You call `getVelocity()` on the very first tick after
   `set(0.8)`. Is it 4800 RPM?"
   `data-answer="no|nope|no its lower|lower|not yet|no it's lower"`
   Win: "No — it's barely started. Velocity ramps up over many ticks, which is exactly why the
   flywheel needs a command that waits."
   Lose: "No. The mechanism takes time to reach speed; on the first tick the velocity is near
   zero. Watch the sandbox's velocity column climb."

MISCONCEPTIONS:
- *"`motor.get()` tells me how fast the motor is going."*
  → "`get()` returns what you *asked for*. Only the encoder tells you what actually happened —
  and that difference is the entire point of a sensor."
- *"Position is in degrees."*
  → "Motor rotations, by default, and through whatever gearbox sits between the motor and the
  mechanism. Teams apply a conversion factor when they want real-world units."
- *"I need to buy an encoder."*
  → "Your SparkMax and Kraken already have one. It's a method call away."
- *"Velocity should hit its target immediately."*
  → "It ramps. A real mechanism has mass, and the sandbox shows the ramp — this is why 'wait
  until up to speed' has to be a behaviour with an end."
- *"Position 0 means the arm is down."*
  → "Position 0 means 'wherever the encoder last got zeroed.' The next lesson is entirely about
  that."

EXERCISE: **PenguinBot gains an arm that knows where it is.**
*Where we are:* PenguinBot has an `Intake` class from `frc-moving-a-motor` — `intake()`,
`stop()`, `outtake()` — and no idea what any mechanism is doing.

Task: write an `Arm` class (a plain class for now; it becomes a real Subsystem in Unit 7) with:
1. A `SparkMax` on **CAN ID 3**, brushless.
2. `setSpeed(double speed)` — move the arm.
3. `stop()`.
4. `getPosition()` — the arm's position in rotations.
5. `getVelocity()` — the arm's velocity in RPM.
6. `printStatus()` — one formatted line with both readings.
Bonus: make `setSpeed` refuse anything above 0.8 in magnitude, so the arm can never be
commanded past the team's limit.

**Full reference solution** (`details.reveal`):
```java
import com.revrobotics.spark.SparkMax;
import com.revrobotics.spark.SparkLowLevel.MotorType;

public class Arm {
    // CAN ID 3 — PenguinBot's arm pivot (see the CAN map from Unit 2)
    private final SparkMax pivot = new SparkMax(3, MotorType.kBrushless);

    public void setSpeed(double speed) {
        // Bonus: never exceed the team's 80% rule, whatever the caller asks for
        double safe = Math.max(-0.8, Math.min(0.8, speed));
        pivot.set(safe);
    }

    public void stop() {
        pivot.set(0);
    }

    public double getPosition() {
        return pivot.getEncoder().getPosition();   // rotations
    }

    public double getVelocity() {
        return pivot.getEncoder().getVelocity();   // RPM
    }

    public void printStatus() {
        System.out.printf("arm: %6.2f rot   %8.2f RPM%n", getPosition(), getVelocity());
    }
}
```
Solution notes for the author to include:
- The motor is `private final` — nothing outside `Arm` can reach it. That's the ownership rule
  from `frc-chain-of-command`, enforced by Java's own access modifiers.
- The clamp in `setSpeed` is the 80 % rule made structural instead of remembered. You'll use
  this exact clamp again in Unit 6, where a PID controller will cheerfully ask for 1.8.
- `getPosition()` returning raw rotations is deliberate — PenguinBot's setpoints are in
  rotations all the way through this course.

Tease: "The arm can tell you it's at 9.00 rotations. But 9.00 rotations from *where*? Restart
the robot and find out — that's the next lesson."

CHECKPOINT: (5 questions, every option explained)

**Q1.** What does `motor.getEncoder().getVelocity()` return?
- a) Percent output — "That's what you commanded, via `get()`."
- b) ✓ **The motor's speed in RPM** — "Yes — and it's what you'd PID-tune a flywheel against."
- c) Rotations turned so far — "That's `getPosition()`."
- d) Voltage — "Not from the encoder."

**Q2.** Where does the encoder on PenguinBot's arm come from?
- a) A separate sensor the team wired up — "You *can* add one, but you don't have to."
- b) ✓ **It's built into the SparkMax** — "Right — a method call on the motor object you already
  created."
- c) The RoboRIO — "The RIO reads it over CAN; it doesn't contain it."
- d) The Driver Station — "The DS displays; it doesn't sense."

**Q3.** Why does the sandbox's velocity column climb gradually instead of jumping straight to
its ceiling?
- a) The encoder is slow — "The encoder reports faithfully; the *mechanism* is what takes time."
- b) ✓ **A real mechanism takes time to reach speed, and the sim models that lag** — "Correct,
  and it's why 'is the flywheel ready?' has to be checked repeatedly."
- c) The CAN bus is congested — "Bus traffic isn't what you're seeing."
- d) The print statement is delayed — "Printing doesn't change the values."

**Q4.** Position reads `9.0` on the arm. Which statement is safe?
- a) The arm is 9 degrees from horizontal — "Only if a conversion factor and a known zero say
  so. Neither is true by default."
- b) ✓ **The motor shaft is 9 rotations from wherever the encoder was last zeroed** — "Yes —
  and 'wherever it was last zeroed' is the next lesson's whole subject."
- c) The arm has moved 9 cm — "Rotation, not distance."
- d) The arm is 90 % of the way up — "Nothing in the number knows the range of travel."

**Q5.** Why is this lesson a prerequisite for PID?
- a) PID needs a velocity — "It needs *a measurement*; position is the common one for an arm."
- b) ✓ **A closed-loop controller needs a measured current value to compare against its target**
  — "Exactly. No sensor, no closed loop — you'd just be pushing and hoping."
- c) PID sets the CAN ID — "Unrelated."
- d) It doesn't; PID works open-loop — "Then it wouldn't be closed-loop control at all."

SEASON-FLAGS:
- `callout--season` on units and conversion: whether `getPosition()` returns rotations by
  default, and the API for changing that, is REVLib-version dependent.
  `[NEEDS RESEARCH: REVLib encoder conversion-factor API for 2026 — content/research/toolchain-2026.md]`
- `[NEEDS RESEARCH: confirm `getEncoder()` still returns a `RelativeEncoder` in the current
  REVLib, and whether the type name has changed]`
- The Kraken's equivalent readings live in Phoenix and are **not** shown here — one sentence
  pointing at CTRE's docs, flagged.

SIM-REQUEST: none beyond the §3 contract. This lesson is the sim's first outing — if
`getEncoder()`, `getPosition()` and `getVelocity()` don't behave as contracted, everything from
here to Unit 11 is affected. Verify this lesson's sandbox first.
