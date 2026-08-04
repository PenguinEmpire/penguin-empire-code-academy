# j-loops · Loops: while & for
unit: J2 · Logic & Flow   |   duration: 30 min   |   difficulty: Beginner

---

## INTRODUCES
`loop` · `iteration` · `while-loop` · `loop-condition` · `loop-variable` ·
`for-loop` · `for-header-three-parts` (init ; condition ; update) ·
`do-while-loop` · `infinite-loop` · `off-by-one` · `less-than-vs-less-than-or-equal` ·
`accumulator-pattern` · `counter-pattern` · `break` (in a loop) · `continue` ·
`loop-guard` / `max-iterations` (the safety valve) · `loop-variable-scope` (named only)

## ASSUMES
`program`, `sequential-execution`, `algorithm`, `literal-machine` *(j-what-is-programming)* ·
`class`, `main-method`, `println`, `print-vs-println`, `semicolon`, `comment`
*(j-first-program)* ·
`variable`, `int`, `double`, `reassignment`, `final-variable` *(j-variables)* ·
`compound-assignment`, `increment-decrement`, `modulo`, `math-class`, `integer-division`
*(j-operators)* ·
`printf-formatting` *(j-strings)* ·
`print-debugging`, `logic-error` *(j-debugging)* ·
`boolean-expression`, `comparison-operators`, `logical-and`, `tolerance-comparison`
*(j-booleans)* ·
`if-statement`, `block`, `braces-are-not-optional` *(j-if-else)* ·
`break` semantics from `switch` *(j-switch)*

## GOAL
Repeat work without repeating yourself: write a `while` and a `for` that each stop at
exactly the right moment, and know how to stop one that won't.

## HOOK
**Section title: "Fifty times a second, forever"**

Team story for `callout--why`, title **"The loop the whole robot runs on"**: when the team
opened a subsystem file for the first time, the thing that needed explaining most was a
method called `periodic()`. The note from that session says it plainly: **`periodic()` runs
every 20 milliseconds, continuously.**

Twenty milliseconds is fifty times a second. For the entire two-and-a-half minutes of a
match. Read a sensor, decide, command a motor, again. Fifty times a second, seven and a half
thousand times a match.

Nobody wrote that out seven thousand times. Somebody wrote **one loop**.

Everything you have written so far runs top to bottom exactly once and stops. That is not
what a robot does. A robot does one small thing over and over, checking each time whether
it's done yet. This lesson is how you say that in Java — and the arm you'll build here,
inching toward a setpoint and stopping when it's close enough, is a hand-cranked version of
what Phase 2 does automatically.

---

## EXPLAIN

**Beat 1 — A loop is "keep doing this while something is true".**

```java
int tick = 0;
while (tick < 5) {
    System.out.println("tick " + tick);
    tick++;
}
```

Walk it out loud, in exactly this order, because this is the mental model:

1. Check the condition. `0 < 5`? Yes.
2. Run the body.
3. Go back to step 1. `1 < 5`? Yes. Run the body. …
4. `5 < 5`? **No.** Skip the body entirely and continue after the `}`.

Two things worth stating: the condition is checked **before** every pass, including the very
first — so a `while` whose condition starts false runs **zero** times. And when the loop
ends, `tick` is `5`, not `4`: it's the value that *failed* the test.

**Beat 2 — Every loop needs three things, or it never ends.**

| Part | In the example | If you forget it |
|---|---|---|
| a starting value | `int tick = 0;` | won't compile |
| a condition that can become false | `tick < 5` | runs forever |
| something in the body that moves toward it | `tick++` | runs forever |

`callout--pitfall`, title **"The infinite loop"**: delete `tick++` and this program prints
`tick 0` until you close the tab. In a sandbox that's a nuisance. On a robot, a loop that
never ends inside the 20 ms cycle means the *whole* robot stops responding — no other code
runs, the Driver Station reports the robot as unresponsive, and nothing you press does
anything. **If a loop can hang, the robot can hang.**

The habit that prevents it: before you run a loop, point at the line that makes the
condition eventually false. If you can't point at one, don't run it.

**Beat 3 — `for`: the same loop with the three parts in one line.**
When you're counting, the three parts belong together:

```java
for (int canId = 10; canId <= 13; canId++) {
    System.out.println("Checking CAN ID " + canId + " ... OK");
}
```

```
for ( start ; keep going while ; after each pass ) { body }
```

