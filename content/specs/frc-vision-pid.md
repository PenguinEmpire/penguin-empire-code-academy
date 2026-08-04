# frc-vision-pid · Vision-Aligned PID (TX / TY)
unit: 10 · Seeing   |   duration: 30 min   |   difficulty: Advanced
interactivity: SANDBOX (PenguinSim + a documented in-lesson `FakeLimelight`)

> Read `_shared-conventions.md` first (§3 sim contract; paste **real** output).
> The source calls this the unit where Units 6, 9 and 10 pay off. Write it as a convergence, not
> as a new topic.

INTRODUCES:
- `vision-as-error-source` — TX **is** the error term; no subtraction needed
- `aim-with-tx` — PID the drivetrain's rotation until TX → 0
- `range-with-ty` — PID distance using the vertical angle
- `tag-filtering` — act only on the IDs you care about
- `target-lost-handling` — what the command does when the tag disappears
- `vision-pid-tolerance` — "aimed enough" as a number in degrees

ASSUMES:
- `pidcontroller-class`, `pid-calculate`, `set-tolerance`, `at-setpoint`, `pid-reset`
  (`frc-pid-syntax`); `tuning-recipe`, `output-clamping` (`frc-pid-tuning`)
- `tx`, `ty`, `fiducial-id`, `limelight-subsystem-wrapper` (`frc-limelight`)
- `field-centric` (`frc-swerve-concept`); full command lifecycle (`frc-command-lifecycle`)
- `add-requirements` (`frc-subsystems`); `sequentialcommandgroup` (`frc-command-groups`)

GOAL:
Write a command that turns the robot until it faces an AprilTag, and handle the case where the
tag disappears.

HOOK: **Everything you've built, in one command** (`_shared-conventions.md` §6 story 12's
counterpart — PDF page 16). `callout--why`.
The source's own sentence: *this unit is where PID (Unit 6) and swerve (Unit 9) pay off: vision
gives the error, PID drives it to zero.*

Look at how little is left to invent. In Unit 6 you learned that a controller needs an **error**
and produces an **output**. In Unit 9 you got a drivetrain that accepts a rotation rate. In Unit
10 you got a camera that hands you an angle off-target.

TX **is** the error. Setpoint 0. That's the whole design:

```
error  = TX            (the camera already did the subtraction)
output = pid.calculate(TX, 0.0)
        -> drivetrain rotation rate
```

Six lines of new code, standing on four units of work. Which is what good structure feels like
from the inside.

Second beat, the warning that belongs here: this is a PID loop driving a **120-pound robot** at a
target. `frc-pid-tuning`'s story — bent parts, a mechanism falling off — applies with more mass
behind it. Start `kP` small. The sandbox lets you get the aggressive one out of your system.

EXPLAIN:

1. **The setpoint is zero, and that's unusual.** Every controller so far aimed at a *position*
   (9.0 rotations). Here the target is **always 0**, because "aimed" means "no angular error."
   What changes instead is the *measurement*: TX moves as the robot turns and as the tag moves.
   Analogy: you're not steering toward a number, you're **cancelling an offset**.

2. **Sign conventions will bite you, and there's no shame in it.** Whether a positive TX means
   the tag is left or right, and whether a positive rotation output turns clockwise, depend on the
   camera's mounting and the drivetrain's convention. The two must agree, and if they don't, your
   robot turns **away** from the target and accelerates — a positive feedback loop.
   The professional response, worth a `callout--tip`: **test at very low `kP` first and watch
   which way it turns.** Exactly Unit 4's "you won't know which direction is positive until you
   test." If it runs away, negate the output. Don't reason about it for twenty minutes; run it at
   `kP = 0.01` and look.

3. **Tolerance, in degrees.** "Aimed" needs a number. About **1.0°** is a reasonable starting
   tolerance for PenguinBot; too tight and the robot hunts forever, too loose and you miss.
   Same `setTolerance()` / `atSetpoint()` pair from `frc-pid-syntax` — no new API.

4. **Losing the target — the thing that separates working vision from a demo.** From
   `frc-limelight`: TX reads 0 with no target, indistinguishable from perfect alignment. So the
   command must ask `isTargetValid()` **before** it acts. Three sane policies, and choosing one
   deliberately is the lesson:

| Policy | Behaviour | Good for |
|---|---|---|
| **Stop and finish** | no valid target → stop the drivetrain, `isFinished()` true | simple, safe, the default |
| **Hold and wait** | keep the last output briefly, hoping it reappears | brief occlusions by a defender |
| **Stop but keep waiting** | stop moving, don't finish, keep looking | when a sequence must not advance |

   Teach **stop and finish** as the default, name the others. The failure to avoid is the fourth,
   unstated option: *carry on driving on a stale reading*, which is what you get for free if you
   don't think about it.

