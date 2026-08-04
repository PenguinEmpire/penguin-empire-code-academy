# j-variables · Variables & Data Types
unit: J1 · Getting Started   |   duration: 20 min   |   difficulty: Beginner

---

## INTRODUCES
`variable` · `declaration` · `initialization` · `assignment` · `reassignment` ·
`data-type` · `int` · `double` · `boolean` · `char` · `String-type` ·
`primitive-vs-reference` (named only, one sentence) · `camelCase` ·
`string-concatenation` · `final-variable` · `type-mismatch-error`

## ASSUMES
`program`, `sequential-execution`, `syntax`, `compiler` *(j-what-is-programming)* ·
`class`, `main-method`, `println`, `statement`, `semicolon`, `comment`,
`string-literal`, `case-sensitivity` *(j-first-program)*

## GOAL
Declare a variable of the right type for a piece of robot data, give it a value, change
that value, and print it with a label.

## HOOK
**Section title: "The number that lived in nine places"**

Team story for `callout--why`, title **"Nine out of ten"**: one season the intake speed
`0.65` was typed directly into ten different spots in the code. Somebody decided it
should be `0.8`, went through and changed it — and missed one. For two meetings the
intake ran at full power everywhere *except* during autonomous, and nobody could work out
why auto kept jamming. The fix took two seconds once they found it.

The lesson: **a number typed in ten places is ten chances to be wrong. A number stored in
one named box is one place to be right.** That box is a variable.

---

## EXPLAIN

**Beat 1 — A variable is a labelled box.**
Analogy: **the bins on the pit cart.** Each bin has a label written on tape (`ZIP TIES`,
`HEX KEYS`) and contents. The label never changes; the contents do. In code the label is
the *name* and the contents are the *value*.

**Beat 2 — Java makes you say what kind of thing goes in the box.**
Analogy: **the bin is shaped.** The battery bin only holds batteries. You cannot drop a
wrench into it. In Java that shape is the **data type**, and you declare it *first*:

> `type` `name` `=` `value` `;`

Give the sentence they'll repeat forever: **"type, name, equals, value, semicolon."**
Point out this exact shape returns in Phase 2 as
`SparkMax leftMotor = new SparkMax(2, MotorType.kBrushless);` — same four parts.

**Beat 3 — The five types you need right now.**
Present as a `vocab` list, each with the robot meaning:

| Type | Holds | Robot example |
|---|---|---|
| `int` | whole numbers, no decimal point | `int teamNumber = 2551;` — CAN IDs, game-piece counts, ports |
| `double` | numbers with a decimal point | `double motorSpeed = 0.65;` — motor output, voltage, distance |
| `boolean` | exactly `true` or `false` | `boolean hasGamePiece = true;` — is a limit switch pressed? |
| `char` | a single character in **single** quotes | `char alliance = 'R';` |
| `String` | text in **double** quotes | `String robotName = "Penguin One";` |

Two rules to state loudly:
- `String` is capitalised; the other four are lowercase. That is not a typo, and the
  compiler will not forgive getting it backwards. (Why: `String` is a *class*, the others
  are *primitives* — one sentence, then move on. Full story in Unit J5.)
- `'R'` (single quotes) is a `char`. `"R"` (double quotes) is a `String`. Different types.

**Beat 4 — Declaring vs. assigning vs. reassigning.**
- **Declare:** `int gamePieces;` — the bin exists, it's empty.
- **Initialize:** `int gamePieces = 0;` — make the bin and put something in it. Do this
  almost always.
- **Reassign:** `gamePieces = 3;` — no type this time. You only name the type once, when
  the bin is created. Writing `int gamePieces = 3;` twice is an error: you can't build the
  same bin twice.

Analogy: you write the label on the bin **once**. After that you just change what's inside.

**Beat 5 — `=` is not "equals".**
This is the big one. `=` means **"put the thing on the right into the box on the left."**
Read it out loud as **"gets"**: `speed = 0.7;` is "speed *gets* 0.7."
That's why `count = count + 1;` makes sense — it's not a broken equation, it's "count
gets whatever count was, plus one."

**Beat 6 — Naming: camelCase, and say what it is.**
Rules the compiler enforces: start with a letter, no spaces, case-sensitive
(`speed` ≠ `Speed`), can't be a Java keyword like `class` or `int`.
Rules the *team* enforces: `camelCase` (first word lowercase, later words capitalised —
`leftMotorSpeed`), and the name says what it holds. `double x = 0.65;` is legal and
useless. `double intakeSpeed = 0.65;` is the same code that a teammate can read at 1 a.m.
at competition.

