# frc-pid-tuning · The Tuning Recipe
unit: 6 · Closed-Loop Control   |   duration: 30 min   |   difficulty: Intermediate
interactivity: SANDBOX (PenguinSim) + **PID playground** widget

> Read `_shared-conventions.md` first (§3 sim contract; paste **real** output).
> This is the lesson where the sandbox *is* the teaching. The five-run gain ladder below is
> pre-computed and load-bearing — verify every number against the shipped sim before publishing.

INTRODUCES:
- `tuning-recipe` — the team's ordered method
- `one-variable-at-a-time` — the rule that makes tuning possible at all
- `overshoot` — sailing past the setpoint
- `limit-cycle` — oscillating forever, never settling
- `output-clamping` — why the 80 % rule has to be enforced outside the controller
- `tolerance` — "close enough" as an explicit number
- `settling-time` — how long until it stays put

ASSUMES:
- `closed-loop-control`, `error`, `setpoint`, `proportional-term`, `integral-term`,
  `derivative-term`, `steady-state-error`, `oscillation` (`frc-pid-concept`)
- `encoder-position`, `homing` (`frc-encoders`, `frc-relative-absolute`)
- `eighty-percent-rule` (`frc-moving-a-motor`)
- **Not** `PIDController` syntax — that's the next lesson. This lesson hands the student a
  pre-written harness and asks them to change three numbers. Say that out loud in the intro:
  *"You don't need to understand every line yet. Change `kP` and press Run."*

GOAL:
Tune a P controller on a real mechanism using the team's recipe, and recognise the three
failure signatures — too slow, overshoot, never settles.

HOOK: **Every season, something breaks from bad PID** (`_shared-conventions.md` §6 story 12).
`callout--why`.
The source doesn't hedge: *every season the team has broken something from bad PID.* Bent
parts. On one occasion, **a whole mechanism falling off the robot.**

Here's how, and it's worth understanding precisely, because it explains why a number in a text
file can destroy hardware. Set `kP` too high and the controller reaches the setpoint travelling
fast, overshoots, sees a large error the other way, slams full power back, overshoots again —
and now the mechanism is being driven at maximum power in alternating directions, fifty times a
second. It's not a mechanism moving to a position any more. It's a machine hammering itself.

You will see exactly this in the sandbox on run 5. Nothing breaks there. Do it on a real arm and
something does.

The counterweight — the other half of the source's advice: **be patient, and change one variable
at a time.**

EXPLAIN:

1. **The recipe.** Reproduce it as a numbered procedure; this is the deliverable of the lesson.
   Mark: [FROM PDF page 10, §6.2]
   1. **Start with only `kP`, very small.** `kI` and `kD` stay at zero.
   2. **Raise `kP` slowly.** The narrator used steps of about 5 (on gains with a much bigger
      scale); *smaller is fine* and safer. Doubling is a reasonable habit.
   3. **If it oscillates or won't settle, adjust `kD`.**
   4. **If it misses the target by a little** and you can afford the correction time, **add a
      small `kI`.**
   5. **Change only one variable at a time** — otherwise you can't tell what helped.
   6. **Be patient.**

2. **Why rule 5 is not optional.** Analogy: changing two ingredients in a recipe and then
   deciding the cake is better. Better *because of which one*? You now have to test both again
   anyway, so you saved nothing and learned nothing. With three gains and no discipline, you're
   searching a three-dimensional space by guessing.

3. **Know what you're looking for before you start.** Define the target as a sentence with
   numbers in it, *before* touching a gain:
   > "The arm reaches 9.0 rotations **within 0.25** and **stays there**, in under **half a
   > second**, without exceeding **0.8** output."
   Without that sentence you'll tune forever, because "better" has no definition. Introduce
   **tolerance** (how close counts) and **settling time** (how long until it stays) here as the
   two numbers that make tuning finite.

4. **The four signatures.** This table is what the student will recognise for the rest of their
   FRC career, and the sandbox produces all four:

| Signature | What you see | What it means | Do |
|---|---|---|---|
| **Too slow** | Creeps, still short after a second | `kP` too small | Raise `kP` |
| **Steady-state gap** | Arrives *almost*, then sits | P too weak at small errors | Small `kI` (or accept it) |
| **Overshoot / ringing** | Sails past, comes back, wobbles in | `kP` too large | Lower `kP`, or add `kD` |
| **Limit cycle** | Slams back and forth forever, never settles | `kP` far too large | **Stop. Lower `kP` a lot.** |

   Beat: the fourth row is the mechanism-destroyer. Give it a `callout--pitfall`: *if a real
   mechanism starts doing this, disable the robot first and think second.*

5. **The clamp, and what it hides.** The harness clamps output to ±0.8 before it reaches the
   motor. That's the 80 % rule from Unit 4, and it's doing real work here: a `kP` of 0.2 at an
   error of 9.0 asks for **1.8**. Two consequences to teach:
   - Early in a big move the controller is **saturated** — pinned at maximum, moving at a
     constant rate, temporarily indistinguishable from open loop. That's why the first few ticks
     of a large move look like a straight line. This is normal and worth naming.
   - The clamp **limits speed. It does not prevent overshoot.** Run 5 in the sandbox oscillates
     violently while never exceeding 0.8. Students expect the clamp to be a safety net for bad
     gains. It isn't.

6. **Tune on the real mechanism, in the real conditions.** Gains depend on weight, gearing,
   friction, and gravity. An arm tuned empty is not tuned holding a game piece; an arm tuned on
   blocks is not tuned on the floor. The sim gets you the *method*; the robot gets you the
   *numbers*.

CODE:
The harness (below, in SANDBOX) is the only code on this page. Do not introduce `PIDController`
here — one lesson, one job.

SANDBOX:

Banner: **"Simulated for teaching. The real classes come from WPILib and REVLib."**

**Exact starter code** — the tuning harness. The student changes exactly one number:
```java
public class Main {
    public static void main(String[] args) {
        final double TARGET    = 9.0;    // PenguinBot's arm scoring setpoint, in rotations
        final double TOLERANCE = 0.25;   // "close enough"
        final double MAX_OUT   = 0.8;    // the team's 80% rule

        // ============ THE ONLY LINE YOU CHANGE ============
        double kP = 0.01;
        // ==================================================

        SparkMax arm = new SparkMax(3, MotorType.kBrushless);

        int settledAt = -1;
        System.out.printf("kP = %.2f   target = %.2f%n", kP, TARGET);
        System.out.println("tick   position");

        for (int tick = 1; tick <= 50; tick++) {
            double error  = TARGET - arm.getEncoder().getPosition();
            double output = kP * error;
            output = Math.max(-MAX_OUT, Math.min(MAX_OUT, output));
            arm.set(output);

            if (Math.abs(error) < TOLERANCE && settledAt < 0) settledAt = tick;
            if (Math.abs(error) >= TOLERANCE) settledAt = -1;   // it left again -- not settled

            if (tick % 5 == 0) {
                System.out.printf("%4d   %8.2f%n", tick, arm.getEncoder().getPosition());
            }
        }
        System.out.println(settledAt > 0
            ? "settled at tick " + settledAt + "  (" + (settledAt * 20) + " ms)"
            : "NEVER SETTLED");
    }
}
```
*Note for the sim engineer / author:* add `CommandScheduler.getInstance().run()` at the top of
the loop body if the model requires it.

**What the student changes:** `kP`, in this exact order. The lesson walks all five runs.

**Expected printed output — the five-run ladder.** All computed from the §3 contract
(`position += output × 2.0` per tick, clamped to ±0.8 by the harness).
**Author must re-run each of the five and paste real output.**

**Run 1 — `kP = 0.01` · too slow**
```
tick   position          tick   position
   5       0.86            30       4.09
  10       1.65            35       4.56
  15       2.35            40       4.99
  20       2.99            45       5.37
  25       3.57            50       5.72
NEVER SETTLED
```
Read it as: after a full second the arm is barely past halfway. In a match, that's a scoring
cycle you didn't complete.

