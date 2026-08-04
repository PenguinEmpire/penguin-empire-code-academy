# j-operators · Operators & Expressions
unit: J1 · Getting Started   |   duration: 20 min   |   difficulty: Beginner

---

## INTRODUCES
`expression` · `arithmetic-operators` (`+ - * /`) · `integer-division` · `modulo` (`%`) ·
`operator-precedence` · `parentheses-grouping` · `compound-assignment` (`+= -= *= /=`) ·
`increment-decrement` (`++ --`) · `type-promotion` (int + double → double) ·
`explicit-cast` (`(int)`, `(double)`) · `string-plus-evaluation-order` ·
`math-class` (`Math.abs`, `Math.min`, `Math.max`, `Math.round`) · `clamping`

## ASSUMES
`program`, `sequential-execution`, `syntax`, `compiler`, `bug` *(j-what-is-programming)* ·
`class`, `main-method`, `println`, `statement`, `semicolon`, `comment`,
`string-literal`, `case-sensitivity` *(j-first-program)* ·
`variable`, `declaration`, `assignment`, `reassignment`, `int`, `double`, `boolean`,
`char`, `String-type`, `camelCase`, `string-concatenation`, `final-variable`,
`type-mismatch-error` *(j-variables)*

## GOAL
Work out a number *in code* instead of typing it in — and keep the answer inside a safe
range with `Math.min` and `Math.max`.

## HOOK
**Section title: "Ninety percent cost us two days"**

Team story for `callout--why`, title **"The 80 % rule is arithmetic"**: the team once pushed
a motor at roughly **90 % power**. It fried so badly it would not run for more than about
five seconds. They spent **two full days** hunting for the bug before realising the value
was simply too high. The rule that came out of it is now team law: **keep output under
about 0.8, or add another motor instead of pushing one harder.**

Here is the uncomfortable part. That rule is not enforced by the motor, or by the compiler,
or by good intentions. It is enforced by **one line of arithmetic**:

```java
double commanded = Math.min(0.8, Math.max(-0.8, requested));
```

This lesson is that line. Everything on this page is the machinery for taking a number you
have, doing something to it, and getting a number you can trust.

---

## EXPLAIN

**Beat 1 — An expression is anything Java can boil down to one value.**
`5` is an expression. `2 + 3` is an expression. `batteryVoltage / 12.6 * 100` is an
expression. Java **evaluates** it — grinds it down to a single value — and *then* does
something with that value: stores it, prints it, hands it to a motor.

Analogy: **the scale in the pit.** You pile parts on it; the display shows one number. You
don't get "3 kg plus a bolt". You get one number. An expression is the pile; evaluation is
the display.

Say the load-bearing sentence: **the right-hand side of `=` is always an expression, and it
is always worked out completely before anything is stored.** That is the same "gets" rule
from `j-variables`, now with more happening on the right.

**Beat 2 — The four you already know, and the one you don't.**

| Operator | Name | `10` and `4` give |
|---|---|---|
| `+` | add | `14` |
| `-` | subtract | `6` |
| `*` | multiply (star, not `x`) | `40` |
| `/` | divide | `2` ← read that again |
| `%` | remainder ("modulo") | `2` |

Two things to flag immediately: multiplication is `*`, never `x` or `·`; and `10 / 4` is
**2**, not 2.5. Beat 3 is why.

**Beat 3 — Integer division throws away the fraction. This is the trap.**
Rule, stated once and loudly: **if both sides of `/` are `int`, the answer is an `int`, and
Java chops off everything after the decimal point.** It does not round. `7 / 2` is `3`.
`1 / 2` is `0`.

Why it bites on a robot: you write `double halfSpeed = 1 / 2;` meaning "half power". Java
computes `1 / 2` **as ints first** — that's `0` — and only then widens it into a `double`.
Your variable holds `0.0`. The motor does nothing. Nothing crashes. Nothing turns red.
The mechanism just sits there while you stare at code that looks correct.

The fix is to make **one side** a decimal:
- `1.0 / 2` → `0.5`
- `1 / 2.0` → `0.5`
- `(double) 1 / 2` → `0.5`

`callout--pitfall`, title **"The silent zero"**: this is one of the few Java bugs that
produces neither an error nor a warning — just a wrong number that flows quietly downstream.
When a mechanism does nothing at all, check your division.