**Beat 7 — Printing a variable, with a label.**
`System.out.println(intakeSpeed);` prints just the number.
`System.out.println("Intake speed: " + intakeSpeed);` glues text and value together —
that `+` is **string concatenation**. When one side of `+` is text, Java turns the other
side into text and joins them. (Full treatment of `+` with numbers is the next lesson.)

**Beat 8 — `final`: the box you nail shut.**
`final double INTAKE_SPEED = 0.65;` — try to reassign it and the compiler stops you.
Convention: `SCREAMING_SNAKE_CASE` for finals. This is exactly the nine-out-of-ten fix:
one nailed-shut box, referenced everywhere. Foreshadow with `callout--note`: *"In Phase 2
this grows up into `Constants.java`, a whole file of `final` values — port numbers, speeds,
setpoints — so nobody ever hunts down ten copies of `0.65` again."*

---

## CODE

### Sample A — the five types, declared and printed (annotate)
`.code.with-lines`, file label `Main.java`:
```java
public class Main {
    public static void main(String[] args) {
        int teamNumber = 2551;
        double batteryVoltage = 12.6;
        boolean isEnabled = false;
        char allianceColor = 'B';
        String robotName = "Penguin One";

        System.out.println(teamNumber);
        System.out.println(batteryVoltage);
        System.out.println(isEnabled);
        System.out.println(allianceColor);
        System.out.println(robotName);
    }
}
```
**Verified output:**
```
2551
12.6
false
B
Penguin One
```
**Annotate:** line 3 "whole number — no decimal point allowed"; line 4 "decimal point
means `double`"; line 5 "only ever `true` or `false`, no quotes"; line 6 "**single**
quotes — exactly one character"; line 7 "**double** quotes, and capital `S` on `String`".

### Sample B — reassignment and the "gets" reading (annotate)
```java
public class Main {
    public static void main(String[] args) {
        int gamePieces = 0;
        System.out.println("Start of match: " + gamePieces);

        gamePieces = 1;
        System.out.println("Picked one up:  " + gamePieces);

        gamePieces = gamePieces + 1;
        System.out.println("Picked another: " + gamePieces);
    }
}
```
**Verified output:**
```
Start of match: 0
Picked one up:  1
Picked another: 2
```
**Annotate:** line 6 "no `int` this time — the box already exists"; line 9 "read it as
*gamePieces gets gamePieces plus one*. The right side is worked out first (0 + 1 → wait,
1 + 1 = 2), then stored back into the same box."

### Sample C — what the compiler rejects (do NOT put this in a sandbox as-is)
Show inside a `callout--pitfall`, clearly marked **"this does not compile"**:
```java
int gamePieces = 2.5;        // error: incompatible types: possible lossy conversion from double to int
double speed = "fast";       // error: incompatible types: String cannot be converted to double
final int MAX_ID = 5;
MAX_ID = 6;                  // error: cannot assign a value to final variable MAX_ID
int class = 3;               // error: not a statement / <identifier> expected
```
Each line gets the real compiler message next to it. The point: **the compiler names the
two types it couldn't reconcile.** That sentence is the bridge to `j-debugging`.

---

## SANDBOX

### Sandbox 1 — "Walk through it": change the contents, watch the output
`data-title="Live Java Sandbox"`
```java
public class Main {
    public static void main(String[] args) {
        String robotName = "Penguin One";
        int teamNumber = 2551;
        double batteryVoltage = 12.6;
        boolean isEnabled = false;

        System.out.println("Robot:   " + robotName);
        System.out.println("Team:    " + teamNumber);
        System.out.println("Battery: " + batteryVoltage);
        System.out.println("Enabled: " + isEnabled);

        // Try it: change isEnabled to true, then Run again.
        // Then change batteryVoltage to 11.4 and Run.
    }
}
```
**What the student changes:** flip `isEnabled` to `true`; change the voltage; rename the
robot. Then the instructive break: change line 5 to `double batteryVoltage = "12.6";`,
press Run, and read the error before undoing it.

