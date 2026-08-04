# frc-can-ids · CAN IDs
unit: 2 · The Toolchain   |   duration: 15 min   |   difficulty: Beginner
interactivity: NO-COMPILER (**can-id-assigner** widget + fill-in-blank + MCQ)

> Read `_shared-conventions.md` first. This lesson plants "CAN ID 16 timed out"; `frc-game-day`
> collects it. It also owns the CAN ID map that every later lesson's code uses — the numbers in
> §2 of the conventions file are set *here*.

INTRODUCES:
- `can-id` — the unique address of a device on the shared bus
- `unique-addressing` — why "turn on motor 2" needs an ID at all
- `reserved-ids` — 0 and 1 by team convention
- `id-convention` — start motors at 2; write the map down
- `can-timeout-error` — `CAN ID 16 timed out` and what it actually means
- `can-id-map-doc` — keeping the map somewhere everyone can see

ASSUMES:
- `can-bus`, `can-daisy-chain`, `pdh`, `signal-path` (`frc-roborio-radio-can`)
- `set-can-id-tool`, `rev-hardware-client`, `phoenix-tuner`, `isolate-code-wiring-build`
  (`frc-vendor-clients`)

GOAL:
Assign conflict-free CAN IDs to every device on a robot, and read a `CAN ID n timed out` error
to the right cause.

HOOK: **"CAN ID 16 timed out"** (`_shared-conventions.md` §6 story 8).
`callout--why`. At competition, the programmer's job during a match is to watch the Driver
Station console. The line that appears most often — and the one the source calls out by name —
is:

```
CAN ID 16 timed out
```

It means a device stopped answering. The source is specific about the odds: it signals a wrong
ID or, **more often, a wiring break**. Two candidate causes, one of them much more likely, and
you have about ninety seconds between matches to figure out which.

Make the continuity explicit and let the student feel it: on PenguinBot, **CAN ID 16 is the
back-left swerve steering motor.** By Unit 9 that will be a real motor they've written code
for. By Unit 12 they'll be the one reading this line at a field.

EXPLAIN:

1. **Why IDs exist at all.** Callback to `frc-roborio-radio-can`: the CAN bus is one shared
   loop. Every message goes past every device. The ID is how a device knows a message is for
   it.
   Analogy: the party line, or house numbers on a street — one road, many doors, and the number
   is the only thing that distinguishes them. Without IDs, "run at 70 %" would spin every motor
   on the robot.
   Mark: [FROM PDF page 5, §2.4]

2. **Where an ID lives — in three places at once.** This is the framing that prevents the
   classic bug:
   - **On the device**, set with the vendor client (`frc-vendor-clients`).
   - **In your code**, as the constructor argument: `new SparkMax(2, …)`.
   - **On the map** — a document the whole team can read.
   All three must agree. Nothing checks this for you. A mismatch compiles, deploys, and fails
   silently.

3. **The team's convention.** ID **0** is taken by the RoboRIO/system, ID **1** by the PDH, so
   **motor IDs start at 2**.
   Mark: [FROM PDF page 5, §2.4] — and state the caveat the source itself states: this is a
   **practical convention, not a rule**. Confirm the reserved IDs for your own setup.
   Put the caveat in a `callout--note`, not buried in prose. A student who treats a convention
   as a law will eventually be confidently wrong.

4. **Choosing a scheme.** Teach the actual professional habit — group IDs by mechanism so a
   number tells you where to look:

| Range | Mechanism | PenguinBot |
|---|---|---|
| 0–1 | reserved | RIO, PDH |
| 2–9 | mechanisms | intake 2, arm 3, arm follower 4 |
| 10–13 | swerve **drive** | FL 10, FR 11, BL 12, BR 13 |
| 14–17 | swerve **steer** | FL 14, FR 15, BL 16, BR 17 |

   Beat: with that scheme, "ID 16 timed out" instantly reads as *back-left steering*. With
   random IDs, it reads as nothing at all and you go get the map. **The scheme is a debugging
   tool, not bookkeeping.**

5. **Reading the timeout.** Decision path, and this is the lesson's takeaway:

```
"CAN ID 16 timed out"
   ├─ Did it EVER work with this code?
   │     no  → the ID in code probably doesn't match the device. Check the client.
   │     yes → it worked before, so the number is right...
   └─ ...which points at WIRING. Check the CAN chain at and before that device.
      Other devices timing out too? Find the break upstream of all of them.
      Only that one? Check its two CAN wires and its connector.
```

   Beat: cross-reference the isolation procedure from `frc-vendor-clients` — the vendor client
   listing the device (or not) settles the ID-versus-wiring question immediately.

