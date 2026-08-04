# frc-relative-absolute · Relative vs. Absolute Encoders
unit: 5 · Sensing   |   duration: 20 min   |   difficulty: Intermediate
interactivity: SANDBOX (PenguinSim)

> Read `_shared-conventions.md` first (§3 sim contract, and the obligation to paste real output).

INTRODUCES:
- `relative-encoder` — resets to 0 on startup; counts from wherever it woke up
- `absolute-encoder` — remembers its real position through a power cycle
- `homing` — deliberately moving a mechanism to a known place and declaring it zero
- `set-position-zero` — `getEncoder().setPosition(0)`
- `startup-reference` — the question every position-controlled mechanism has to answer
- `free-spin-risk` — when an absolute reference goes wrong

ASSUMES:
- `encoder`, `get-encoder`, `encoder-position`, `encoder-velocity`, `built-in-encoder`,
  `external-encoder`, `units-and-conversion` (`frc-encoders`)
- `percent-output`, `eighty-percent-rule` (`frc-moving-a-motor`)
- Java: objects, constructors, `while` loops.

GOAL:
Choose the right encoder type for a mechanism, and write a homing routine that makes a relative
encoder's zero mean something.

HOOK: **9.00 rotations from where?** (Real mechanism; no invented anecdote.) `callout--why`.
Last lesson ended with the arm reporting `9.00 rot`. Here is the uncomfortable question: nine
rotations **from what**?

Turn the robot off. Turn it back on. The arm hasn't moved a millimetre — it's still physically
holding a game piece in the air. `getPosition()` now returns `0.00`.

Nothing broke. That is exactly what a **relative** encoder does: on startup it calls wherever it
happens to be "zero." The arm's position didn't change; the *reference* did. And if your code
then runs "go to 9.0" believing 0 is stowed, the arm drives another nine rotations past the top
of its travel and into the frame.

This is the failure mode behind the source's warning about a mechanism ending up somewhere it
shouldn't. It costs nothing to prevent and everything to discover at a competition.

EXPLAIN:

1. **Relative vs absolute, in one table.** Reproduce the source's table — it's already the
   clearest possible statement of this:

| | **Relative encoder** | **Absolute encoder** |
|---|---|---|
| On startup | Resets current position to **0** | **Remembers** the last real position (e.g. 50°) |
| Good when | There **is** a known/home start position | There is **no** physical stop to home against |
| Risk | Loses meaning if you can't home it | If a motor free-spins after a break, the reference is wrong |

   Mark: [FROM PDF page 9, §5.2 table]
   Analogy: a relative encoder is a **stopwatch** — it starts at zero whenever you turn it on
   and measures change. An absolute encoder is a **clock** — ask it at any moment and it tells
   you what time it is, even if it was unplugged.

2. **The SparkMax's built-in encoder is relative.** That's the one from last lesson. So the
   question "how does my arm know where it is on boot?" is a question you must answer, not one
   the hardware answers for you.

