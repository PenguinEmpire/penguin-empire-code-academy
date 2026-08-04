# frc-dashboards · Dashboards & AdvantageScope
unit: 2 · The Toolchain   |   duration: 20 min   |   difficulty: Beginner
interactivity: NO-COMPILER (annotated static graph reading + predict-output + MCQ)

> Read `_shared-conventions.md` first. This is the last Unit 2 lesson — close the unit by
> naming the full toolbox before Unit 3 turns to code.

INTRODUCES:
- `dashboard` — a live view of values your code publishes
- `glass` — the real-time dashboard the team moved to
- `smartdashboard` — the one being phased out
- `networktables` — the pipe that carries values between robot and laptop
- `advantagescope` — graphs those values **over time**
- `telemetry-over-time` — the difference between a number and a trace
- `amperage-limit-debug` — the worked example: a motor cutting out at a current limit

ASSUMES:
- `driver-station`, `ds-console`, `println-output` (`frc-game-tools`)
- `can-id`, `can-timeout-error` (`frc-can-ids`)
- `encoder` is **not** yet introduced — talk about "a value your code publishes", not
  specifically encoder readings, and say the real examples arrive in Unit 5.

GOAL:
Choose the right observation tool for a question — console, live dashboard, or a graph over
time — and read a velocity/current trace to spot a motor hitting a limit.

HOOK: **SmartDashboard got banned; AdvantageScope caught the cutout**
(`_shared-conventions.md` §6 story 9). `callout--why`.
Two beats, both from the source and both useful:

1. The team used **SmartDashboard** until it was being **banned**, and moved to **Glass**. Your
   dashboard is not a permanent choice — it's a season decision. (This is the single most
   season-dependent lesson in the track; flag hard.)
2. A motor kept cutting out and nobody could see why from a live number, because the number
   was fine every time anyone looked. Graphing **amperage over time** in AdvantageScope showed
   the motor hitting a current limit and dropping out — a spike lasting a fraction of a second.
   **A live value can't show you something that only happens for 50 milliseconds.**

That second beat is the whole lesson: `println` shows you a moment, a dashboard shows you now,
a graph shows you what happened.

EXPLAIN:

1. **Three tools, three questions.** Lead with the decision table — it's what students will
   come back for:

| Question you're asking | Tool |
|---|---|
| "Did my code reach this line?" / "What's the error?" | **Driver Station console** (`println`) |
| "What is this value *right now*?" | **Glass / a live dashboard** |
| "What did this value *do* over the last ten seconds?" | **AdvantageScope** |

   Analogy: the console is a shouted message, the dashboard is a speedometer, AdvantageScope is
   the dashcam footage. Diagnosing "why did it cut out?" from a speedometer is hopeless.

2. **How a value gets out of the robot.** Your code *publishes* a named value; the dashboard
   *subscribes* to it. The pipe between them is **NetworkTables** — a shared table of key/value
   pairs the robot and every connected laptop can see.
   Analogy: a whiteboard the robot writes on and your laptop reads. It's not a print statement
   going somewhere; it's a value with a **name** that keeps being updated.
   Beat: names matter, because a graph of `"arm/position"` is useful and a graph of `"value1"`
   is not. Establish the naming habit now, before Unit 5 makes it real.
   Note: NetworkTables also appeared in `frc-what-programmers-do` as how the voice-command
   experiment sent results to the robot — same pipe, other direction. Call that back; it makes
   NetworkTables concrete.

3. **Glass, and why the dashboard changes.** Glass shows live values on screen — a motor
   reading 300 RPM, a boolean going true, a field view. SmartDashboard did the same job and is
   being phased out.
   State the general rule plainly: **which dashboard is current, and which are legal at
   competition, changes between seasons.** That's not a caveat, it's the fact.
   Mark: [FROM PDF page 6, §2.5]

4. **AdvantageScope is your oscilloscope.** It plots the values NetworkTables carries against
   time. The two traces the source names:
   - **velocity vs time** — did the flywheel actually reach speed, and how long did it take?
   - **amperage vs time** — is the motor hitting a current limit and cutting out?
   Mark: [FROM PDF page 6, §2.5]
   Beat — **the shape of a trace is information.** Teach four shapes with a labelled static
   graph (a `.diagram` or an inline SVG, drawn by the author):

```
 A) smooth rise, flat    ✔ reached target and held
 B) rise, overshoot, ring   PID kP too high      → Unit 6
 C) rise, then sudden drop  hit a current limit  → the war story
 D) sawtooth, never flat    never settles        → Unit 6
```

   Two of those four shapes are the exact output of the PID sandboxes in Unit 6. Say so — this
   is where the student learns to *read* what those sandboxes will *print*.