6. **Duplicate IDs — the nastiest failure.** Two devices with the same ID on one bus produce
   behaviour that looks like a poltergeist: intermittent, inconsistent, and it moves around.
   The intro notes say it plainly: *"don't make them all 0."* When a device is replaced, the
   new one comes with a factory-default ID, and if you forget to set it, you now have two
   devices claiming the same address. **Replacing a controller means re-setting its ID** —
   put that in a `callout--pitfall`.

CODE:
```java
// [FROM PDF page 8 verified box] — the ID in code must match the ID on the device
SparkMax intakeRoller = new SparkMax(2, MotorType.kBrushless);   // set to 2 in the REV client
SparkMax armPivot     = new SparkMax(3, MotorType.kBrushless);   // set to 3 in the REV client
```
Annotate both comment tails: the comment is not decoration — it's the link between two places
that can silently disagree.

Forward-tease only (do not teach it here; `frc-constants` owns it): those bare numbers will
eventually move into `Constants.java` so the map lives in exactly one file. One sentence, then
stop.

SANDBOX: none — NO-COMPILER lesson.

Interactive load: the **can-id-assigner** widget (see WIDGET-REQUEST) plus challenges below.

CHALLENGES:

1. **Fill-in-the-blank · the map** — `data-kind="fib"`. Give PenguinBot's device list with the
   IDs blanked, and the scheme table visible above it:
   `RoboRIO ` blank(`data-answer="0"`) ` · PDH ` blank(`data-answer="1"`) ` · intake roller `
   blank(`data-answer="2"`) ` · arm pivot ` blank(`data-answer="3"`) ` · back-left steer `
   blank(`data-answer="16"`)
   Win: "That's PenguinBot's map — and you'll use these exact numbers for the rest of the
   course."
   Lose: "0 and 1 are reserved by convention (RIO, PDH); mechanisms start at 2; steering motors
   are 14–17, and back-left is the third one: 16."

2. **MCQ · read the error** — "Mid-match the console prints `CAN ID 16 timed out`. This code has
   worked all week. Most likely cause?"
   - a) The ID in the code is wrong — "It worked all week with this code, so the number is
     almost certainly right."
   - b) ✓ **A CAN wiring break at or before that device** — "Correct — the source says wiring is
     the more common cause, and 'it worked yesterday' rules the ID out."
   - c) The motor is fried — "A fried motor stops *moving*; the controller still answers the bus."
   - d) The battery is low — "Low voltage causes brownouts and resets, not a single ID timing
     out."

3. **MCQ · duplicate IDs** — "You swap in a replacement SparkMax and now the arm behaves
   erratically and intermittently. What did you forget?"
   - a) To rebuild the code — "The code didn't change."
   - b) ✓ **To set the new controller's CAN ID — it's still on its factory default and may now
     collide with another device** — "Exactly, and intermittent weirdness is the classic
     signature of an ID collision."
   - c) To clear sticky faults — "Worth doing, but it doesn't cause erratic motion."
   - d) To update the Driver Station — "Unrelated."

4. **Predict / short answer** — "Your code says `new SparkMax(2, MotorType.kBrushless)` but the
   device is set to ID 5 in the REV client. What happens when you build and deploy?"
   `data-answer="nothing|it builds fine|builds fine|compiles|no error|it deploys|nothing happens"`
   Win: "It builds and deploys perfectly, and the motor never moves. Nothing checks that these
   two numbers agree — that's why the map matters."
   Lose: "It compiles and deploys with no complaint at all. The mismatch only shows up as a
   motor that doesn't move, possibly with a timeout in the console."

MISCONCEPTIONS:
- *"CAN IDs are assigned automatically."*
  → "You assign them, in the vendor client. Devices ship on a default, and defaults collide."
- *"The ID is set in the code."*
  → "The code *requests* an ID. The device is *told* its ID in the client. Two places, and they
  can disagree silently."
- *"`CAN ID 16 timed out` means motor 16 is broken."*
  → "It means device 16 stopped answering the bus. More often than not, that's a wire, not the
  motor."
- *"ID 0 is fine to use."*
  → "By this team's convention 0 is the RIO and 1 is the PDH — start at 2, and confirm the
  reserved IDs for your own setup."
- *"The numbers don't matter as long as they're unique."*
  → "Unique is the requirement; *grouped by mechanism* is what turns an error message into a
  location."