Read it as: *"start at 10; keep going while it's 13 or less; add one each time."*
This is the same loop as the `while`, rearranged so the loop machinery is in one place and
the body is only about the work.

Rule of thumb, and it's a good one:
> **Counting a known number of times → `for`. Waiting for a condition → `while`.**

Note also that `canId` is declared *inside* the `for` header. It exists only inside the loop
— try to print it afterwards and you get *cannot find symbol*. That's **scope**, and it gets
a whole lesson in Unit J3.

**Beat 4 — `< length` vs `<= last`: the off-by-one.**
This is the single most common loop bug in existence, so give it real space.

- `for (int i = 0; i < 4; i++)` runs with i = **0, 1, 2, 3** — **four** passes.
- `for (int i = 0; i <= 4; i++)` runs with i = **0, 1, 2, 3, 4** — **five** passes.

Neither is wrong. They're answers to different questions. The rule that keeps you sane:

> **When counting a number of items, start at 0 and use `<`. When walking a range of real
> numbers like CAN IDs 10 to 13, start at the first and use `<=`.**

Starting at 0 with `<` isn't arbitrary — it matches how positions work in a String
(`j-strings`) and, in two lessons, in an array. `i < 4` and "there are 4 of them" line up
perfectly.

**Beat 5 — The counter and the accumulator.**
Two patterns you'll use forever, both just "a variable declared *outside* the loop and
updated *inside* it":

```java
int ticks = 0;              // counter: how many times did we go round?
double position = 0.0;      // accumulator: build up a total

while (position < 9.0) {
    position = position + 0.6;
    ticks++;
}
```

The critical detail: **declare them before the loop.** A variable declared inside the body is
created fresh every pass and forgets everything — which is exactly the bug that produces a
counter permanently stuck at 1.

**Beat 6 — A loop can end for two different reasons, and that matters.**
The arm loop above stops when `position` reaches 9.0. But what if the mechanism is jammed
and `position` never moves? The loop never ends and the robot is gone.

So real loops carry a **safety valve** — a second reason to stop:

```java
while (Math.abs(SETPOINT - position) >= TOLERANCE && tick < MAX_TICKS) {
```

Two conditions joined with `&&` from `j-booleans`: *keep going while we're not there yet
**and** we haven't been trying for too long.* Afterwards you ask which one it was:

```java
System.out.println("arrived: " + (Math.abs(SETPOINT - position) < TOLERANCE));
```

`callout--note`: *"Phase 2 gives this a name — a **command timeout**. Every command that
waits for a mechanism gets one, because 'wait until the arm arrives' plus a jammed arm
equals a robot that does nothing for the rest of the match. You are building that idea
right now."*

**Beat 7 — `break` and `continue`.**
- `break;` — leave the loop **immediately**. Same word as in a `switch`, same meaning:
  get out of the nearest enclosing block that can be broken out of.
- `continue;` — skip the rest of *this* pass and go straight to the next one.

```java
for (int canId = 10; canId <= 13; canId++) {
    if (canId == 12) {
        System.out.println("CAN ID 12 timed out - skipping");
        continue;                 // this ID, and only this one, is skipped
    }
    System.out.println("CAN ID " + canId + " OK");
}
```
Swap `continue` for `break` and the scan stops dead at 12 — 13 is never checked.

That difference is not academic: *"one device is unreachable, keep checking the rest"* and
*"one device is unreachable, abandon the scan"* are different engineering decisions, and the
keyword is where you record which one you meant.

Use both sparingly. A loop with four `break`s scattered through it is a loop nobody can
read.

**Beat 8 — `do-while`: check afterwards, so the body always runs once.**
```java
int countdown = 3;
do {
    System.out.println("T-minus " + countdown);
    countdown--;
} while (countdown > 0);
```
Condition at the **bottom**, so the body runs at least once no matter what. Useful for
"do the thing, then decide whether to do it again" — menus, retries, a countdown. Note the
`;` after the closing `while (...)`. It's the least-used of the three loops; know it exists,
recognise it in someone else's code.

---

## CODE

### Sample A — a `while` counting ticks (annotate)
`.code.with-lines`, file label `Main.java`:
```java
public class Main {
    public static void main(String[] args) {
        int tick = 0;
        while (tick < 5) {
            System.out.println("tick " + tick + "  (t = " + (tick * 20) + " ms)");
            tick++;
        }
        System.out.println("loop finished, tick = " + tick);
    }
}
```
**Verified output:**
```
tick 0  (t = 0 ms)
tick 1  (t = 20 ms)
tick 2  (t = 40 ms)
tick 3  (t = 60 ms)
tick 4  (t = 80 ms)
loop finished, tick = 5
```
**Annotate:** line 3 "declared **outside** the loop so it survives between passes"; line 4
"checked before every pass, including the first"; line 6 "**this** is what eventually ends
the loop — delete it and the program never stops"; line 8 "`tick` is 5, not 4: it's the
value that failed the test".

