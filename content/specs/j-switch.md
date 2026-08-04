# j-switch · switch Statements
unit: J2 · Logic & Flow   |   duration: 20 min   |   difficulty: Beginner

---

## INTRODUCES
`switch-statement` · `case-label` · `break` (in a switch) · `default-case` ·
`fall-through` (the bug, and the deliberate use) · `grouped-cases` ·
`switch-on-int` / `switch-on-char` / `switch-on-String` ·
`arrow-switch` (`case X -> …`, no fall-through) · `switch-expression` (assigning from a
switch) · `when-to-prefer-if`

## ASSUMES
`program`, `sequential-execution`, `literal-machine` *(j-what-is-programming)* ·
`class`, `main-method`, `println`, `semicolon`, `comment` *(j-first-program)* ·
`variable`, `int`, `char`, `String-type`, `string-concatenation`, `reassignment`
*(j-variables)* ·
`expression`, `arithmetic-operators` *(j-operators)* ·
`equals()`, `dot-notation` *(j-strings)* ·
`logic-error` *(j-debugging)* ·
`comparison-operators`, `string-equality` *(j-booleans)* ·
`if-statement`, `else-if-chain`, `first-match-wins`, `default-branch`, `block`
*(j-if-else)*

## GOAL
Replace a long chain of `else if` tests against one variable with a `switch`, and never get
caught by fall-through.

## HOOK
**Section title: "Check in order, run the match, else fall to a default"**

Team story for `callout--why`, title **"Same idea, different clothes"**: when the team's
onboarding session listed the topics still to cover, one of them was written down as, near
enough, *"programming switches — chained conditionals, like a long if/else: check
conditions in order, run the matching one, else fall to a default."* And then the honest
note that follows it: **"functionally interchangeable with if-statements."**

That is the entire lesson, said correctly, before you've read it.

So why bother? Because of the specific case it's built for: **one variable, compared against
a list of fixed values.** A direction that is `"up"`, `"down"`, `"left"` or `"right"`. A
robot mode that is auto, teleop, test or disabled. A CAN ID that maps to a mechanism. When
that's the shape of your problem, a `switch` makes it look like what it is — a lookup table
— instead of a wall of repeated `else if (direction.equals(...))`.

You will need exactly this for Alice's kitchen, where `moveObject` takes a direction as a
String and has to turn it into a change of row or column.

---

## EXPLAIN

**Beat 1 — The shape.**

```java
switch (direction) {
    case "up":
        System.out.println("row - 1");
        break;
    case "down":
        System.out.println("row + 1");
        break;
    default:
        System.out.println("Unknown direction: " + direction);
}
```

Read it as: *"look at `direction`. Find the `case` that matches. Run from there until you hit
a `break`."*

Parts to name explicitly:
- **the selector** — the value in `switch ( … )`, evaluated once
- **`case X:`** — a label, not a condition. It's an exact match, nothing else
- **`break;`** — "stop here, leave the switch"
- **`default:`** — the "none of the above" label. Same job as the final `else`

**Beat 2 — What you can switch on.**
`int`, `char`, `String`, and (from Unit J5) enums. **Not** `double` — because exact equality
on decimals is meaningless, exactly as `j-booleans` explained. **Not** ranges: you cannot
write `case > 11.5:`. A `case` is a single fixed value.

That's the deciding rule for the rest of the course:

> **Fixed list of exact values → `switch`. Ranges, or anything involving `&&` → `if`.**

The battery chain from `j-if-else` (`>= 12.0`, `>= 11.5`, …) can never be a switch. The
direction lookup can never sensibly be a chain.

`callout--note`: *"Switching on a `String` compares with `.equals(...)` under the hood — not
`==`. Java does the right thing for you here. Note that it is still case-sensitive: `"Up"`
does not match `case "up":`."*

**Beat 3 — Fall-through is real, and it is the classic bug.**
Leave out the `break`s and Java **keeps going into the next case**, ignoring its label
entirely:

```java
switch (direction) {          // direction is "up"
    case "up":
        System.out.println("row - 1");
    case "down":
        System.out.println("row + 1");
    case "left":
        System.out.println("col - 1");
    default:
        System.out.println("Unknown direction: " + direction);
}
```
prints **all four lines**. Alice moves up, then down, then left, and is then told she gave
an unknown direction.

Say why it works this way, so it stops feeling arbitrary: a `case` is a **place to jump
to**, not a box to run. Once you've jumped in, you keep running until something tells you to
stop. `break` is what tells you to stop.