5. **Filter by tag ID.** `isTargetValid()` from `frc-limelight` already checks the ID is one of
   yours. Say why once more, concretely: aiming at the opposing alliance's tag is a real failure
   mode, and it looks like the code working perfectly.

6. **TY for range — same shape, one paragraph.** A second `PIDController` on TY with a non-zero
   setpoint (the TY reading at your preferred shooting distance), driving forward/back translation
   instead of rotation. Two controllers, two axes, running simultaneously on one drivetrain.
   Do **not** build it — say it's the same pattern and hand it to the exercise as a bonus.

7. **Where this sits in a match.** One paragraph: `AimAtTagCommand` isn't usually bound to a
   button by itself. It goes at the front of a scoring sequence — *aim, then raise the arm, then
   score* — and in Unit 11 the same command appears inside the autonomous routine. That's the
   composition payoff: the command you write here is reused twice without modification.

CODE:

**Sample — `AimAtTagCommand`.** The only genuinely new class in the lesson:
```java
import edu.wpi.first.math.controller.PIDController;
import edu.wpi.first.wpilibj2.command.Command;
import static frc.robot.Constants.VisionConstants;
import static frc.robot.Constants.RobotConstants;

public class AimAtTagCommand extends Command {

    private final DriveSubsystem     drive;
    private final LimelightSubsystem limelight;

    // Setpoint is ZERO: "aimed" means no angular error.
    private final PIDController pid =
        new PIDController(VisionConstants.kAimP, 0.0, 0.0);

    public AimAtTagCommand(DriveSubsystem drive, LimelightSubsystem limelight) {
        this.drive     = drive;
        this.limelight = limelight;
        addRequirements(drive);          // NOT the limelight -- reading it doesn't own it
    }

    @Override
    public void initialize() {
        pid.reset();
        pid.setTolerance(VisionConstants.kAimToleranceDeg);
    }

    @Override
    public void execute() {
        if (!limelight.isTargetValid()) {
            drive.stopRotation();        // no valid tag: do not act on a stale reading
            return;
        }
        double tx  = limelight.getAngleToTag();      // the error, straight from the camera
        double out = pid.calculate(tx, 0.0);
        double max = RobotConstants.kMaxOutput;
        drive.rotate(Math.max(-max, Math.min(max, out)));
    }

    @Override
    public boolean isFinished() {
        // Finish when aimed -- OR when there's nothing to aim at.
        return !limelight.isTargetValid() || pid.atSetpoint();
    }

    @Override
    public void end(boolean interrupted) {
        drive.stopRotation();            // always
    }
}
```
Annotations to call out:
- `addRequirements(drive)` and **not** the Limelight — reading a sensor doesn't require exclusive
  ownership of it, and requiring it would stop any other command from reading vision. This
  distinction is worth a sentence; students over-require.
- The `isTargetValid()` guard appears in **both** `execute()` and `isFinished()`. Not redundant:
  one stops the motion, the other stops the command.
- The clamp is here too. Every PID output in this course gets clamped.
`[NEEDS RESEARCH: the real DriveSubsystem rotation API from the swerve generator —
`rotate(double)` and `stopRotation()` are placeholders named for readability.
content/research/swerve.md. Mark them clearly as stand-ins for whatever the generated subsystem
exposes.]`

SANDBOX:

Banner: **"Simulated for teaching. The real classes come from WPILib."**
Second banner, equally prominent: **PenguinSim has no camera and no drivetrain.** The sandbox
defines a small `FakeLimelight` and `FakeDrive` **in the student's own file**, visible and
labelled, so the control loop is real even though the sensor isn't. Show them; don't hide them in
the shim. A visible fake is honest; an invisible one teaches a false API.

