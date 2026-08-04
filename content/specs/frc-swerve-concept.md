# frc-swerve-concept · Field-Centric Swerve
unit: 9 · Driving   |   duration: 25 min   |   difficulty: Advanced
interactivity: NO-COMPILER (**field-centric swerve toy** widget — this is its home lesson)

> Read `_shared-conventions.md` first. Swerve internals are **not** in either source PDF beyond
> the concept, so anything beyond field-centric behaviour comes from `content/research/swerve.md`
> with a citation, or it doesn't go in.

INTRODUCES:
- `swerve-module` — a wheel with its own drive motor and its own steering motor
- `field-centric` — stick direction = field direction, regardless of robot heading
- `robot-centric` — stick direction = robot-relative direction
- `translation-vs-rotation` — the left stick moves, the right stick spins
- `gyro-heading` — the sensor that makes field-centric possible
- `module-count` — 4 modules, 8 motors

ASSUMES:
- `motor-vs-motor-controller`, `kraken`, `motor-count-per-mechanism` (`frc-motors`)
- `can-id`, `id-convention` (`frc-can-ids`)
- `subsystembase` (`frc-subsystems`); `axis-reading`, `deadband` (`frc-controllers`)
- `absolute-encoder` (`frc-relative-absolute`)

GOAL:
Explain what field-centric control means and predict how a swerve robot moves for a given stick
input and robot heading.

HOOK: **Swerve is not a video game** (`_shared-conventions.md` §6 story — PDF page 15, §9.1).
`callout--why`.
Every new driver arrives with an instinct from games: push the stick forward, the vehicle goes
*the way it's pointing*. Turn, and forward becomes a new direction.

Swerve doesn't work like that, and the source is emphatic: **swerve is field-centric, not
game-like.** Push the left stick forward and the robot moves toward the far side of the field —
**regardless of which way the robot is facing.** Spin the robot 180° with the right stick and
push forward again: it still goes toward the far side of the field. The robot's *body* rotated;
its *sense of forward* did not.

Once that clicks it feels obvious, because it matches how the driver actually sees the field —
from behind the glass, looking at a map. The stick points where you want the robot to go on that
map. Nothing about the robot's orientation enters into it.

Until it clicks, drivers crash. Which is why this lesson has a toy in it and not a code sample.

EXPLAIN:

1. **What a swerve module is.** Each corner of the robot has a module: **one motor drives the
   wheel, one motor steers it.** Four modules = **eight motors**, plus an encoder per module to
   know which way each wheel is pointing.
   Mark: [FROM PDF page 15, §9.2]
   Analogy: a shopping trolley caster that you can *aim* rather than just letting it flop.
   Beat: because a wheel can be pointed *anywhere* on boot and there's no hard stop to home
   against, steering uses an **absolute encoder** — the exact case from
   `frc-relative-absolute`. Collect that; it's the most satisfying callback in the unit.

2. **What swerve buys you.** A tank drivetrain can drive forward and turn. A swerve can
   **translate in any direction while simultaneously rotating**. Strafe sideways while spinning to
   face the goal. Approach a scoring position from any angle without a three-point turn.
   Analogy: tank drive is a car; swerve is a helicopter that happens to be on the ground.

3. **Field-centric, precisely.** Two frames of reference, one table:

| | **Robot-centric** | **Field-centric** |
|---|---|---|
| Stick forward means | forward *for the robot* | toward the far end of the *field* |
| Turning the robot | changes what "forward" does | changes nothing about what "forward" does |
| Driver has to | track the robot's heading in their head | just point at where they want it to go |
| Used for | fine alignment, some autonomous | almost all teleop driving |

   The source's own phrasing, worth quoting: *whatever direction you push on the stick is the
   direction the robot translates on the field* — think **top-down map view**.

4. **The right stick rotates, and it's independent.** Per the source: the right stick rotates the
   robot left/right **without changing its translation direction**. So the robot can drive
   north-east across the field while continuously spinning to keep its intake pointed at a game
   piece. This decoupling is the thing that makes swerve worth its complexity.

5. **How the robot knows which way "field forward" is: the gyro.**
   The maths only works if the robot knows its heading. A gyro measures it. Two consequences that
   are entirely practical and cause real problems:
   - **The gyro must be zeroed with the robot facing a known direction**, usually at the start of
     a match. Zero it while the robot is facing sideways and every subsequent stick input is
     rotated by 90°. This is the *same* class of bug as an unhomed relative encoder in Unit 5 —
     make that connection explicitly.
   - Teams provide a **re-zero button** so a driver can reset "forward" mid-match if the heading
     drifts or the robot is picked up.
   `[NEEDS RESEARCH: what gyro/IMU is typical in 2026 (Pigeon 2? navX? the built-in RIO IMU?) and
   the current API for reading heading and zeroing it — content/research/swerve.md. Name no device
   and show no code until the factsheet lands.]`

6. **The mental model for a single stick push.** Walk it through, because this is what the widget
   will show:
```
Driver pushes the left stick up-and-right (north-east on the field map).
The robot is currently facing WEST.
  -> the code subtracts the robot's heading from the stick's field direction
  -> it works out that "north-east on the field" is "back-and-right" for THIS robot
  -> each of the 4 modules is told an angle and a speed
  -> all four wheels rotate to point north-east, and drive
The robot slides north-east. It is still facing west the whole time.
```
   That last line is the whole lesson. Say it in bold.

7. **You will not write this maths.** Set expectations honestly, and let the next lesson carry it:
   swerve kinematics involves real trigonometry per module, and teams use a **generator** to
   produce the code. The point of *this* lesson is understanding the behaviour. The point of the
   next is knowing which generator matches your hardware.
   Mark: [FROM PDF page 15, §9.2 lesson note — "students rarely write swerve from scratch"]

CODE: **none.** Deliberate, and worth stating in the lesson: there is no verified swerve API in
either source, and the code you'd eventually write is generated. Showing an invented
`drive(x, y, rot)` signature here would be exactly the kind of made-up API this course forbids.
`frc-swerve-generators` shows what the generator produces, with citations.

SANDBOX: none — NO-COMPILER lesson.

Interactive load: the **field-centric swerve toy** (plan §6, U9 — this is its home).
Required behaviours:
- A top-down field with the robot drawn as an arrow (heading visible).
- Drag a vector for the left stick; a slider or drag for the right stick's rotation.
- A **toggle: field-centric / robot-centric.** Same input, two different results — this
  comparison *is* the teaching.
- The robot's heading is independently adjustable, so the student can set it to west and then push
  the stick north and watch the robot slide sideways while still facing west.
- Draw the four module wheel angles on the robot so the student sees all four rotate together for
  pure translation, and splay for pure rotation.
- A "gyro zeroed facing the wrong way" mode: offset field-forward by 90° and let them feel the
  bug from beat 5.
*Fallback:* three static annotated diagrams — (a) robot facing north, stick north; (b) robot
facing west, stick north, field-centric; (c) the same, robot-centric — plus challenges 1 and 2,
which already carry the concept.

CHALLENGES:

1. **MCQ · the core behaviour** — "The robot is facing **west**. The driver pushes the left stick
   straight **up** (north). Field-centric is on. What does the robot do?"
   - a) Drives west, the way it's facing — "That's robot-centric behaviour."
   - b) ✓ **Slides north, still facing west** — "Exactly. Field-centric means the stick points at
     the field, not at the robot."
   - c) Turns to face north, then drives — "It never needs to turn to translate; that's the point
     of swerve."
   - d) Nothing until you rotate first — "No rotation is needed."

2. **MCQ · robot-centric** — "Same setup, but field-centric is **off**. What does the robot do?"
   - a) Slides north — "That's field-centric."
   - b) ✓ **Drives west, the way it's facing** — "Right — robot-centric means the stick is
     relative to the robot's own nose."
   - c) Spins — "The left stick translates; the right stick rotates."
   - d) Nothing — "It drives, just in a different direction than you might expect."

3. **Predict / short answer** — "PenguinBot's swerve has 4 modules. Each has a drive motor and a
   steering motor. How many CAN IDs do the drivetrain motors need?"
   `data-answer="8|eight"`
   Win: "Eight — IDs 10–13 for drive and 14–17 for steering on PenguinBot's map. Which is why the
   ID scheme from Unit 2 earns its keep."
   Lose: "Eight. Four modules × two motors. And with a grouped ID scheme, `CAN ID 16 timed out`
   immediately reads as 'back-left steering'."

4. **MCQ · the gyro bug** — "A driver zeroes the gyro while the robot is facing **sideways** on the
   field. What happens when they push the stick forward?"
   - a) Nothing; the gyro doesn't affect translation — "Field-centric translation is entirely
     built on the heading."
   - b) ✓ **The robot moves 90° off from where they intended, consistently** — "Right, and it's
     consistent, which makes it feel like the driver's fault rather than a setup bug."
   - c) The robot spins — "The heading offset rotates translation; it doesn't add rotation."
   - d) The modules break — "Nothing breaks; it just goes the wrong way."

5. **MCQ · why the absolute encoder** — "Why do swerve steering motors use absolute encoders?"
   - a) They're more accurate — "Accuracy isn't the deciding factor."
   - b) ✓ **A wheel can be pointing any direction at power-on and there's no hard stop to home
     against** — "Exactly the decision rule from Unit 5, applied to real hardware."
   - c) They're required for CAN — "Nothing about CAN requires them."
   - d) Relative encoders don't work on Krakens — "They do; the mechanism is what decides."

MISCONCEPTIONS:
- *"Field-centric means the robot always faces forward."*
  → "The robot can face any direction it likes. Field-centric is about which way it *translates*,
  not which way it points."
- *"You have to turn the robot before you can drive that way."*
  → "That's a car. A swerve translates in any direction instantly, without changing its heading."
- *"The right stick changes the direction of travel."*
  → "It rotates the robot's body. Translation direction is unaffected — that decoupling is the
  whole reason swerve is worth the complexity."
- *"Swerve is just four independently driven wheels."*
  → "Each wheel is also *steered* by its own motor. Eight motors, not four."
