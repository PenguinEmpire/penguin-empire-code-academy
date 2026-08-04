# frc-swerve-generators · CTRE Generator vs. YAGSL
unit: 9 · Driving   |   duration: 20 min   |   difficulty: Advanced
interactivity: NO-COMPILER (decision-tree MCQs + drag-to-order the setup + fill-in-blank)

> Read `_shared-conventions.md` first. **Check `content/research/swerve.md` before finalising.**
> If that factsheet isn't there yet, every API name on this page stays inside a
> `[NEEDS RESEARCH]` marker and out of code blocks. This is the lesson most exposed to invented
> APIs — be disciplined.

INTRODUCES:
- `ctre-swerve-generator` — Phoenix Tuner's generator; fast, CTRE-hardware-only
- `yagsl` — Yet Another Generic Swerve Library; cross-vendor, harder to set up
- `generated-code` — code you configure rather than write
- `robot-physical-constants` — dimensions, mass, moment of inertia, centre of mass
- `hardware-dependency` — the tool you can use is decided by the motors you own

ASSUMES:
- `swerve-module`, `field-centric`, `gyro-heading`, `module-count` (`frc-swerve-concept`)
- `kraken`, `vendor-docs-matching` (`frc-motors`); `phoenix-tuner` (`frc-vendor-clients`)
- `vendor-library`, `vendordeps-json` (`frc-vendordeps`)
- `subsystembase` (`frc-subsystems`); `constants-file-pattern` (`frc-constants`)

GOAL:
Choose the right swerve code generator for a team's hardware, and describe what you have to
supply it before it can produce anything.

HOOK: **Eight Krakens or bust** (`_shared-conventions.md` §6 — PDF page 15, §9.2). `callout--why`.
The CTRE Swerve Generator is, by the source's account, **fast and easy**. You feed it your robot's
dimensions and centre of mass, and it writes the swerve code for you to import. Done in an
afternoon.

There's one condition: **it requires eight Kraken/CTRE motors.** Not "works best with." Requires.

So the decision isn't really a software decision at all. It was made months earlier, when someone
ordered motors. If your drivetrain is CTRE, take the easy path. If it's mixed, or REV, you need
**YAGSL** — which works across brands and is, again by the source's account, **harder to set up**.

That's the honest shape of a lot of FRC engineering: the best tool is the one your hardware
allows, and your hardware was chosen before you got here.

EXPLAIN:

1. **Why generate at all?** Recall from `frc-swerve-concept`: four modules, each needing an angle
   and a speed derived from three inputs (x, y, rotation) and the gyro heading, with wheel angles
   optimised so a module turns 90° rather than 270°, plus odometry, plus per-module closed-loop
   control on both motors. It's a lot of correct trigonometry, and every team needs the same
   trigonometry.
   Analogy: nobody writes their own JSON parser. Not because they couldn't — because it's solved,
   and yours would be worse.
   Mark: [FROM PDF page 15, §9.2 — "swerve involves heavy trig, so teams use a code generator"]

2. **The two options.** Table, straight from the source and expanded only where the source
   supports it:

| | **CTRE Swerve Generator** | **YAGSL** |
|---|---|---|
| Lives in | Phoenix Tuner | a vendor library you install |
| Hardware | **Requires CTRE** — 8 Kraken/CTRE motors | **Cross-brand** — works with what you have |
| Setup | Fast and easy | Harder |
| You supply | robot dimensions, centre of mass | configuration files describing the modules |
| Output | code you import into your project | a library you configure and call |
| Choose it when | your drivetrain is all CTRE | mixed or non-CTRE hardware |

   Mark: [FROM PDF page 15, §9.2]
   `[NEEDS RESEARCH: current names, versions and workflows for both — is the CTRE tool still
   inside Phoenix Tuner X in 2026? What is YAGSL's current configuration format (JSON files)? —
   content/research/swerve.md]`

