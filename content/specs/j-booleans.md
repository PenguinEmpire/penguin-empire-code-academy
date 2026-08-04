# j-booleans · Booleans & Comparisons
unit: J2 · Logic & Flow   |   duration: 25 min   |   difficulty: Beginner

---

## INTRODUCES
`boolean-expression` · `comparison-operators` (`==`, `!=`, `<`, `>`, `<=`, `>=`) ·
`equality-vs-assignment` (`==` vs `=`) · `logical-and` (`&&`) · `logical-or` (`||`) ·
`logical-not` (`!`) · `truth-table` · `short-circuit-evaluation` ·
`boolean-variable-naming` (`isX` / `hasX`) · `named-condition` (storing a test in a
variable) · `de-morgan` (light touch) ·
`double-equality-trap` (never `==` two `double`s) · `tolerance-comparison` ·
`string-equality` (`==` vs `.equals()`, the real explanation)

## ASSUMES
`program`, `sequential-execution`, `compiler`, `bug` *(j-what-is-programming)* ·
`class`, `main-method`, `println`, `semicolon` *(j-first-program)* ·
`variable`, `int`, `double`, `boolean`, `String-type`, `string-concatenation`,
`final-variable` *(j-variables)* ·
`expression`, `arithmetic-operators`, `operator-precedence`, `parentheses-grouping`,
`math-class` (`Math.abs`) *(j-operators)* ·
`dot-notation`, `equals()`, `string-immutability` *(j-strings)* ·
`logic-error`, `print-debugging` *(j-debugging)*

## GOAL
Turn a question about the robot into a `boolean` expression, combine several of them with
`&&`, `||` and `!`, and know why you must never compare two decimals with `==`.

## HOOK
**Section title: "The question with only two answers"**

Hook on a real mechanism, `callout--why`, title **"Pressed, or not pressed"**: at the bottom
of PenguinBot's arm there is a limit switch. It is either pressed or it is not. There is no
"mostly pressed," no "pressed-ish." One wire, two answers.

Now count how many decisions the robot makes in a two-and-a-half minute match. *Should I
stop the arm? Do I have a game piece? Is the tag in view? Is the battery healthy enough to
try this?* Every one of them bottoms out in a question with exactly two answers.

Java has a type for exactly that, and you already met it in `j-variables`: `boolean`. Two
values, `true` and `false`, and nothing else forever.

Second beat, and it's the one that costs people a meeting: **the arm's position is not a
boolean.** It's `8.9732...`. Asking a decimal whether it is *exactly* 9.0 is a question that
is almost always answered `false`, even when the arm is sitting right where you wanted it.
That's why the team's arm has a **tolerance of 0.25 rotations** written down as a number.
Beat 8 is where that comes from.

---

## EXPLAIN

**Beat 1 — A comparison is an expression that evaluates to `true` or `false`.**
`j-operators` said the right-hand side of `=` is always an expression that gets boiled down
to one value. A comparison is the same thing, and the one value it produces is a `boolean`:

```java
double armPosition = 9.0;
double setpoint = 9.0;
boolean arrived = armPosition == setpoint;   // arrived is now true
```

You can print one directly, store one in a variable, or (from the next lesson) hand one to
an `if`.

**Beat 2 — The six comparison operators.**

| Operator | Reads as | `canId` is 3 |
|---|---|---|
| `==` | is equal to | `canId == 3` → `true` |
| `!=` | is **not** equal to | `canId != 3` → `false` |
| `<` | less than | `canId < 3` → `false` |
| `>` | greater than | `canId > 1` → `true` |
| `<=` | less than or equal to | `canId <= 3` → `true` |
| `>=` | greater than or equal to | `canId >= 4` → `false` |

**Beat 3 — `=` stores. `==` asks. This is the big one.**
Bring back the "gets" reading from `j-variables`:

- `speed = 0.7` — **"speed gets 0.7."** A command. Changes the box.
- `speed == 0.7` — **"is speed 0.7?"** A question. Changes nothing, produces `true` or
  `false`.