**Exact starter code:**
```java
// Real robot code would start with:
//   import edu.wpi.first.math.controller.PIDController;

public class Main {

    // ---- STAND-INS. On a real robot these are a Limelight and your swerve. ----
    static class FakeField {
        // The tag starts 25 degrees to one side of where the robot is pointing.
        double tx = 25.0;
        boolean hasTarget = true;
        int tagId = 7;

        // Positive power turns the robot one way, which moves the tag across the
        // image and INCREASES tx. Negative power decreases it.
        void rotate(double power) { tx += power * 2.0; }
    }
    // --------------------------------------------------------------------------

    public static void main(String[] args) {
        FakeField field = new FakeField();

        final double TOLERANCE = 1.0;     // degrees -- "aimed enough"
        final double MAX_OUT   = 0.8;     // the team's 80% rule
        final int[]  OUR_TAGS  = { 7, 8 };

        PIDController pid = new PIDController(0.05, 0.0, 0.0);   // <-- CHANGE ME
        pid.setTolerance(TOLERANCE);

        System.out.printf("kP = %.2f   starting tx = %.2f%n", 0.05, field.tx);
        System.out.println("tick      tx   output   aimed");

        for (int tick = 1; tick <= 40; tick++) {

            boolean valid = field.hasTarget && contains(OUR_TAGS, field.tagId);
            if (!valid) {
                System.out.println("tick " + tick + "  NO VALID TARGET -- stopping");
                break;
            }

            double out = pid.calculate(field.tx, 0.0);
            out = Math.max(-MAX_OUT, Math.min(MAX_OUT, out));
            field.rotate(out);

            if (tick % 4 == 0 || pid.atSetpoint()) {
                System.out.printf("%4d  %6.2f   %6.2f   %b%n",
                                  tick, field.tx, out, pid.atSetpoint());
            }
            if (pid.atSetpoint()) { System.out.println("aimed at tick " + tick); break; }
        }
    }

    static boolean contains(int[] ids, int id) {
        for (int i : ids) if (i == id) return true;
        return false;
    }
}
```

**What the student changes:**
1. `kP`: `0.05` → `0.20`. Compare how many ticks each takes. Same tuning skill as Unit 6, new
   mechanism.
2. **Negate the output** (`field.rotate(-out)`) and watch TX run away to infinity — the sign-error
   failure from EXPLAIN beat 2, made visible and harmless.
3. Set `field.hasTarget = false` at tick 6 and confirm the command stops instead of continuing on
   a stale reading.
4. Set `field.tagId = 3` (not one of ours) and confirm it refuses to aim at all.
5. Set `TOLERANCE = 0.05` and watch it take far longer, or hunt.

**Expected printed output** at `kP = 0.05` (computed from the sandbox's own model:
`tx += output × 2.0`, output clamped to ±0.8, so `tx` falls 1.6°/tick while saturated —
`tx > 16` — then geometrically by ×0.9 per tick). **Author must re-run and paste real output.**
```
kP = 0.05   starting tx = 25.00
tick      tx   output   aimed
   4   18.60    -0.80   false
   8   12.20    -0.69   false
  12    8.00    -0.45   false
  16    5.25    -0.29   false
  20    3.44    -0.19   false
  24    2.26    -0.13   false
  28    1.48    -0.08   false
  32    0.99    -0.06   true
aimed at tick 32
```
At `kP = 0.20` (saturated while `tx > 4`, then ×0.6 per tick):
```
kP = 0.20   starting tx = 25.00
tick      tx   output   aimed
   4   18.60    -0.80   false
   8   12.20    -0.80   false
  12    5.80    -0.80   false
  16    0.94    -0.31   true
aimed at tick 16
```

**Output shape assertions** (must hold even if numbers differ):
1. TX **decreases monotonically** toward 0 and the output shrinks with it.
2. The output is pinned at the clamp early on and only comes off it as TX gets small.
3. `aimed` flips true when |TX| drops below the tolerance, and the loop stops.
4. `kP = 0.20` aligns in roughly **half** the ticks of `kP = 0.05`.
5. With the output negated, TX **increases without bound** — the run-away sign error.
6. With `hasTarget = false` or a foreign tag ID, the loop prints the no-valid-target line and
   **stops** — it never acts on the reading.

Teaching text must land assertion 5: *this is what a sign error looks like. On a real robot it's a
120-pound machine spinning up to full speed while your code believes it's correcting. Test at
`kP = 0.01` and watch which way it turns before you trust it.*

CHALLENGES:

1. **Predict the output** — `data-kind="text"`. "You negate the drivetrain output so a positive
   PID result turns the wrong way. TX starts at 25. What happens to TX?"
   `data-answer="increases|it grows|goes up|runs away|gets bigger|increases forever|grows without bound"`
   Win: "It grows without bound. The controller is now driving the error *up*, and the further off
   it gets the harder it pushes — a runaway."
   Lose: "TX increases forever. Flipping the sign turns negative feedback into positive feedback:
   the bigger the error, the harder it drives in the wrong direction. Test at a tiny `kP` first."