3. **Homing: how a relative encoder gets a meaningful zero.**
   The recipe, and it's short:
   1. Drive the mechanism **slowly** toward a known physical position — a hard stop, a limit
      switch, the bottom of its travel.
   2. When you're there, call `setPosition(0)`.
   3. From now on, `0.0` genuinely means *stowed*, and `9.0` genuinely means *scoring height*.
   Analogy: pushing a ruler flat against the edge of the table before you measure. The ruler
   isn't wrong; you have to give it a starting edge.
   Two safety notes worth a `callout--pitfall`:
   - **Slowly.** Homing drives a mechanism deliberately into a hard stop. Do it at a low output
     (0.1–0.2), not 0.8. This is the fried-motor rule in a new costume.
   - Home **once**, at a known moment (robot init, or on a driver's button), not repeatedly.

4. **When you can't home: use absolute.**
   Some mechanisms have no hard stop — a turret that spins freely, a swerve module's steering
   angle. There's nothing to push against, so there is no home position to find. That's what an
   absolute encoder is for: ask it at boot and it tells you the truth immediately.
   Beat: this is not hypothetical for PenguinBot. **Swerve steering modules use absolute
   encoders** precisely because a wheel can point any direction on boot and there's nothing to
   home against. Unit 9 collects this.

5. **The absolute encoder's own failure mode.** Straight from the source: *if a motor free-spins
   after a break, the reference is wrong.* An absolute encoder reads a physical angle. If the
   thing it's measuring has become mechanically disconnected from the thing you care about — a
   snapped belt, a stripped gear, a slipped coupler — it reports a confident, precise, wrong
   answer.
   Teaching point that generalises far beyond this lesson: **a sensor tells you about the sensor.
   Whether that's also true of the mechanism is an assumption.**

6. **Choosing, as a decision:**
```
Is there a physical stop or switch you can drive to safely?
   yes → relative + a homing routine   (PenguinBot's arm)
   no  → absolute                       (a turret; swerve steering)
```
   Cheap, common, needs homing — versus more parts, no homing, trusts the mechanical link.

CODE:

**Sample 1 — zeroing a relative encoder.**
```java
// Declare THIS position to be zero.
armPivot.getEncoder().setPosition(0);
```
Mark: `[NEEDS RESEARCH: confirm RelativeEncoder.setPosition(double) is current in the season's
REVLib — content/research/toolchain-2026.md]`. It is not in the PDF's green boxes, so it must be
confirmed before it appears as verified. Present it inside a `callout--season` until then, and
keep it in the sandbox (PenguinSim provides it per §3).

**Sample 2 — a homing routine, subsystem-shaped.**
```java
// Drive slowly down until the arm reaches its hard stop, then call zero.
public void startHoming() {
    setSpeed(-0.15);        // slow, and downward
}

public void finishHoming() {
    stop();
    pivot.getEncoder().setPosition(0);   // here == zero, from now on
}
```
Annotate: `-0.15` — deliberately far below the 80 % limit, because this drives into a hard stop;
`setPosition(0)` — the moment the number starts meaning something.
Mark: [derived from PDF page 9 §5.2 + the verified encoder API] — the *structure* is the team's
pattern, the `setPosition` call carries the research flag above.
`[NEEDS RESEARCH: how the team detects "at the hard stop" in real code — a limit switch
(DigitalInput), a current spike, or a velocity-near-zero check. Describe the options in prose;
do not show a limit-switch API sample until confirmed.]`

SANDBOX:

Banner: **"Simulated for teaching. The real classes come from WPILib and REVLib."**

**Exact starter code:**
```java
public class Main {
    public static void main(String[] args) {
        SparkMax armPivot = new SparkMax(3, MotorType.kBrushless);

        // 1) Raise the arm for 20 ticks.
        armPivot.set(0.4);
        for (int tick = 1; tick <= 20; tick++) { /* one 20 ms tick */ }
        armPivot.set(0);
        System.out.printf("before power cycle: position = %.2f rot%n",
                          armPivot.getEncoder().getPosition());

        // 2) Power cycle the robot. The arm does NOT move -- only the code restarts.
        SparkMax armAfterReboot = new SparkMax(3, MotorType.kBrushless);
        System.out.printf("after  power cycle: position = %.2f rot%n",
                          armAfterReboot.getEncoder().getPosition());

        // 3) Home it: drive slowly down to the hard stop, then declare zero.
        armAfterReboot.set(-0.15);
        for (int tick = 1; tick <= 30; tick++) { /* creeping down to the stop */ }
        armAfterReboot.set(0);
        armAfterReboot.getEncoder().setPosition(0);          // <-- the important line
        System.out.printf("after  homing:      position = %.2f rot%n",
                          armAfterReboot.getEncoder().getPosition());

        // 4) Now raise it again -- and this time the number means something.
        armAfterReboot.set(0.3);
        for (int tick = 1; tick <= 5; tick++) { }
        armAfterReboot.set(0);
        System.out.printf("raised 5 ticks:     position = %.2f rot%n",
                          armAfterReboot.getEncoder().getPosition());
    }
}
```
*Note for the sim engineer / author:* as in `frc-encoders`, if the model only advances on
`CommandScheduler.getInstance().run()`, put that call inside each loop body and keep the
one-line explanation.

**What the student changes:**
1. Comment out the `setPosition(0)` line and re-run — watch step 4 print a number measured from
   a meaningless zero.
2. Change the homing speed from `-0.15` to `-0.8` and read the PenguinSim warning; the lesson
   text then asks what that would do to a real hard stop.

**Expected printed output** (computed from the §3 contract; **author must re-run and paste
real output**):
```
before power cycle: position = 16.00 rot
after  power cycle: position = 0.00 rot
after  homing:      position = 0.00 rot
raised 5 ticks:     position = 3.00 rot
```

**Output shape assertions** (must hold even if numbers differ):
1. The position **before** the power cycle is non-zero.
2. The position **immediately after** the power cycle is `0.00` — and the lesson must say, in
   bold, *the arm did not move.*
3. After homing, position is `0.00` — the same number as line 2, now **meaning** something
   different. That the two lines look identical and differ entirely in meaning is the lesson.
4. The final raise is a small positive number measured from a **known** zero.

Teaching text under the sandbox must make point 3 explicit: *lines 2 and 3 print the same value.
The difference is that after homing, you know what zero is.*

CHALLENGES:

1. **Predict the output** — `data-kind="text"`. "The arm is physically at the top of its travel.
   You reboot the robot and immediately call `getPosition()` on the relative encoder. What does
   it return?"
   `data-answer="0|0.0|0.00|zero"`
   Win: "Zero. The arm is exactly where it was; the encoder just started counting again."
   Lose: "0. A relative encoder calls whatever position it wakes up in 'zero' — the mechanism's
   actual position has nothing to do with it."

2. **MCQ · pick the encoder** — "A turret spins continuously and has no hard stop in either
   direction. Which encoder does it need?"
   - a) Relative, homed at startup — "Homing needs somewhere to home *to*. There's no stop."
   - b) ✓ **Absolute** — "Correct — no physical reference means you need an encoder that already
     knows its angle."
   - c) Either; it makes no difference — "It makes all the difference on boot."
   - d) Neither; use a timer — "Timing gives you no position at all."

