# frc-vendor-clients · REV & CTRE Hardware Clients
unit: 2 · The Toolchain   |   duration: 20 min   |   difficulty: Beginner
interactivity: NO-COMPILER (**match-pairs** widget + drag-to-order the isolation procedure + MCQ)

> Read `_shared-conventions.md` first.

INTRODUCES:
- `rev-hardware-client` — talk to Neos and SparkMaxes over **USB-C**
- `phoenix-tuner` — talk to Krakens **over the radio**
- `firmware-update` — pushing new firmware to a motor controller
- `set-can-id-tool` — where CAN IDs are actually assigned (the *tool*, not the code)
- `sticky-fault` — a fault that happened at some point, not necessarily now
- `apply-test-voltage` — spinning a motor with no robot code at all
- `isolate-code-wiring-build` — the three-way split that ends most debugging arguments

ASSUMES:
- `sparkmax`, `neo`, `kraken`, `vendor-docs-matching` (`frc-motors`)
- `can-bus`, `radio` (`frc-roborio-radio-can`)
- `revlib`, `phoenix-lib` (`frc-vendordeps`)

GOAL:
Use a vendor hardware client to prove whether a dead mechanism is a code problem, a wiring
problem, or a build problem — before writing a line of code.

HOOK: **Apply a test voltage** (`_shared-conventions.md` §6 story 7, plus the diagnostic half
of story 1). `callout--why`.
The team once lost **two full days** to a motor that had stopped running. The cause turned out
to be a value set far too high — but the two days went into *not knowing where to look*. Code?
Wiring? The mechanism itself?

The REV Hardware Client answers that question in about fifteen seconds. Plug a USB-C cable
into the SparkMax, press **apply voltage**, and watch. If it spins: your wiring and your motor
are fine, and the problem is in your code. If it doesn't: stop reading your code — it was
never the code.

This is the most valuable habit in Unit 2. Teach it as **isolation**: cut the system in half
and find out which half is broken.

EXPLAIN:

1. **Two clients, because two vendors.** Direct sequel to `frc-motors`. Table:

| | **REV Hardware Client** | **CTRE Phoenix Tuner** |
|---|---|---|
| Talks to | Neos, SparkMaxes | Krakens, CTRE devices |
| Connects over | **USB-C** to the device | **the radio** (over the robot's network) |
| Update firmware | yes | yes |
| Set CAN IDs | yes | yes |
| Name / list devices | yes | yes — list and name every motor |
| Check sticky faults | yes | yes |
| Spin a motor with no code | yes ("apply voltage") | yes |

   Mark: [FROM PDF page 5, §2.3]
   Analogy: these are the diagnostic ports on a car. The engine computer doesn't have to be
   running for a mechanic to interrogate a component directly.
   Beat: the **connection difference is not trivia**. USB-C means you can talk to a SparkMax on
   a bench with no robot, no RIO, and no radio. Over-the-radio means the robot has to be
   powered and connected. Two different debugging situations.

2. **Firmware — yes, that's your job.** Callback to `frc-what-programmers-do`: programmers push
   firmware. Devices running mismatched firmware behave strangely, and "update the firmware"
   is a legitimate early step when a device is acting oddly. Keep this short; it's a fact, not
   a skill.

3. **CAN IDs are set here, in the tool — not in code.** Critical framing that
   `frc-can-ids` (next lesson) will build on. Your code *says which ID it wants to talk to*;
   the vendor client is where the device is *told what its ID is*. If those two numbers
   disagree, nothing happens and nothing warns you at compile time.
   Analogy: your code dials a phone number. The client is where you assign phone numbers.
   Dialling a number nobody has just rings out.

4. **Sticky faults — the concept students always mangle.**
   Definition, precisely: a **sticky fault is a record that a fault occurred at some point**.
   It is *not* a statement that anything is wrong right now. It persists until you clear it.
   Analogy: a check-engine light that stays on after you fix the car — informative history,
   not a current diagnosis.
   The rule from the source: **clear sticky faults once you've fixed the real problem.** Then
   if one comes back, you know it just happened. A fault list you never clear is useless.
   Mark: [FROM PDF page 5, §2.3]

5. **The isolation procedure — the actual deliverable of this lesson.** Present as a numbered
   procedure, and reuse it in `frc-game-day`:
   1. **Does the mechanism move by hand?** No → it's a **build** problem (jammed, seized,
      bound up). Stop.
   2. **Does the motor spin under "apply voltage" from the client?** No → it's a **wiring or
      hardware** problem (power lead, blown controller, dead motor). Stop.
   3. **Does the client see the device on the bus at the ID you expect?** No → **CAN wiring or
      the ID**. Stop.
   4. Only now: it's a **code** problem. Now read your code — and check the console.
   Each step is cheap and each one eliminates a whole category. Two days become ten minutes.

