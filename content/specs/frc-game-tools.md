# frc-game-tools · FRC Game Tools & the Driver Station
unit: 2 · The Toolchain   |   duration: 20 min   |   difficulty: Beginner
interactivity: NO-COMPILER (**driver-station-panel** widget + install `checklist` + MCQ set)

> Read `_shared-conventions.md` first. This is the first Unit 2 lesson — establish the unit's
> framing in one line: *nothing you write in Unit 4 can reach a robot until these tools exist.*

INTRODUCES:
- `frc-game-tools` — the bundle that ships the Driver Station and dashboards
- `driver-station` — the app that enables the robot and shows your console
- `enable-disable` — Disabled means **no code runs**
- `robot-modes-selector` — where teleop/auto/test/practice actually get chosen
- `ds-status-indicators` — Communication / Robot Code / Joystick
- `ds-console` — where `System.out.println` output appears
- `println-output` — your primary debugging channel until Unit 2's dashboards lesson
- `windows-only-ds` — the Driver Station is Windows-only

ASSUMES:
- `roborio`, `radio`, `signal-path` (`frc-roborio-radio-can`)
- `firmware-push-responsibility` (`frc-what-programmers-do`)
- Java `System.out.println` (Phase 1 — link to `j-first-program`)

GOAL:
Read the Driver Station's three status indicators to say whether a problem is the network, the
code, or the controller — and find your `println` output.

HOOK: **Macs can't run the Driver Station** (`_shared-conventions.md` §6 story 4).
`callout--why`. The team runs Macs, a PC, and one dedicated Windows laptop. You can write
robot code on any of them. You cannot **enable the robot** on any of them except the Windows
one, because FRC Game Tools is Windows-only. That single fact reorganises how a team works:
there is one laptop that goes to the field, and everyone's code has to end up on it. Half of
game day (Unit 12) is logistics that follow from this one line.

EXPLAIN:

1. **What FRC Game Tools is.** One installer, several tools: the **Driver Station**, the
   dashboards, and the utilities for imaging the RoboRIO. It is separate from WPILib — WPILib
   is how you *write* code, Game Tools is how you *run* the robot. Students conflate these
   constantly; separate them explicitly here, then again in `frc-wpilib-vscode`.
   `[NEEDS RESEARCH: exactly what the 2026 Game Tools bundle contains and where it's
   downloaded from (NI). Do not print a URL or a version number until the factsheet lands —
   content/research/toolchain-2026.md]`

2. **The Driver Station is the bar at the bottom of the screen.**
   Analogy: the ignition and dashboard of a car. It doesn't drive; it decides whether the
   engine may run at all, and it tells you what's wrong.
   Beat — **Disabled = no code runs. Enabled = controllers active.** Say this twice. It is the
   answer to "why isn't my code doing anything" more often than any bug.
   Mark: [FROM PDF page 5, §2.1]

3. **The three status indicators — the diagnostic core of this lesson.**

| Indicator | Green means | Red means | Look at |
|---|---|---|---|
| **Communication** | The DS can reach the robot | Network problem | Radio still booting, Ethernet, radio image |
| **Robot Code** | Your code is on the RIO and running | Not deployed, or it crashed | Redeploy; read the console for an exception |
| **Joystick** | A controller is connected and assigned | No controller in a port | Plug it in, drag it to port 0 |

   Mark: [FROM PDF page 5, §2.1]
   Teach it as a **top-down checklist**: Communication first — if it's red, nothing else means
   anything. Then Robot Code. Then Joystick. This ordering is the transferable skill.
   Beat: the difference between "Communication red" and "Robot Code red" is exactly the
   difference between *"the robot can't hear me"* and *"the robot heard me and my program isn't
   running."* Two completely different afternoons.

4. **Modes are chosen here, not in code.** The DS is where you pick teleoperated, autonomous,
   test, or practice. Your code has *handlers* for each mode (`frc-robot-java` in Unit 8); the
   DS decides which one is live. Forward tease only — do not teach `teleopPeriodic` here.

