# PenguinSim — what's real and what isn't

`penguinsim.java.txt` is a **teaching simulation**, not WPILib. It exists because the
lesson sandboxes run on OneCompiler, which compiles plain, single-file Java with no
external libraries — so `SparkMax` and `PIDController` simply don't exist there.

Rather than make the whole FRC half of the course read-only, we ship stand-in classes with
the **same names and the same method shapes** as the real ones. A student writes a
subsystem, presses Run, and watches the 20 ms loop actually happen.

## How it's used

A lesson marks its sandbox with `data-sim`:

```html
<div class="sandbox" data-compiler data-sim data-title="PenguinSim Sandbox">
  <script type="text/x-java" class="sb-src"> ...lesson code... </script>
</div>
```

`widgets.js` fetches this file once, prepends it to the lesson's code, and sends the
combined file to the compiler as `Main.java`. Every such sandbox renders a banner saying
it is simulated — **do not remove that banner.**

The shim's classes are package-private *top-level* classes, so they sit alongside the
lesson's `public class Main` in one file. That's why the shim goes first and why the file
must be called `Main.java`.

## What is faked

| | PenguinSim | The real thing |
|---|---|---|
| **Encoder units** | degrees and degrees/second | REV's `RelativeEncoder` reports **rotations** and **RPM** |
| **Physics** | one generic geared mechanism, 600 deg/s² at full output, viscous damping, 3.5% stiction | a real mechanism with gravity, battery sag, current limits, backlash, gear ratios |
| **Time** | only moves when you move it (`PenguinSim.step()`, `CommandScheduler.run()`, `Timer.delay()`) | a real 20 ms loop running continuously on the RoboRIO |
| **`Timer.delay()`** | fast-forwards the simulated clock | actually blocks the thread |
| **Scheduler** | runs a finite number of cycles so the sandbox terminates | runs forever |
| **CAN / wiring** | none — `setInverted()` is shape only | real devices, real IDs, real broken wires |
| **Vision, swerve, PathPlanner** | not modelled at all | see the Unit 9–11 lessons |

## What is real

- The **method names and signatures** — `motor.set(-1.0 … 1.0)`,
  `motor.getEncoder().getPosition()`, `pid.calculate(measurement, setpoint)`,
  `initialize()` / `execute()` / `isFinished()` / `end(boolean)`.
- The **command lifecycle order**, and the fact that a subsystem's `periodic()` and a
  command's `execute()` both run on the same ~20 ms loop.
- The **PID behaviour**. `PIDController` here has no anti-windup and no output clamp,
  exactly like the WPILib class by default — so bad gains misbehave the way bad gains
  really do. Measured gain values live in `content/research/pid-sim-gains.md`; the Unit 6
  lesson text quotes those numbers, so **re-measure that table if you retune the physics.**
- The **80% rule**. Push output past 0.8 and the sim warns you, because that is how 2551
  fried a motor.

## What a student must un-learn on a real robot

1. **Import the real classes.** `com.revrobotics.spark.SparkMax`,
   `edu.wpi.first.math.controller.PIDController`, `edu.wpi.first.wpilibj2.command.*`.
2. **Convert the units.** Position is in rotations, velocity in RPM, unless you set a
   conversion factor. Every setpoint you tuned here is meaningless there.
3. **Re-tune every gain.** These gains fit this fake mechanism and nothing else.
4. **The loop runs itself.** You never call `CommandScheduler.getInstance().run()` in a
   lesson-style loop — `Robot.java` already does it for you every 20 ms.

## Changing it

Keep it honest and keep it small. If you add a class, add it to the "what is faked" table
above and to the header comment inside `penguinsim.java.txt`. Verify with:

```bash
cat site/assets/js/sim/penguinsim.java.txt your_test.java > Main.java
javac -d out Main.java && java -cp out Main
```