### Sample B — a `for` over PenguinBot's swerve CAN IDs (annotate)
```java
public class Main {
    public static void main(String[] args) {
        for (int canId = 10; canId <= 13; canId++) {
            System.out.println("Checking CAN ID " + canId + " ... OK");
        }
        System.out.println("All swerve drive motors responded.");
    }
}
```
**Verified output:**
```
Checking CAN ID 10 ... OK
Checking CAN ID 11 ... OK
Checking CAN ID 12 ... OK
Checking CAN ID 13 ... OK
All swerve drive motors responded.
```
**Annotate:** the three parts of the header, labelled `start` / `keep going while` / `after
each pass`; "`<=` because 13 is a real ID we want to check, not a count"; "these are
PenguinBot's four swerve drive motors — real numbers you'll meet again in Phase 2".

### Sample C — off-by-one, side by side (annotate)
```java
public class Main {
    public static void main(String[] args) {
        for (int i = 0; i < 4; i++) {
            System.out.println("i = " + i);
        }
        System.out.println("---");
        for (int i = 0; i <= 4; i++) {
            System.out.println("i = " + i);
        }
    }
}
```
**Verified output:**
```
i = 0
i = 1
i = 2
i = 3
---
i = 0
i = 1
i = 2
i = 3
i = 4
```
**Annotate:** "four passes"; "five passes"; "one character of difference, and it is the
most common bug in programming. Count the lines, not the numbers."

### Sample D — accumulator + counter (annotate)
```java
public class Main {
    public static void main(String[] args) {
        double position = 0.0;
        int ticks = 0;

        while (position < 9.0) {
            position = position + 0.6;
            ticks++;
        }

        System.out.println("ticks: " + ticks);
        System.out.printf("position: %.2f%n", position);
        System.out.printf("time: %.2f s%n", ticks * 0.02);
    }
}
```
**Verified output:**
```
ticks: 16
position: 9.60
time: 0.32 s
```
**Annotate:** lines 3–4 "declared outside — they have to survive between passes"; line 6
"stops when position reaches 9.0…"; line 11 "…which means it **overshoots** to 9.60, because
the check happens before the step, not after. Real mechanisms do this too — it's called
overshoot and Phase 2 spends a whole unit on it."; line 13 "16 ticks × 20 ms = 0.32 seconds
of simulated time".

### Sample E — `continue` vs `break` (annotate)
```java
public class Main {
    public static void main(String[] args) {
        for (int canId = 10; canId <= 13; canId++) {
            if (canId == 12) {
                System.out.println("CAN ID 12 timed out - skipping");
                continue;
            }
            System.out.println("CAN ID " + canId + " OK");
        }

        System.out.println("---");

        for (int canId = 10; canId <= 13; canId++) {
            if (canId == 12) {
                System.out.println("CAN ID 12 timed out - aborting scan");
                break;
            }
            System.out.println("CAN ID " + canId + " OK");
        }
    }
}
```
**Verified output:**
```
CAN ID 10 OK
CAN ID 11 OK
CAN ID 12 timed out - skipping
CAN ID 13 OK
---
CAN ID 10 OK
CAN ID 11 OK
CAN ID 12 timed out - aborting scan
```
**Annotate:** "`continue` skipped one ID and carried on — 13 was still checked"; "`break`
ended the scan — 13 was never checked at all"; "`CAN ID 12 timed out` is a real error
message this team has seen at competition. In Phase 2 you'll learn which motor that is."

### Sample F — `do-while` (annotate)
```java
public class Main {
    public static void main(String[] args) {
        int countdown = 3;
        do {
            System.out.println("T-minus " + countdown);
            countdown--;
        } while (countdown > 0);
        System.out.println("Match start.");

        int never = 10;
        do {
            System.out.println("this runs once even though 10 > 5 is checked after");
        } while (never < 5);
    }
}
```
**Verified output:**
```
T-minus 3
T-minus 2
T-minus 1
Match start.
this runs once even though 10 > 5 is checked after
```
**Annotate:** line 7 "condition at the bottom, and note the `;`"; lines 10–13 "the condition
was false from the start and the body still ran — that's the whole difference".