3. **MCQ · the absolute failure** — "An absolute encoder on an arm reads a steady 42° while the
   arm is visibly hanging at the bottom. What's the most likely explanation?"
   - a) The encoder needs re-zeroing — "Absolute encoders don't need zeroing; that's their point."
   - b) The battery is low — "That would affect motion, not a steady reading."
   - c) ✓ **The mechanical link between the encoder and the arm has failed — a snapped belt or
     slipped coupler** — "Yes. The sensor is reporting its own angle correctly; it's just no
     longer connected to what you care about."
   - d) The CAN ID is wrong — "A wrong ID gives you no reading at all, not a plausible one."

4. **Fill-in-the-blank · the homing routine** — `data-kind="fib"`:
   ```
   pivot.set(<blank>);                              // slow, downward, into the hard stop
   // ... wait until it reaches the stop ...
   pivot.set(0);
   pivot.getEncoder().<blank>(0);                   // declare THIS to be zero
   ```
   answers: `data-answer="-0.15|-0.1|-0.2|-0.15;"` and `data-answer="setPosition"`
   Win: "Slow, then zero. That's the whole routine."
   Lose: "Drive **slowly** (a small negative output) into the stop, then call `setPosition(0)` —
   homing at high power is how you break the stop you're homing against."

5. **Predict / short answer** — "You skip homing and your code drives the arm to setpoint 9.0
   after a reboot, while the arm is already at the top. What happens?"
   `data-answer="it keeps going|it drives past|it goes too far|breaks|it overshoots|drives into the frame|9 more rotations"`
   Win: "It drives nine more rotations past the top. The code isn't wrong; the zero is."
   Lose: "The arm goes another 9 rotations *beyond* where it already is, because after the
   reboot the encoder thinks the top of the travel is zero."

MISCONCEPTIONS:
- *"The encoder is broken — it says 0 and the arm is up."*
  → "It's working perfectly. A relative encoder reports change from startup, not absolute
  position. Nothing is broken; the reference just needs establishing."
- *"Absolute encoders are strictly better."*
  → "They cost more, they're extra hardware, and they can be confidently wrong if the mechanical
  link fails. Relative plus homing is the right answer whenever there's a stop to home against."
- *"I can just remember to put the arm down before turning the robot off."*
  → "You will forget once, at a competition, under time pressure. Home in code."
- *"Homing means driving to the stop at full power."*
  → "Home slowly. You are deliberately running a mechanism into a hard stop; 0.15 is plenty."
- *"`setPosition(0)` moves the arm to position 0."*
  → "It moves nothing. It renames the arm's current position to 0."

EXERCISE: **PenguinBot's arm learns where zero is.**
*Where we are:* your `Arm` class from `frc-encoders` can report position and velocity, and
those numbers currently mean nothing across a reboot.

Task: extend `Arm` with a homing routine.
1. `startHoming()` — drive slowly downward at `-0.15`.
2. `isAtHardStop()` — return whether the arm has reached the stop. Use the honest,
   sensor-free approximation available in the sim: **the arm has been commanded downward and its
   velocity has dropped to near zero**. (In the lesson, say plainly that a real robot usually
   uses a limit switch, and that this stand-in exists because PenguinSim has no hard stop.)
3. `finishHoming()` — stop the motor and `setPosition(0)`.
4. `isHomed()` — a boolean the rest of the code can check before trusting any position.
Bonus: make `getPosition()` print a warning if it's called before homing.

