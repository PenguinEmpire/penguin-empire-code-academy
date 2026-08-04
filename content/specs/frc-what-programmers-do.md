# frc-what-programmers-do · What an FRC Programmer Does
unit: 0 · Orientation   |   duration: 15 min   |   difficulty: Beginner
interactivity: NO-COMPILER (drag-to-order "the season timeline" + MCQ + predict-output)

> Read `_shared-conventions.md` first. This is the first page of Phase 2 — it sets the voice
> for 30 lessons. Warm, honest, zero hype.

INTRODUCES:
- `programmer-role` — what the software sub-team is actually responsible for
- `mechanics-vision-auto-split` — the three workstreams and their dependency order
- `firmware-push-responsibility` — programmers touch hardware too (imaging, firmware, IDs)
- `iteration-loop` — write → deploy → watch → adjust; you never get it right the first time
- `safety-judgement` — knowing when *not* to ship something
- `season-shape` — build season, competition, offseason

ASSUMES:
- All of Phase 1 Java (variables → lambdas → exceptions). Nothing FRC-specific.
- That the student has never touched a robot. Assume zero hardware knowledge.

GOAL:
Describe what an FRC programmer is responsible for across a season, and explain why
autonomous is always built last.

HOOK: **The voice-controlled ChairBot** (`_shared-conventions.md` §6 story 2).
A team member built a working offline voice-command prototype for the ChairBot using a
~40 MB local speech model — no internet, no API, running on a Raspberry Pi or the driver
station laptop, sending results to the robot over NetworkTables (the standard FRC pattern).
It *worked*. It still didn't ship: one drive motor drifted right and needed constant
correction, and the only safety feature was having to hold something while giving a command.
The point of the hook: **the job is not "make it work." The job is "make it work reliably,
and know when it doesn't."** That judgement call is the most senior thing on this page.

Second beat, same section: the team experimented with simulating robot code one year and
never got the tooling stable, so they went back to waiting for the physical robot
(story 21). Programmers work around broken tools constantly. That is normal.

EXPLAIN: (concept beats in order, with the analogy)

1. **You are not "the person who types."**
   Analogy: a mechanism is a body; the software is the nervous system. Mechanical builds
   the arm; you make it *know where it is and stop at the right place*. Neither half is a
   robot on its own.

2. **Three workstreams, in dependency order.** This is the spine of the whole track.
   - **Mechanics** — make each mechanism move on command (intake spins, arm lifts).
   - **Vision** — make the robot see where it is relative to the field.
   - **Autonomous** — the first ~20 seconds of a match where nobody is driving.
   Analogy: *you cannot choreograph a dance before the dancer can walk.* Autonomous is
   literally a **sequence of the commands you already wrote** for mechanisms, aimed by
   vision. Build it last. (The source is emphatic about this; the whole course order
   obeys it, and Unit 11 is the last unit for exactly this reason.)

3. **Programmers touch hardware.** Not a metaphor: you image the RoboRIO each season, image
   the radio at competition, push motor-controller firmware, and assign CAN IDs. Unit 1 and
   Unit 2 exist because you cannot debug a signal you can't picture.

4. **The loop is write → deploy → watch → adjust.** Analogy: cooking without tasting. You
   never know which direction "positive" spins a motor until you run it slowly and look.
   Nothing on a robot is verified by reading it.

5. **The season shape.** Build season (weeks of nightly iteration) → competition (you're at
   the field with the drive team, watching a console) → offseason (learning, side projects
   like the ChairBot). Set the expectation that Unit 12 is about the day it all gets used.

6. **Closing beat — the one rule.** From the source, verbatim in spirit: *don't be afraid to
   say when something doesn't make sense; keep poking at it until it clicks — that matters
   more than nodding along.* Put this in a `callout--tip`. It licenses the student to be
   confused for the next 29 lessons.

CODE: none. This lesson has **no code blocks at all** — deliberate. The first FRC page a
student reads should not be syntax. One `.diagram` instead:

```
MECHANICS   →   VISION   →   AUTONOMOUS
(Units 4-8)    (Units 9-10)   (Unit 11)
 make it        know where     do it with
 move           you are        nobody driving
```
Mark: [FROM PDF page 3, progression map + "keep Unit 11 last"]

SANDBOX: none — NO-COMPILER lesson.
Interactive load is carried by the drag-to-order challenge (below) plus the MCQ set.

CHALLENGES: (≥3, mixed kinds)

1. **Drag-to-order** — `data-kind="order"`. Prompt: "Your team wants a robot that drives
   itself to the goal and scores during autonomous. Put these four jobs in the order you
   must do them."
   Items (shuffled): *Write the auto routine* / *Make the arm lift to a setpoint* / *Make the
   Limelight report the angle to the tag* / *Make the intake motor spin*.
   **Answer key:** Make the intake motor spin → Make the arm lift to a setpoint → Make the
   Limelight report the angle to the tag → Write the auto routine.
   Win: "Exactly. Auto is a sequence of commands you already wrote, aimed by vision. It
   cannot come first."
   Lose: "Autonomous is last. It reuses your mechanism commands and your vision readings —
   there is nothing to sequence until those work."
   *Fallback if `data-kind="order"` isn't shipped: an MCQ with four candidate orderings.*

2. **MCQ** — "Which of these is *not* an FRC programmer's job?"
   - a) Imaging the RoboRIO at the start of the season — `data-explain`: "This is yours.
     Programmers push firmware and images, not just code."
   - b) Assigning CAN IDs to motor controllers — "Yours. You do it in the vendor client so
     your code can address each motor."
   - c) **Coaching the driver during a match** ✓ correct — "Right. That's the drive coach.
     Your job at the field is watching the console for errors — you'll see this again in
     Unit 12."
   - d) Watching the Driver Station console for errors — "Yours, and it's the main one on
     game day."

