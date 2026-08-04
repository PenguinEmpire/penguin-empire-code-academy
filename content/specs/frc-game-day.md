# frc-game-day · At the Competition
unit: 12 · Game Day   |   duration: 20 min   |   difficulty: Beginner
interactivity: NO-COMPILER (`checklist` widget + console-triage MCQs + drag-to-order)

> Read `_shared-conventions.md` first. This is the **final lesson of the whole course**. It should
> read like a handover, not a summary — the student is about to be the programmer at a field. Warm
> in tone, ruthless in specifics.

INTRODUCES:
- `field-setup` — what happens at the field, in what order
- `radio-imaging-at-field` — imaged at the field's setup laptop, re-imaged at home after
- `driver-station-laptop-kit` — the three things you plug in
- `console-watching` — your actual job during a match
- `role-boundaries` — you are not the drive coach
- `pre-match-checklist` — the artifact this lesson produces
- `post-match-debrief` — what to record while it's fresh

ASSUMES:
- Everything. This lesson is allowed to reference any concept in the track.
- Especially: `driver-station`, `ds-status-indicators` (`frc-game-tools`); `can-timeout-error`
  (`frc-can-ids`); `isolate-code-wiring-build` (`frc-vendor-clients`); `radio`,
  `radio-boot-delay` (`frc-roborio-radio-can`); `limelight-config` (`frc-limelight`);
  `auto-chooser`, `start-pose` (`frc-auto-routines`).

GOAL:
Do the programmer's job at a competition: get the robot on the field, watch the right things, and
diagnose the errors you'll actually see.

HOOK: **Your job is not to coach the driver** (`_shared-conventions.md` §6 story 20 — PDF page 17,
§12.1). `callout--why`.
This surprises people, so say it early and plainly. During a match, the programmer's job is:

- **Not** telling the driver what to do — that's the drive coach's role, and two voices is worse
  than one.
- **Watching the console for errors.** `CAN ID 16 timed out` means a wrong ID or, more often, a
  wiring break — and now you know it's the back-left steering module.
- **Answering the driver's questions.** "Did the arm actually go up?" is a question only you can
  answer, because you're the one looking at the numbers.

It's a quieter job than people expect, and a more useful one. The team's most valuable ninety
seconds are the ones between matches, and what you noticed during the match is what makes them
count.

Second beat, and end the whole course on it: **the captain's laptop died mid-season and he wrote
code on the driver-station laptop for the rest of the year.** The robot didn't care. Neither did
the code. Whatever you don't have, the show goes on.

EXPLAIN:

1. **What's different at a competition.** Three things, and all three are yours:
   - The **radio must be imaged at the field's setup laptop** before you play — different
     configuration from the one you use at home. And you **re-image it at home afterwards**, or
     nothing works in the shop on Monday.
   - You go **to the field with the drive team**, carrying the driver-station laptop.
   - You plug in **three things**: **Ethernet** (to the field), the **controller** (USB), and
     **power**.
   Mark: [FROM PDF page 17, §12.1]
   `[NEEDS RESEARCH: whether radio imaging at the field is still the 2026 procedure, and what the
   current radio and its setup flow are — content/research/toolchain-2026.md. This is the most
   likely item on the page to have changed. Wrap in callout--season.]`

2. **Only one laptop can do this.** From `frc-game-tools`: the Driver Station is Windows-only. The
   team's Macs cannot enable the robot. Consequences that bite at 8 a.m.:
   - Everyone's code has to reach **that** laptop before the first match.
   - That laptop has to be **charged**, and its charger has to be in the bag.
   - In a pinch you can write code **on it** — which is exactly what the captain did all season.
   Mark: [FROM PDF page 17, §12.2]

3. **The pre-match sequence.** This is the lesson's central artifact. It's an expansion of the
   bring-up checklist the student wrote in `frc-game-tools`, now with a competition's constraints:
```
IN THE PIT
  [ ] Correct code deployed to the robot. Confirm the version, don't assume.
  [ ] Charged battery, secured.
  [ ] Limelight re-tuned for THIS venue's lighting.
  [ ] Autonomous routine selected in the chooser.
  [ ] Mechanisms move by hand -- nothing jammed from the last match.

AT THE FIELD
  [ ] Robot placed on the marked start position, correct heading.
  [ ] Plug in: Ethernet, controller, power.
  [ ] Driver Station open. Controller assigned to port 0.
  [ ] Communication green.
  [ ] Robot Code green.
  [ ] Joystick green.
  [ ] Console clear of errors before the match starts.

DURING THE MATCH
  [ ] Watch the console. Not the robot.
  [ ] Note anything that appears, with roughly when.

AFTER THE MATCH
  [ ] Write down what you saw while you still remember it.
  [ ] Fix what you can in the pit. Note what you can't.
```
   The line **"Watch the console. Not the robot."** deserves a callout. Everyone watches the
   robot. Everyone in the stands is watching the robot. Nobody else is watching the console, and
   it is the only place a fault announces itself.