3. **What the generator actually needs from you.** This is the most transferable part of the
   lesson, because it's true of both tools and of PathPlanner in Unit 11:
   - **Physical dimensions** — the distance between wheel centres, front-to-back and side-to-side.
     The kinematics maths is *entirely* about the geometry of where the wheels are.
   - **Mass and moment of inertia** — how heavy it is and how hard it is to spin.
   - **Centre of mass** — where the weight actually sits.
   - **Gear ratios and wheel diameter** — to convert motor rotations into metres travelled. Exactly
     the conversion-factor problem from `frc-encoders`, at drivetrain scale.
   - **CAN IDs and encoder offsets** for all eight motors and four steering encoders.
   Mark: [FROM PDF page 15 and page 17 — "it uses robot constants (weight, moment of inertia,
   dimensions)"]
   Beat worth its own callout: **measurements are inputs to correctness.** A generator fed the
   wrong wheelbase produces code that compiles, runs, and drives slightly wrong forever. There is
   no error message for a mistyped dimension. Get a tape measure and have someone check it.

4. **Encoder offsets — the one setup step that always bites.** Each steering module's absolute
   encoder reads *some* angle when the wheel points straight forward, and it's never zero. Setup
   involves physically aligning all four wheels forward and recording each encoder's reading as
   its offset.
   Get one offset wrong and that module fights the other three: the robot drives crabwise, or
   spins when asked to go straight. Recognising *that symptom* is the useful takeaway.
   `[NEEDS RESEARCH: the current procedure and API for setting steering encoder offsets in both
   CTRE's generator and YAGSL — content/research/swerve.md]`

5. **What "generated code" means for you.** Set expectations honestly:
   - You will have a `DriveSubsystem` (or the generator's equivalent) that you **did not write**.
   - You will still write commands that *use* it, exactly like every other subsystem.
   - You should **not** hand-edit generated files — regenerate instead, or your changes vanish the
     next time someone does.
   - It's still a subsystem: it registers with the scheduler, has a `periodic()`, and is required
     by commands. Everything from Unit 7 applies unchanged.
   Beat: this is why Unit 9 comes *after* Unit 7. A student who understands subsystems can use a
   generated one immediately. A student who doesn't has an opaque black box.

6. **What you'll actually call.** In prose, not code, until the factsheet lands: the drive
   subsystem exposes something equivalent to *"translate at this speed in this direction while
   rotating at this rate, field-centric"* — the three numbers from the two sticks. Your teleop
   binding reads the sticks, applies a deadband, and passes them in.
   `[NEEDS RESEARCH: the actual drive-request API for CTRE's generated swerve (SwerveRequest
   types?) and for YAGSL (a drive(Translation2d, double, boolean) style call?) —
   content/research/swerve.md. NO code sample until cited.]`

CODE: **none until `content/research/swerve.md` lands.**
Explicit instruction to the author: if the factsheet is unavailable at authoring time, ship this
lesson with **zero Java** and a `callout--note` saying the team's own generated drive code is the
reference to read, plus links to the CTRE and YAGSL docs. A lesson with no code is fine. A lesson
with invented code fails the Verifier and teaches a false API.
If the factsheet **is** available, add at most **two** short cited samples: (a) constructing or
obtaining the generated drive subsystem, (b) a teleop drive binding reading the two sticks. Each
inside a `callout--verified` naming its citation, and inside a `callout--season`.

SANDBOX: none — NO-COMPILER lesson. Nothing here can run without vendor libraries and eight
motors, and the honest deliverable is a decision, not a program.

Interactive load: the decision-tree challenges below, plus a reprise of the **field-centric swerve
toy** from `frc-swerve-concept` in "wrong encoder offset" mode — one module misaligned, so the
student can see the crabwise symptom from beat 4.
*Fallback:* a static before/after diagram of one misaligned module.

CHALLENGES:

1. **MCQ · pick the generator** — "Your drivetrain has eight Kraken motors. Which tool?"
   - a) YAGSL — "It would work, but you'd be choosing the harder setup for no reason."
   - b) ✓ **The CTRE Swerve Generator** — "Right — all-CTRE hardware is exactly its requirement,
     and it's the fast path."
   - c) Write it by hand — "Heavy trigonometry that's already solved correctly elsewhere."
   - d) Either; they're identical — "They differ in hardware requirements and in setup effort."

2. **MCQ · pick the generator** — "Your drivetrain has four Krakens for drive and four REV motors
   for steering. Which tool?"
   - a) The CTRE Swerve Generator — "It requires CTRE motors throughout. Half your drivetrain
     isn't."
   - b) ✓ **YAGSL** — "Correct — cross-brand support is the whole reason it exists."
   - c) Two generators, one per half — "They'd each own the same drivetrain. Not workable."
   - d) Swap the REV motors out — "Sometimes the right *hardware* answer, but it isn't the
     software answer to the question asked."

