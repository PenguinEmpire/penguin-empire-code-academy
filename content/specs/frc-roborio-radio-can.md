# frc-roborio-radio-can · RoboRIO, Radio & the CAN Bus
unit: 1 · The Robot's Body   |   duration: 20 min   |   difficulty: Beginner
interactivity: NO-COMPILER (**signal-path diagram** widget — this is its home lesson)

> Read `_shared-conventions.md` first. This lesson owns the signal-path mental model that
> `frc-moving-a-motor` (built) already references — keep the vocabulary identical to the
> `.diagram` block in that page.

INTRODUCES:
- `roborio` — the controller that stores and runs your code
- `imaging-the-rio` — flashing the season's firmware before anything works
- `radio` — the Wi-Fi link between laptop/controller and robot
- `radio-boot-delay` — 1–2 minutes after power-on before you can connect
- `ethernet-tether` — the wired path, radio-independent
- `can-bus` — the twisted-pair loop carrying commands to every controller
- `can-daisy-chain` — one loop, returning to the RIO through the PDH
- `pdh` — Power Distribution Hub: sends power out, sits on the CAN chain
- `signal-path` — RIO → CAN → motor controller → motor → spin

ASSUMES:
- `programmer-role`, `firmware-push-responsibility` (`frc-what-programmers-do`)
- No hardware knowledge whatsoever.

GOAL:
Trace a command from your code to a spinning motor, name every component it passes through,
and predict what fails when any one of them is broken.

HOOK: **One broken CAN wire kills the whole loop** (`_shared-conventions.md` §6 story 3).
`callout--why`. The CAN bus is a *loop*: every device sits on the same pair of wires and the
chain returns to the RIO through the PDH. A single wire pulled loose anywhere on that loop —
one crimp that vibrated apart during a match — and devices past the break stop answering.
The source is blunt about it: **this happens often; expect it.** That's why the first thing
a good programmer does when a motor goes dead is *not* re-read their code.

EXPLAIN:

1. **The RoboRIO is the brain.**
   Analogy: it's the robot's *computer*, and your laptop is where you write the program that
   gets copied onto it. You "push" (deploy) compiled code from VS Code onto the RIO; the RIO
   runs it every 20 ms until the robot is disabled.
   Beat: **every season you image it** — flash it with the new firmware — or it won't work at
   all with the new WPILib.