4. **Console triage — the reference table.** The whole course, collapsed into diagnosis. This is
   what a student will actually come back to this page for:

| What you see | Most likely | Check | Taught in |
|---|---|---|---|
| `CAN ID <n> timed out` | wiring break (more often), or a wrong ID | the CAN chain at and before that device; grouped IDs tell you where | `frc-can-ids` |
| Communication red | radio still booting, or field connection | wait 1–2 min; check the Ethernet | `frc-roborio-radio-can` |
| Robot Code red | code not deployed, or it crashed | redeploy; read the console for an exception | `frc-game-tools` |
| Joystick red | controller not assigned | drag it into port 0 in the DS | `frc-controllers` |
| Everything green, nothing moves | robot not **Enabled** | enable it | `frc-game-tools` |
| One mechanism dead, others fine | that device's ID or wiring | vendor client: does it see the device? | `frc-vendor-clients` |
| Auto did nothing at all | a step hung with no timeout, or the wrong routine selected | the chooser; the console; add timeouts | `frc-auto-routines` |
| Vision never aims | camera not re-tuned for this venue, or no valid tag | re-tune; check the published tag ID | `frc-limelight` |
| Mechanism moves, then stops | current limit, or a fault | graph the current; check sticky faults | `frc-dashboards` |

   Note in the lesson that the **grouped CAN ID scheme** from Unit 2 is what makes row one a
   location instead of a number. That was the point of doing it.

5. **The isolation procedure still applies, and faster.** Reprise `frc-vendor-clients`'s
   four-step: turn it by hand → apply a test voltage → does the client see the device → *then*
   read your code. Between matches you have minutes, not hours. Cheap checks that eliminate whole
   categories are worth more under time pressure, not less.

6. **What to change between matches, and what not to.** A judgement paragraph, and it's genuinely
   the most senior thing on the page:
   - **Do** fix a clear, understood fault. A broken wire, a wrong constant, a missing timeout.
   - **Do** switch to the simpler autonomous routine if the complex one failed and you don't know
     why.
   - **Don't** deploy a change you haven't tested because you *think* it'll help. An untested
     deploy between matches is how a working robot becomes a broken one.
   - **Don't** re-tune PID at a competition unless something mechanical changed. The story from
     `frc-pid-tuning` — bent parts, a mechanism falling off — happens fastest under pressure.
   The rule: **at a competition, prefer a known-working robot over a better one.**

7. **Closing the course.** Two short paragraphs, and they should be warm.
   First: name what the student has built. PenguinBot intakes, senses its own position, holds a
   setpoint under closed-loop control, sequences behaviours with real end conditions, responds to
   a driver, drives field-centrically, aims itself at a tag, and runs a scoring routine with
   nobody touching it. Twelve units ago they had never created a motor object.
   Second: the source's own closing note, and it's the right last line of the whole course —
   *don't be afraid to say when something doesn't make sense. Keep poking at it until it clicks.
   That matters more than nodding along.*

CODE: **none.** The final lesson of a programming course has no code in it, deliberately, and it's
worth one sentence saying why: on game day the code is finished. What's left is knowing what to
look at.

SANDBOX: none — NO-COMPILER lesson.

Interactive load:
1. The **`checklist`** widget (requested in `frc-game-tools`) holding the full pre-match checklist
   — persistent, so a student can genuinely use it at a competition on their phone. This is the
   one widget in the track with a real-world use outside the lesson.
2. Console-triage MCQs (below) — a small diagnostic drill.
*Fallback:* a plain `<ol class="task-list">` and the triage table.

CHALLENGES:

1. **MCQ · triage** — "Mid-match the console prints `CAN ID 16 timed out`. This code has worked all
   weekend. What's your first move?"
   - a) Redeploy the code — "The code hasn't changed and worked all weekend."
   - b) ✓ **Note it, and after the match check the CAN wiring at the back-left steering module** —
     "Right on both counts: you can't fix it mid-match, and the grouped ID scheme tells you
     exactly where to look."
   - c) Tell the driver to avoid turning left — "That's the drive coach's call, and it treats the
     symptom."
   - d) Change the CAN ID in code — "It worked all weekend; the number is right."

2. **MCQ · role boundaries** — "During a match the driver is lining up badly and you can see it.
   What do you do?"
   - a) Tell them how to line up — "That's the drive coach's job. Two voices is worse than one."
   - b) ✓ **Keep watching the console, and answer if they ask you something** — "Yes — that's the
     job as the source describes it, and it's the one nobody else is doing."
   - c) Take the controller — "Never."
   - d) Disable the robot — "Only for a genuine safety problem, and that's a call you make out
     loud with the team."