---

## SANDBOX

### Sandbox 1 — "Walk through it": move the boundary
`data-title="Live Java Sandbox"`
```java
public class Main {
    public static void main(String[] args) {
        for (int i = 0; i < 4; i++) {
            System.out.println("i = " + i);
        }
        System.out.println("done");

        // Try it, one change at a time, and COUNT THE LINES each time:
        //  1. change  i < 4   to   i <= 4
        //  2. change  i = 0   to   i = 1
        //  3. change  i++     to   i += 2
        //  4. delete  i++     entirely -- then STOP the sandbox and put it back
    }
}
```
**Verified output as shipped:** four lines, `i = 0` through `i = 3`, then `done`.
**Verified for step 1** (`i <= 4`): five lines, `i = 0` through `i = 4`.
**Verified for step 2** (`i = 1; i < 4`): three lines, `i = 1` through `i = 3`.
**Verified for step 3** (`i = 0; i < 4; i += 2`): two lines, `i = 0` and `i = 2`.
**Step 4** produces an infinite loop — the sandbox will print forever.
**Author warning to put on the page:** *"Step 4 will not stop on its own. That's the lesson.
Reload the page or press the sandbox's stop control, then put `i++` back. Now imagine that
loop inside a robot that is supposed to be checking its sensors fifty times a second."*

### Sandbox 2 — "Build it": the arm run, with a safety valve
`data-title="Project Sandbox"`
```java
public class Main {
    public static void main(String[] args) {
        // Simulate PenguinBot's arm creeping toward its scoring setpoint.
        // Each pass through the loop is one 20 ms tick.
        //
        // 1. Loop while the arm is NOT within TOLERANCE of SETPOINT.
        // 2. Each pass: add STEP to position, and count the tick.
        // 3. ALSO stop if tick reaches MAX_TICKS -- the safety valve.
        // 4. Print a line every 5 ticks only  (hint: tick % 5 == 0).
        // 5. Afterwards, print whether it actually arrived, and the elapsed seconds.

        final double SETPOINT  = 9.0;
        final double TOLERANCE = 0.25;
        final double STEP      = 0.6;
        final int    MAX_TICKS = 100;

        double position = 0.0;
        int    tick     = 0;

        System.out.println("=== ARM RUN ===");
        // TODO
    }
}
```
**Reference (author check, not shown on the page):**
```java
public class Main {
    public static void main(String[] args) {
        final double SETPOINT  = 9.0;
        final double TOLERANCE = 0.25;
        final double STEP      = 0.6;
        final int    MAX_TICKS = 100;

        double position = 0.0;
        int    tick     = 0;

        System.out.println("=== ARM RUN ===");

        while (Math.abs(SETPOINT - position) >= TOLERANCE && tick < MAX_TICKS) {
            position = position + STEP;
            tick++;
            if (tick % 5 == 0) {
                System.out.printf("tick %2d  position %.2f%n", tick, position);
            }
        }

        System.out.printf("stopped at tick %d, position %.2f%n", tick, position);
        System.out.println("arrived: " + (Math.abs(SETPOINT - position) < TOLERANCE));
        System.out.printf("elapsed: %.2f s%n", tick * 0.02);
    }
}
```
**Verified output:**
```
=== ARM RUN ===
tick  5  position 3.00
tick 10  position 6.00
tick 15  position 9.00
stopped at tick 15, position 9.00
arrived: true
elapsed: 0.30 s
```
**Required second run — the jam.** Change `STEP` to `0.05` (a nearly-stalled mechanism) and
re-run. **Verified:** the loop prints every 5 ticks up to `tick 100  position 5.00`, then:
```
stopped at tick 100, position 5.00
arrived: false
elapsed: 2.00 s
```
**Target:** the student can explain, out loud, that the second run stopped for a **different
reason** than the first, and that without `MAX_TICKS` it would have run forever.

---

## CHALLENGES

### Challenge 1 — Predict the output  (`data-kind="text"`)
Prompt: "How many lines does this print?"
```java
for (int i = 0; i < 4; i++) {
    System.out.println("checking");
}
```
**Answer key:** `data-answer="4"` — **verified.**
- `data-win`: "Right — i takes the values 0, 1, 2, 3. Starting at 0 with `<` gives you exactly the number in the condition."
- `data-lose`: "Four. `i` runs 0, 1, 2, 3 and then `4 < 4` is false. Start at 0 and use `<` and the count matches the number you wrote."