### Sandbox 2 — "Build it": the nine-out-of-ten fix
`data-title="Project Sandbox"`
```java
public class Main {
    public static void main(String[] args) {
        // This code has 0.65 typed in three places. Fix it the way the team did:
        // 1. Make one variable  final double INTAKE_SPEED = 0.65;
        // 2. Replace all three 0.65s with INTAKE_SPEED
        // 3. Change the speed to 0.8 by editing ONE line, and Run.

        System.out.println("Teleop intake at " + 0.65);
        System.out.println("Auto intake at " + 0.65);
        System.out.println("Eject at -" + 0.65);
    }
}
```
**Target after the fix:** changing a single line makes all three printed numbers change
together.
**Reference (for the author's own check, not shown on the page):**
```java
public class Main {
    public static void main(String[] args) {
        final double INTAKE_SPEED = 0.8;
        System.out.println("Teleop intake at " + INTAKE_SPEED);
        System.out.println("Auto intake at " + INTAKE_SPEED);
        System.out.println("Eject at -" + INTAKE_SPEED);
    }
}
```
**Verified output:**
```
Teleop intake at 0.8
Auto intake at 0.8
Eject at -0.8
```

---

## CHALLENGES

### Challenge 1 — Predict the output  (`data-kind="text"`)
Prompt: "Trace it line by line. What single number is printed?"
```java
int a = 2;
int b = a;
a = 9;
System.out.println(b);
```
**Answer key:** `data-answer="2"` — **verified.**
- `data-win`: "Right. `b = a` copied the *value* 2 into b. Changing `a` afterwards doesn't reach back into `b`."
- `data-lose`: "It's 2. `int b = a;` copies what was in `a` at that moment — it does not link the two boxes together."

**Reveal explanation:** `int b = a;` reads the value currently inside `a` (which is 2) and
puts a copy of it into `b`. From that instant the two bins are unrelated. Setting `a = 9`
refills `a`'s bin only. `b` still holds its copy: **2**.

### Challenge 2 — Predict the output  (`data-kind="text"`)
Prompt: "What exactly gets printed? Watch the quotes."
```java
int pieces = 3;
System.out.println("pieces" + pieces);
```
**Answer key:** `data-answer="pieces3"` — **verified.**
- `data-win`: "Yes — `\"pieces\"` in quotes is literal text, `pieces` without quotes is the variable's value. Glued together with no space: `pieces3`."
- `data-lose`: "Careful with the quotes. `\"pieces\"` prints the word; `pieces` prints the value 3. The result is `pieces3` — one string, no space, because you didn't put a space inside the quotes."

### Challenge 3 — Fill in the blanks  (`data-kind="fib"`)
Prompt: "Declare the right type for each piece of robot data."
```
______ canId = 4;
______ armSetpoint = 0.42;
______ limitSwitchPressed = true;
______ subsystemName = "Intake";
```
Blanks: `data-answer="int"`, `data-answer="double"`, `data-answer="boolean"`,
`data-answer="String"`
- `data-win`: "All four correct — whole number, decimal, true/false, and text with a capital S."
- `data-lose`: "Check each one: whole number → `int`, decimal → `double`, true/false → `boolean`, text in double quotes → `String` (capital S)."

### Challenge 4 — Multiple choice  (`data-kind="mcq"`)
Prompt: "Which line does **not** compile?"

| Option | Correct | `data-explain` |
|---|---|---|
| `double speed = 1;` | | This is fine — Java happily widens the whole number 1 into the double 1.0. |
| `int ticks = 4.0;` | ✅ | Correct. A `double` won't fit in an `int` bin without losing the decimal, so Java refuses: *possible lossy conversion from double to int*. |
| `boolean ready = false;` | | Perfectly legal — `false` is exactly what a boolean holds. |
| `String name = "2551";` | | Legal. Digits inside double quotes are text, not a number — and that's allowed. |

### Challenge 5 — Multiple choice  (`data-kind="mcq"`)
Prompt: "Why did the team switch from typing `0.65` everywhere to a `final` variable?"

| Option | Correct | `data-explain` |
|---|---|---|
| It makes the robot faster | | Identical machine code. This is entirely about the humans reading it. |
| One place to change it, so you can't miss the tenth copy | ✅ | Exactly the nine-out-of-ten bug. One named value, one edit, no hunting. |
| `final` variables use less memory | | Memory isn't the issue; correctness and readability are. |
| Java requires it | | Java is fine with repeated literals. Your teammates at 1 a.m. are not. |

---

## MISCONCEPTIONS

1. **"`=` means equals."**
   → It means *gets*: the right-hand side is worked out, then stored in the box on the
   left — which is why `count = count + 1;` is normal, not nonsense.
2. **"`int b = a;` links `b` to `a`."**
   → It copies the value once; changing `a` afterwards never touches `b`.
3. **"`String` and `string` are both fine."**
   → Java is case-sensitive and only `String` (capital S) exists — `string` gets you
   *cannot find symbol*.
4. **"`'R'` and `\"R\"` are the same."**
   → Single quotes make a one-character `char`, double quotes make a `String`, and they
   are different types that don't swap freely.
5. **"You have to write the type every time you use the variable."**
   → You write the type once at declaration; after that, just the name.
6. **"A shorter name is a better name."**
   → `x` costs you nothing today and costs you twenty minutes at competition; name the
   box after what's in it.

---

## EXERCISE

### Mini-project: The Robot Status Board
Every robot prints a status block to the Driver Station on startup. Build one out of
variables — so that changing the robot means editing values at the top, not hunting
through print statements.

**Task:**
1. Declare five variables: `teamNumber` (int), `robotName` (String), `batteryVoltage`
   (double), `allianceColor` (char), `isEnabled` (boolean).
2. Print a header line `=== ROBOT STATUS ===`.
3. Print one labelled line per variable, using `+` to join the label and the value.
4. **Bonus:** add `final int MAX_MOTOR_ID = 12;` and print it as `Max CAN ID: 12`.

Starter code:
```java
public class Main {
    public static void main(String[] args) {
        // TODO: declare your five variables here
        int teamNumber = 2551;

        System.out.println("=== ROBOT STATUS ===");
        // TODO: print one labelled line per variable
    }
}
```

**Reference solution:**
```java
public class Main {
    public static void main(String[] args) {
        int teamNumber = 2551;
        String robotName = "Penguin One";
        double batteryVoltage = 12.6;
        char allianceColor = 'B';
        boolean isEnabled = false;
        final int MAX_MOTOR_ID = 12;

        System.out.println("=== ROBOT STATUS ===");
        System.out.println("Team:      " + teamNumber);
        System.out.println("Robot:     " + robotName);
        System.out.println("Battery:   " + batteryVoltage + " V");
        System.out.println("Alliance:  " + allianceColor);
        System.out.println("Enabled:   " + isEnabled);
        System.out.println("Max CAN ID: " + MAX_MOTOR_ID);
    }
}
```
**Verified output:**
```
=== ROBOT STATUS ===
Team:      2551
Robot:     Penguin One
Battery:   12.6 V
Alliance:  B
Enabled:   false
Max CAN ID: 12
```

---

## CHECKPOINT

**Q1.** What does `double intakeSpeed = 0.65;` do?
- *Creates a box named `intakeSpeed` that holds decimal numbers, and puts 0.65 in it* — ✅ `data-explain`: "Right — type, name, equals, value, semicolon. All four parts."
- *Checks whether `intakeSpeed` equals 0.65* — `data-explain`: "That's a comparison, which uses `==` and comes in Unit J2. A single `=` stores."
- *Prints 0.65* — `data-explain`: "Nothing prints unless you call `System.out.println`. Declaring is silent."

**Q2.** Which of these needs a `double`, not an `int`?
- *A CAN device ID* — `data-explain`: "Device IDs are whole numbers — `int` is right."
- *A motor output between -1.0 and 1.0* — ✅ `data-explain`: "Yes. `0.65` has a decimal point, so `int` would throw the fraction away and the motor would get 0."
- *The number of game pieces scored* — `data-explain`: "You never score 2.5 game pieces. `int`."

**Q3.** `String` vs `char` — which is correct for a single alliance letter written as `'R'`?
- *`String alliance = 'R';`* — `data-explain`: "Mismatch: single quotes make a `char`, and a `char` doesn't fit a `String` box. The compiler says *incompatible types*."
- *`char alliance = 'R';`* — ✅ `data-explain`: "Correct — single quotes, single character, `char`."
- *`char alliance = \"R\";`* — `data-explain`: "Backwards. Double quotes make a `String`, which won't fit in a `char`."

**Q4.** After these lines, what's in `speed`?
```java
double speed = 0.5;
speed = 0.9;
```
- *0.5* — `data-explain`: "The second line overwrote it. A bin only holds one thing at a time."
- *0.9* — ✅ `data-explain`: "Right. Reassigning replaces the contents; the old value is gone."
- *Both — it remembers the history* — `data-explain`: "Variables have no memory of past values. If you need the old one, store it in a second variable first."

**Q5.** Why write `final` on a value like an intake speed?
- *So the compiler stops anyone (including you) from changing it later* — ✅ `data-explain`: "Yes — it turns 'please don't edit this' into a rule the compiler enforces. This grows into `Constants.java` in Phase 2."
- *So it can only be used once* — `data-explain`: "You can read a `final` variable as many times as you like. You just can't reassign it."
- *So it runs faster* — `data-explain`: "Not the point. `final` is about protecting a value that many lines depend on."

---

## PHASE 2 FORESHADOWING
- `type name = value;` is explicitly called back in U4 when the student writes
  `SparkMax leftMotor = new SparkMax(2, MotorType.kBrushless);`
- `final` → `Constants.java` (U8). Say the word "Constants" here so it lands later.
- `double` in the range −1.0 … 1.0 is exactly the `motor.set(speed)` range. Say so.