3. **Drag-to-order · at the field.** Items (shuffled): *Place the robot on the marked start
   position* · *Plug in Ethernet, controller and power* · *Check Communication, Robot Code and
   Joystick* · *Confirm the autonomous routine is selected* · *Watch the console during the match*.
   **Answer key:** place the robot → plug in → check the three indicators → confirm the auto
   selection → watch the console.
   Win: "Physical setup, then connection, then the indicators, then the one setting that decides
   the first fifteen seconds. Then your actual job."
   Lose: "Robot placed first (the start pose is a promise your auto depends on), then the three
   plugs, then the three indicators in order, then the chooser — and then watch the console."
   *Fallback: MCQ over three orderings.*

4. **MCQ · what to change** — "Autonomous did nothing last match and you're not sure why. Six
   minutes until the next one. What do you do?"
   - a) Rewrite the auto routine — "No time, and untested code between matches is how you lose a
     working robot."
   - b) Re-tune the arm's PID — "Nothing suggests the gains, and this is exactly the pressure that
     breaks mechanisms."
   - c) ✓ **Switch the chooser to the simple leave-the-line routine, and investigate after the
     match** — "Exactly. Known-working beats better, and you still score the leave points."
   - d) Run it and hope — "You already know it doesn't work."

5. **Predict / short answer** — "You get to the field, plug everything in, and Communication is
   red. Before touching anything, what do you do?"
   `data-answer="wait|wait 1-2 minutes|wait a minute|wait for the radio|wait two minutes"`
   Win: "Wait. The radio takes 1–2 minutes to come up. More field time is lost to impatience here
   than to any actual fault."
   Lose: "Wait 1–2 minutes for the radio to boot. It's the same advice as Unit 1, and it's still
   the most common false alarm in FRC."

MISCONCEPTIONS:
- *"The programmer coaches the driver during a match."*
  → "The drive coach coaches. You watch the console and answer questions — the job nobody else is
  doing."
- *"If the robot is working, there's nothing to watch."*
  → "The console is where a fault announces itself before it becomes a failure. A timeout in match
  three is why you check a connector before match four."
- *"We can fix anything between matches."*
  → "You have minutes. Prefer switching to a known-working configuration over deploying an
  untested fix."
- *"The radio only needs imaging once."*
  → "Imaged at the field for competition, re-imaged at home afterwards. Both directions."
- *"Any laptop can run the match."*
  → "The Driver Station is Windows-only. One laptop, charged, with its charger in the bag."
- *"Vision worked in the shop, so it'll work here."*
  → "Different lighting. Re-tune at the venue — it's on the checklist."
- *"I need my own powerful machine to contribute."*
  → "One captain wrote a whole season on the driver-station laptop after his own died."

EXERCISE: **PenguinBot's competition checklist.**
*Where we are:* PenguinBot is finished — intake, arm, closed-loop control, commands, bindings,
swerve, vision, and an autonomous routine with a fallback. This is the last thing it needs, and
it isn't code.

Task: write the checklist your team will actually use. Not a generic one — PenguinBot's, with its
real numbers and its real failure modes.
1. **Pit checklist** — before the robot leaves for the field.
2. **Field checklist** — from arriving to the match starting.
3. **During-match** — what you watch and what you write down.
4. **Post-match** — what you record and what you check.
5. **Triage card** — the five errors you're most likely to see on *this* robot, and the first check
   for each. Use PenguinBot's actual CAN map so an ID reads as a location.
6. One paragraph: three things you will **not** do at a competition, and why.