6. **Where this fits with the Driver Station.** The DS tells you about the *system*
   (comms/code/joystick). The vendor client tells you about *one device*. Different scopes,
   both needed. Name the pairing explicitly so students build a mental toolbox.

CODE: none. Deliberate — this entire lesson is about the things you do **without** code, and
that framing is the point. If an author feels the urge to add a snippet here, that's the urge
to resist.

SANDBOX: none — NO-COMPILER lesson. These are desktop applications talking to physical
hardware over USB and radio; no browser sandbox can represent that honestly.

Interactive load:
1. **match-pairs** (requested in `frc-motors`) — challenge 1.
2. **Drag-to-order** — the isolation procedure, challenge 2. This is the highest-value
   interaction on the page.

CHALLENGES:

1. **Match-pairs · tool → job.** Left: *REV Hardware Client* · *Phoenix Tuner* · *Driver
   Station* · *VS Code + WPILib*. Right: *Set a Kraken's CAN ID over the radio* · *Apply a test
   voltage to a Neo over USB-C* · *Enable the robot and read the console* · *Build and deploy
   the code*.
   Answer key: REV → apply voltage over USB-C; Phoenix Tuner → Kraken ID over radio; Driver
   Station → enable + console; VS Code → build and deploy.
   Win: "Four tools, four jobs. Knowing which one answers your question is most of debugging."
   Lose: "REV for REV hardware over USB-C, Phoenix Tuner for CTRE hardware over the radio, the
   Driver Station to enable and watch, VS Code to build and deploy."
   *Fallback: four MCQs.*

2. **Drag-to-order · isolate the fault.** "The intake doesn't move. Put these checks in the
   order that eliminates the most possibilities soonest."
   Items (shuffled): *Read your intake code* · *Try to turn the roller by hand* · *Apply a test
   voltage from the REV client* · *Check the client sees the device at CAN ID 2*.
   **Answer key:** turn by hand → apply test voltage → check the device appears at ID 2 → read
   your code.
   Win: "That's the procedure. Every step is cheap and each one rules out a whole category —
   which is how two days of debugging becomes ten minutes."
   Lose: "Start with the cheapest, broadest check and work inward. Reading code is *last*,
   because it's the only step that can't rule anything out on its own."
   *Fallback: MCQ over three candidate orderings.*

3. **MCQ · sticky faults** — "The client shows a sticky fault on the arm's SparkMax. What does
   that tell you?"
   - a) The arm is broken right now — "Not necessarily — 'sticky' means it happened at *some*
     point."
   - b) ✓ **A fault occurred at some point; it may or may not be happening now** — "Correct.
     Fix the real problem, then clear it — a fault that reappears after clearing is live."
   - c) The firmware is out of date — "Possible cause, but not what a sticky fault means."
   - d) The CAN ID is wrong — "A wrong ID means the device wouldn't appear at all."

4. **Predict / short answer** — "You apply a test voltage from the REV client and the intake
   roller spins perfectly. Where is the bug?"
   `data-answer="code|in the code|my code|the code|software"`
   Win: "In your code. The motor, the controller, the power wiring and the mechanism just
   proved themselves. That's the whole point of the test."
   Lose: "In your code. If the motor spins with no robot program involved, everything
   downstream of your code is healthy — so stop looking at the wiring."

MISCONCEPTIONS:
- *"A sticky fault means something is wrong right now."*
  → "It means something *was* wrong at some point. Clear it after you fix the cause; if it
  comes back, then it's live."
- *"CAN IDs are set in the code."*
  → "Your code says which ID it wants. The vendor client is where the device is told its ID.
  Mismatch them and nothing moves and nothing complains at compile time."
- *"If the motor won't move, my code is wrong."*
  → "Prove it. Apply a test voltage first — you'll find out in fifteen seconds whether code is
  even involved."
