# frc-motors · Motors & Motor Controllers
unit: 1 · The Robot's Body   |   duration: 20 min   |   difficulty: Beginner
interactivity: NO-COMPILER (signal-path diagram reprise + **match-pairs** widget + MCQ)

> Read `_shared-conventions.md` first.

INTRODUCES:
- `motor-vs-motor-controller` — the distinction the whole unit turns on
- `sparkmax` — REV's motor controller (the team's main one)
- `neo` — REV's motor; plugs into a SparkMax
- `kraken` — CTRE's motor with the controller built in; CAN runs straight through it
- `brushed-vs-brushless` — and why the team almost always uses brushless
- `vendor-docs-matching` — which manual you read depends on which hardware you have
- `motor-count-per-mechanism` — one mechanism can have several motors

ASSUMES:
- `signal-path`, `can-bus`, `roborio` (`frc-roborio-radio-can`)
- `programmer-role` (`frc-what-programmers-do`)

GOAL:
Tell a motor apart from a motor controller, name which vendor's documentation you need for a
given piece of hardware, and explain why a mechanism might have four motors instead of one.

HOOK: **Two motors, two manuals.** (Real mechanism — no invented anecdote.)
`callout--why`. Two students are told "make the motor spin." One has a Neo, one has a Kraken.
The first opens the REV docs, types `SparkMax`, and it works. The second copies her friend's
code exactly and nothing compiles — because a Kraken isn't a REV device at all, and the class
she needs lives in a completely different library. **The hardware in your hand decides which
documentation is true for you.** Nothing about that is guessable from the code.

Second beat: the source's ChairBot had **two sides, two wheels per side, and two motors
driving each side — four motors total**. That's the moment students realise "one mechanism =
one motor" is wrong.

Third beat, forward tease only (the full story is `frc-vendordeps`): an entire motor
controller family the team once used — Jaguars — has been *removed* from current WPILib. The
class simply doesn't exist any more. Hardware ages out; that's a Unit 2 story.

EXPLAIN:

1. **A motor and a motor controller are different objects.**
   Analogy: the motor is the muscle; the controller is the nerve ending that decides how hard
   to pull. The motor has two power leads and no brain. The controller sits on the CAN bus,
   listens for its ID, and delivers exactly that much power.
   Beat: **in code you create the controller, not the motor.** `new SparkMax(2, ...)` is the
   controller. The Neo bolted to it never appears in your code by name. Students find this
   genuinely surprising, and it's the single most useful sentence on the page.

2. **The three names the student will hear constantly.** Table, straight from the source:

| Device | What it is | Whose docs |
|---|---|---|
| **SparkMax** | Motor **controller** — the team's main one | REV |
| **Neo** | **Motor** by REV; plugs into a SparkMax | REV |
| **Kraken** | **Motor** by CTRE with the controller **built in** — CAN runs straight through it | CTRE / Phoenix |

   Mark: [FROM PDF page 4, §1.4 table]
   Beat: a Kraken collapses two boxes of the signal path into one. Redraw the diagram both
   ways side by side — this is the clearest possible illustration of the distinction:

```
Neo setup:      RIO → CAN → SparkMax → Neo → spin
Kraken setup:   RIO → CAN → Kraken (controller inside) → spin
```

3. **Brushed vs brushless.**
   Analogy: brushed motors have physical contacts that rub (the "brushes") — older, simpler,
   they wear. Brushless motors are switched electronically — newer, more efficient, they last.
   Beat: **the team almost always uses brushless**, which is why the constructor argument you
   will type a hundred times this season is `MotorType.kBrushless`. Mark: [FROM INTRO NOTES
   page 3]. Note carefully: the intro notes' example lists a Kraken as brushless — true, but
   a Kraken is a *motor*, not a REV type; the `MotorType` enum is a REVLib thing you pass to a
   SparkMax. Don't blur those.

4. **Why four motors?** Because a mechanism needs torque you can't get from one, or because
   two sides need independent control. The ChairBot: two sides × two motors. PenguinBot's
   swerve drivetrain: 4 modules × 2 motors = **8**. And the 80 % rule from the built lesson
   flips into a design principle here: *if you need more force, add a motor — don't push one
   harder.*
   Beat: multiple motors on one mechanism usually means one method sets them all:
   `setLeftMotors(speed)` writes to both left motors in one call. That's the pattern the
   student will write for real in `frc-subsystems`.

5. **Reading the right manual.** Close with the practical skill: identify hardware → pick
   vendor → open that vendor's docs. REV for SparkMax/Neo. CTRE/Phoenix for Kraken. WPILib for
   everything that isn't vendor-specific. Appendix C of the team's reference lists all of them
   and `/reference/docs` will collect the links.