3. **Drag-to-order · setting up generated swerve.** Items (shuffled): *Measure the robot's
   wheelbase and track width* · *Set and record CAN IDs for all eight motors* · *Physically align
   all four wheels forward and record the steering encoder offsets* · *Feed the dimensions and
   mass into the generator* · *Import the generated code into the project* · *Drive slowly and
   check that forward is forward*.
   **Answer key:** that order.
   Win: "Measure, address, align, generate, import, and *then* test slowly. Every step before the
   last one is an input to correctness."
   Lose: "Physical facts first — dimensions, CAN IDs, encoder offsets — because the generator can
   only be as right as what you tell it. Then generate, import, and test at low speed."
   *Fallback: MCQ over three orderings.*

4. **MCQ · the symptom** — "Your generated swerve is installed. Asked to drive straight forward,
   the robot drifts sideways and one wheel is audibly fighting. Most likely cause?"
   - a) The gyro is zeroed wrong — "That would rotate *all* motion consistently, not make one
     wheel fight."
   - b) ✓ **One module's steering encoder offset is wrong, so that wheel points differently from
     the other three** — "Exactly, and 'one wheel fighting three' is the signature."
   - c) `kP` is too high — "That would cause oscillation, not a consistent drift."
   - d) A CAN wire is broken — "Then that module would time out and stop entirely, not fight."

5. **Fill-in-the-blank** — `data-kind="fib"`:
   `The CTRE generator requires ` blank(`data-answer="8|eight"`) ` ` blank(`data-answer="Kraken|CTRE|Kraken/CTRE|CTRE motors"`)
   ` motors. ` blank(`data-answer="YAGSL|yagsl"`) ` works across brands but is harder to set up.`
   Win: "Hardware decides the tool. That's the whole decision."
   Lose: "The CTRE generator needs eight Kraken/CTRE motors. YAGSL is the cross-brand option, at
   the cost of a harder setup."

MISCONCEPTIONS:
- *"Using a generator means I don't understand swerve."*
  → "You need to understand field-centric behaviour, module geometry, and encoder offsets to
  configure one at all. What you're skipping is retyping solved trigonometry."
- *"I can use the CTRE generator with REV motors."*
  → "It requires CTRE hardware. That's YAGSL's job."
- *"The generator figures out the robot's dimensions."*
  → "You measure them and type them in. A wrong number produces code that compiles and drives
  wrong forever, with no error."
- *"I can edit the generated file to fix something."*
  → "Regenerate instead. Hand edits disappear the next time anyone regenerates, usually at the
  worst moment."
- *"Generated swerve isn't a real subsystem."*
  → "It is one. It registers with the scheduler, has a `periodic()`, and is required by commands —
  everything from Unit 7 applies."
- *"Encoder offsets are a one-time thing."*
  → "Re-check after any mechanical work on a module. A module that's been apart is a module whose
  offset you no longer know."

EXERCISE: **PenguinBot's drivetrain decision.**
*Where we are:* PenguinBot's CAN map reserves IDs 10–17 for eight swerve motors
(`frc-swerve-concept`). Nothing has been generated yet.

Task — write the decision document a team would actually produce:
1. State PenguinBot's drivetrain hardware (eight Krakens, per the conventions CAN map) and the
   generator that follows from it. Justify it in one sentence.
2. List every measurement and value you'd need to collect before running the generator, with who
   on the team you'd get each from.
3. Write the encoder-offset procedure as numbered steps someone else could follow.
4. Write the first-drive test plan: what you check, in what order, at what speed.
5. State what would change in your answer if half the drivetrain were REV.