5. **What you publish is a design decision.** Not everything, and not at random. Publish the
   handful of values you'd want during a match: mechanism positions, whether a mechanism is at
   its setpoint, current draw on anything that has ever cut out, and whether vision sees a tag.
   Beat, honest: printing or publishing on every 20 ms loop for twenty values costs real time
   and floods the log. Same pitfall as `println` in `frc-game-tools`; reinforce it.

CODE:
One block, minimal, and its purpose is to make "publish a named value" concrete — **not** to
teach dashboards in code:
```java
// [NEEDS RESEARCH: confirm SmartDashboard is still the recommended 2026 publishing API and
//  that this import path is current — content/research/toolchain-2026.md]
import edu.wpi.first.wpilibj.smartdashboard.SmartDashboard;

SmartDashboard.putNumber("arm/position", position);   // a NAMED value on NetworkTables
```
Rules for the author:
- Show it inside a `callout--season`, not as a verified box, until the factsheet confirms it.
- Annotate only the **name** argument — the naming habit is the teachable part here.
- Do not teach `getNumber`, `putBoolean`, sendables, or a dashboard-driven tuning loop. Out of
  scope for Unit 2.
- `[NEEDS RESEARCH: the 2026 recommended dashboard(s) — is Glass still current, what is
  Elastic's status, and which dashboards are permitted at competition?]` Until answered, the
  lesson names Glass as *the team's* choice with a prominent season flag, and never asserts
  what is "the" dashboard.

SANDBOX: none — NO-COMPILER lesson. Dashboards read a live robot; a browser sandbox can't
produce one, and a fake dashboard would teach a fake workflow.

Interactive load: reading the four annotated trace shapes above, plus the challenges. The
"read the graph" challenge is the highest-value interaction on the page.

CHALLENGES:

1. **MCQ · read the trace.** Show trace **C** (velocity climbs, holds, then drops abruptly to
   zero while the commanded output stays constant). "What does this most likely show?"
   - a) The command was set to 0 — "The commanded output is flat in this trace; the drop isn't
     coming from your set call."
   - b) ✓ **The motor hit a current limit and cut out** — "Right — exactly the bug the team
     found by graphing amperage over time. A live number would have missed it."
   - c) The encoder is broken — "A broken encoder usually reads garbage or zero from the start,
     not a clean climb followed by a drop."
   - d) The CAN bus timed out — "Possible, but a timeout would also produce console errors; the
     current-limit cutout is the textbook shape here."

2. **MCQ · pick the tool** — "A mechanism works nine times and fails once, and you can never
   catch it happening. Which tool?"
   - a) The console — "It'll tell you *if* an error was thrown, but not what the value was doing
     around the failure."
   - b) A live dashboard — "By the time you look, the moment is gone. That's the whole problem."
   - c) ✓ **AdvantageScope — graph it over time and go back to the failure** — "Yes. Intermittent
     problems need history, not a snapshot."
   - d) Reinstall Game Tools — "Never the answer."

3. **Fill-in-the-blank** — `data-kind="fib"`:
   `The console shows you an ` blank(`data-answer="error|message|event|exception"`) `, a
   dashboard shows you a value ` blank(`data-answer="now|right now|live|currently"`) `, and
   AdvantageScope shows you a value ` blank(`data-answer="over time|history|through time"`) `.`
   Win: "Three tools, three time horizons. Choosing well is most of debugging speed."
   Lose: "Console = an event that happened. Dashboard = the value now. AdvantageScope = the
   value over time."

4. **Predict / short answer** — "You publish a value under the name `value1`. Six weeks later
   you're at a competition graphing three traces. What's the problem?"
   `data-answer="you don't know what it is|bad name|you cant tell what it is|no idea what it is|unclear name|meaningless name"`
   Win: "You can't tell what it is. Name values like `arm/position` and `intake/current` — the
   name is the only documentation a trace ever gets."
   Lose: "Nobody, including you, will know what `value1` is. Names like `arm/position` cost
   nothing now and save you at 9 a.m. on a Saturday."

MISCONCEPTIONS:
- *"A dashboard is where I control the robot."*
  → "The Driver Station enables and controls. A dashboard *displays* — and it's a different
  window doing a different job."
- *"`println` and a dashboard are the same thing."*
  → "`println` sends a one-off line of text. A dashboard shows a *named value* that keeps
  updating — which means it can be graphed."