- *"Phoenix Tuner and the REV client are interchangeable."*
  → "Each vendor's tool talks only to its own hardware, and they don't even connect the same
  way: USB-C to a SparkMax, over the radio to a Kraken."
- *"Firmware is the electrical team's job."*
  → "Programmers push firmware. It's on your list right next to imaging the RIO."

EXERCISE: **PenguinBot's device sheet.**
*Where we are:* PenguinBot's project has REVLib installed (`frc-vendordeps`). Before any code
can address a motor, every device needs a known, recorded identity — and you need to know which
tool assigns it.

Task: produce PenguinBot's device sheet — the document a team actually keeps taped inside the
electronics bay. For every device: name, hardware, CAN ID, which client sets that ID, and how
it connects. Then write the one-line test you'd run in that client to prove the device is alive.

**Reference solution** (`details.reveal`):

| Device | Hardware | CAN ID | Client | Connection | Alive test |
|---|---|---|---|---|---|
| Intake roller | SparkMax + Neo | 2 | REV Hardware Client | USB-C to the SparkMax | Apply a low test voltage; roller spins |
| Arm pivot | SparkMax + Neo | 3 | REV Hardware Client | USB-C | Apply a low test voltage; arm creeps |
| Swerve drive ×4 | Kraken | 10–13 | Phoenix Tuner | Over the radio | List devices; each appears and can be spun |
| Swerve steer ×4 | Kraken | 14–17 | Phoenix Tuner | Over the radio | Same |
| PDH | — | 1 | REV Hardware Client | USB-C / on the bus | Appears in the device list |

> Two rules to write at the bottom of the sheet: **apply voltage low first** — the fried motor
> cost two days — and **clear sticky faults only after fixing the cause**, so the next fault you
> see means something.

Tease: "Every one of those ID numbers is about to become a number in your code. Next lesson is
about not getting them wrong."

CHECKPOINT: (4 questions, every option explained)

**Q1.** How does the REV Hardware Client connect to a SparkMax?
- a) Over the radio — "That's how Phoenix Tuner reaches Krakens."
- b) ✓ **USB-C, straight to the device** — "Yes — which means you can test a SparkMax on a
  bench with no robot at all."
- c) Through the Driver Station — "The DS talks to the RIO, not to individual controllers."
- d) Over the CAN bus from your laptop — "Your laptop isn't on the CAN bus."

**Q2.** What is "apply a test voltage" for?
- a) Charging the motor — "Motors don't hold charge."
- b) Calibrating the encoder — "That's a different operation."
- c) ✓ **Spinning the motor with no robot code involved, to find out whether the problem is
  code or hardware** — "Exactly — the single most useful isolation step in the unit."
- d) Setting the CAN ID — "Also done in the client, but a different function."

**Q3.** You clear a sticky fault, run the mechanism, and the fault comes straight back. That
means…
- a) Clearing didn't work — "It worked; the fault re-occurred."
- b) ✓ **The problem is happening right now** — "Right, and that's exactly why you clear
  faults: so the next one is meaningful."
- c) The firmware is corrupt — "Maybe, but the reappearance itself just tells you it's live."
- d) You should ignore it — "A reproducing fault is the best debugging information you have."

**Q4.** The intake won't move. Which check do you do **first**?
- a) Re-read `IntakeSubsystem.java` — "Last. It's the only step that can't eliminate a
  category."
- b) Redeploy the code — "Cheap, but it proves nothing about the hardware."
- c) ✓ **Try to turn the roller by hand** — "Yes — a seized mechanism looks exactly like a code
  bug from the keyboard, and this takes two seconds."
- d) Reinstall REVLib — "Nothing about a physically dead mechanism points at the library."

SEASON-FLAGS:
- `callout--season`: both clients' names, download locations, and UI layouts change. The
  Phoenix tooling in particular has been through generations (Phoenix 5 → Phoenix 6 era
  tooling). `[NEEDS RESEARCH: current names + versions of the REV Hardware Client and the CTRE
  tuner app for 2026, and whether the CTRE tool still requires a licence/activation for some
  features — content/research/toolchain-2026.md]`
- The reserved-ID convention (0 = RIO, 1 = PDH) is a **team practice** — `frc-can-ids` owns the
  caveat; mention it here only in passing.

WIDGET-REQUEST: none new. Uses `match-pairs` (requested in `frc-motors`) and drag-to-order,
with MCQ fallbacks stated above.