5. **The console is your first debugger.** `System.out.println(...)` in robot code prints to
   the Driver Station console. That's it — the same method from `j-first-program`, now printing
   from a machine bolted to a robot. This is how you'll debug everything until
   `frc-dashboards` gives you numbers over time.
   Beat honestly: printing every 20 ms floods the console and can slow the loop. Print
   sparingly, or on a condition. This pitfall is worth a `callout--pitfall`.

CODE:
One block only — the smallest possible thing, to connect Phase 1 to the robot:
```java
// [FROM PDF Appendix A — "shows in Driver Station console"]
System.out.println(value);   // appears in the Driver Station console, not your IDE
```
Annotate the comment line: this is the whole bridge from Phase 1 to robot debugging.

SANDBOX: none — NO-COMPILER lesson. There is genuinely nothing to compile: this is an
application you learn to read.

Interactive load:
1. The **driver-station-panel** widget (see WIDGET-REQUEST) — a mock DS bar with the three
   indicators, an Enable/Disable toggle, a mode selector, and a console pane. The lesson feeds
   it 4 scenarios; the student clicks the indicator they'd check first and gets feedback.
2. An install **checklist** widget (see WIDGET-REQUEST) for the Unit 2 tool list, shared with
   `frc-wpilib-vscode` and `frc-vendordeps`.

CHALLENGES:

1. **MCQ · triage** — "Communication is green, Robot Code is red, Joystick is green. What's
   wrong?"
   - a) The radio hasn't booted — "Comms is green, so the network is fine."
   - b) ✓ **Your code isn't on the robot or isn't running** — "Right — deploy again and read
     the console for an exception."
   - c) The controller is unplugged — "Joystick is green; the controller is fine."
   - d) The robot is disabled — "Disable stops code from *acting*; the Robot Code light still
     shows your program is loaded and running."

2. **MCQ · triage** — "All three indicators are green, you press the intake button, and nothing
   happens. What do you check *before* your code?"
   - a) The CAN wiring — "Worth checking, but there's something faster and more common."
   - b) ✓ **Whether the robot is Enabled** — "Yes. Disabled means no code runs, even with three
     green lights. This is the single most common false bug."
   - c) The RoboRIO image — "The Robot Code light already proves your program is running."
   - d) Reinstall Game Tools — "Never the first move."

3. **Fill-in-the-blank** — `data-kind="fib"`:
   `The Driver Station shows your ` + blank(`data-answer="println|System.out.println|print"`) +
   ` output, and while the robot is ` + blank(`data-answer="disabled|Disabled"`) + ` no code runs.`
   Win: "Both halves of that sentence will save you hours this season."
   Lose: "`System.out.println` output lands in the DS console; and while the robot is Disabled,
   nothing your code says has any effect."

4. **Predict / short answer** — "Your teammate has a MacBook and has just finished writing the
   intake code. Can she enable the robot from her laptop?"
   `data-answer="no|nope|not on a mac|no windows only|no she cant|no she can't"`
   Win: "No — the Driver Station is Windows-only. She can write and even deploy code, but
   enabling happens on the Windows driver-station laptop."
   Lose: "No. FRC Game Tools is Windows-only. Writing code works anywhere; enabling the robot
   needs the Windows laptop — which is why the team has a dedicated one."

MISCONCEPTIONS:
- *"Green Communication means my code is running."*
  → "Communication only means the DS can reach the robot. **Robot Code** is the separate light
  that says your program is loaded and running."
- *"`println` prints to VS Code's terminal."*
  → "Your code is running on the RoboRIO, not your laptop. Its output travels back to the
  Driver Station console."
- *"Game Tools and WPILib are the same install."*
  → "Two separate installs with two different jobs: WPILib to write and deploy, Game Tools to
  enable and observe."
- *"I can pick the mode in my code."*
  → "You write a handler per mode; the Driver Station picks which mode is active."
- *"Disabled just stops the motors."*
  → "Disabled stops your code from doing anything at all. It isn't a motor cut-out; it's an
  everything cut-out."

EXERCISE: **PenguinBot's bring-up checklist.**
*Where we are:* you can trace a signal (`frc-roborio-radio-can`) and name the hardware
(`frc-motors`). Nothing you write reaches PenguinBot until you can bring the robot up.