3. **Predict / short answer** — `data-kind="text"`.
   Prompt: "A teammate has a working voice-control prototype for the robot. It responds
   correctly about 9 times out of 10, and there's no way to stop a command once it starts.
   In one word: ship it, or shelve it?"
   `data-answer="shelve|shelve it|no|don't ship|dont ship"`
   Win: "Shelve it. This actually happened — the prototype worked and still didn't make the
   robot, because 'works most of the time' plus 'no stop button' is a safety problem."
   Lose: "Shelve it. Reliability and a way to stop are not optional extras on a 120-pound
   machine — the team shelved exactly this prototype for exactly this reason."

MISCONCEPTIONS:
- *"Programming is the last step — mechanical builds it, then we code it."*
  → Correcting sentence: "Software runs alongside the build, not after it; you'll be
  assigning CAN IDs and testing motors on a half-built robot, which is why Units 1 and 2 are
  hardware and tooling."
- *"Autonomous is the hard, impressive part, so we should start there."*
  → "Autonomous is the *easy* part once everything else works, because it's just a sequence
  of commands you already wrote — and it is impossible before then."
- *"If I break something, I've failed."*
  → "Every season this team has broken something — a fried motor, bent parts, a mechanism
  that fell off. What separates a good programmer is starting low, raising slowly, and
  saying out loud when something doesn't make sense."
- *"I need a powerful laptop to do this."*
  → "One captain's computer died mid-season and he wrote code on the driver-station laptop
  for the rest of the year. You'll meet that story properly in Unit 2."

EXERCISE: **Map your season** (the one non-code entry in the PenguinBot spine — it's the
"what are we building" page, so the exercise is a plan, not a class).
Give the student the PenguinBot description from `_shared-conventions.md` §2 verbatim:
an intake, an arm, a swerve drivetrain, and a Limelight. Ask them to write, in their own
words, the order in which they'd make PenguinBot score a game piece by itself — and one
sentence on what breaks if they do vision before the arm works.

**Reference solution** (put in `details.reveal`):
> 1. Spin the intake motor (Unit 4). 2. Read the arm's encoder so I know where it is
> (Unit 5). 3. Use PID so the arm stops at the scoring position instead of slamming past it
> (Unit 6). 4. Turn that into a Command so it has a clear end, and a Subsystem that owns the
> motors (Unit 7). 5. Bind it to a controller button and chain arm-up → outtake → arm-down
> (Unit 8). 6. Make the robot drive (Unit 9). 7. Use the Limelight's TX to aim (Unit 10).
> 8. Only now: draw a path and sequence those commands into an auto routine (Unit 11).
>
> If I do vision first, I have a robot that can tell me it's 12° off target and can do
> nothing about it — there's no arm command to aim and no drivetrain to turn. Vision only
> produces an *error number*; something else has to act on it.

Close with the spine tease: "That list is this whole phase. By Unit 11 you will have
written every step of it."

CHECKPOINT: (4 questions, every option explained)

**Q1.** Why is autonomous built last?
- a) It's the hardest math — "Not really; PathPlanner generates the math. The reason is
  dependency, not difficulty."
- b) ✓ **It's a sequence of the mechanism and vision commands you already wrote** — "Right.
  Nothing to sequence until those exist."
- c) It only matters at competition — "It's worth a lot of match points, and it's built last
  for dependency reasons, not importance."
- d) The rules change every year — "They do, and that's a real season flag, but it isn't why
  auto comes last."

**Q2.** Which best describes a programmer's relationship to hardware?
- a) None — you only write code — "Wrong. You image the RIO, push firmware, and set CAN IDs."
- b) ✓ **You push firmware and images, set device IDs, and must understand how signals
  travel** — "Yes — that's the whole reason Units 1 and 2 come before any code."
- c) You build the mechanisms — "That's the mechanical sub-team; you make their mechanisms
  know things."
- d) You only touch hardware at competition — "You touch it all season; competition just adds
  the radio imaging and the console watch."

**Q3.** A prototype works 90 % of the time and can't be stopped mid-action. What does a good
programmer do?
- a) Ship it — 90 % is good — "On a 120-pound machine, the 10 % is the whole problem."
- b) ✓ **Shelve it until it's reliable and stoppable** — "Correct, and that's a real call
  this team made about a working voice-control prototype."
- c) Ship it but tell the driver to be careful — "A verbal warning is not a safety feature."
- d) Rewrite it in a different language — "The language was never the issue; reliability and
  a stop condition were."

**Q4.** What is the write-deploy-watch-adjust loop for?
- a) Making the code compile faster — "Compilation isn't the bottleneck; reality is."
- b) Satisfying the inspectors — "Inspectors check the robot, not your workflow."
- c) ✓ **You cannot tell what a mechanism will do by reading the code — you have to run it
  and look** — "Exactly. You won't even know which direction 'positive' spins a motor until
  you test it slowly."
- d) It's a rule in the game manual — "It's a working habit, not a rule."

SEASON-FLAGS:
- The autonomous period length ("the first ~20 seconds") is **game-specific**. Wrap in
  `callout--season`: "Auto length and scoring change every game — check this season's manual."
- Nothing else here should date.

WIDGET-REQUEST: none. Uses drag-to-order (`data-kind="order"`, in-flight per plan §6) with an
MCQ fallback stated above.