**Run 2 — `kP = 0.05` · closer, still not there** (the source's own starting value)
```
   5       3.69            30       8.62
  10       5.86            35       8.77
  15       7.15            40       8.87
  20       7.90            45       8.92
  25       8.35            50       8.95
NEVER SETTLED
```
Read it as: the shape is right and it's decelerating properly — it just runs out of push near
the end. This is the steady-state gap from `frc-pid-concept`, and on a real arm with gravity it
would stop short entirely rather than creeping in.

**Run 3 — `kP = 0.20` · the answer**
```
   5       7.44            30       9.00
  10       8.88            35       9.00
  15       8.99            40       9.00
  20       9.00            45       9.00
  25       9.00            50       9.00
settled at tick 10  (200 ms)
```
Read it as: 200 ms, no overshoot, output never exceeded the clamp for long. **This is the number
PenguinBot uses for the rest of the course.**

**Run 4 — `kP = 0.95` · overshoot and ringing**
```
   5       8.00            30       9.05
  10       9.39            35       8.97
  15       8.77            40       9.02
  20       9.14            45       8.99
  25       8.92            50       9.01
NEVER SETTLED
```
Read it as: it got there faster — and then wobbled around the setpoint for the next 800 ms. Peak
overshoot was around **9.60** between the printed lines. Ask the student to print every tick to
find it.

**Run 5 — `kP = 1.50` · the mechanism-breaker**
```
   5       8.00            30       9.60
  10       9.60            35       8.00
  15       8.00            40       9.60
  20       9.60            45       8.00
  25       8.00            50       9.60
NEVER SETTLED
```
Read it as: **it is not converging. It never will.** The arm is being driven at full clamped
output in alternating directions, fifty times a second, forever. This exact behaviour is what
bends parts and shakes mechanisms off robots.

**Output shape assertions** (must hold even if the numbers differ):
1. Run 1 is monotonic, smooth, and **far short** at tick 50.
2. Run 2 is monotonic, smooth, and **just short** at tick 50.
3. Run 3 is monotonic, **reaches tolerance**, and reports a settle tick.
4. Run 4 **exceeds the target** at least once and then alternates above and below it.
5. Run 5 alternates between two values **forever**, with **no** trend toward the target, and
   reports `NEVER SETTLED`.
6. Runs 4 and 5 both stay within ±0.8 output — proving the clamp does not prevent overshoot.

**The extra experiment** (put it after the ladder, it earns its own subsection):
> Set `kP = 1.50` and **delete the clamp line**. Run it. PenguinSim prints its over-80 % warning
> and the oscillation gets wider. The clamp wasn't saving you — it was only limiting how hard
> the mechanism hit itself.

CHALLENGES:

1. **Predict the output** — `data-kind="text"`. "You've run `kP = 0.05` (finishes at 8.95) and
   `kP = 0.20` (settles at tick 10). Without running it, roughly where will `kP = 0.10` finish —
   short of 9.00, at it, or past it?"
   `data-answer="at it|at 9|reaches it|at the target|9.00|it reaches it|at|9"`
   Win: "It reaches it. `0.10` sits between a gain that crawls in and a gain that arrives
   crisply — no overshoot, just slower than 0.20. Run it and see how many ticks it takes."
   Lose: "It reaches the target, a bit slower than `0.20`. Overshoot doesn't start until the
   gain is high enough to jump past the setpoint in a single tick, and `0.10` is nowhere near
   that. Try it."

2. **MCQ · read the signature** — show run 5's output. "What do you do?"
   - a) Add `kI` to help it settle — "Adding push to something already slamming back and forth
     makes it worse."
   - b) Increase `kP` so it corrects faster — "This is *caused* by too much `kP`."
   - c) ✓ **Lower `kP` substantially** — "Yes. And on a real robot, disable first — this is the
     behaviour that breaks mechanisms."
   - d) Widen the tolerance until it counts as settled — "Now you have a mechanism destroying
     itself and a program that says it's fine."

3. **MCQ · read the signature** — show run 2's output. "What do you do?"
   - a) ✓ **Raise `kP`** — "Right — the shape is correct, there's just not enough push. Raise it
     and re-test."
   - b) Add `kD` — "`kD` damps oscillation. There's no oscillation here."
   - c) Lower `kP` — "It's already too slow."
   - d) Nothing; 8.95 is within 0.25 of 9.00 — "Check the numbers: 9.00 − 8.95 = 0.05, so it
     actually is inside tolerance at tick 50. But it took the full second to get there, and the
     spec said half a second. Read the settle line, not just the last row." *(Deliberate
     near-miss option — the explanation teaches reading the whole output. Keep it.)*