2. **The radio is the wireless link.**
   Analogy: a Wi-Fi router bolted to the robot. It connects to the RIO over Ethernet. Two
   facts that will actually bite the student:
   - After powering on, the radio takes **1–2 minutes** to come online. New members assume
     the code is broken. It isn't; wait.
   - It must be **imaged at competition** (at the field's setup laptop) and re-imaged at home
     afterwards. Different configuration for field play vs. the shop.
   Beat: when the radio is being uncooperative, **Ethernet tether** — plug the laptop
   straight into the RIO — takes the radio out of the equation entirely. This is the single
   most useful debugging move in Unit 1.

3. **The CAN bus is how one wire pair talks to twenty devices.**
   Analogy: a party line / a single hallway every device's door opens onto. Green and yellow
   twisted pair. The RIO shouts "device 2, run at 70 %" and only device 2 acts, because every
   device has a unique **CAN ID** (Unit 2 gives that its own lesson).
   Beat: it is a **loop**, not a star. Out from the RIO, through every controller, through
   the PDH, back to the RIO. One break, and everything downstream goes quiet.

4. **The PDH does two jobs.** It distributes the red/black power wires *and* it sits on the
   CAN chain. Students routinely think it's "just the fuse box." It is also a CAN device,
   which is why it usually holds a reserved ID.

5. **Put it together: the signal path.** Reuse the exact `.diagram` block from the built
   `frc-moving-a-motor` lesson so the two pages reinforce each other:

```
RoboRIO  →  CAN bus  →  SparkMax  →  Neo motor  →  spin
 (your      (twisted    (motor       (the          (the
  code)      pair wire)  controller)  actual        mechanism
                         addressed    spinning      moves)
                         by CAN ID)   part)
```
   Mark: [FROM PDF page 4, §1.4 lesson note — "the key takeaway for students is the signal
   path"]

6. **Failure table — the payoff of the whole lesson.** Put this as a real table:

| What's broken | What you see |
|---|---|
| RIO not imaged for the season | Code won't deploy, or deploys and won't run |
| Radio still booting | No Communication light; wait 1–2 min |
| Radio not imaged for the field | Can't connect at competition |
| One CAN wire broken | Devices past the break time out (`CAN ID n timed out`) |
| Wrong CAN ID in code | *That one* motor does nothing; others fine |
| Motor unplugged from its controller | Controller answers, motor doesn't move |

   Teach the diagnostic order this table implies: **narrow by scope.** Everything dead →
   RIO/radio/power. One branch dead → CAN break. One device dead → ID or wiring at that
   device. This is the reasoning skill the lesson is actually for.

CODE:
Exactly one, and it isn't robot code — it's the error string students must recognise:
```
ERROR  CAN ID 16 timed out
```
Mark: [FROM PDF page 17, §12.1]. Explain it here at the level of "a device stopped
answering"; `frc-can-ids` owns the full diagnosis and `frc-game-day` owns the competition
version. Do not write Java on this page.

SANDBOX: none — NO-COMPILER lesson.
Interactive load: the **signal-path diagram** widget (plan §6, U1). Its home is this page.

Required behaviour for this lesson's instance:
- Renders the five stages: **RoboRIO → CAN bus → SparkMax (ID 2) → Neo → intake roller**,
  plus the PDH on the loop and the radio hanging off the RIO over Ethernet.
- Clicking a stage shows a one-line "what this does" panel.
- **Break a link** — clicking a wire segment cuts it and the diagram shows the resulting
  symptom text from the failure table above (e.g. cutting the CAN loop after the PDH →
  "`CAN ID 16 timed out` — devices past the break stopped answering").
- A "repair all" reset.
Fallback if the widget slips: the static `.diagram` block above plus the failure table plus
challenge 1 below.

CHALLENGES:

1. **MCQ · diagnose by scope** — "You enable the robot. The intake and the arm both work.
   The two back swerve motors do nothing and the console prints `CAN ID 16 timed out`. Where
   do you look first?"
   - a) The intake code — "The intake works. Nothing in this symptom points at code you can
     see running correctly."
   - b) ✓ **The CAN wiring between the last working device and the dead ones** — "Right. Some
     devices answer and some don't, which is the signature of a break in the loop."
   - c) The laptop's Wi-Fi — "You're connected — you can see console output, so comms are up."
   - d) The battery — "A dead battery takes down everything, not two motors."

2. **Fill-in-the-blank · the signal path** — `data-kind="fib"`, using `.fib` markup with a
   plain-text path rather than code:
   `RoboRIO → [____] → [____] → Neo → spin`
   blanks: `data-answer="CAN bus|CAN|can bus"` and `data-answer="SparkMax|motor controller|spark max"`
   Win: "That's the path every single `motor.set()` call travels."
   Lose: "Between the RIO and the motor there are two things: the wiring that carries the
   message (the CAN bus) and the device that receives it and delivers power (the SparkMax)."

3. **Predict / short answer** — "You power on the robot and immediately try to connect. The
   Driver Station shows no communication. Before you change anything, what should you do?"
   `data-answer="wait|wait 1-2 minutes|wait a minute|wait two minutes|wait for the radio"`
   Win: "Wait. The radio takes 1–2 minutes to boot. More new-member debugging time is lost to
   impatience here than to any actual bug."
   Lose: "Nothing yet — wait. The radio needs 1–2 minutes after power-on before it will
   connect. Only if it's still dead after that do you start looking."

4. **MCQ · the PDH** — "What does the PDH do?"
   - a) Only distributes power — "Half right, and the half people forget is the important one."
   - b) ✓ **Distributes power *and* sits on the CAN chain as a device** — "Yes — which is why
     it holds a reserved CAN ID and why a fault at the PDH can break the loop."
   - c) It's the robot's Wi-Fi — "That's the radio."
   - d) It runs your code — "That's the RoboRIO."

MISCONCEPTIONS:
- *"The CAN bus is like USB — each motor has its own cable to the RIO."*
  → "It's one shared loop, not a star. Every device is on the same pair of wires, which is
  exactly why each one needs a unique ID and why one break takes out everything after it."
- *"No comms means my code is broken."*
  → "Your code isn't even running yet. Communication is the radio/network layer; the Robot
  Code indicator is a separate light."
- *"The radio is optional if I'm plugged in."*
  → "Correct, actually — and that's the tip: tethering by Ethernet bypasses the radio, which
  is how you tell a radio problem from a robot problem."
- *"Imaging the RIO is a one-time setup."*
  → "It's every season. New WPILib, new image."