**Beat 4 — `%` (modulo) is the leftover, and it is more useful than it sounds.**
`47 % 20` is `7`: twenty goes into forty-seven twice with **seven left over**.
Robot uses:
- Split a time: `150 / 60` → 2 minutes, `150 % 60` → 30 seconds.
- Split encoder ticks into whole rotations plus leftovers.
- "Is this number even?" — `n % 2` is `0` for even numbers. (You'll use that in J2.)

**Beat 5 — Mixing `int` and `double`: promotion.**
When one side of an operation is a `double`, Java **promotes** the other side to `double`
and the answer is a `double`. `3 * 2.0` is `6.0`, not `6`. That is why printing a `double`
shows `0.8` and `1.0` rather than `.8` and `1`.

**Beat 6 — Casting: forcing a type change on purpose.**
`(int) 12.9` is `12` — a cast to `int` **truncates**, it does not round. `(double) 7` is
`7.0`. Put the cast in the right place:
- `(double) 7 / 2` → cast first, then divide → `3.5`
- `(double) (7 / 2)` → divide as ints first, *then* cast → `3.0`

Same characters, different parentheses, different answer. Casting is a promise to the
compiler that you meant to lose something. Make it deliberately.

**Beat 7 — Precedence: `*` and `/` and `%` happen before `+` and `-`.**
`2 + 3 * 4` is `14`, not `20`. This is exactly the maths-class rule. The professional habit
is not to memorise deeper levels of the table — it is to **add parentheses whenever the
answer isn't obvious at a glance.** `(2 + 3) * 4` costs you two keystrokes and buys a
teammate ten seconds at midnight.

**Beat 8 — `+` with text: order matters, and it will get you.**
`+` means "add" when both sides are numbers and "glue" when either side is text. Java reads
left to right, so:

- `"Total: " + 2 + 3` → `"Total: 2"` then `"Total: 23"` → prints **`Total: 23`**
- `"Total: " + (2 + 3)` → `2 + 3` is `5` first → prints **`Total: 5`**
- `2 + 3 + " pieces"` → `2 + 3` is `5` first (both numbers) → prints **`5 pieces`**

Rule of thumb: **wrap any sum you print in parentheses.** Every time.

**Beat 9 — Compound assignment and `++`.**
`gamePieces = gamePieces + 1;` is so common it has a shorthand: `gamePieces += 1;`, and for
exactly 1 there's `gamePieces++;`. The whole family: `+=`, `-=`, `*=`, `/=`, and `++` / `--`.
They read as "add this to what's already there." Nothing new is happening — this is still
"box gets the result of an expression."

**Beat 10 — `Math`: the toolbox you don't have to write.**
Java ships a class called `Math` full of ready-made calculations. You use them by writing
the class name, a dot, and the name:

| Call | Gives | Robot use |
|---|---|---|
| `Math.abs(-0.93)` | `0.93` | "how far is the stick pushed?" ignoring direction |
| `Math.max(-0.8, x)` | the larger | floor: never below −0.8 |
| `Math.min(0.8, x)` | the smaller | ceiling: never above 0.8 |
| `Math.round(12.64)` | `13` | rounds properly, unlike `(int)` |

`callout--note`: *"`Math.abs(...)` is called on the class name `Math` itself, not on a
variable. That's a `static` call, and `j-static-vs-instance` in Unit J5 explains why some
things work that way. For now: `Math.` then the name."*

**Beat 11 — Clamping: the 80 % rule as code.**
Put the floor and the ceiling together and you get the pattern from the hook:

```java
double commanded = Math.min(0.8, Math.max(-0.8, requested));
```

Read it inside-out: `Math.max(-0.8, requested)` drags anything below −0.8 up to −0.8. Then
`Math.min(0.8, ...)` drags anything above 0.8 down to 0.8. Whatever comes out is inside
the safe band, always.

Foreshadow with `callout--note`: *"In Phase 2 this exact expression goes around the output
of a PID controller before it reaches `motor.set(...)`. The controller does not know about
the team's 80 % rule. You do, and you clamp."*

---

## CODE

### Sample A — the five arithmetic operators (annotate)
`.code.with-lines`, file label `Main.java`:
```java
public class Main {
    public static void main(String[] args) {
        int totalTicks = 42;
        int matchSeconds = 15;

        System.out.println("add:      " + (totalTicks + matchSeconds));
        System.out.println("subtract: " + (totalTicks - matchSeconds));
        System.out.println("multiply: " + (totalTicks * matchSeconds));
        System.out.println("divide:   " + (totalTicks / matchSeconds));
        System.out.println("remainder:" + (totalTicks % matchSeconds));
    }
}
```
**Verified output:**
```
add:      57
subtract: 27
multiply: 630
divide:   2
remainder:12
```
**Annotate:** line 6 "every sum is wrapped in `( )` so it is added, not glued"; line 9
"42 ÷ 15 is 2.8 — but both are `int`, so the answer is `2`"; line 10 "15 goes into 42 twice
with 12 left over".

### Sample B — the same division, five ways (annotate)
```java
public class Main {
    public static void main(String[] args) {
        System.out.println(7 / 2);
        System.out.println(7.0 / 2);
        System.out.println(7 / 2.0);
        System.out.println((double) 7 / 2);
        System.out.println((double) (7 / 2));
    }
}
```
**Verified output:**
```
3
3.5
3.5
3.5
3.0
```
**Annotate:** line 3 "both `int` → `int` answer, fraction chopped"; lines 4–5 "one decimal
anywhere promotes the whole thing"; line 6 "cast **then** divide"; line 7 "divide **then**
cast — the damage is already done".

### Sample C — counting up (annotate)
```java
public class Main {
    public static void main(String[] args) {
        int gamePieces = 0;
        gamePieces = gamePieces + 1;
        System.out.println("after + 1:  " + gamePieces);
        gamePieces += 2;
        System.out.println("after += 2: " + gamePieces);
        gamePieces++;
        System.out.println("after ++:   " + gamePieces);
        gamePieces--;
        System.out.println("after --:   " + gamePieces);

        double speed = 0.5;
        speed *= 2;
        System.out.println("after *= 2: " + speed);
    }
}
```
**Verified output:**
```
after + 1:  1
after += 2: 3
after ++:   4
after --:   3
after *= 2: 1.0
```
**Annotate:** line 4 and line 6 "these two lines do the same *kind* of thing — `+=` is just
shorter"; line 16 "`1.0`, not `1` — `speed` is a `double`, so its answer prints with a
decimal point".

### Sample D — precedence and the `+` order trap (annotate)
```java
public class Main {
    public static void main(String[] args) {
        System.out.println(2 + 3 * 4);
        System.out.println((2 + 3) * 4);
        System.out.println("Total: " + 2 + 3);
        System.out.println("Total: " + (2 + 3));
        System.out.println(2 + 3 + " pieces");
    }
}
```
**Verified output:**
```
14
20
Total: 23
Total: 5
5 pieces
```
**Annotate:** line 3 "`*` first"; line 5 "text is on the left, so both numbers get glued on
one at a time"; line 6 "parentheses force the addition to happen first"; line 7 "the text is
on the **right**, so `2 + 3` is a plain sum before anything is glued".

### Sample E — Math, and the clamp (annotate)
```java
public class Main {
    public static void main(String[] args) {
        double requested = 0.95;
        double clamped = Math.min(0.8, Math.max(-0.8, requested));
        System.out.println("requested: " + requested);
        System.out.println("clamped:   " + clamped);

        double stick = -0.93;
        System.out.println("magnitude: " + Math.abs(stick));
        System.out.println("rounded:   " + Math.round(12.64));
        System.out.println("bigger:    " + Math.max(3, 9));
    }
}
```
**Verified output:**
```
requested: 0.95
clamped:   0.8
magnitude: 0.93
rounded:   13
bigger:    9
```
**Annotate:** line 4 "inside first: `Math.max(-0.8, 0.95)` is `0.95`; then
`Math.min(0.8, 0.95)` is `0.8`"; line 10 "`Math.round` rounds; `(int)` would have given 12".

---

## SANDBOX

### Sandbox 1 — "Walk through it": the silent zero
`data-title="Live Java Sandbox"`
```java
public class Main {
    public static void main(String[] args) {
        double halfSpeed = 1 / 2;
        System.out.println("Half speed is: " + halfSpeed);

        // That printed 0.0 — the motor would not move at all.
        // Try it: change line 3 to  double halfSpeed = 1.0 / 2;  and Run again.
        // Then try  1 / 2.0  and  (double) 1 / 2  — all three fix it.
    }
}
```
**Verified output as shipped:**
```
Half speed is: 0.0
```
**Verified output after the fix (`1.0 / 2`):**
```
Half speed is: 0.5
```
**What the student changes:** apply each of the three fixes in turn and confirm all three
print `0.5`. Then the instructive break: change it to `(double) (1 / 2)` and watch it go
back to `0.0` — proof that *where* the cast goes decides everything.

### Sandbox 2 — "Build it": clamp the motor speed
`data-title="Project Sandbox"`
```java
public class Main {
    public static void main(String[] args) {
        // The 80% rule: no motor command may be above 0.8 or below -0.8.
        // Right now this program prints the request unchanged. Fix it.
        //
        // 1. Build  double commanded = ...  using Math.min and Math.max
        //    so that the printed value is always between -0.8 and 0.8.
        // 2. Test with all four requests below by editing the value on line 5.

        double requested = 0.95;
        double commanded = requested;   // TODO: clamp this

        System.out.println("requested: " + requested);
        System.out.println("commanded: " + commanded);
    }
}
```
**Target:** with `requested` set to `0.95`, `0.5`, `-0.5`, `-1.0`, the commanded value must
print `0.8`, `0.5`, `-0.5`, `-0.8`.
**Reference (author check, not shown on the page):**
```java
public class Main {
    public static void main(String[] args) {
        double requested = 0.95;
        double commanded = Math.min(0.8, Math.max(-0.8, requested));
        System.out.println("requested: " + requested);
        System.out.println("commanded: " + commanded);
    }
}
```
**Verified output (`requested = 0.95`):**
```
requested: 0.95
commanded: 0.8
```
**Verified output (`requested = -1.0`):**
```
requested: -1.0
commanded: -0.8
```

---

## CHALLENGES

### Challenge 1 — Predict the output  (`data-kind="text"`)
Prompt: "Both values are `int`. What single number is printed?"
```java
System.out.println(7 / 2);
```
**Answer key:** `data-answer="3"` — **verified.**
- `data-win`: "Right. `int / int` gives an `int`, and Java chops the fraction off — it does not round to 4."
- `data-lose`: "It's 3. Both sides are whole numbers, so Java does whole-number division: 2 goes into 7 three times, and the .5 is thrown away."

**Reveal explanation:** 7 ÷ 2 is 3.5, but there is no `double` anywhere in that expression,
so Java has nowhere to put the `.5`. It truncates to `3`. Write `7.0 / 2` if you want `3.5`.

### Challenge 2 — Predict the output  (`data-kind="text"`)
Prompt: "Watch the order Java reads this in. Type the whole printed line."
```java
System.out.println("Total: " + 2 + 3);
```
**Answer key:** `data-answer="Total: 23"` — **verified.**
- `data-win`: "Exactly. Left to right: text + 2 makes `Total: 2`, then that text + 3 makes `Total: 23`."
- `data-lose`: "It prints `Total: 23`. Once the left side is text, every `+` after it glues instead of adding. Wrap the sum: `\"Total: \" + (2 + 3)` prints `Total: 5`."

### Challenge 3 — Predict the output  (`data-kind="text"`)
Prompt: "`a` is 10 and `b` is 4, and both are `int`. What is printed?"
```java
int a = 10;
int b = 4;
System.out.println(a / b + a % b);
```
**Answer key:** `data-answer="4"` — **verified.**
- `data-win`: "Yes — `10 / 4` is 2, `10 % 4` is 2, and 2 + 2 is 4. Both are plain numbers, so `+` adds."
- `data-lose`: "It's 4. `/` and `%` both run before `+`. `10 / 4` is 2 (fraction chopped) and `10 % 4` is 2 (the leftover). 2 + 2 = 4."

### Challenge 4 — Fill in the blanks  (`data-kind="fib"`)
Prompt: "Complete the clamp so no value ever leaves the range −0.8 … 0.8."
```
double commanded = Math.______(0.8, Math.______(-0.8, requested));
```
Blanks: `data-answer="min"`, `data-answer="max"`
- `data-win`: "That's the clamp. `max` puts a floor under it, `min` puts a ceiling on it."
- `data-lose`: "Think about which one protects which end. To stop a value going *below* −0.8 you take the larger of the two (`max`). To stop it going *above* 0.8 you take the smaller (`min`)."

### Challenge 5 — Multiple choice  (`data-kind="mcq"`)
Prompt: "A mechanism does absolutely nothing, and there is no error message. Which line is the most likely culprit?"

| Option | Correct | `data-explain` |
|---|---|---|
| `double speed = 0.7;` | | Nothing wrong here — that's a decimal in a decimal box. |
| `double speed = 3 / 4;` | ✅ | Correct. `3 / 4` is computed as whole numbers first, giving `0`, which is then stored as `0.0`. The motor is commanded to stop, and nothing complains. |
| `double speed = 3.0 / 4;` | | This is `0.75`. One decimal is enough to promote the whole expression. |
| `double speed = 0.75;` | | Fine — the value is already what you meant. |

### Challenge 6 — Multiple choice  (`data-kind="mcq"`)
Prompt: "What does `(int) 12.9` give you?"

| Option | Correct | `data-explain` |
|---|---|---|
| `13` | | That's what `Math.round(12.9)` gives. A cast is not a rounder. |
| `12` | ✅ | Right — casting to `int` truncates: it deletes everything after the decimal point, no matter how close to 13 the value was. |
| `12.9` | | An `int` cannot hold a fraction at all, so something has to go. |
| A compiler error | | The cast is you telling the compiler "I know I'm losing the fraction, do it anyway" — so it does it without complaint. |

---

## MISCONCEPTIONS

1. **"`/` always gives me the real answer."**
   → Only if at least one side is a `double`. `int / int` truncates, silently, every time.
2. **"Casting rounds."**
   → `(int)` chops. `Math.round(...)` rounds. `(int) 0.99` is `0`.
3. **"`+` always adds."**
   → It glues the moment either side is text — and Java works left to right, so
   `"x = " + 1 + 2` gives `x = 12`.
4. **"`%` is a percent sign."**
   → It's the *remainder* operator. Percentages are just `/ 100`, done by hand.
5. **"`speed += 1` and `speed = speed + 1` are different things."**
   → Identical result; `+=` is only shorter to type and read.
6. **"If the maths were wrong the compiler would tell me."**
   → The compiler checks grammar, not intent. `1 / 2` is perfect grammar and the wrong
   number.
7. **"I should memorise the whole precedence table."**
   → Learn `* / %` before `+ -`, and then use parentheses for everything else. Working
   programmers add parentheses.

---

## EXERCISE

### Mini-project: The Match Maths Report
Before every match someone converts numbers in their head: how long is the match, how many
full rotations is that, is the battery good enough. Make the program do it.

**Task:**
1. Start from `int matchSeconds = 150;`. Print the match length as
   `Match length: 2m 30s`, using `/` for the minutes and `%` for the seconds.
2. Start from `int totalTicks = 47;` and `final int TICKS_PER_ROTATION = 20;`. Print
   `Rotations: 2 (+7 ticks)`.
3. Start from `double batteryVolts = 11.4;` and a `final double FULL_VOLTS = 12.6;`. Print
   the battery percentage. Print it twice — once raw, once through `Math.round(...)` — so
   the difference is visible.
4. **Bonus:** take `double requested = 0.95;` and print the clamped command using
   `Math.min` / `Math.max`.

Starter code:
```java
public class Main {
    public static void main(String[] args) {
        int matchSeconds = 150;
        // TODO: minutes and seconds

        int totalTicks = 47;
        final int TICKS_PER_ROTATION = 20;
        // TODO: full rotations and leftover ticks

        double batteryVolts = 11.4;
        final double FULL_VOLTS = 12.6;
        // TODO: battery percentage, raw and rounded
    }
}
```

**Reference solution:**
```java
public class Main {
    public static void main(String[] args) {
        int matchSeconds = 150;
        int minutes = matchSeconds / 60;
        int seconds = matchSeconds % 60;
        System.out.println("Match length: " + minutes + "m " + seconds + "s");

        int totalTicks = 47;
        final int TICKS_PER_ROTATION = 20;
        int fullRotations = totalTicks / TICKS_PER_ROTATION;
        int leftover = totalTicks % TICKS_PER_ROTATION;
        System.out.println("Rotations: " + fullRotations + " (+" + leftover + " ticks)");

        double batteryVolts = 11.4;
        final double FULL_VOLTS = 12.6;
        double percent = batteryVolts / FULL_VOLTS * 100;
        System.out.println("Battery: " + percent + "%");
        System.out.println("Battery: " + Math.round(percent) + "%");

        double requested = 0.95;
        double commanded = Math.min(0.8, Math.max(-0.8, requested));
        System.out.println("Commanded: " + commanded);
    }
}
```
**Verified output:**
```
Match length: 2m 30s
Rotations: 2 (+7 ticks)
Battery: 90.47619047619048%
Battery: 90%
Commanded: 0.8
```
Closing note for the reveal: *"Look at that raw percentage — `90.47619047619048`. That's not
a bug, it's what a `double` actually holds. Nobody wants to read it on a dashboard, which is
why the second line exists. Deciding how much precision a human needs is part of the job."*

---

## CHECKPOINT

**Q1.** `int result = 9 / 4;` — what is in `result`?
- *2.25* — `data-explain`: "An `int` box has no room for `.25`. And because both sides are `int`, Java never computed the .25 in the first place."
- *2* — ✅ `data-explain`: "Right — whole-number division. The fraction is discarded, not rounded."
- *3* — `data-explain`: "Java truncates, it doesn't round up. `9 / 4` is 2."

**Q2.** You want half of `1`, as a `double`. Which line works?
- *`double h = 1 / 2;`* — `data-explain`: "This gives `0.0`. Both sides are `int`, so the division happens as whole numbers before the value ever reaches the `double` box."
- *`double h = 1.0 / 2;`* — ✅ `data-explain`: "Yes. One decimal point promotes the whole expression to `double`, and you get `0.5`."
- *`double h = (double) (1 / 2);`* — `data-explain`: "Too late. The `int` division runs inside the parentheses first and produces 0; casting 0 gives `0.0`."

**Q3.** `System.out.println(1 + 2 + " motors");` prints…
- *`1 2 motors`* — `data-explain`: "Java doesn't insert spaces or keep the numbers separate — the `+` between two numbers is addition."
- *`3 motors`* — ✅ `data-explain`: "Correct. Java goes left to right: `1 + 2` are both numbers so they add to 3, and only then does the text get glued on."
- *`12 motors`* — `data-explain`: "That would happen if the text came first. Here the two numbers meet each other before any text is involved."

**Q4.** What is `Math.max(-0.8, -1.0)`?
- *−1.0* — `data-explain`: "`max` gives the *larger* value, and −0.8 is larger than −1.0 — it's further to the right on the number line."
- *−0.8* — ✅ `data-explain`: "Right, and that's exactly why `max` is the floor of a clamp: it drags anything too negative up to the limit."
- *0.8* — `data-explain`: "`Math.max` picks one of the two values you gave it; it never flips a sign."

**Q5.** Why wrap `(totalTicks + matchSeconds)` in parentheses inside a `println`?
- *Java requires parentheses around every sum* — `data-explain`: "It doesn't. `int x = a + b;` is perfectly legal with no parentheses."
- *Because the text on the left would otherwise turn `+` into glue and print the digits side by side* — ✅ `data-explain`: "Exactly the `Total: 23` trap. The parentheses force the addition to finish before the gluing starts."
- *It makes the program run faster* — `data-explain`: "Identical speed. Parentheses change the *meaning*, not the performance."

---

## PHASE 2 FORESHADOWING
- `Math.min(0.8, Math.max(-0.8, x))` is the exact clamp applied to every PID output in
  U6–U10. Say "you will write this again around a PID output" out loud.
- Integer division returns in U5 when converting encoder rotations to distance — a
  conversion factor is a `double` for exactly this reason.
- `Math.abs(...)` returns in U6 as the "am I close enough?" check
  (`Math.abs(target - position) < 0.25`) and in U9 as the joystick deadband.