**Reveal explanation:** this is the pattern to burn in: `for (int i = 0; i < n; i++)` runs
exactly `n` times. It lines up with String positions from `j-strings` and, next lesson, with
arrays.

### Challenge 2 — Predict the output  (`data-kind="text"`)
Prompt: "What is the value of `tick` on the line printed **after** the loop ends?"
```java
int tick = 0;
while (tick < 5) {
    tick++;
}
System.out.println(tick);
```
**Answer key:** `data-answer="5"` — **verified.**
- `data-win`: "Yes. The loop exits when the condition fails, and `5 < 5` is what failed — so `tick` is 5."
- `data-lose`: "It's 5. The loop stops *because* `tick` reached 5; the last value it had inside the body was 4, but the variable keeps going up one more time before the test fails."

### Challenge 3 — Fill in the blanks  (`data-kind="fib"`)
Prompt: "Write a `for` loop over PenguinBot's four swerve drive CAN IDs: 10, 11, 12 and 13."
```
for (int canId = ______; canId ______ 13; canId______) {
    System.out.println(canId);
}
```
Blanks: `data-answer="10"`, `data-answer="<="`, `data-answer="++"`
- `data-win`: "That's the range form: start at the first real value and use `<=` because 13 is an ID you want, not a count."
- `data-lose`: "Start at 10, keep going while `canId <= 13` (13 is a real motor — you want to check it), and step with `++`."

### Challenge 4 — Multiple choice  (`data-kind="mcq"`)
Prompt: "Which of these loops never ends?"

| Option | Correct | `data-explain` |
|---|---|---|
| `int i = 0; while (i < 5) { i++; }` | | Ends after 5 passes — `i++` moves the condition toward false. |
| `int i = 0; while (i < 5) { System.out.println(i); }` | ✅ | Correct. Nothing ever changes `i`, so `0 < 5` is true forever. Every loop needs a line that moves it toward stopping. |
| `for (int i = 0; i < 5; i++) { }` | | Ends after 5 passes; the update is right there in the header. |
| `int i = 5; while (i > 0) { i--; }` | | Counts down and ends at 0. |

### Challenge 5 — Multiple choice  (`data-kind="mcq"`)
Prompt: "In the CAN scan, what changes if you swap `continue` for `break`?"

| Option | Correct | `data-explain` |
|---|---|---|
| Nothing — they're synonyms | | They're opposites in an important way: one skips a pass, the other ends the loop. |
| `break` abandons the whole scan, so IDs after 12 are never checked | ✅ | Right. `continue` skips only the current pass; `break` leaves the loop entirely. Which one you want is an engineering decision about how to handle a failure. |
| `break` restarts the loop from the beginning | | Nothing in Java restarts a loop from the top like that. |
| `break` only works inside a `switch` | | It works in loops too, with the same meaning: leave the enclosing block. |

### Challenge 6 — Multiple choice  (`data-kind="mcq"`)
Prompt: "Why add `&& tick < MAX_TICKS` to a loop that already waits for the arm to arrive?"

| Option | Correct | `data-explain` |
|---|---|---|
| To make it finish faster | | In the normal case it changes nothing at all — the arm arrives long before the limit. |
| So a jammed mechanism can't hang the loop forever | ✅ | Exactly. "Wait until it arrives" plus a mechanism that never arrives equals a robot frozen for the rest of the match. This is a command timeout, built by hand. |
| Because `while` loops must have two conditions | | One condition is perfectly normal. This second one is a deliberate safety choice. |
| To count the ticks | | `tick++` counts them. This condition only decides when to give up. |

---

## MISCONCEPTIONS

1. **"The loop variable holds the last body value after the loop."**
   → It holds the value that **failed** the condition — one past the last one used.
2. **"`i < 4` and `i <= 4` are basically the same."**
   → Four passes versus five. This one character is the most common bug in programming.
3. **"A `while` always runs at least once."**
   → Only `do-while` guarantees that. A `while` whose condition starts false runs zero
   times, which is often exactly right.
4. **"I can declare my counter inside the loop body."**
   → Then it's created fresh every pass and forgets everything. Counters and accumulators
   go **before** the loop.
5. **"An infinite loop is just annoying."**
   → On a robot it means the 20 ms cycle never completes: no sensors read, no commands run,
   nothing responds. It is one of the worst failures you can ship.