`callout--pitfall`, title **"The missing `break`"**: this compiles with no warning and the
output looks like the program has lost its mind. If a switch produces several results at
once, count your `break`s. Every `case` needs one — including, by habit, the last one.

**Beat 4 — Deliberate fall-through: grouped cases.**
The one time you *want* it: several values that should do the same thing.

```java
case 10:
case 11:
case 12:
case 13:
    System.out.println("Swerve drive motor");
    break;
```
Stack the labels with nothing between them and they share one body. Read as *"10, 11, 12 or
13 → this."* This is the only fall-through you should write on purpose, and when you do it,
write a comment saying so.

**Beat 5 — The modern arrow form, which cannot fall through.**
Newer Java has a second syntax:

```java
switch (alliance) {
    case 'R' -> System.out.println("Red alliance");
    case 'B' -> System.out.println("Blue alliance");
    default  -> System.out.println("Unknown alliance");
}
```
No `break`, no fall-through, **impossible to get wrong in the classic way.** Group values
with commas: `case 10, 11, 12, 13 -> …`.

And it can produce a value, which is genuinely useful:
```java
String label = switch (mode) {
    case "auto"   -> "Autonomous";
    case "teleop" -> "Teleoperated";
    case "test"   -> "Test";
    default       -> "Disabled";
};
```
Note the `;` after the closing brace — this whole thing is an *expression* being assigned,
like the ternary in `j-if-else`, so the statement needs its terminator.

`callout--tip`, title **"Learn to read both"**: write the arrow form when you have the
choice — it removes an entire category of bug. But **you must be able to read the classic
form**, because most of the FRC code you'll open, including examples in vendor
documentation, is written with `case … : … break;`.

**Beat 6 — When a `switch` is the wrong tool.**
Be honest about it:
- Ranges (`>= 11.5`) → `if`.
- Combined conditions (`atLowerLimit && speed < 0`) → `if`.
- Two possibilities → `if / else` reads better than a two-case switch.
- Fifteen `else if`s all comparing the same variable to a fixed value → **switch**, and it
  will read three times better.

---

## CODE

### Sample A — a direction switch (annotate)
`.code.with-lines`, file label `Main.java`:
```java
public class Main {
    public static void main(String[] args) {
        String direction = "up";

        switch (direction) {
            case "up":
                System.out.println("row - 1");
                break;
            case "down":
                System.out.println("row + 1");
                break;
            case "left":
                System.out.println("col - 1");
                break;
            case "right":
                System.out.println("col + 1");
                break;
            default:
                System.out.println("Unknown direction: " + direction);
        }

        System.out.println("move finished");
    }
}
```
**Verified output:**
```
row - 1
move finished
```
**Annotate:** line 5 "the selector is evaluated once"; line 6 "an exact match — and it is
case-sensitive"; line 8 "**this is what stops it**"; line 18 "unreachable here, but it's
what protects you against a typo'd direction"; line 22 "outside the switch — always runs".

### Sample B — the same switch with the `break`s removed (annotate)
Show inside a `callout--pitfall`, marked **"this compiles, and it is wrong"**:
```java
public class Main {
    public static void main(String[] args) {
        String direction = "up";

        switch (direction) {
            case "up":
                System.out.println("row - 1");
            case "down":
                System.out.println("row + 1");
            case "left":
                System.out.println("col - 1");
            default:
                System.out.println("Unknown direction: " + direction);
        }
    }
}
```
**Verified output:**
```
row - 1
row + 1
col - 1
Unknown direction: up
```
**Annotate:** "one input, four outputs"; "Java jumped to `case \"up\"` and then simply kept
running downwards — the later labels were never re-checked"; "notice the last line
confidently reporting that `up` is unknown".

### Sample C — grouped cases, on an int (annotate)
```java
public class Main {
    public static void main(String[] args) {
        int canId = 12;

        switch (canId) {
            case 0:
                System.out.println("RoboRIO (reserved)");
                break;
            case 1:
                System.out.println("PDH (reserved)");
                break;
            case 2:
                System.out.println("Intake roller");
                break;
            case 3:
            case 4:
                System.out.println("Arm pivot or follower");
                break;
            case 10:
            case 11:
            case 12:
            case 13:
                System.out.println("Swerve drive motor");
                break;
            default:
                System.out.println("Unassigned CAN ID");
        }
    }
}
```
**Verified output:**
```
Swerve drive motor
```
**Annotate:** lines 15–16 "two labels, one body — deliberate fall-through"; lines 19–22
"four IDs that all mean the same thing"; "this is PenguinBot's real CAN map, and it's about
to become a lesson of its own in Phase 2".