**Full reference solution** (`details.reveal`):
```java
import com.revrobotics.spark.SparkMax;
import com.revrobotics.spark.SparkLowLevel.MotorType;

public class Arm {
    private final SparkMax pivot = new SparkMax(3, MotorType.kBrushless);

    private static final double HOMING_SPEED = -0.15;   // slow, and downward
    private boolean homed = false;

    public void setSpeed(double speed) {
        double safe = Math.max(-0.8, Math.min(0.8, speed));
        pivot.set(safe);
    }

    public void stop() {
        pivot.set(0);
    }

    public double getPosition() {
        if (!homed) {
            System.out.println("WARNING: arm position read before homing -- zero is meaningless");
        }
        return pivot.getEncoder().getPosition();
    }

    public double getVelocity() {
        return pivot.getEncoder().getVelocity();
    }

    // --- homing -------------------------------------------------------
    public void startHoming() {
        homed = false;
        setSpeed(HOMING_SPEED);
    }

    // Stand-in for a limit switch: we are pushing down and no longer moving.
    public boolean isAtHardStop() {
        return Math.abs(getVelocity()) < 1.0;
    }

    public void finishHoming() {
        stop();
        pivot.getEncoder().setPosition(0);   // THIS position is now zero
        homed = true;
    }

    public boolean isHomed() {
        return homed;
    }
}
```
Solution notes for the author:
- `HOMING_SPEED` is a named constant, not a literal buried in a method. Unit 7 moves it to
  `Constants.java`; naming it now makes that refactor obvious rather than arbitrary.
- `isHomed()` exists so nothing downstream trusts a position it shouldn't. In Unit 6 the PID
  command will check it before running.
- `isAtHardStop()` is an approximation, and the lesson says so out loud. On a real PenguinBot
  this is a limit switch. Teaching an honest approximation and labelling it beats teaching a
  fake API.
- Notice the shape: `startHoming()` / `isAtHardStop()` / `finishHoming()` is *begin, check every
  cycle, finish* — which is `initialize` / `isFinished` / `end`. You have just invented a
  Command by hand. Unit 7 gives it its real name. **Point this out explicitly; it's the best
  foreshadowing in the track.**

Tease: "Your arm knows where it is and where zero is. It still can't *stop* at a setpoint — set
it moving and it sails past. Unit 6 is how a mechanism arrives somewhere on purpose."

CHECKPOINT: (5 questions, every option explained)

**Q1.** What does a relative encoder do when the robot boots?
- a) Remembers where it was — "That's an absolute encoder."
- b) ✓ **Calls its current position zero** — "Yes — it measures change from startup, nothing more."
- c) Reports an error — "It reports a number, confidently. That's the hazard."
- d) Drives the mechanism to zero — "Encoders never move anything."

**Q2.** When is an absolute encoder the right choice?
- a) Always — more information is better — "It's more hardware, more cost, and it has its own
  failure mode."
- b) When the mechanism is fast — "Speed isn't the criterion."
- c) ✓ **When there's no physical stop to home against** — "Right — a turret or a swerve steering
  module has nowhere to home to."
- d) When you're using a Kraken — "The vendor doesn't decide this; the mechanism does."

**Q3.** What does `setPosition(0)` do?
- a) Moves the mechanism to position 0 — "It moves nothing at all."
- b) ✓ **Renames the current position as zero** — "Correct — it changes the reference, not the
  mechanism."
- c) Resets the motor controller — "It only affects the encoder's count."
- d) Stops the motor — "You do that separately, with `set(0)`."

**Q4.** Why home at `-0.15` instead of `-0.8`?
- a) `-0.8` is illegal — "It's within range; it's just a bad idea here."
- b) It would be too fast to read the encoder — "Reading isn't the problem."
- c) ✓ **You're deliberately driving into a hard stop, and doing that hard breaks things** —
  "Exactly — same instinct as the 80 % rule, applied to a mechanism you're pushing against on
  purpose."
- d) Negative values need to be small — "Sign has nothing to do with magnitude limits."

**Q5.** An absolute encoder reads a steady, plausible angle but the mechanism is somewhere else
entirely. What's the general lesson?
- a) Absolute encoders are unreliable — "They're reliable about *themselves*."
- b) ✓ **A sensor tells you about the sensor; that it also describes the mechanism is an
  assumption** — "Yes — and that assumption breaks when the mechanical link does."
- c) You should have used relative — "Relative has exactly the same exposure to a broken link."
- d) The reading needs converting — "A conversion factor wouldn't fix a snapped belt."

SEASON-FLAGS:
- `callout--season` on `setPosition(0)` until the REVLib factsheet confirms it.
- `[NEEDS RESEARCH: current REVLib API for reading a SparkMax's *absolute* encoder (an encoder
  plugged into the SparkMax data port) — do not show a sample until confirmed]`
- `[NEEDS RESEARCH: the WPILib class for a limit switch input (DigitalInput?) and whether the
  team's pattern is a switch or a current-spike check — content/research/toolchain-2026.md]`
- Swerve steering's use of absolute encoders (CANcoders or equivalent) is asserted in prose
  only here; `frc-swerve-generators` owns it and carries its own research flag.

SIM-REQUEST: `RelativeEncoder.setPosition(double)` (already listed in `_shared-conventions.md`
§3). *Fallback if not shipped:* drop step 3 of the sandbox and demonstrate the power-cycle
problem only, then teach homing from the static code sample — the core teaching (a relative
zero is meaningless until you set it) survives intact.