2. **MCQ · the setpoint** — "What setpoint do you pass to `pid.calculate(tx, ...)` when aiming?"
   - a) The tag's ID — "That's which tag, not where."
   - b) ✓ **0.0** — "Yes — 'aimed' means no angular error, so the target value for TX is zero."
   - c) The current TX — "Then the error is always zero and nothing ever moves."
   - d) The tolerance — "Tolerance is how close counts; it isn't the target."

3. **MCQ · losing the tag** — "Mid-aim, a defender blocks the camera. `hasTarget()` goes false and
   TX reads 0. What must your `execute()` do?"
   - a) Keep using TX; 0 means aimed — "That's the trap. 0 means aimed *or* nothing there."
   - b) ✓ **Stop the rotation and not act on the reading** — "Correct — and then either finish, or
     wait, but never drive on it."
   - c) Increase `kP` to find the tag — "More power doesn't restore a sensor."
   - d) Switch to encoder aiming — "The encoders don't know where the tag is."

4. **Fill-in-the-blank** — `data-kind="fib"`:
   ```
   double tx  = limelight.getAngleToTag();
   double out = pid.calculate(tx, <blank>);
   out = Math.max(-0.8, Math.min(0.8, <blank>));
   drive.rotate(out);
   ```
   answers: `data-answer="0.0|0|0.0)"`, `data-answer="out"`
   Win: "Setpoint zero, clamped output. Four lines and PenguinBot aims itself."
   Lose: "The setpoint is `0.0` — no angular error. And the output gets clamped to the team's
   limit like every other PID output in this course."

5. **MCQ · requirements** — "`AimAtTagCommand` calls `addRequirements(drive)` but not the
   Limelight. Why?"
   - a) An oversight — "It's deliberate."
   - b) ✓ **It *commands* the drivetrain but only *reads* the camera — requiring the camera would
     stop anything else reading vision at the same time** — "Exactly. Requirements are about
     exclusive control, not about use."
   - c) Sensors can't be required — "They can; it's just usually wrong."
   - d) The Limelight isn't a subsystem — "It is one, wrapped as `LimelightSubsystem`."

MISCONCEPTIONS:
- *"Vision replaces PID."*
  → "Vision *supplies* the error. PID is still what turns an error into an output — that's why
  Unit 6 came first."
- *"I need to convert TX into a distance or a target angle."*
  → "TX is already the error, in degrees, with a sign. Feed it straight in."
- *"If the code compiles and the maths is right, it'll aim."*
  → "Only if the camera's sign convention and the drivetrain's agree. Test at a tiny `kP` and
  watch which way it turns."
- *"TX = 0 means done."*
  → "Only if there's a valid target. Check `isTargetValid()` first, in both `execute()` and
  `isFinished()`."
- *"Tighter tolerance is better."*
  → "Too tight and the robot hunts around the target and never reports aimed. 1° is a sane start."
- *"The aim command should require the Limelight too."*
  → "Requirements mean exclusive control. Reading a sensor doesn't need it, and taking it stops
  everything else from reading."

EXERCISE: **PenguinBot aims itself.**
*Where we are:* PenguinBot has `LimelightSubsystem` (`frc-limelight`), a swerve drivetrain
(`frc-swerve-generators`), a tuned PID habit (Unit 6), and `ScoreSequence`
(`frc-command-groups`).

Task:
1. Add a `VisionConstants` block: `kAimP`, `kAimToleranceDeg = 1.0`, `kScoringTagIds`.
2. Write `AimAtTagCommand`: rotate until TX is within tolerance; require the drivetrain but not
   the Limelight; guard on `isTargetValid()` in both `execute()` and `isFinished()`; clamp the
   output; stop the drivetrain in `end()`.
3. Tune `kAimP` in the sandbox. Record a tuning log, as in `frc-pid-tuning`.
4. Build `AimAndScore` — a `SequentialCommandGroup` of `AimAtTagCommand` then `ScoreSequence` —
   and bind it to a button.
5. Write the sign-convention test you'd run first on the real robot, in three steps.
Bonus 1: add a TY range controller so the robot also drives to a consistent distance, running on
the same drivetrain at the same time. Explain why that's one command with two controllers rather
than two commands.
Bonus 2: add a timeout so a robot that can never quite aim doesn't freeze `AimAndScore`.