**Reference solution** (`details.reveal`):
> **1. Pit**
> - [ ] Correct code deployed — check the version, don't assume the last person deployed.
> - [ ] Battery charged and secured.
> - [ ] Arm moves freely by hand through its full range. Intake roller turns freely.
> - [ ] **Limelight re-tuned for this venue's lighting.**
> - [ ] `VisionConstants.kScoringTagIds` matches this field's tags.
> - [ ] Autonomous routine chosen and, if in doubt, set to `LeaveLineAuto`.
> - [ ] Charger and spare battery in the cart.
>
> **2. Field**
> - [ ] Robot on the marked start position, correct heading — the auto's start pose depends on it.
> - [ ] Plug in **Ethernet**, **controller**, **power**.
> - [ ] Driver Station open; controller dragged into **port 0**.
> - [ ] **Communication** green (wait 1–2 min if not).
> - [ ] **Robot Code** green.
> - [ ] **Joystick** green.
> - [ ] Console clear before the match starts.
> - [ ] Chooser shows the routine we intend.
>
> **3. During the match** — watch the **console**, not the robot. Write down any line that
> appears, with roughly when. Answer the driver if asked; otherwise stay quiet.
>
> **4. Post-match** — write it down before you talk to anyone: what appeared in the console, did
> auto do what it should, did anything behave oddly. Check `arm/current` and `intake/current` in
> AdvantageScope if a mechanism cut out. Clear sticky faults **only after** you've fixed the cause.
>
> **5. PenguinBot triage card**
>
> | Error | First check |
> |---|---|
> | `CAN ID 2 timed out` | Intake roller SparkMax — connector and CAN wiring |
> | `CAN ID 3 timed out` | Arm pivot SparkMax — same |
> | `CAN ID 16 timed out` | **Back-left steering** Kraken — CAN chain at that corner |
> | Arm doesn't reach its setpoint | Is it homed? Is something jammed? Did the timeout fire? |
> | Robot won't aim | Is a valid tag visible? Was the Limelight re-tuned for this venue? |
>
> **6. Three things I will not do**
> 1. **Deploy an untested change between matches.** A robot that works imperfectly beats one that
>    doesn't work at all, and I won't know which I've got until the match starts.
> 2. **Re-tune PID at a competition** unless something mechanical actually changed. Bad gains bend
>    parts, and I'd be doing it in six minutes under pressure.
> 3. **Coach the driver.** That's the drive coach's job. Mine is the console, and if I'm talking
>    I'm not reading it.

**Closing the course** (this goes after the exercise, before the checkpoint — write it warmly):
> Twelve units ago you had never created a motor object. PenguinBot now runs an intake, reads its
> own arm position, holds a setpoint under closed-loop control, sequences behaviours with real end
> conditions, responds to a driver, drives field-centrically, aims itself at an AprilTag, and runs
> a full scoring routine with nobody touching the controls.
>
> Every one of those is a thing your team's robot needs someone to do.
>
> And the last piece of advice comes from the person who recorded the onboarding this course was
> built from: **don't be afraid to say when something doesn't make sense. Keep poking at it until
> it clicks. That matters more than nodding along.**

CHECKPOINT: (5 questions, every option explained)

**Q1.** What is the programmer's main job during a match?
- a) Coaching the driver — "That's the drive coach."
- b) ✓ **Watching the console for errors and answering the driver's questions** — "Yes, and it's
  the job nobody else on the team is doing."
- c) Operating a mechanism — "One driver, one controller."
- d) Filming the match — "Useful for someone; not you, not now."

**Q2.** What three things get plugged in at the field?
- a) Power, HDMI, USB — "No display goes to the field."
- b) ✓ **Ethernet, the controller, and power** — "Right — and knowing this in advance is what
  makes setup take one minute instead of five."
- c) Ethernet, power, and the radio — "The radio is on the robot, not the laptop."
- d) Just power and the controller — "Ethernet is how the laptop reaches the field."

**Q3.** When does the radio get imaged?
- a) Once, at the start of the season — "It changes for competition."
- b) ✓ **At the field's setup laptop before you play, and re-imaged at home afterwards** — "Both
  directions, and forgetting the second one is why nothing works on Monday."
- c) Every match — "Once per event, not per match."
- d) Never; it's automatic — "It's a deliberate step, and it's yours."

**Q4.** Autonomous failed and you don't know why. Six minutes to the next match.
- a) Rewrite it — "No time, and untested code is a bigger risk than a simpler routine."
- b) Deploy a guess — "That's how a working robot becomes a broken one."
- c) ✓ **Select the simple fallback routine and investigate afterwards** — "Correct: at a
  competition, prefer a known-working robot over a better one."
- d) Skip autonomous entirely — "You'd give up the leave-the-line points for nothing."

**Q5.** `CAN ID 16 timed out` appears. On PenguinBot, what is device 16?
- a) The intake roller — "That's 2."
- b) The arm pivot — "That's 3."
- c) ✓ **The back-left swerve steering motor** — "Yes — and being able to say that in two seconds
  is exactly why the IDs were grouped by mechanism back in Unit 2."
- d) The PDH — "That's 1."

SEASON-FLAGS:
- `callout--season` on the radio imaging procedure — **the most likely item on this page to have
  changed**. `[NEEDS RESEARCH: 2026 radio model and its at-the-field setup flow —
  content/research/toolchain-2026.md]`
- `[NEEDS RESEARCH: whether field connection is still Ethernet-to-the-DS in 2026]`
- `callout--season` on the Driver Station being Windows-only (stable, but re-verify annually).
- Match structure, autonomous length, and field layout are **game-specific** — flag any mention.
- The triage table's *reasoning* and the role boundaries are stable and need no flags.

WIDGET-REQUEST: none new. Uses the **`checklist`** widget requested in `frc-game-tools` — and this
is the lesson that most justifies building it, since a persistent checklist on a phone is
genuinely useful at a competition. Plain `<ol class="task-list">` fallback.