EXERCISE: **PenguinBot's CAN ID map.**
*Where we are:* you have a project with REVLib installed and you know which tool sets a device
ID. Time to commit to the numbers the rest of this course uses.

Task: write the definitive PenguinBot CAN ID map. Requirements: honour the reserved IDs, group
by mechanism so a number identifies a location, leave room for the arm follower motor you'll
add in Unit 7, and finish with the one-sentence rule for what to do when a controller gets
replaced.

**Reference solution** (`details.reveal`):

| CAN ID | Device | Vendor | Set with |
|---|---|---|---|
| 0 | RoboRIO | — | reserved by convention |
| 1 | PDH | REV | reserved by convention |
| 2 | Intake roller | SparkMax + Neo | REV Hardware Client |
| 3 | Arm pivot | SparkMax + Neo | REV Hardware Client |
| 4 | Arm follower *(added Unit 7)* | SparkMax + Neo | REV Hardware Client |
| 10 / 11 / 12 / 13 | Swerve **drive** FL / FR / BL / BR | Kraken | Phoenix Tuner |
| 14 / 15 / 16 / 17 | Swerve **steer** FL / FR / BL / BR | Kraken | Phoenix Tuner |

> **Rule:** any time a motor controller is replaced, set its CAN ID before it goes back on the
> robot. A factory-default device on a live bus is an intermittent bug that will cost you a day.
>
> Tape this map inside the electronics bay and keep a copy in the repo. When the console says
> `CAN ID 16 timed out`, you want to read "back-left steering" off it in two seconds — not go
> looking for who remembers.

Tease: "One more tool before you can start writing robot code: the dashboards that show you
what those motors are actually doing."

CHECKPOINT: (4 questions, every option explained)

**Q1.** Why does every device on the CAN bus need a unique ID?
- a) So the code compiles — "IDs are just numbers to the compiler; it never checks them."
- b) ✓ **Because they all share one bus, and the ID is how a device knows a message is for it**
  — "Right — one loop, many devices, addressed by number."
- c) So they can be powered separately — "Power comes from the PDH, independent of CAN."
- d) For the Driver Station's device list — "Convenient, but not the reason."

**Q2.** Where do you set a SparkMax's CAN ID?
- a) In `Constants.java` — "That stores the number your *code* uses. The device still has to be
  told its own."
- b) In the Driver Station — "The DS doesn't configure devices."
- c) ✓ **In the REV Hardware Client** — "Yes — and Phoenix Tuner for CTRE devices."
- d) It's printed on the device and can't change — "It's configurable, and it has to be."

**Q3.** Code that worked yesterday now prints `CAN ID 16 timed out`. First suspicion?
- a) The ID in the code is wrong — "It was right yesterday; nothing changed in code."
- b) ✓ **A CAN wire at or before that device** — "Correct, and it's the more common cause even
  without the 'worked yesterday' clue."
- c) REVLib needs reinstalling — "Libraries don't cause runtime bus timeouts."
- d) The motor needs new firmware — "Firmware issues rarely present as a clean timeout."

**Q4.** What's the practical advantage of grouping IDs by mechanism?
- a) It makes the bus faster — "Bus speed doesn't depend on how you number things."
- b) It's required by the game rules — "There's no such rule."
- c) ✓ **An error message tells you where to look without consulting anything** — "Exactly —
  `16` reads as 'back-left steering' immediately."
- d) It prevents duplicates automatically — "Only discipline prevents duplicates; a scheme just
  makes them easier to spot."

SEASON-FLAGS:
- The reserved-ID convention (0 = RIO, 1 = PDH) is a **team practice** and the source says to
  confirm it for your setup. `callout--season` / `callout--note`.
- `[NEEDS RESEARCH: whether any CAN IDs are genuinely reserved by the FRC control system in
  2026, or whether it is purely convention — content/research/toolchain-2026.md]`
- The exact wording of the timeout error can change between WPILib versions; teach the
  *pattern* (`CAN ID <n> timed out`), not a literal string match.

WIDGET-REQUEST: **`can-id-assigner`** — a table of PenguinBot's devices with an editable ID per
row. Live validation: duplicates highlight red on both rows, IDs 0–1 warn "reserved by
convention", and a "check my map" button reports conflicts. Directly teaches the failure mode
that costs teams the most time.
*Fallback:* challenge 1's fill-in-the-blank map plus the duplicate-ID MCQ (challenge 3) already
carry the teaching — ship those if the widget isn't ready.