### Sample D — the arrow form (annotate)
```java
public class Main {
    public static void main(String[] args) {
        char alliance = 'B';

        switch (alliance) {
            case 'R' -> System.out.println("Red alliance");
            case 'B' -> System.out.println("Blue alliance");
            default  -> System.out.println("Unknown alliance");
        }

        String mode = "auto";
        String label = switch (mode) {
            case "auto"   -> "Autonomous";
            case "teleop" -> "Teleoperated";
            case "test"   -> "Test";
            default       -> "Disabled";
        };
        System.out.println("Mode: " + label);
    }
}
```
**Verified output:**
```
Blue alliance
Mode: Autonomous
```
**Annotate:** line 6 "no `break` — the arrow form runs one branch and leaves"; line 12
"this switch **produces a value**"; line 17 "note the `;` — you're finishing an assignment
statement, not just closing a block".

---

## SANDBOX

### Sandbox 1 — "Walk through it": break it, then group it
`data-title="Live Java Sandbox"`
```java
public class Main {
    public static void main(String[] args) {
        String direction = "up";

        switch (direction) {
            case "up":
                System.out.println("row - 1");
                break;
            case "down":
                System.out.println("row + 1");
                break;
            case "left":
                System.out.println("col - 1");
                break;
            case "right":
                System.out.println("col + 1");
                break;
            default:
                System.out.println("Unknown direction: " + direction);
        }

        // Try it:
        //  1. change direction to "left", then to "sideways"
        //  2. change it to "Up" (capital U) -- predict first
        //  3. DELETE every break and run it with "up"
        //  4. put the breaks back
    }
}
```
**Verified outputs:** `"up"` → `row - 1`; `"left"` → `col - 1`;
`"sideways"` → `Unknown direction: sideways`; `"Up"` → `Unknown direction: Up`;
with all `break`s deleted and `"up"` → four lines (see Sample B).
**What the student changes:** the four steps above. Step 2 is the case-sensitivity lesson
from `j-first-program`, showing up where it costs you. Step 3 is fall-through, felt rather
than described.

### Sandbox 2 — "Build it": Alice takes one step
`data-title="Project Sandbox"`
```java
public class Main {
    public static void main(String[] args) {
        // Alice is standing in a kitchen grid at row 3, column 2.
        // Rows count DOWN the screen, so "up" means row - 1.
        //
        // 1. Write a switch on 'direction' that changes row or col by 1.
        // 2. Give it a default that prints a complaint and moves nothing.
        // 3. Test all four directions, then test "diagonal".
        //
        // (You are writing a piece of the capstone project. Keep it.)

        int row = 3;
        int col = 2;
        String direction = "left";

        System.out.println("Alice starts at (" + row + ", " + col + ")");

        // TODO: switch here

        System.out.println("Alice is now at (" + row + ", " + col + ")");
    }
}
```
**Reference (author check, not shown on the page):**
```java
public class Main {
    public static void main(String[] args) {
        int row = 3;
        int col = 2;
        String direction = "left";

        System.out.println("Alice starts at (" + row + ", " + col + ")");

        switch (direction) {
            case "up":
                row = row - 1;
                break;
            case "down":
                row = row + 1;
                break;
            case "left":
                col = col - 1;
                break;
            case "right":
                col = col + 1;
                break;
            default:
                System.out.println("Unknown direction '" + direction + "' - not moving.");
        }

        System.out.println("Alice is now at (" + row + ", " + col + ")");
    }
}
```
**Verified output (`direction = "left"`):**
```
Alice starts at (3, 2)
Alice is now at (3, 1)
```
**Verified output (`direction = "diagonal"`):**
```
Alice starts at (3, 2)
Unknown direction 'diagonal' - not moving.
Alice is now at (3, 2)
```
**Target:** all four directions move Alice exactly one square in the right direction, and an
unknown direction leaves her exactly where she was **and says so**. That "and says so" is
the part people skip and then spend twenty minutes wondering why nothing moved.

---

## CHALLENGES