- *"Once the gyro is set up, it's fine."*
  → "It has to be zeroed facing a known direction, and drivers need a re-zero button. It's the
  same 'what does zero mean?' problem as a relative encoder."
- *"I'll write the swerve maths myself."*
  → "Almost nobody does. The next lesson is about which generator to use."

EXERCISE: **PenguinBot learns to drive (on paper).**
*Where we are:* PenguinBot can score from one button press (`frc-command-groups`) and cannot move
across the field. Before you generate a drivetrain, be able to predict what it will do.

Task:
1. Draw the field top-down with PenguinBot facing **east**, halfway down one side.
2. For each of these inputs, draw where the robot goes and which way it's facing afterwards.
   Assume field-centric with the gyro correctly zeroed:
   a. Left stick fully north.
   b. Left stick fully north **and** right stick left (rotate).
   c. Left stick north-west.
   d. Right stick only.
3. Redo (a) with **robot-centric** on.
4. Redo (a) with the gyro zeroed 90° wrong.
5. Write the drivetrain's entry in PenguinBot's CAN map — all eight motors, grouped so an error
   message identifies a location.

**Reference solution** (`details.reveal`):
> a. Robot **slides north**, still facing **east**. Its body never rotates.
> b. Robot **travels north** while **spinning anticlockwise**. Its path is a straight line north;
>    its heading changes continuously. Both at once — this is what a tank drive cannot do.
> c. Robot **slides north-west**, still facing east. All four wheels point north-west.
> d. Robot **spins in place**, does not translate. The four wheels splay tangentially.
> **3. Robot-centric:** the robot drives **east** — the way it's facing — because the stick is now
> interpreted relative to the robot's nose.
> **4. Gyro 90° wrong:** the robot goes **east** (or west, depending on the sign of the error)
> when the driver asked for north. Every input is rotated by the same offset — consistently, which
> is exactly what makes it feel like a driving problem rather than a setup problem.
>
> **5. Drivetrain CAN map:**
>
> | CAN ID | Module | Motor |
> |---|---|---|
> | 10 / 11 / 12 / 13 | FL / FR / BL / BR | **drive** |
> | 14 / 15 / 16 / 17 | FL / FR / BL / BR | **steer** |
>
> Grouped this way, `CAN ID 16 timed out` reads instantly as *back-left steering* — no map, no
> asking. That's the whole payoff of the scheme from Unit 2, and you'll be very glad of it in
> Unit 12.

Tease: "You know what a swerve does. Next: how the code that does it gets written — because it
almost certainly isn't by you."

CHECKPOINT: (5 questions, every option explained)

**Q1.** How many motors does a four-module swerve drivetrain have?
- a) 4 — "One per module would only drive, never steer."
- b) ✓ **8** — "One drive and one steer per module."
- c) 2 — "That's a simple tank drive."
- d) 16 — "Two per module, not four."

**Q2.** Field-centric means…
- a) The robot always faces the far end — "It can face anywhere."
- b) ✓ **The stick's direction is a direction on the field, regardless of the robot's heading** —
  "Yes — the driver points at the map, not at the robot."
- c) The robot drives itself — "That's autonomous."
- d) Rotation is disabled — "The right stick rotates freely and independently."

**Q3.** The right stick does what?
- a) Changes the direction of travel — "That's the left stick."
- b) ✓ **Rotates the robot without changing its translation direction** — "Right, and that
  independence is swerve's main advantage."
- c) Selects field- or robot-centric — "That's a toggle or a button, not the stick."
- d) Controls speed — "Speed is the magnitude of the left stick."

**Q4.** Why does field-centric control need a gyro?
- a) To measure speed — "Encoders do that."
- b) ✓ **To know the robot's heading, so a field direction can be converted into robot-relative
  wheel angles** — "Exactly — no heading, no field-centric."
- c) To detect collisions — "Not what it's for here."
- d) It doesn't; it's optional — "Without a heading there is no field frame to work in."

**Q5.** Why isn't there any code in this lesson?
- a) Swerve doesn't need code — "It needs a great deal of it."
- b) It's too advanced — "The concept is right here; the code is the easy part to acquire."
- c) ✓ **Swerve code is produced by a generator, and neither source verifies a swerve API — so
  showing one would be inventing it** — "Correct, and that's the course's rule: no invented APIs."
- d) It's covered in Unit 11 — "Unit 11 is autonomous; the next lesson covers generators."

SEASON-FLAGS:
- `callout--season` on anything hardware-specific: the gyro/IMU model, module vendors, and the
  number of modules a team runs.
- `[NEEDS RESEARCH: typical 2026 FRC gyro/IMU and its heading + zeroing API —
  content/research/swerve.md]`
- The **concept** of field-centric control is stable and needs no flag.

WIDGET-REQUEST: none new — the **field-centric swerve toy** is already scoped in plan §6 for
Unit 9. Required behaviours listed under SANDBOX above; static three-diagram fallback specified.
Of all the widgets in this track, this one changes the most: field-centric is genuinely hard to
explain in prose and instant to understand when you can drag a vector. Prioritise it.
