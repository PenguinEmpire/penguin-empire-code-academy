# Verified PID gains for PenguinSim — Unit 6 lesson values

**These numbers are measured, not guessed.** Every row below was produced by compiling
`site/assets/js/sim/penguinsim.java.txt` against a test harness on JDK 25 and reading the
output. Unit 6 lessons (`frc-pid-concept`, `frc-pid-tuning`, `frc-pid-syntax`) and the PID
playground widget must use these exact values, or the lesson text won't match what the
student sees when they press Run.

**Setup for every row:** an arm subsystem, one `SparkMax(2, kBrushless)`, setpoint **50°**,
`pid.calculate(encoder.getPosition(), 50.0)` fed straight into `motor.set(...)`, 250 loops
of 20 ms (5 s of robot time).

## The P story

| Gains | Result | What the student sees | Teaching point |
|---|---|---|---|
| `kP=0.005` | final **46.4°**, 0 overshoot, 0 rings | Creeps up and stalls short, never arrives | Too little P — friction wins before the target |
| `kP=0.02` | final **50.00°**, 0 overshoot, 0 rings | Glides in and stops dead on | Tuned. This is the target behaviour |
| `kP=0.05` | final 49.6°, **7.6% overshoot**, 1 ring | Sails past 54°, comes back, settles | The curriculum PDF's own starting value — works, but hot |
| `kP=0.15` | final 49.8°, 10.4% overshoot, **3 rings** | Bounces around the target a few times | Too much P |
| `kP=0.5` | final 49.9°, 9.5% overshoot, **7 rings** | Hunts back and forth, won't settle | "A powerful ally and a dangerous foe" — this is what bends parts |

## The D story

| Gains | Result | Teaching point |
|---|---|---|
| `kP=0.5, kD=0` | 9.5% overshoot, **7 rings** | The problem |
| `kP=0.5, kD=0.05` | **0% overshoot, 0 rings**, final 49.94° | D damps the approach. Same P, ringing gone |

This is the cleanest demonstration in the unit: change **one number**, the oscillation
disappears entirely. Build the lesson around exactly this before/after.

## The I story

Start from `kP=0.005`, which stalls **1.81° short** (stiction — the output falls below
the 3.5% break-loose threshold before reaching the target).

| Gains | Final | Leftover error | Teaching point |
|---|---|---|---|
| `kP=0.005, kI=0` | 48.19° | 1.81° short | The problem I exists to solve |
| `kP=0.005, kI=0.00005` | 49.12° | 0.88° short | Helping, not yet enough |
| **`kP=0.005, kI=0.0001`** | **50.01°** | **0.01°** | The win — I quietly builds until it breaks static friction |
| `kP=0.005, kI=0.00025` | 52.35° | 2.35° **past** | Winding up |
| `kP=0.005, kI=0.0004` | 54.26° | 4.26° **past** | Windup — overshoots and stays there |
| `kP=0.005, kI=0.02` | wild: peaks 82°, ends 55° | — | What "a small kI" does NOT mean |

**Author's note — do not sanitize this.** `PIDController` in PenguinSim deliberately has
no anti-windup, exactly like the real WPILib class by default. I is genuinely the term most
likely to hurt you, which is why FRC practice is P → D → and only then a little I. The
useful kI here is **200× smaller** than the useful kP. Teach that ratio; it's the honest
lesson and it matches the curriculum PDF's warning ("Overshoot → oscillation if tuned too high").

## Physics constants behind these numbers

`SparkMax` in the shim models one generic geared mechanism:

```
ACCEL    = 600.0   // deg/s^2 at 100% output
DAMP     = 6.0     // 1/s  -> ~100 deg/s free speed
STICTION = 0.035   // below 3.5% output nothing breaks loose
```

`DAMP` was changed from the original `10.0` to `6.0` on 2026-07-30 after measurement.
At `DAMP=10` the motor saturated for the whole approach, so the move was effectively
bang-bang and **raising kP from 0.3 to 2.0 made overshoot go *down* (3.6% → 3.2%) and the
arm never oscillated at all.** That directly contradicts the lesson Unit 6 has to teach.
At `DAMP=6` ringing increases monotonically with kP, and D visibly cures it.

If anyone retunes these constants, **re-measure this whole table** — the lesson text quotes
these numbers.

## Reproducing

```bash
cat site/assets/js/sim/penguinsim.java.txt your_test.java > Main.java   # must be Main.java
javac -d out Main.java && java -cp out Main
```

The concatenation order matters and the file must be named `Main.java` — the shim's classes
are package-private top-level classes, and `public class Main` has to match the filename.
This is the same constraint OneCompiler imposes, so if it compiles here it compiles there.