Say the mnemonic once: **one equals sets, two equals asks.**

`callout--pitfall`, title **"The typo the compiler catches — usually"**: writing `=` where
you meant `==` inside a condition is one of the oldest mistakes in programming. In some
languages it silently ruins your day. In Java you usually get a compiler error
(*incompatible types: int cannot be converted to boolean*) — one more reason to be glad
Java is picky. But if both sides are already `boolean`, `if (isEnabled = true)` compiles
fine and is a real bug. Read your equals signs.

**Beat 4 — `&&`, `||`, `!` — combining answers.**
Analogy: **the pre-match checklist.** The robot is ready when battery **and** bumpers
**and** tether-unplugged are all done. It's *not* ready if **any one** of them is missing.

| Operator | Name | True when |
|---|---|---|
| `&&` | AND | **both** sides are true |
| `\|\|` | OR | **at least one** side is true |
| `!` | NOT | flips it: `!true` is `false` |

Truth tables, as a `.diagram`:

| `a` | `b` | `a && b` | `a \|\| b` |
|---|---|---|---|
| true | true | true | true |
| true | false | false | true |
| false | true | false | true |
| false | false | false | false |

Say the English out loud each time: `&&` is "and also", `||` is "or maybe", `!` is "not".
`hasGamePiece && !armAtScore` reads as *"I have a piece and the arm is not up yet"* — which
is precisely the moment you'd want to raise the arm.