**Reference solution** (`details.reveal`):
> **1.** PenguinBot runs eight Krakens (drive 10–13, steer 14–17). All-CTRE, so the **CTRE Swerve
> Generator** in Phoenix Tuner: it's the fast path and our hardware meets its requirement exactly.
>
> **2. What to collect**
>
> | Value | From |
> |---|---|
> | Track width and wheelbase (wheel-centre to wheel-centre) | Mechanical — measured, then checked by a second person |
> | Robot mass, with battery and bumpers | Mechanical — weighed, not estimated |
> | Centre of mass | Mechanical / CAD |
> | Drive gear ratio and wheel diameter | Mechanical / the module's spec sheet |
> | CAN IDs for all 8 motors and 4 steering encoders | Ours — set in Phoenix Tuner, from the CAN map |
> | Steering encoder offsets | Ours — measured during setup |
>
> **3. Encoder-offset procedure**
> 1. Put the robot on blocks so the wheels turn freely.
> 2. Rotate all four wheels by hand until they point **straight forward** and are parallel. Use a
>    straight edge across each pair — eyeballing it is not good enough.
> 3. In the vendor client, read and write down each steering encoder's current reading.
> 4. Enter those four readings as the module offsets in the generator's configuration.
> 5. Regenerate, deploy, and re-check: commanded to zero, all four wheels should return to
>    straight-forward.
>
> **4. First-drive test plan** — on blocks first, then on the floor, slowly.
> 1. On blocks: enable, no stick input. Nothing should move. If a module creeps, its offset or its
>    closed loop is wrong.
> 2. On blocks: push the stick forward. All four wheels should point forward and spin the same way.
> 3. On blocks: right stick only. Wheels should splay tangentially and spin to rotate the robot.
> 4. On the floor, low speed: push forward with the robot facing the driver. It should move away
>    in a straight line.
> 5. **Rotate the robot 90° by hand, re-zero nothing, push forward again.** Field-centric means it
>    should still travel the same direction across the field. If it doesn't, the gyro or the
>    field-centric flag is wrong.
> 6. Only then, raise the speed.
>
> **5. If half were REV:** the CTRE generator is unavailable — it requires CTRE hardware
> throughout — so it would be **YAGSL**, and we'd budget significantly more setup time. The
> physical measurements and the encoder-offset procedure are identical either way, because those
> are facts about the robot, not about the software.

Tease: "PenguinBot can now move across the field. It still has no idea *where* it is. Unit 10:
seeing."

CHECKPOINT: (4 questions, every option explained)

**Q1.** What's the CTRE Swerve Generator's hard requirement?
- a) A specific RoboRIO version — "Not the stated constraint."
- b) ✓ **Eight Kraken/CTRE motors** — "Yes — hardware decides whether this tool is available at
  all."
- c) A Limelight — "Vision is unrelated to drivetrain generation."
- d) PathPlanner installed — "PathPlanner is Unit 11 and separate."

**Q2.** What does YAGSL give you that the CTRE generator doesn't?
- a) Better performance — "Not the stated trade-off."
- b) ✓ **Cross-brand hardware support** — "Right, at the cost of a harder setup."
- c) Field-centric control — "Both provide that; it's a property of swerve, not the tool."
- d) Automatic PID tuning — "Neither claims that."

**Q3.** Why does the generator need your robot's dimensions?
- a) For the dashboard display — "Display is incidental."
- b) ✓ **Swerve kinematics is entirely about where the wheels are relative to the centre** —
  "Exactly, and a wrong number produces code that drives wrong with no error."
- c) To check it's legal — "Inspection is a separate process."
- d) It doesn't; it measures them itself — "It has no way to measure anything."

**Q4.** The robot drifts sideways when asked to drive straight, and one wheel is fighting. First
suspicion?
- a) The gyro zero — "That rotates all motion together; it doesn't make one wheel disagree."
- b) ✓ **A wrong steering encoder offset on one module** — "Correct — one module pointing
  differently from the other three is exactly this symptom."
- c) A broken CAN wire — "That module would time out and stop, not fight."
- d) The wrong generator — "The wrong generator wouldn't have produced working code at all."

SEASON-FLAGS: **Heavy. This is one of the two most volatile lessons in the track.**
- `callout--season` on both tool names, both workflows, the configuration formats, and anything
  version-numbered.
- `[NEEDS RESEARCH: CTRE swerve generator's current name/location and whether Phoenix Tuner X is
  still the host; YAGSL's current version and configuration format; both tools' drive-request
  APIs; steering encoder offset procedures — content/research/swerve.md]`
- `[NEEDS RESEARCH: whether CTRE's swerve features require a licence/activation in 2026]`
- The **decision criterion** (hardware decides the tool) and the **inputs the generator needs**
  are stable and safe to teach without flags.

WIDGET-REQUEST: none new. Reuses the field-centric swerve toy from `frc-swerve-concept` with a
"misaligned module" mode; static diagram fallback specified.