- *"AdvantageScope is for advanced teams."*
  → "It's the fastest way to find an intermittent problem, and reading a trace is easier than
  reading a log. It found a bug that live numbers hid completely."
- *"Everything should be published so we don't miss anything."*
  → "Twenty values at 50 Hz costs loop time and buries the three you actually need. Publish
  deliberately."
- *"Glass is the FRC dashboard."*
  → "Glass is *this team's current* dashboard. SmartDashboard was, until it wasn't. Check every
  season."

EXERCISE: **PenguinBot's telemetry plan.**
*Where we are:* you have a CAN ID map (`frc-can-ids`) and a full toolbox. You haven't written
robot code yet — so plan what you'll want to *see* when you do.

Task: list the values PenguinBot should publish, with, for each: the name you'd publish it
under, which tool you'd watch it in, and the one question it answers. Cover the intake, the arm,
and the drivetrain. Then name the one value you'd graph over time on the strength of the war
story alone.

**Reference solution** (`details.reveal`):

| Value | Published name | Watch in | Question it answers |
|---|---|---|---|
| Arm position | `arm/position` | Glass (live) | Where is the arm right now? |
| Arm at setpoint? | `arm/atSetpoint` | Glass (live) | Is it safe to run the next step? |
| Intake current | `intake/current` | **AdvantageScope** | Is the roller stalling on a game piece? |
| Arm current | `arm/current` | **AdvantageScope** | Is it hitting a current limit and cutting out? |
| Drive speed | `drive/speed` | Glass (live) | Is the drivetrain responding at all? |
| Vision sees a tag? | `vision/hasTarget` | Glass (live) | Can we aim right now? |

> The one to graph over time on the war story alone: **current draw**. A motor that cuts out
> intermittently looks perfectly healthy every single time you check a live number. The team
> only found it by graphing amperage and seeing the spike.
>
> Notice that half of these values don't exist yet — you can't publish an arm position until you
> can *read* one. That's Unit 5.

Tease: "Unit 2 is done: you can install it, connect to it, address it, and watch it. Unit 3 is
the map of the project itself — where every line of code you're about to write belongs."

CHECKPOINT: (4 questions, every option explained)

**Q1.** What carries a published value from the robot to your laptop?
- a) The CAN bus — "CAN is inside the robot, between the RIO and the devices."
- b) ✓ **NetworkTables** — "Yes — a shared table of named values both sides can see."
- c) `System.out.println` — "That sends text to the console; it isn't a named, updating value."
- d) The USB cable to the SparkMax — "That's the vendor client's private connection to one
  device."

**Q2.** What does AdvantageScope do that a live dashboard can't?
- a) Show more values at once — "Both can show many values."
- b) ✓ **Plot values against time so you can see what happened** — "Correct — and that's how the
  amperage cutout was finally found."
- c) Enable the robot — "Only the Driver Station enables."
- d) Set CAN IDs — "That's the vendor clients."

**Q3.** Why does this lesson refuse to tell you which dashboard to use?
- a) They're all identical — "They aren't; they differ in features and in what's permitted."
- b) ✓ **Which dashboard is current, and which are allowed at competition, changes between
  seasons** — "Right — the team moved off SmartDashboard for exactly this reason."
- c) Dashboards don't matter — "They matter a lot; the choice is just not permanent."
- d) The team doesn't use one — "They use one; it just isn't the same one it used to be."

**Q4.** Best name for a published arm angle?
- a) `value1` — "Unreadable in six weeks, and unreadable to teammates immediately."
- b) `a` — "Worse."
- c) ✓ **`arm/position`** — "Yes — grouped by mechanism, says what it is, readable on a trace."
- d) `System.out.println(position)` — "That's a print statement, not a published name."

SEASON-FLAGS: **This is the most season-dependent lesson in the track. Flag generously.**
- Which dashboards exist and which are permitted at competition. SmartDashboard's phase-out is
  the source's own example of exactly this churn.
- `[NEEDS RESEARCH: 2026 dashboard landscape — Glass status, Elastic status, whether
  SmartDashboard/Shuffleboard still ship, and any competition restrictions —
  content/research/toolchain-2026.md]`
- `[NEEDS RESEARCH: whether AdvantageScope now ships with the WPILib installation or is still a
  separate download in 2026]`
- `[NEEDS RESEARCH: current publishing API — is `SmartDashboard.putNumber` still the
  recommended entry point, or is a NetworkTables-native / epilogue-style API preferred?]`
- Every code line on this page sits inside a season callout until those land.

WIDGET-REQUEST: none. The four annotated trace shapes are static author-drawn SVG or a
`.diagram` block; challenge 1 supplies the interaction.