EXERCISE: **PenguinBot's body map.**
*Where we are:* in `frc-moving-a-motor` you'll write code that calls `motor.set(0.7)` on the
intake. Before that line can do anything, you need to know what it travels through.

Task: hand-draw (or list) the complete path from a line of your code to PenguinBot's intake
roller physically turning. Label every component. Then annotate each arrow with **one thing
that could break there** and **the symptom you'd see**.

**Reference solution** (`details.reveal`):
> **Your laptop** — you write and build the code here.
> ↓ *deploy over Wi-Fi or Ethernet* — breaks if the radio is still booting, or the RIO isn't
> imaged for this season. Symptom: deploy fails, or no Robot Code light.
> **RoboRIO (CAN ID 0)** — stores and runs the code, executing your loop every 20 ms.
> ↓ *CAN bus, green/yellow twisted pair* — breaks if a wire vibrates loose. Symptom:
> `CAN ID n timed out` for everything past the break.
> **PDH (CAN ID 1)** — power out, and a device on the CAN loop.
> ↓ *CAN bus continues, and the loop returns to the RIO*
> **SparkMax, CAN ID 2** — the intake's motor controller. Breaks if the ID in code doesn't
> match the ID set on the device. Symptom: that one motor does nothing, everything else fine.
> ↓ *power wires from the SparkMax*
> **Neo motor** — breaks if the motor lead is unplugged or the motor is fried. Symptom: the
> controller reports fine, nothing spins.
> ↓ *shaft, belt, pulley*
> **Intake roller spins.**

Tease: "Next lesson: the difference between the *motor* and the *motor controller*, and why
which one you have decides which manual you read."

CHECKPOINT: (4 questions, every option explained)

**Q1.** Where does your compiled code actually run?
- a) On the driver-station laptop — "The laptop sends commands and shows the console; the
  code runs on the robot."
- b) ✓ **On the RoboRIO** — "Yes — you push the compiled code onto the RIO and it runs there."
- c) On the SparkMax — "The SparkMax receives instructions; it doesn't run your program."
- d) On the radio — "The radio only carries the network link."

**Q2.** The CAN bus is best described as…
- a) A wireless protocol — "It's wire. The wireless part is the radio."
- b) One cable per motor — "That's a star topology; CAN is shared."
- c) ✓ **A shared twisted-pair loop that every device sits on and that returns to the RIO** —
  "Correct — which is why unique IDs matter and one break is fatal downstream."
- d) The power distribution wiring — "That's the PDH's red/black output; CAN is the green and
  yellow pair."

**Q3.** You power on the robot and there's no communication. Most likely first cause?
- a) A bug in `RobotContainer.java` — "Your code hasn't been reached yet; comms come first."
- b) ✓ **The radio hasn't finished booting (1–2 min)** — "Right — this is the most common
  false alarm on the field and in the shop."
- c) The motors are unplugged — "That would stop motion, not communication."
- d) The wrong CAN ID — "A wrong ID silences one device; you'd still have comms."

**Q4.** Every device on the CAN loop times out at once, and the robot has power. What's the
most likely explanation?
- a) Every motor is fried simultaneously — "Extraordinarily unlikely; look for one cause, not
  twelve."
- b) ✓ **A break very early on the CAN loop, or the RIO itself isn't running** — "Yes — narrow
  by scope: everything dead points upstream, not at individual devices."
- c) You used `set(0.9)` — "Too much power damages a motor over time; it doesn't cause bus
  timeouts."
- d) The dashboard is closed — "Dashboards only display; they don't affect the bus."

SEASON-FLAGS:
- **RoboRIO version.** The source's team used RoboRIO 1 and expected to move to RoboRIO 2.
  `callout--season`: "Which RoboRIO your team runs, and how it's imaged, changes — check
  this season's WPILib and NI documentation." `[NEEDS RESEARCH: current RoboRIO model(s) and
  the 2026 imaging tool/flow — content/research/toolchain-2026.md]`
- **The radio.** `[NEEDS RESEARCH: the FRC-legal radio for 2026 and how it is configured at
  the field — the source predates any recent radio change. Do not name a model in the lesson
  until the factsheet lands; write "the team's radio" and flag it.]` Wrap in
  `callout--season`.
- Reserved CAN IDs (0 for RIO, 1 for PDH) are a **practical convention**, not a law — say so,
  and defer the full treatment to `frc-can-ids`.

WIDGET-REQUEST: none new — uses the **signal-path diagram** already scoped in plan §6 for
Unit 1. Required behaviours listed under SANDBOX above; static fallback specified.