6. **"`break` and `continue` are advanced."**
   → They're ordinary, and easy to overuse. A loop with several scattered `break`s is
   harder to read than one with a clear condition.
7. **"`for` and `while` are for different problems."**
   → They can express the same loops. `for` when you're counting; `while` when you're
   waiting for something to become true.

---

## EXERCISE

### Mini-project: The Arm Run
In `j-if-else` you built a gate that decided whether a *single* command was safe. A real
mechanism doesn't get one command — it gets one every 20 ms until it's done. Build that.

**Task:**
1. Set up the four `final` values: `SETPOINT = 9.0`, `TOLERANCE = 0.25`, `STEP = 0.6`,
   `MAX_TICKS = 100`.
2. Declare `position` and `tick` **before** the loop.
3. Loop while the arm is outside the tolerance **and** `tick < MAX_TICKS`.
4. Each pass: advance `position` by `STEP` and increment `tick`.
5. Print a status line only every 5th tick, using `%` and `printf`.
6. After the loop, print where it stopped, whether it `arrived`, and the elapsed seconds
   (`tick * 0.02`).
7. **Required:** re-run with `STEP = 0.05` and explain why it stopped that time.
8. **Bonus:** print `"OVERSHOT by "` and the amount when `position` ends up past `SETPOINT`.

Starter code and **reference solution:** as Sandbox 2 above.
**Verified outputs:** both runs, exactly as in Sandbox 2.

Closing note for the reveal: *"Two runs, two completely different reasons for stopping, and
the code can tell you which. That last line — `arrived: false` — is the difference between a
robot that reports 'the arm is jammed' and a robot that just sits there. In Phase 2 this
loop disappears into the framework: the scheduler calls your code every 20 ms and asks
`isFinished()`. You will recognise every part of it."*

---

## CHECKPOINT

**Q1.** `for (int i = 0; i < 6; i++)` runs how many times?
- *5* — `data-explain`: "That's the last value `i` takes, not the number of passes. Count the values: 0, 1, 2, 3, 4, 5."
- *6* — ✅ `data-explain`: "Right. Starting at 0 with `<` makes the count match the number in the condition."
- *7* — `data-explain`: "That would be `i <= 6`, which adds a seventh pass with `i` equal to 6."

**Q2.** When is a `while` loop's condition checked?
- *After the body, every time* — `data-explain`: "That's `do-while`. A plain `while` checks first."
- *Before the body, every time — including the first* — ✅ `data-explain`: "Correct, which is why a `while` whose condition starts false runs zero times."
- *Only once, at the start* — `data-explain`: "Then it could never stop. It's re-checked before every pass."

**Q3.** What makes a loop infinite?
- *Using `while` instead of `for`* — `data-explain`: "Either kind can be infinite or finite. The keyword isn't the issue."
- *Nothing in the loop ever makes the condition false* — ✅ `data-explain`: "Exactly. Before running a loop, point at the line that moves it toward stopping. If there isn't one, don't run it."
- *Having too many conditions* — `data-explain`: "More conditions joined with `&&` actually gives a loop *more* ways to end, not fewer."

**Q4.** Where should a counter variable be declared?
- *Inside the loop body* — `data-explain`: "Then it's brand new every pass and always resets — the classic 'my counter is stuck at 1' bug."
- *Before the loop* — ✅ `data-explain`: "Right. It has to survive from one pass to the next, so it must live outside."
- *It doesn't matter* — `data-explain`: "It changes the answer completely. Scope is the subject of a whole lesson in Unit J3 for this reason."

**Q5.** `continue` does what?
- *Ends the loop* — `data-explain`: "That's `break`. `continue` keeps the loop going."
- *Skips the rest of this pass and starts the next one* — ✅ `data-explain`: "Yes — in the CAN scan it skipped one bad ID and carried on checking the rest."
- *Restarts the loop from its first value* — `data-explain`: "The loop variable keeps its progress; only the remainder of the current pass is skipped."

---

## PHASE 2 FORESHADOWING
- The 20 ms tick is literal: `periodic()` and `execute()` are bodies of a loop the framework
  runs for you, fifty times a second.
- `MAX_TICKS` becomes a **command timeout** in U7 — the same idea with a WPILib name.
- The overshoot in Sample D (stopping at 9.60 instead of 9.00) is the exact problem PID
  control exists to solve, and U6 opens with it.
- `for (int i = 0; i < n; i++)` is about to become the way you walk an array, then a grid,
  then Alice's kitchen.