CODE:
Two short blocks, both already verified elsewhere. **Show, don't teach** — `frc-moving-a-motor`
owns the real explanation; this page is only making the vendor point.

```java
// [FROM PDF page 8 verified box — REVLib]
import com.revrobotics.spark.SparkMax;
import com.revrobotics.spark.SparkLowLevel.MotorType;

SparkMax leftMotor1 = new SparkMax(2, MotorType.kBrushless);   // a Neo, through a SparkMax
```
Annotate: line 1–2 = REV's library, not WPILib's; line 4 = the *controller* object, CAN ID 2,
brushless because it's a Neo.

```java
// [FROM INTRO NOTES page 3-4 — the ChairBot's four motors]
SparkMax leftMotor1  = new SparkMax(2, MotorType.kBrushless);
SparkMax leftMotor2  = new SparkMax(3, MotorType.kBrushless);
SparkMax rightMotor1 = new SparkMax(4, MotorType.kBrushless);
SparkMax rightMotor2 = new SparkMax(5, MotorType.kBrushless);
```
Annotate: four objects, four unique IDs, one mechanism. "Don't make them all 0."

**Do NOT show a Kraken/TalonFX code sample on this page.**
`[NEEDS RESEARCH: the current Phoenix 6 class name and import for a Kraken X60 (TalonFX?) and
its equivalent of set() — content/research/toolchain-2026.md]`. Until that factsheet lands,
describe the Kraken in prose only and say "the CTRE class name lives in the Phoenix library —
see the docs index." Do not guess.

SANDBOX: none — NO-COMPILER lesson. There is nothing to run: the point is hardware identity.

Interactive load:
- The **signal-path diagram** widget (Unit 1's widget) re-instantiated with a toggle between
  the *Neo + SparkMax* path and the *Kraken* path, so the "controller inside" idea is shown
  rather than asserted. Fallback: the two static `.diagram` blocks in EXPLAIN beat 2.
- The **match-pairs** widget (see WIDGET-REQUEST).

CHALLENGES:

1. **Match-pairs · hardware → documentation.** Left column: *Neo*, *SparkMax*, *Kraken*,
   *RoboRIO*. Right column: *REV docs*, *REV docs*, *CTRE / Phoenix docs*, *WPILib docs*.
   Answer key: Neo → REV, SparkMax → REV, Kraken → CTRE/Phoenix, RoboRIO → WPILib.
   Win: "That's the reflex to build: identify the hardware, then open that vendor's manual."
   Lose: "REV makes the Neo and the SparkMax. CTRE makes the Kraken. The RoboRIO is core FRC,
   so WPILib."
   *Fallback: four one-question MCQs, or a `data-kind="fib"` table with vendor-name blanks.*

2. **MCQ · which one is the controller?** — "In `new SparkMax(2, MotorType.kBrushless)`, what
   object are you creating in software?"
   - a) The Neo motor — "The motor never appears by name in your code."
   - b) ✓ **The SparkMax motor controller** — "Right. You address the controller; it drives
     whatever motor is plugged into it."
   - c) The CAN bus — "The bus is wiring; the ID argument is how you address a device on it."
   - d) The mechanism — "The mechanism is what moves. Your code only ever talks to controllers."

3. **Predict / short answer** — "PenguinBot's swerve drivetrain has 4 modules, and each module
   has one motor to drive the wheel and one to steer it. How many motors is that?"
   `data-answer="8|eight"`
   Win: "Eight — which is exactly why swerve gets its own unit and why you'll never hand-write
   the math for it."
   Lose: "4 modules × 2 motors each = 8. Every one of those needs a unique CAN ID."

4. **MCQ · adding force** — "A mechanism isn't strong enough at `set(0.7)`. What does this
   team do?"
   - a) Run it at `set(1.0)` — "That's the fried-motor story from Unit 4. Full power is how
     you lose two days."
   - b) ✓ **Add a second motor to the mechanism** — "Correct — that's the team's stated rule:
     add motors instead of pushing one harder."
   - c) Switch to a brushed motor — "Brushed is the older, less capable type; that's backwards."
   - d) Increase the CAN ID — "The ID is an address. It has nothing to do with power."

MISCONCEPTIONS:
- *"SparkMax is a motor."*
  → "SparkMax is a *controller*. The motor plugged into it is a Neo — and the Neo never
  appears in your code."
- *"All motors use the same class."*
  → "A Neo goes through REV's `SparkMax` class; a Kraken uses CTRE's Phoenix library. Same
  idea, different library, different method names."