`callout--tip`: `&&` is **two** ampersands and `||` is **two** pipes. The single-character
versions exist and do something different (they don't short-circuit — Beat 6). Always use
the doubles.

**Beat 5 — Name your conditions.**
This is the habit that separates readable robot code from a wall of symbols:

```java
boolean armReady  = Math.abs(SCORE_SETPOINT - armPosition) < TOLERANCE;
boolean batteryOk = batteryVoltage >= MIN_VOLTAGE;
boolean readyToScore = hasGamePiece && armReady && batteryOk && tagVisible;
```

versus the same logic on one unreadable line. Naming rule the team uses and Phase 2 uses:
boolean names read as **yes/no questions** — `isEnabled`, `hasGamePiece`, `atSetpoint`,
`tagVisible`. If the name doesn't sound like a question, it probably isn't a boolean.

Bonus: named conditions are self-debugging. Print `armReady` and `batteryOk` separately and
you instantly know *which* of four things blocked you — the print-debugging habit from
`j-debugging`, applied to logic.

**Beat 6 — Short-circuiting: `&&` stops early.**
If the left side of `&&` is already `false`, Java **doesn't even look** at the right side —
the answer can't change. Same for `||` when the left is already `true`.

This is not trivia. It's the standard guard pattern, and you'll write it constantly:

```java
boolean safeToRead = (sensor != null) && sensor.isConnected();
```

If `sensor` is empty, the left side is false, the right side is never touched, and you don't
crash. (`null` gets its own lesson in J4; the pattern is worth seeing now.) In Phase 2 the
same shape guards vision: *"is there a target at all? only then trust the angle."*

**Beat 7 — Comparison chains don't work the way maths does.**
`0 < x < 10` is valid maths and **invalid Java** — it won't compile. Java evaluates
`0 < x` first, gets a `boolean`, and then can't compare a boolean to `10`. Write it as two
comparisons joined with `&&`:

```java
boolean inRange = (x > 0) && (x < 10);
```

**Beat 8 — Never ask a `double` whether it is equal.**
Run this and watch:

```java
double a = 0.1 + 0.2;
System.out.println(a);        // 0.30000000000000004
System.out.println(a == 0.3); // false
```

That is not a Java bug and it is not a rounding mistake you made. A `double` stores numbers
in binary, and some decimal values simply cannot be written exactly in binary — the same way
1/3 cannot be written exactly in decimal. Tiny errors are inherent.

So `armPosition == 9.0` is a question that is essentially never `true`, even when the arm is
mechanically sitting at the setpoint. An arm waiting for that condition waits forever.

**The fix is a tolerance**: decide, as a number, how close counts as arrived.

```java
Math.abs(setpoint - armPosition) < TOLERANCE
```

`Math.abs` (from `j-operators`) makes it work whether you're above or below. The team's
number for the arm is **0.25 rotations**.

`callout--note`: *"In Phase 2 this exact idea gets a method name — `setTolerance(0.25)` and
`atSetpoint()` — but under the hood it is the line above. 'Close enough' is not a vague
feeling; it is a number you write down."*

Rule for the rest of your life: **`==` for `int`, `char` and `boolean`. Tolerance for
`double`.**

**Beat 9 — And now the String answer we owed you.**
`j-strings` promised an explanation. Here it is:

```java
String a = "Intake";
String b = "Intake";
String c = "Int";
String d = c + "ake";

a == b       // true
a == d       // false     <- both hold the text "Intake"
a.equals(d)  // true
```

`==` on a String does **not** ask "is this the same text?" It asks **"is this the same
object in memory?"** Two identical text literals written directly in your source often end
up sharing one object, so `a == b` is `true` and it *looks* like `==` works. Build the same
text at runtime, as `d` is, and you get a second object holding identical characters — and
`==` says `false`.

That "it worked in my little test" behaviour is exactly what makes this trap survive so long.

> **Rule, permanently: compare text with `.equals(...)`. Never with `==`.**

`callout--note`: *"You've now met the two halves of the same idea. `int` and `double` and
`boolean` are **primitives** — the box holds the value itself, so `==` compares values.
`String` is a **reference type** — the box holds a pointer to a thing somewhere else, so
`==` compares pointers. `j-variables` named that split in one sentence and promised Unit J5;
this is the down payment."*

**Beat 10 — Light De Morgan.**
Two identities worth recognising, not memorising:

- `!(a && b)` is the same as `!a || !b`
- `!(a || b)` is the same as `!a && !b`

In English: *"not (both)"* is *"either one is missing"*. Useful when you're staring at a
condition trying to write its opposite — flip every operator and negate every piece.

---

## CODE

### Sample A — the six comparisons (annotate)
`.code.with-lines`, file label `Main.java`:
```java
public class Main {
    public static void main(String[] args) {
        double armPosition = 9.0;
        double setpoint = 9.0;
        int canId = 3;

        System.out.println(armPosition == setpoint);
        System.out.println(canId != 3);
        System.out.println(armPosition < setpoint);
        System.out.println(armPosition <= setpoint);
        System.out.println(canId > 1);
        System.out.println(canId >= 4);
    }
}
```
**Verified output:**
```
true
false
false
true
true
false
```
**Annotate:** line 7 "two equals — this is a *question*, and it prints its answer";
line 9 "9.0 is not less than 9.0"; line 10 "…but it *is* less than **or equal to** 9.0";
line 12 "3 is not 4 or more".

### Sample B — combining with `&&`, `||`, `!` (annotate)
```java
public class Main {
    public static void main(String[] args) {
        boolean hasGamePiece = true;
        boolean armAtScore = false;

        System.out.println("AND: " + (hasGamePiece && armAtScore));
        System.out.println("OR:  " + (hasGamePiece || armAtScore));
        System.out.println("NOT: " + (!hasGamePiece));
        System.out.println("both ready: " + (hasGamePiece && !armAtScore));
    }
}
```
**Verified output:**
```
AND: false
OR:  true
NOT: false
both ready: true
```
**Annotate:** line 6 "both must be true, and one isn't"; line 9 "`!armAtScore` flips
`false` into `true`, so this whole thing is `true && true`"; note that every condition is
wrapped in `( )` for the same reason sums were in `j-operators` — the `+` in front of it
is gluing text.

### Sample C — the decimal trap and its fix (annotate)
```java
public class Main {
    public static void main(String[] args) {
        double a = 0.1 + 0.2;
        double b = 0.3;
        System.out.println(a);
        System.out.println(a == b);
        System.out.println(Math.abs(a - b) < 0.0001);

        double armPosition = 8.98;
        double setpoint = 9.0;
        System.out.println("exact:     " + (armPosition == setpoint));
        System.out.println("tolerance: " + (Math.abs(setpoint - armPosition) < 0.25));
    }
}
```
**Verified output:**
```
0.30000000000000004
false
true
exact:     false
tolerance: true
```
**Annotate:** line 5 "this is what the machine is really holding"; line 6 "`false` — and
neither number was 'wrong'"; line 7 "the same question, asked with a tolerance"; line 11
"an arm waiting for *this* waits forever"; line 12 "8.98 is 0.02 away from 9.0, which is
well inside 0.25 — **arrived**".

### Sample D — `==` vs `.equals()` on text (annotate)
```java
public class Main {
    public static void main(String[] args) {
        String a = "Intake";
        String b = "Intake";
        String c = "Int";
        String d = c + "ake";

        System.out.println("a == b     : " + (a == b));
        System.out.println("a == d     : " + (a == d));
        System.out.println("a.equals(d): " + a.equals(d));
    }
}
```
**Verified output:**
```
a == b     : true
a == d     : false
a.equals(d): true
```
**Annotate:** line 8 "`true` — which is exactly why this bug survives"; line 9 "`d` holds
the same six characters and `==` still says no"; line 10 "`.equals` asks the question you
actually meant".

---

## SANDBOX

### Sandbox 1 — "Walk through it": the tolerance dial
`data-title="Live Java Sandbox"`
```java
public class Main {
    public static void main(String[] args) {
        double setpoint    = 9.0;
        double armPosition = 8.98;
        double tolerance   = 0.25;

        System.out.println("position:  " + armPosition);
        System.out.println("error:     " + Math.abs(setpoint - armPosition));
        System.out.println("exact ==:  " + (armPosition == setpoint));
        System.out.println("arrived:   " + (Math.abs(setpoint - armPosition) < tolerance));

        // Try it:
        //  1. set armPosition to 9.0 exactly -- now BOTH say true
        //  2. set armPosition to 8.5 -- arrived goes false
        //  3. set tolerance to 0.6 -- 8.5 counts as arrived again
        //  4. set tolerance to 0.0 -- nothing ever arrives
    }
}
```
**Verified output as shipped:**
```
position:  8.98
error:     0.019999999999999574
exact ==:  false
arrived:   true
```
**Author note — do not "clean up" that error value.** It really prints as
`0.019999999999999574`, not `0.02`. That is the exact floating-point reality the lesson just
described, turning up uninvited in the middle of the demo, and it is the single most
convincing argument on the page for why tolerances exist. Leave it.

**Verified after step 2** (`armPosition = 8.5`): `arrived:   false`.
**Verified after step 4** (`tolerance = 0.0`, `armPosition = 9.0`): `arrived:   false` —
even sitting *exactly* on the setpoint, a zero tolerance never counts as arrived, because
`< 0.0` can never be satisfied by a distance.
**What the student changes:** the four steps in the comments, in order. Step 4 is the
punchline: a tolerance of exactly zero means "arrived" is unreachable, which is what
`==` was doing all along.

### Sandbox 2 — "Build it": the score-permission check
`data-title="Project Sandbox"`
```java
public class Main {
    public static void main(String[] args) {
        // PenguinBot may only score when ALL FOUR are true:
        //   - it has a game piece
        //   - the arm is within 0.25 rotations of the 9.0 setpoint
        //   - the battery is at least 11.0 volts
        //   - the AprilTag is visible
        //
        // 1. Build armReady and batteryOk as named boolean variables.
        // 2. Combine all four into readyToScore with &&.
        // 3. Print each named condition on its own line, then the verdict.
        // 4. Break it: set batteryVoltage to 10.4 and confirm you can SEE which one failed.

        boolean hasGamePiece   = true;
        double  armPosition    = 8.9;
        double  batteryVoltage = 11.8;
        boolean tagVisible     = true;

        final double SCORE_SETPOINT = 9.0;
        final double TOLERANCE      = 0.25;
        final double MIN_VOLTAGE    = 11.0;

        // TODO
    }
}
```
**Reference (author check, not shown on the page):**
```java
public class Main {
    public static void main(String[] args) {
        boolean hasGamePiece   = true;
        double  armPosition    = 8.9;
        double  batteryVoltage = 11.8;
        boolean tagVisible     = true;

        final double SCORE_SETPOINT = 9.0;
        final double TOLERANCE      = 0.25;
        final double MIN_VOLTAGE    = 11.0;

        boolean armReady     = Math.abs(SCORE_SETPOINT - armPosition) < TOLERANCE;
        boolean batteryOk    = batteryVoltage >= MIN_VOLTAGE;
        boolean readyToScore = hasGamePiece && armReady && batteryOk && tagVisible;

        System.out.println("=== SCORE CHECK ===");
        System.out.println("hasGamePiece : " + hasGamePiece);
        System.out.println("armReady     : " + armReady);
        System.out.println("batteryOk    : " + batteryOk);
        System.out.println("tagVisible   : " + tagVisible);
        System.out.println("READY TO SCORE: " + readyToScore);
        System.out.println("BLOCKED       : " + !readyToScore);
    }
}
```
**Verified output:**
```
=== SCORE CHECK ===
hasGamePiece : true
armReady     : true
batteryOk    : true
tagVisible   : true
READY TO SCORE: true
BLOCKED       : false
```
**Target:** with `batteryVoltage = 10.4`, `batteryOk` prints `false`, `READY TO SCORE`
prints `false`, and the student can point at the one line that explains why. That
one-line-per-condition layout **is** the deliverable.

---

## CHALLENGES

### Challenge 1 — Predict the output  (`data-kind="text"`)
Prompt: "Type `true` or `false`."
```java
double a = 0.1 + 0.2;
System.out.println(a == 0.3);
```
**Answer key:** `data-answer="false"` — **verified.**
- `data-win`: "Right, and it isn't a trick — `0.1 + 0.2` really is stored as `0.30000000000000004`. Doubles can't hold some decimals exactly."
- `data-lose`: "It's `false`. Printing `a` shows `0.30000000000000004`. This is why you compare doubles with a tolerance, never with `==`."

**Reveal explanation:** binary can't write 0.1 or 0.2 exactly, the same way decimal can't
write 1/3 exactly. The sum lands a hair off, and `==` is unforgiving. Use
`Math.abs(a - 0.3) < 0.0001` instead.

### Challenge 2 — Predict the output  (`data-kind="text"`)
Prompt: "`hasGamePiece` is `true` and `armAtScore` is `false`. Type `true` or `false`."
```java
System.out.println(hasGamePiece && !armAtScore);
```
**Answer key:** `data-answer="true"` — **verified.**
- `data-win`: "Yes — `!armAtScore` flips false into true, so it's `true && true`."
- `data-lose`: "It's `true`. `!` runs first and turns `armAtScore`'s `false` into `true`; then `true && true` is `true`."

### Challenge 3 — Fill in the blanks  (`data-kind="fib"`)
Prompt: "Write the condition for 'the arm has arrived', using a tolerance instead of `==`."
```
boolean arrived = Math.______(setpoint - armPosition) ______ TOLERANCE;
```
Blanks: `data-answer="abs"`, `data-answer="<"`
- `data-win`: "That's the pattern you'll use for the rest of the course: distance from the target, made positive, compared against a number you chose."
- `data-lose`: "`Math.abs(...)` makes the error positive whether you're above or below the setpoint, and you want that error to be **less than** the tolerance."

### Challenge 4 — Multiple choice  (`data-kind="mcq"`)
Prompt: "Which line asks *'does `speed` currently hold 0.7?'*"

| Option | Correct | `data-explain` |
|---|---|---|
| `speed = 0.7;` | | That's a command, not a question — it *sets* speed to 0.7 and destroys whatever was there. |
| `speed == 0.7` | ✅ | Correct. Two equals asks; one equals sets. (Though for a `double` you'd really want a tolerance — see the next question.) |
| `speed.equals(0.7)` | | `.equals(...)` is for objects like `String`. A `double` is a primitive and has no methods to call. |
| `speed := 0.7` | | Not Java. `:=` is from other languages; Java uses `=` and `==`. |

### Challenge 5 — Multiple choice  (`data-kind="mcq"`)
Prompt: "Two `String` variables both hold the text `Intake`, but `a == b` prints `false`. Why?"

| Option | Correct | `data-explain` |
|---|---|---|
| One of them has a hidden space | | Possible in general, but not here — `.equals(...)` returns `true`, which proves the characters are identical. |
| `==` on Strings compares whether they are the same object, not whether they hold the same text | ✅ | Exactly. Text built at runtime is a different object from a literal, even with identical characters. Use `.equals(...)` — always. |
| Java can't compare Strings at all | | It compares them fine — with `.equals(...)`. Only the `==` shortcut asks the wrong question. |
| The strings are too long | | Length is irrelevant. `"a"` behaves the same way. |

### Challenge 6 — Multiple choice  (`data-kind="mcq"`)
Prompt: "Why is `boolean safe = (sensor != null) && sensor.isConnected();` written in that order?"

| Option | Correct | `data-explain` |
|---|---|---|
| Alphabetical order | | Order in a condition is about *meaning*, never about spelling. |
| Because `&&` stops as soon as the left side is false, so `sensor.isConnected()` is never reached when `sensor` is empty | ✅ | Right — that's short-circuiting, and it's the standard guard pattern. Swap the two halves and the program crashes the moment the sensor is missing. |
| Because `!=` is faster than a method call | | Speed isn't the point; not crashing is. |
| It makes no difference which order you write them | | It makes all the difference. The whole reason for the order is that the right side is unsafe until the left side has been checked. |

---

## MISCONCEPTIONS

1. **"`=` and `==` are interchangeable."**
   → One stores, one asks. `speed = 0.7` changes the robot; `speed == 0.7` only produces
   an answer.
2. **"`0 < x < 10` works."**
   → It doesn't compile. Java computes `0 < x` into a boolean and then can't compare that
   to 10. Write `(x > 0) && (x < 10)`.
3. **"`==` works fine on doubles — I tested it."**
   → You tested a value that happened to be exact. `0.1 + 0.2 == 0.3` is `false`. Use a
   tolerance every time, not just when you remember.
4. **"`==` works fine on Strings — I tested it."**
   → Same trap, same reason it survives. Two literals often share one object; text built
   at runtime does not. Use `.equals(...)`.
5. **"`&&` and `&` are the same."**
   → `&&` short-circuits and `&` doesn't. Use `&&`; it is both faster and safer.
6. **"A long condition is a sign of good, thorough code."**
   → A long condition is a debugging nightmare. Name each part in its own `boolean`
   variable and print them separately — then a failure tells you *which* part failed.
7. **"`!` applies to the whole line."**
   → `!` binds tightly to the thing right after it. `!a && b` is `(!a) && b`. Use
   parentheses if you meant `!(a && b)`.

---

## EXERCISE

### Mini-project: The Score-Permission Panel
`j-strings` gave you a console a human can read. Now give that console something worth
saying: whether the robot is actually allowed to score, and if not, which single condition
is blocking it.

**Task:**
1. Declare the four raw inputs: `hasGamePiece` (boolean), `armPosition` (double),
   `batteryVoltage` (double), `tagVisible` (boolean).
2. Declare three `final` limits: `SCORE_SETPOINT = 9.0`, `TOLERANCE = 0.25`,
   `MIN_VOLTAGE = 11.0`.
3. Build two **named** conditions: `armReady` (within tolerance of the setpoint) and
   `batteryOk` (at least the minimum voltage).
4. Build `readyToScore` by `&&`-ing all four conditions together.
5. Print every named condition on its own labelled line, then `READY TO SCORE`.
6. **Bonus:** also print `BLOCKED` using `!readyToScore`.

Starter code and **reference solution:** as Sandbox 2 above.
**Verified output** (with the values as given): as Sandbox 2.

Then the required experiment: set `armPosition = 8.5` and re-run. Verified result —
`armReady` becomes `false` and `READY TO SCORE` becomes `false`, while the other three lines
stay `true`. Closing note for the reveal: *"Four booleans, one verdict, and you can tell at
a glance which one failed. Compare that to a single line of `&&`s that just says `false` and
refuses to explain itself. In Phase 2 these lines go to the Driver Station console, and
during a match this panel is the difference between 'it's broken' and 'the arm is 0.4
short.'"*

---

## CHECKPOINT

**Q1.** What type does `canId > 1` produce?
- *`int`* — `data-explain`: "The values being compared are ints, but the *answer* to a comparison is never a number."
- *`boolean`* — ✅ `data-explain`: "Right. Every comparison boils down to exactly `true` or `false`."
- *`String`* — `data-explain`: "It prints as the word `true`, but that's `println` turning a boolean into text for display. The value itself is a boolean."

**Q2.** `double pos = 9.0;` — which is the right way to ask if the arm has arrived at 9.0?
- *`pos == 9.0`* — `data-explain`: "It might be true today and false tomorrow with a real sensor. Doubles carry tiny inherent errors, so exact equality is a coin flip you always lose."
- *`Math.abs(9.0 - pos) < 0.25`* — ✅ `data-explain`: "Yes. Distance from the target, made positive, compared to a tolerance you chose deliberately."
- *`pos.equals(9.0)`* — `data-explain`: "A `double` is a primitive — it has no methods. This won't compile."

**Q3.** `a` is `true`, `b` is `false`. What is `a || b`?
- *`true`* — ✅ `data-explain`: "Correct — `||` needs only one side to be true."
- *`false`* — `data-explain`: "That would be `a && b`, which needs *both*. `||` is the forgiving one."
- *A compiler error* — `data-explain`: "Two booleans and `||` is perfectly valid; it produces a boolean."

**Q4.** Why do we compare text with `.equals(...)` instead of `==`?
- *`==` doesn't work on objects at all* — `data-explain`: "It works — it just answers a different question, and compiles happily while doing so."
- *`==` asks whether they're the same object in memory, not whether they hold the same characters* — ✅ `data-explain`: "Exactly, and the trap is that identical literals often *are* the same object, so `==` appears to work until the text is built at runtime."
- *`.equals(...)` is faster* — `data-explain`: "It's the *correct* one, which matters infinitely more than speed here."

**Q5.** Why build `armReady` and `batteryOk` as separate named variables instead of one long condition?
- *Java can only handle two `&&` at a time* — `data-explain`: "Java will happily chain as many as you like. The limit is human, not technical."
- *So you can print each one and see exactly which condition blocked you* — ✅ `data-explain`: "Right. A named condition is a debuggable condition — and it also makes the code read like a sentence."
- *It runs faster* — `data-explain`: "Identical work. This is entirely about being able to find out what went wrong at 90 seconds into a match."

---

## PHASE 2 FORESHADOWING
- `Math.abs(setpoint - position) < TOLERANCE` becomes `PIDController.setTolerance(0.25)` and
  `atSetpoint()` in U6. Say so explicitly — the method is a wrapper around this line.
- `boolean hasGamePiece` and `isEnabled` reappear as real sensor reads in U5 and U8.
- Short-circuit `&&` becomes the vision guard in U10: *"is there a target at all?"* before
  trusting `tx`.
- The `isX` / `hasX` naming convention is the same one WPILib uses (`isFinished()`,
  `atSetpoint()`, `isConnected()`).