**Full reference solution** (`details.reveal`): the `AimAtTagCommand` from the CODE section, plus:
```java
// commands/AimAndScore.java
public class AimAndScore extends SequentialCommandGroup {
    public AimAndScore(DriveSubsystem drive, LimelightSubsystem limelight,
                       ArmSubsystem arm, IntakeSubsystem intake) {
        addCommands(
            new AimAtTagCommand(drive, limelight),   // face the tag first
            new ScoreSequence(arm, intake)           // then the cycle you already built
        );
    }
}
// RobotContainer:
driver.cross().onTrue(new AimAndScore(drive, limelight, arm, intake));
```
> **Sign-convention test, on the real robot:**
> 1. Put the robot on blocks. Set `kAimP = 0.01` — far too small to be useful, which is the point.
> 2. Place a tag clearly off to one side. Enable and run the command. **Watch which way the wheels
>    turn.**
> 3. If they turn toward the tag, raise `kP` and carry on tuning. If they turn away, negate the
>    output once and repeat step 2. Do not raise `kP` until step 2 passes.
>
> **Bonus 1 — why one command, not two:** both controllers command the **same drivetrain**. Two
> separate commands would both require it, so the scheduler would let only one run — the second
> would interrupt the first. One command holding two `PIDController` objects and combining their
> outputs into a single drive request is the correct structure. That's requirements from Unit 7
> deciding an architecture decision in Unit 10.
>
> **Bonus 2:** a `TIMEOUT_TICKS` counter in `isFinished()`, exactly as in
> `frc-command-lifecycle`. A robot that hunts around 1.2° forever would otherwise never let
> `ScoreSequence` start — and you'd watch a whole match go by with the robot gently wobbling.

Tease: "PenguinBot can see, aim, drive and score, all triggered by a human. Unit 11: take the
human out."

CHECKPOINT: (5 questions, every option explained)

**Q1.** What is the error term when aiming with TX?
- a) `setpoint − encoder position` — "That's the arm. Vision gives you the error directly."
- b) ✓ **TX itself — the camera has already measured the angular offset** — "Right, which is why
  the setpoint is 0."
- c) The tag ID — "That identifies the tag, not its position."
- d) The gyro heading — "The gyro knows the robot's heading, not the tag's."

**Q2.** Why must a vision command check `isTargetValid()` before using TX?
- a) TX throws an exception with no target — "It returns a number, which is worse."
- b) ✓ **TX reads 0 with no target, which is identical to 'perfectly aimed'** — "Exactly, and the
  robot would stop, believing it had succeeded."
- c) The camera needs warming up — "Not the issue."
- d) It's required by WPILib — "Nothing requires it; correctness does."

**Q3.** Your aiming robot spins faster and faster away from the tag. What's wrong?
- a) `kP` is too small — "Too small makes it slow, not wrong-way."
- b) The tolerance is too tight — "That makes it hunt near the target, not run away."
- c) ✓ **The output's sign is inverted, so feedback is positive instead of negative** — "Yes —
  test at a tiny `kP` and watch which way it turns before trusting the loop."
- d) The tag is the wrong ID — "Then it wouldn't act at all."

**Q4.** Why does `AimAtTagCommand` require the drivetrain but not the Limelight?
- a) The Limelight isn't a subsystem — "It is, wrapped as `LimelightSubsystem`."
- b) ✓ **It commands the drivetrain and only reads the camera; requiring the camera would block
  anything else from reading it** — "Correct. Requirements are about exclusive control."
- c) Cameras can't be required — "They can, and it's usually a mistake."
- d) To make it faster — "No performance difference."

**Q5.** Why is a TY range controller part of the *same* command as the TX aim controller?
- a) They share the camera — "Sharing a sensor doesn't force it."
- b) ✓ **They both command the same drivetrain, and two commands requiring it would interrupt each
  other** — "Exactly — requirements dictate the structure."
- c) TY depends on TX — "They're independent readings."
- d) It's faster — "Not the reason; correctness is."

SEASON-FLAGS:
- `callout--season` on all Limelight API names (inherited from `frc-limelight`) and on the
  drivetrain's rotation API (from the swerve generator).
- `[NEEDS RESEARCH: the generated DriveSubsystem's rotation/drive-request API —
  content/research/swerve.md. `rotate(double)` and `stopRotation()` in this spec are readability
  placeholders and must be labelled as such in the lesson.]`
- `[NEEDS RESEARCH: LimelightHelpers signatures and the has-target reading —
  content/research/vision-pathplanner.md]`
- Tag IDs in `kScoringTagIds` are **game-specific**; flag hard and put a "verify for this season"
  comment in the code itself.
- The PID structure and the sign-convention test are stable.

SIM-REQUEST: none beyond §3 — `PIDController` with `setTolerance`/`atSetpoint`/`reset`. The
`FakeField` stand-in is defined in the student's own file **deliberately**, so the fake is visible
rather than hidden in the shim. Do not move it into PenguinSim.