### Challenge 1 — Predict the output  (`data-kind="text"`)
Prompt: "There are no `break` statements. `mode` is `\"auto\"`. Type the words that print, in order, separated by spaces."
```java
switch (mode) {
    case "auto":
        System.out.println("AUTO");
    case "teleop":
        System.out.println("TELEOP");
    default:
        System.out.println("DISABLED");
}
```
**Answer key:** `data-answer="AUTO TELEOP DISABLED"` — **verified.**
- `data-win`: "Exactly. Java jumps to the matching label and then keeps running downwards through every case until a `break` — and there isn't one."
- `data-lose`: "All three print: `AUTO TELEOP DISABLED`. A `case` is a place to jump *to*, not a box that contains its own exit. Without `break`, execution falls straight through the labels below."

**Reveal explanation:** this is fall-through. It is occasionally useful (grouped cases) and
usually a bug. The arrow form `case "auto" -> …` makes it impossible.

### Challenge 2 — Predict the output  (`data-kind="text"`)
Prompt: "`canId` is `11`. Type the exact line printed."
```java
switch (canId) {
    case 10:
    case 11:
    case 12:
    case 13:
        System.out.println("Swerve drive motor");
        break;
    default:
        System.out.println("Unassigned CAN ID");
}
```
**Answer key:** `data-answer="Swerve drive motor"` — **verified.**
- `data-win`: "Right — stacked labels with no body between them share the body underneath. This is the one fall-through you write on purpose."
- `data-lose`: "It prints `Swerve drive motor`. `case 11:` has no body of its own, so execution falls through to the next label that does — which is exactly the point of grouping them."

### Challenge 3 — Fill in the blanks  (`data-kind="fib"`)
Prompt: "Complete the switch so it handles `\"right\"` and has a safe fallback."
```
switch (direction) {
    ______ "right":
        col = col + 1;
        ______;
    ______:
        System.out.println("Unknown direction");
}
```
Blanks: `data-answer="case"`, `data-answer="break"`, `data-answer="default"`
- `data-win`: "`case` labels a value, `break` leaves the switch, `default` catches everything else."
- `data-lose`: "The label keyword is `case`, the exit is `break`, and the none-of-the-above label is `default`."

### Challenge 4 — Multiple choice  (`data-kind="mcq"`)
Prompt: "Which of these **cannot** be done with a `switch`?"

| Option | Correct | `data-explain` |
|---|---|---|
| Match a `String` against four fixed direction names | | Perfect switch material — one variable, a short list of exact values. |
| Match an `int` CAN ID against a list of device numbers | | Also ideal. Switching on `int` is the original use case. |
| Check whether `batteryVoltage >= 11.5` | ✅ | Correct. A `case` is a single exact value, not a range or a comparison — and you'd never test a `double` for exact equality anyway. Use an `if` chain. |
| Match a `char` alliance letter | | Fine — `char` is one of the types you can switch on. |

### Challenge 5 — Multiple choice  (`data-kind="mcq"`)
Prompt: "A switch on `\"up\"` prints four different lines. What is wrong?"

| Option | Correct | `data-explain` |
|---|---|---|
| The cases are in the wrong order | | Order doesn't matter in a switch the way it does in an `if` chain — a `case` is an exact match, so at most one label can match. |
| The `break` statements are missing | ✅ | Yes. Execution jumped to the matching label and then ran straight through every case below it. Each `case` body needs its own `break`. |
| `String` can't be switched on | | It can, since Java 7, and it compares correctly with `.equals(...)` behaviour. |
| The `default` is in the wrong place | | `default` conventionally goes last, but its position isn't what produced four lines of output. |

### Challenge 6 — Multiple choice  (`data-kind="mcq"`)
Prompt: "What is the practical advantage of `case \"up\" -> …` over `case \"up\": … break;`?"

| Option | Correct | `data-explain` |
|---|---|---|
| It runs faster | | No measurable difference. This is a readability and safety change. |
| It cannot fall through, so a forgotten `break` is impossible | ✅ | Right — an entire class of bug is designed out. It can also produce a value, which the classic form can't do directly. |
| It works on `double` values | | Neither form does. The restriction is about the *selector type*, not the syntax. |
| It's the only form that supports `default` | | Both forms support `default`. |

---

## MISCONCEPTIONS

1. **"Each `case` is a separate block, like an `else if`."**
   → It's a **label** — a place to jump to. Without `break`, execution keeps going into the
   next one.
2. **"`default` has to be last."**
   → Conventionally yes, and you should write it last, but Java doesn't require it — which
   makes a misplaced `default` with no `break` a spectacular bug.
3. **"I can use a range in a case."**
   → `case > 5:` isn't Java. Ranges belong to `if`.