- *"A Kraken needs a SparkMax."*
  → "A Kraken has its controller built in — CAN runs straight through the motor."
- *"One mechanism, one motor."*
  → "The ChairBot drove each side with two motors, and a swerve drivetrain uses eight. One
  subsystem method usually writes to all of them at once."
- *"`kBrushless` is about the motor controller."*
  → "It describes the motor you plugged in. A Neo is brushless, so you tell the SparkMax that."

EXERCISE: **PenguinBot's hardware inventory.**
*Where we are:* you can trace a signal from code to spin (`frc-roborio-radio-can`). Now name
every piece of hardware that signal touches on the robot you're about to program.

Task: build PenguinBot's hardware table. For each mechanism, list the motor, the controller,
the vendor whose docs you'd read, and how many motors it needs. Use the CAN ID map from
`_shared-conventions.md` §2 (show it to the student — it's the shared robot).

**Reference solution** (`details.reveal`):

| Mechanism | Motor | Controller | Docs | Count | CAN IDs |
|---|---|---|---|---|---|
| Intake roller | Neo | SparkMax | REV | 1 | 2 |
| Arm pivot | Neo | SparkMax | REV | 1 (2 with a follower) | 3 (4) |
| Swerve drive | Kraken | built in | CTRE / Phoenix | 4 | 10–13 |
| Swerve steer | Kraken | built in | CTRE / Phoenix | 4 | 14–17 |
| — | — | RoboRIO | WPILib | — | 0 |
| — | — | PDH | REV | — | 1 |

> Ten motors, two vendors, two manuals. When the arm misbehaves you open REV's docs; when a
> swerve module misbehaves you open CTRE's. Knowing which is half the debugging.

Tease: "Unit 2 is the software you need installed before any of this hardware will answer
you — starting with the app that lets you press Enable."

CHECKPOINT: (4 questions, every option explained)

**Q1.** Which pair is *motor* and *motor controller*?
- a) Neo and Kraken — "Both of those are motors."
- b) ✓ **Neo and SparkMax** — "Right: the Neo is the motor, the SparkMax is its controller."
- c) SparkMax and PDH — "The PDH distributes power; it isn't a motor controller."
- d) Kraken and Neo — "Two motors, from two different vendors."

**Q2.** What's special about a Kraken?
- a) It's brushed — "Krakens are brushless; brushed is the older type."
- b) It doesn't need a CAN ID — "Everything on the bus needs a unique ID."
- c) ✓ **Its motor controller is built in, so CAN runs straight through the motor** — "Yes —
  it collapses two boxes of the signal path into one."
- d) It only works in autonomous — "Motors don't know what mode you're in."

**Q3.** You have a Kraken and you're stuck. Which documentation do you open?
- a) REV — "REV makes the Neo and SparkMax, not the Kraken."
- b) ✓ **CTRE / Phoenix** — "Correct. Kraken is a CTRE product; its library is Phoenix."
- c) WPILib only — "WPILib covers the core framework; vendor devices need vendor docs."
- d) Whichever your friend used — "That's the trap in the hook: hardware decides the manual."

**Q4.** Why does PenguinBot's swerve drivetrain need eight motors?
- a) Redundancy in case one fails — "Nice thought, but no — each one has a distinct job."
- b) ✓ **Each of the four modules has a drive motor and a steering motor** — "Exactly, and
  that's why swerve code is generated rather than hand-written."
- c) Eight is the FRC limit — "There's no such rule; it's the mechanism's design."
- d) To stay under 80 % power — "Adding motors does reduce load per motor, but the count here
  is driven by the module design."

SEASON-FLAGS:
- `callout--season`: vendor class names and import paths move between seasons (`SparkMax` vs
  the older `CANSparkMax` is the live example — the built Unit 4 lesson already flags it).
  Confirm against the season's REV and CTRE docs.
- `[NEEDS RESEARCH: Phoenix 6 class name + import for Kraken X60; whether "Kraken X60" and
  "Kraken X44" both need naming in 2026 — content/research/toolchain-2026.md]`
- The claim "SparkMax is the team's main controller" is a **team fact**, not a universal one —
  phrase it as the team's setup.

WIDGET-REQUEST: **`match-pairs`** — a two-column matching widget (`data-kind="match"`), click
a left item then its right partner, correct pairs lock in green, wrong pairs shake and reset.
Wanted by `frc-motors` (hardware → docs), `frc-vendor-clients` (tool → device), and
`frc-limelight` (TX/TY/ID → what you do with it). **Fallback in all three: a short MCQ set or
a fill-in-the-blank table** — no lesson is blocked if it doesn't ship.