Task: write the ordered checklist you'd follow, from "the robot is on the cart, powered off"
to "the intake spins when I press the button." Each step names what you'd *look at* to confirm
it worked. (This checklist becomes the seed of the real pre-match checklist in
`frc-game-day` — say so.)

**Reference solution** (`details.reveal`):
> 1. **Power on the robot.** Look at: the RIO's lights coming up.
> 2. **Wait 1–2 minutes for the radio.** Look at: nothing yet — this is the waiting step
>    people skip.
> 3. **Open the Driver Station** on the Windows laptop.
> 4. **Communication green?** If not: wait longer, then check the radio and try an Ethernet
>    tether.
> 5. **Robot Code green?** If not: deploy from VS Code, then read the console for an exception.
> 6. **Plug in the controller. Joystick green?** If not: assign it to port 0 in the DS.
> 7. **Choose Teleoperated** in the mode selector.
> 8. **Enable.** Nothing before this point can move a motor.
> 9. **Press the button.** If nothing happens *now*, it's finally time to suspect your code —
>    and the console is where you look first.

Tease: "Next: the other half of the toolchain — the VS Code that knows what a robot is, and how
you get code onto the RIO in the first place."

CHECKPOINT: (4 questions, every option explained)

**Q1.** Where does `System.out.println` output appear in robot code?
- a) The VS Code terminal — "Your code runs on the RIO, not your laptop."
- b) ✓ **The Driver Station console** — "Correct — that's your primary debugging channel."
- c) A log file you have to download — "Logs exist, but the console is live and immediate."
- d) Nowhere; printing doesn't work on a robot — "It works, and you'll lean on it constantly."

**Q2.** "Disabled" means…
- a) Motors are cut but code still runs — "No — the whole program is prevented from acting."
- b) The robot has lost communication — "That's the Communication indicator, separately."
- c) ✓ **No code runs at all** — "Yes. Three green lights and a disabled robot does nothing."
- d) You're in test mode — "Test is a mode; Disabled is the enable state."

**Q3.** Which indicator being red tells you the problem is the *network*, not your program?
- a) Robot Code — "That one means your program isn't running."
- b) Joystick — "That's the controller."
- c) ✓ **Communication** — "Right — the DS can't reach the robot at all."
- d) All three simultaneously — "That happens, but Communication is the one that identifies the
  network specifically."

**Q4.** Why does the team keep a dedicated Windows laptop?
- a) It's faster than the Macs — "Speed isn't the reason."
- b) ✓ **FRC Game Tools and the Driver Station only run on Windows** — "Exactly, and that
  laptop is what goes to the field."
- c) VS Code is Windows-only — "VS Code runs everywhere; the Driver Station doesn't."
- d) The CAN bus needs Windows drivers — "CAN is entirely on the robot."

SEASON-FLAGS:
- `callout--season` on the whole install section: the Game Tools bundle, its download location,
  and its version change every season. `[NEEDS RESEARCH: 2026 Game Tools contents, installer
  name, and whether the dashboards still ship inside it — content/research/toolchain-2026.md]`
- `[NEEDS RESEARCH: whether the DS's mode names are still "Teleoperated / Autonomous / Test /
  Practice" in the 2026 DS UI]` — the four names come from the PDF page 13.
- The "Windows-only" claim is stable but re-verify each season.

WIDGET-REQUEST (two, both with fallbacks):
1. **`driver-station-panel`** — a mock Driver Station bar: three status LEDs (settable per
   scenario), Enable/Disable toggle, mode dropdown, and a scrolling console pane the lesson can
   push lines into. Scenario-driven: the lesson declares `data-scenario` states and the student
   clicks the indicator they'd check first. *Fallback:* the static indicator table plus the
   two triage MCQs above (challenges 1–2), which already carry the teaching.
2. **`checklist`** — a persistent (localStorage) checkbox list keyed by lesson id, so a student
   installing tools across three lessons doesn't lose their place. Wanted by
   `frc-game-tools`, `frc-wpilib-vscode`, `frc-vendordeps`, `frc-game-day`. *Fallback:* a plain
   `<ol class="task-list">` — no persistence, no loss of teaching.