4. **"I can switch on a `double`."**
   → You can't, and you shouldn't want to: exact equality on decimals is unreliable
   (`j-booleans`).
5. **"Switching on a String uses `==`, so it's unsafe."**
   → Java compares String cases correctly. It is still **case-sensitive**: `"Up"` will not
   match `case "up":`.
6. **"A switch is always better than an if chain."**
   → It's better for one variable against fixed values. For ranges and combined conditions
   it isn't an option at all.
7. **"The arrow form is just cosmetic."**
   → It removes fall-through entirely and can return a value. That's a behavioural
   difference, not a style one.

---

## EXERCISE

### Mini-project: Alice Takes a Step
This is the first line of the capstone project you'll finish in Unit J6. Alice stands in a
kitchen grid. Give her one legal step.

**Task:**
1. Declare `int row = 3;`, `int col = 2;`, `String direction = "left";`.
2. Print where she starts.
3. Write a `switch` on `direction` handling `"up"`, `"down"`, `"left"`, `"right"`. Rows
   count **down** the screen, so `"up"` is `row - 1`.
4. Give it a `default` that prints a complaint naming the bad direction and changes nothing.
5. Print where she ends up.
6. **Bonus:** rewrite the whole thing using the arrow form and confirm the output is
   identical.

Starter code and **reference solution:** as Sandbox 2 above.
**Verified output** (`"left"` and then `"diagonal"`): as Sandbox 2.

Closing note for the reveal: *"Save this. In Unit J6 the same switch moves inside a method
called `moveObject(String direction)` on a `Kitchen` class, and the row and column stop
being loose variables and become part of an object. The logic in the middle does not change
at all."*

---

## CHECKPOINT

**Q1.** What does `break` do inside a switch?
- *Ends the whole program* — `data-explain`: "It ends the *switch*. The lines after the closing brace still run."
- *Leaves the switch immediately* — ✅ `data-explain`: "Right. Without it, execution falls through into the next case."
- *Skips to the `default`* — `data-explain`: "It skips past everything, including `default`, to the line after the switch."

**Q2.** Which type can you **not** switch on?
- *`String`* — `data-explain`: "You can, and it's very common — direction names, mode names, dashboard keys."
- *`double`* — ✅ `data-explain`: "Correct. A `case` needs an exact match, and exact equality on decimals is unreliable — the same reason `==` is banned on doubles."
- *`int`* — `data-explain`: "The original switch type. CAN IDs and port numbers are the classic example."

**Q3.** Two `case` labels are stacked with no code between them. What happens?
- *A compiler error* — `data-explain`: "It's completely legal, and it's the standard way to group values."
- *Both values run the body underneath them* — ✅ `data-explain`: "Yes — deliberate fall-through. `case 10: case 11:` means 'either of these'."
- *Only the second label works* — `data-explain`: "Both work. The first one falls through into the shared body."

**Q4.** When should you use an `if` chain instead of a `switch`?
- *When there are more than three options* — `data-explain`: "Option count isn't the deciding factor — a ten-case switch is very readable."
- *When the conditions are ranges or combine several variables* — ✅ `data-explain`: "Exactly. `>= 11.5` and `atLowerLimit && speed < 0` cannot be expressed as a `case` at all."
- *Never — `switch` is always better* — `data-explain`: "They're different tools. The battery chain from the last lesson has no switch equivalent."

**Q5.** Why write a `default` even when you think every value is covered?
- *Java requires it* — `data-explain`: "It doesn't. A switch with no `default` compiles fine and silently does nothing when nothing matches."
- *So an unexpected value produces a message instead of silence* — ✅ `data-explain`: "Right. Silent nothing is the hardest failure to debug — you can't tell it apart from 'the code never ran'."
- *It makes the switch faster* — `data-explain`: "No performance effect. It's about what happens on the day someone passes `\"Up\"` with a capital U."

---

## PHASE 2 FORESHADOWING
- The direction switch **is** `Kitchen.moveObject(String direction)` in Unit J6. Say so.
- `switch (canId)` here previews U2's CAN ID map — the same numbers, the same grouping.
- Robot mode (`auto` / `teleop` / `test` / `disabled`) previews U8's `Robot.java`
  lifecycle. The framework does the switching for you there; here you see what it's doing.
- In Unit J5 you'll switch on an **enum**, which is where switch statements really belong —
  and `MotorType.kBrushless` is an enum you'll meet in Phase 2.