4. **Drag-to-order · the recipe.** Items (shuffled): *Set `kI` and `kD` to zero* · *Start with a
   very small `kP`* · *Raise `kP` slowly until it reaches the setpoint quickly* · *If it
   oscillates, add `kD`* · *If it stops just short, add a small `kI`*.
   **Answer key:** that order.
   Win: "That's the recipe. P first, always, and only one change at a time."
   Lose: "Zero the other two, start `kP` small, raise it slowly, and only then reach for `kD`
   (for oscillation) or `kI` (for a persistent gap)."
   *Fallback: MCQ over three orderings.*

5. **MCQ · about the clamp** — "Runs 4 and 5 both clamp output to 0.8. Why did they still
   misbehave?"
   - a) The clamp is too low — "A higher clamp would make it worse, not better."
   - b) ✓ **The clamp limits how *hard* it pushes, not *when* it stops pushing — a bad gain still
     overshoots, just at 0.8 instead of 1.0** — "Exactly. The clamp is a damage limiter, not a
     tuning fix."
   - c) The clamp only applies to positive values — "It's symmetric: `Math.max(-0.8, Math.min(0.8,
     …))`."
   - d) PenguinSim ignores the clamp — "It doesn't; the values in the trace confirm it's
     applied."

MISCONCEPTIONS:
- *"Higher `kP` is better — it gets there faster."*
  → "Up to a point. Past it you get overshoot, then ringing, then a mechanism hammering itself
  at 50 Hz."
- *"If P doesn't work, add I and D."*
  → "Add them for specific symptoms: `kI` for a persistent gap, `kD` for oscillation. Adding
  both because P was disappointing means you can't tell what did what."
- *"The 0.8 clamp keeps the mechanism safe."*
  → "It limits force. Run 5 stays under 0.8 the whole time and is exactly the behaviour that
  breaks parts."
- *"I can tune faster by changing two gains at once."*
  → "You'll get a result you can't attribute, and you'll have to test both again. Slower, not
  faster."
- *"Gains I found in the sim will work on the robot."*
  → "The sim has no gravity, no friction, no game piece, and no gearbox slop. It teaches you the
  method. The robot gives you the numbers."
- *"Once tuned, always tuned."*
  → "Re-check after a mechanical change, a new gearbox, or added weight. The mechanism changed;
  the gains describe the mechanism."

EXERCISE: **Tune PenguinBot's arm, and write down why.**
*Where we are:* your `Arm` class has a hand-written P controller with `kP = 0.05`, which crawls.

Task:
1. Using the sandbox, find a `kP` that gets the arm to 9.0 ± 0.25 in **under 15 ticks (300 ms)**
   with **no overshoot**.
2. Record a tuning log: for each `kP` you tried, the settle tick (or "never"), whether it
   overshot, and your one-sentence verdict. Minimum four rows. This log is the deliverable —
   the number is easy, the record of how you found it is the skill.
3. Set that `kP` in your `Arm` class.
4. Write the sentence you'd tell a teammate: what value, and what happens if they raise it.

**Full reference solution** (`details.reveal`):
> **Tuning log**
>
> | `kP` | Settled | Overshoot | Verdict |
> |---|---|---|---|
> | 0.01 | never (5.72 at tick 50) | no | Far too slow — not even halfway in a second |
> | 0.05 | never (8.95 at tick 50) | no | Right shape, not enough push at the end |
> | 0.20 | **tick 10 (200 ms)** | no | **Meets the spec.** Fast, clean, monotonic |
> | 0.95 | never — ringing | yes, to ~9.60 | Faster to arrive, then wobbles for 800 ms |
> | 1.50 | never — limit cycle | yes, permanently | Alternates 8.00 ↔ 9.60 forever. Dangerous |
>
> **In `Arm.java`:**
> ```java
> private double kP = 0.2;   // tuned: 9.0 rot in ~200 ms, no overshoot
> ```
> **What I'd tell a teammate:** "The arm runs `kP = 0.2` — that reaches the scoring setpoint in
> about 200 ms with no overshoot. Don't raise it past about 0.9 or it starts overshooting and
> ringing, and around 1.5 it never settles at all and just slams back and forth. If you change
> the arm's weight or gearing, re-tune — and change one number at a time."
>
> Notice the log has five rows and only one of them is the answer. That ratio is normal. Tuning
> is mostly ruling things out, which is why writing it down matters.

Tease: "You tuned a controller you wrote by hand. WPILib has a class that does the arithmetic
for you — plus tolerance checking and a proper reset. Next lesson swaps your four lines for it."

CHECKPOINT: (5 questions, every option explained)

**Q1.** What's the first step of the tuning recipe?
- a) Set all three gains to a reasonable middle value — "There's no such thing, and you'd have
  three unknowns at once."
- b) ✓ **Zero `kI` and `kD`, start `kP` very small, and raise it slowly** — "Correct — P alone,
  from the bottom."
- c) Copy the gains from another mechanism — "Gains describe *that* mechanism's weight, gearing
  and friction."
- d) Start `kP` high and come down — "You'd start with the mechanism-breaking case."

**Q2.** The arm sails past the setpoint and wobbles in. Which change comes first?
- a) Raise `kP` — "That's the cause."
- b) Add `kI` — "More push. Wrong direction."
- c) ✓ **Lower `kP`, or add some `kD`** — "Both address overshoot; lower `kP` first because it's
  one variable and it's the one that's wrong."
- d) Widen the tolerance — "That hides the symptom without fixing it."

**Q3.** Why change only one gain at a time?
- a) The controller can only accept one change per deploy — "It takes all three whenever you
  like."
- b) ✓ **Otherwise you can't attribute the change and have to re-test anyway** — "Exactly — the
  source says this explicitly, and it's the difference between tuning and guessing."
- c) It's faster — "It's slower per step and much faster overall."
- d) `kI` and `kD` interact and `kP` doesn't — "All three interact; that's precisely why you
  isolate."

**Q4.** Run 5 oscillates between 8.00 and 9.60 forever while never exceeding 0.8 output. What
does that prove?
- a) The clamp is broken — "The trace shows it working."
- b) ✓ **Clamping limits force but doesn't fix a bad gain** — "Right — it's a damage limiter,
  not a tuning tool."
- c) The setpoint is unreachable — "It passes through 9.00 on every single cycle."
- d) The encoder is too slow — "The encoder is keeping up fine; the gain is the problem."

**Q5.** You tune the arm empty and it's perfect. Then you pick up a game piece and it stops
short. Why?
- a) The encoder drifted — "Encoders don't drift from added weight."
- b) `kP` changed — "It's a number in a file; it didn't change."
- c) ✓ **The mechanism changed — more weight means more gravity to fight, and the gains describe
  the mechanism** — "Exactly, and this is the classic case for a small `kI` or a feedforward
  term."
- d) The battery is low — "Possible in general, but the symptom here tracks the game piece."

SEASON-FLAGS:
- Almost none — tuning is control theory, not API.
- One `callout--season` note: the narrator's "steps of about 5" refers to gains on a much
  larger scale than the values on this page. Present the *method* (raise slowly, one at a time),
  not that literal step size, and say so.
- Motion profiling is named as an alternative the team skipped because its syntax changed
  between seasons — one sentence, flagged, with `frc-pid-syntax` owning it.

SIM-REQUEST: none beyond §3. **But this is the sandbox most sensitive to the sim's constants.**
If the shipped model's per-tick gain differs from `output × 2.0`, all five runs shift and the
"answer" `kP` changes. The author must re-derive the ladder, keep the five *signatures*, and
report the new gain values to the Architect so `_shared-conventions.md` §2 and every downstream
lesson's `kP = 0.2` are updated together.

WIDGET-REQUEST: **`pid-playground`** — scoped in plan §6 for Unit 6 but absent from the
Architect's available-widget list, so raising it explicitly: `kP`/`kI`/`kD` sliders driving a
live canvas plot of the simulated arm, with the setpoint and the ±tolerance band drawn in, and a
readout of peak overshoot and settle time. It should use the **same motion model as PenguinSim**
so the plot and the sandbox agree — a student who sees different behaviour in the two will
trust neither.
*Fallback:* the five-run ladder above is a complete lesson on its own; ship it as text output
with the traces and the signature table. The playground makes tuning *fast*, but the sandbox
makes it *understood*.
