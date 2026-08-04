# j-strings · Working with Text (Strings)
unit: J1 · Getting Started   |   duration: 25 min   |   difficulty: Beginner

---

## INTRODUCES
`dot-notation` (calling a method **on** a value) · `string-immutability` ·
`zero-based-index` · `length()` · `charAt()` · `substring()` ·
`toUpperCase()` / `toLowerCase()` · `trim()` · `indexOf()` · `contains()` ·
`equals()` · `equalsIgnoreCase()` · `escape-sequence` (`\n`, `\t`, `\"`, `\\`) ·
`method-chaining` · `printf-formatting` (`%s`, `%d`, `%.2f`, `%n`) ·
`string-index-out-of-bounds` (named and shown, not yet handled)

## ASSUMES
`program`, `sequential-execution`, `syntax`, `compiler`, `bug` *(j-what-is-programming)* ·
`class`, `main-method`, `println`, `print-vs-println`, `statement`, `semicolon`,
`string-literal`, `case-sensitivity` *(j-first-program)* ·
`variable`, `int`, `double`, `boolean`, `char`, `String-type`, `string-concatenation`,
`final-variable` *(j-variables)* ·
`expression`, `arithmetic-operators`, `string-plus-evaluation-order`, `math-class`
*(j-operators)*

> **Author note:** `==` has **not** been taught yet — it arrives in `j-booleans`. In this
> lesson, comparing text is done with `.equals(...)`, full stop. Tease the `==` contrast in
> a `callout--note` ("there is a second comparison symbol, and for text it does something
> subtly different — `j-booleans` shows you exactly what") but **do not use `==` anywhere
> on this page**, not even in a wrong-example.

## GOAL
Take a piece of text apart, clean it up, compare it to another piece of text, and print a
console line a human can actually read.

## HOOK
**Section title: "Your only window is the console"**

Team story for `callout--why`, title **"Watch the console"**: during a match, the
programmer's job is **not** to coach the driver. It is to sit behind the Driver Station and
**watch the console** — the scrolling text window where everything the robot prints shows
up. When something goes wrong, that window is your entire view into a robot forty feet away
that you are not allowed to touch.

And the console can only ever show you **text you decided to print**.

Print `System.out.println(position);` and you get:

```
0.42
```

Which of the nine numbers on this robot is that? Is 0.42 good? The team already learned this
lesson on dashboards, where the naming rule became **`arm/position`, not `value1`.** Same
rule here. Text is not decoration on top of the real work — on game day, **text is your
instrumentation.**

---

## EXPLAIN

**Beat 1 — Text is a `String`, and a `String` can do things.**
You have been using `String` since `j-variables` as a box that holds text. Now the twist:
a `String` is not just a value, it is a value **that comes with a set of skills.** You ask
it to use one with a dot:

> `theString` `.` `skillName` `(` `maybe some information` `)`

```java
String subsystem = "IntakeSubsystem";
System.out.println(subsystem.length());   // 15
```

Analogy: **the pit crew.** You don't reach into someone's toolbox and rummage. You say
"Sam, torque wrench" and Sam does it. `subsystem.length()` is you asking the string *"how
long are you?"* and it answering.

Introduce the vocabulary honestly and then park it: asking a value to do something is
called **calling a method**. You have been doing it since lesson 2 —
`System.out.println(...)` is a method call. Unit J3 teaches you to *write* your own methods;
Unit J5 explains how a value comes to have skills at all. Right now you only need the shape:
**dot, name, parentheses.**

`callout--tip`, title **"Parentheses are not optional"**: `subsystem.length` is not a
mistake Java can guess its way out of — it will refuse to compile. Even when a method needs
no information, you still write the empty `()`. The parentheses are what say "do it."

**Beat 2 — Counting starts at zero.**
This is the single most important sentence in Unit J4, planted here:

> **The first character of a String is at position `0`.**

`"Penguin"` has 7 characters, at positions 0, 1, 2, 3, 4, 5, 6. There is no position 7.
So `charAt(0)` gives `'P'`, and the **last** character is at `length() - 1`.

Diagram (`.diagram`): the word `Penguin` in seven boxes with `0 1 2 3 4 5 6` underneath and
`length() = 7` bracketed across the top. Label the arrow at the far right: *"position 7 does
not exist."*

Say why it matters now: `charAt(7)` on a 7-character string doesn't print an empty line, it
**crashes the program**. You will meet that crash on purpose in `j-debugging`.

**Beat 3 — The measuring and reading methods.**

| Call on `"IntakeSubsystem"` | Result | What it's for |
|---|---|---|
| `.length()` | `15` | how many characters |
| `.charAt(0)` | `'I'` | the character at one position |
| `.substring(0, 6)` | `"Intake"` | a slice: from 0, **up to but not including** 6 |
| `.substring(6)` | `"Subsystem"` | a slice from 6 to the end |
| `.indexOf("Sub")` | `6` | where it starts, counting from 0 |
| `.contains("take")` | `true` | is it in there at all — a `boolean` |

Land the `substring` rule explicitly, because everyone gets it wrong once: **the first
number is included, the second is not.** `substring(0, 6)` gives you exactly 6 characters:
positions 0, 1, 2, 3, 4, 5.

**Beat 4 — The cleaning methods.**

| Call | Result |
|---|---|
| `"  Intake  ".trim()` | `"Intake"` — strips spaces off both ends |
| `"Intake".toUpperCase()` | `"INTAKE"` |
| `"Intake".toLowerCase()` | `"intake"` |

`trim()` matters more than it looks: text that comes from a file, a dashboard field, or a
person's typing very often has invisible spaces on the end, and those spaces make two
labels that *look* identical fail to match.

**Beat 5 — Strings never change. They make new ones.**
This is the beat that catches everyone.

```java
String name = "Intake";
name.toUpperCase();       // asks for an uppercase version...
System.out.println(name); // ...and prints "Intake"
```

Nothing happened. `toUpperCase()` did not *modify* `name` — Strings in Java are
**immutable**, meaning a String's contents can never be edited after it is created. What
`toUpperCase()` does is **hand you back a brand-new String** and leave the original alone.
If you don't catch the new one, it evaporates.

```java
String shouted = name.toUpperCase();   // catch it
```

Analogy: **the laminator in the pit.** You feed in a sheet and you get a laminated sheet
back. The original sheet is not laminated — it's still sitting there. If you walk away
without picking up the new one, you have nothing.

`callout--pitfall`, title **"The line that does nothing"**: any line that is just
`something.someTextMethod();` on its own, with no `=` in front of it, almost certainly does
nothing at all. Text methods **return** a result. You have to store it or print it.

**Beat 6 — Chaining: the result has skills too.**
Because `trim()` hands back a String, and a String has skills, you can keep going on the
same line:

```java
String clean = subsystem.trim().toUpperCase();
```

Read it strictly left to right: take `subsystem`, trim it, and whatever that gives you,
uppercase *that*. Each dot operates on whatever the thing to its left produced. This is
**method chaining**, and you'll see it constantly in Phase 2.

**Beat 7 — Comparing text: use `.equals(...)`.**
Two pieces of text are the same when they contain the same characters in the same order,
including case:

```java
String a = "Intake";
String b = "intake";
a.equals(b);              // false  -- capital I vs lowercase i
a.equalsIgnoreCase(b);    // true
a.equals("Intake");       // true
```

`.equals(...)` gives back a `boolean` — `true` or `false`, the type from `j-variables`.

`callout--note`, title **"There's a second way, and it's a trap"**: *"Java also has a `==`
symbol for comparing things. For numbers it does what you'd expect. For text it does
something subtly different that catches people out for years. `j-booleans`, two lessons from
now, takes it apart properly. Until then the rule is simple and safe: **compare text with
`.equals(...)`.**"*

**Beat 8 — Escape sequences: putting the impossible inside quotes.**
A `"` ends a String — so how do you print one? You **escape** it with a backslash.

| You type | You get |
|---|---|
| `\n` | a new line, mid-string |
| `\t` | a tab — lines up columns |
| `\"` | a literal double quote |
| `\\` | a literal backslash |

`"She said \"CAN ID 16 timed out\""` prints `She said "CAN ID 16 timed out"`.
`"Arm\tPosition\tVelocity"` prints three columns that actually line up — which is how you
make a console readable.

**Beat 9 — `printf`: numbers that don't embarrass you.**
Remember the battery percentage from `j-operators`?

```
Battery: 90.47619047619048%
```

That is what a `double` really holds, and nobody wants it on a console at 90 seconds into a
match. `System.out.printf(...)` prints a **template** with slots:

```java
System.out.printf("Battery: %.1f%%%n", percent);   // Battery: 90.5%
```

| Slot | Means |
|---|---|
| `%s` | drop a String (or anything) in here |
| `%d` | drop a whole number in here |
| `%.2f` | drop a decimal here, rounded to 2 places |
| `%%` | a literal percent sign |
| `%n` | end the line |

You do not need to memorise this table. You need to know **that it exists**, so that when a
console line looks awful you know there is a fix.

---

## CODE

### Sample A — the reading methods (annotate)
`.code.with-lines`, file label `Main.java`:
```java
public class Main {
    public static void main(String[] args) {
        String subsystem = "IntakeSubsystem";

        System.out.println(subsystem.length());
        System.out.println(subsystem.charAt(0));
        System.out.println(subsystem.substring(0, 6));
        System.out.println(subsystem.toUpperCase());
        System.out.println(subsystem.toLowerCase());
        System.out.println(subsystem.indexOf("Sub"));
        System.out.println(subsystem.contains("take"));
    }
}
```
**Verified output:**
```
15
I
Intake
INTAKESUBSYSTEM
intakesubsystem
6
true
```
**Annotate:** line 5 "15 characters, so valid positions are 0 to 14"; line 6 "position 0 is
the **first** character"; line 7 "0 up to *but not including* 6 — six characters"; line 10
"`Sub` starts at position 6, which is why `substring(0, 6)` stopped exactly where it did";
line 11 "this one gives back a `boolean`, not text".

### Sample B — cleaning and comparing (annotate)
```java
public class Main {
    public static void main(String[] args) {
        String typed = "  Intake  ";
        System.out.println("[" + typed + "]");
        System.out.println("[" + typed.trim() + "]");

        String a = "Intake";
        String b = "intake";
        System.out.println(a.equals(b));
        System.out.println(a.equalsIgnoreCase(b));
        System.out.println(a.equals("Intake"));
    }
}
```
**Verified output:**
```
[  Intake  ]
[Intake]
false
true
true
```
**Annotate:** lines 4–5 "the square brackets are only there so you can *see* the spaces —
this is a real debugging trick"; line 9 "`false`, and the only difference is one capital
letter"; line 10 "`equalsIgnoreCase` is the same question with case switched off".

### Sample C — the line that does nothing (annotate)
```java
public class Main {
    public static void main(String[] args) {
        String name = "Intake";
        name.toUpperCase();
        System.out.println(name);

        String shouted = name.toUpperCase();
        System.out.println(shouted);
        System.out.println(name);
    }
}
```
**Verified output:**
```
Intake
INTAKE
Intake
```
**Annotate:** line 4 "**this line does nothing.** It builds an uppercase String and drops
it on the floor"; line 7 "same call, but the result is caught in a variable"; line 9 "the
original is still `Intake` — it was never modified, and never could be".

### Sample D — escapes (annotate)
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Line one\nLine two");
        System.out.println("Arm\tPosition\tVelocity");
        System.out.println("She said \"CAN ID 16 timed out\"");
        System.out.println("Backslash: \\");
    }
}
```
**Verified output:**
```
Line one
Line two
Arm	Position	Velocity
She said "CAN ID 16 timed out"
Backslash: \
```
**Annotate:** line 3 "one `println`, two lines of output"; line 5 "without the backslashes
the String would end at the second quote and the compiler would be very confused".

### Sample E — printf (annotate)
```java
public class Main {
    public static void main(String[] args) {
        double percent = 11.4 / 12.6 * 100;
        System.out.println("Battery: " + percent + "%");
        System.out.printf("Battery: %.1f%%%n", percent);
        System.out.printf("%s at %.2f (CAN %d)%n", "Intake", 0.7, 2);
    }
}
```
**Verified output:**
```
Battery: 90.47619047619048%
Battery: 90.5%
Intake at 0.70 (CAN 2)
```
**Annotate:** line 4 "honest, and unreadable"; line 5 "`%.1f` rounds to one decimal place,
`%%` prints a real percent sign, `%n` ends the line"; line 6 "the values fill the slots
left to right, in order".

---

## SANDBOX

### Sandbox 1 — "Walk through it": the string ruler
`data-title="Live Java Sandbox"`
```java
public class Main {
    public static void main(String[] args) {
        String s = "Penguin";

        System.out.println(s.length());
        System.out.println(s.charAt(0));
        System.out.println(s.charAt(s.length() - 1));
        System.out.println(s.substring(0, 3));
        System.out.println(s.substring(3));

        // Try it: change charAt(0) to charAt(1), then charAt(6), then charAt(7).
        // The last one CRASHES. Read the message before you undo it.
    }
}
```
**Verified output as shipped:**
```
7
P
n
Pen
guin
```
**Verified output when `charAt(0)` is changed to `charAt(7)`** (first two lines print, then
the program stops):
```
7
Exception in thread "main" java.lang.StringIndexOutOfBoundsException: Index 7 out of bounds for length 7
```
followed by several `at ...` lines ending in `at Main.main(Main.java:6)`.
**What the student changes:** walk `charAt` from 0 to 7 and watch it die at exactly 7.
Instruction to include verbatim: *"Nothing is broken and you did nothing stupid. The string
has 7 characters at positions 0 to 6, and you asked for a position that does not exist. The
next lesson is about reading exactly this message."*

### Sandbox 2 — "Build it": the console line
`data-title="Project Sandbox"`
```java
public class Main {
    public static void main(String[] args) {
        // A status line for the Driver Station console.
        // The subsystem name arrived with stray spaces and the wrong case.
        //
        // 1. Make 'clean' hold "ARM"  -- use .trim() and .toUpperCase(), chained.
        // 2. Print   ARM (CAN 3)
        // 3. Print the position rounded to 2 decimal places with printf.
        // 4. Print whether 'clean' matches "arm" ignoring case.

        String subsystem = "  arm  ";
        int canId = 3;
        double position = 8.9732;

        String clean = subsystem;   // TODO: trim and uppercase

        System.out.println("=== CONSOLE ===");
        // TODO: the four lines above
    }
}
```
**Reference (author check, not shown on the page):**
```java
public class Main {
    public static void main(String[] args) {
        String subsystem = "  arm  ";
        int canId = 3;
        double position = 8.9732;
        boolean atSetpoint = true;

        String clean = subsystem.trim().toUpperCase();

        System.out.println("=== CONSOLE ===");
        System.out.println(clean + " (CAN " + canId + ")");
        System.out.printf("  position   %.2f%n", position);
        System.out.println("  atSetpoint " + atSetpoint);
        System.out.println("  label len  " + clean.length());
        System.out.println("  first char " + clean.charAt(0));
        System.out.println("  is arm?    " + clean.equalsIgnoreCase("arm"));
    }
}
```
**Verified output:**
```
=== CONSOLE ===
ARM (CAN 3)
  position   8.97
  atSetpoint true
  label len  3
  first char A
  is arm?    true
```

---

## CHALLENGES

### Challenge 1 — Predict the output  (`data-kind="text"`)
Prompt: "Careful with the second number. Type the exact text printed."
```java
String s = "Penguin";
System.out.println(s.substring(0, 3));
```
**Answer key:** `data-answer="Pen"` — **verified.**
- `data-win`: "Right. Start at 0, stop *before* 3 — that's positions 0, 1 and 2: `Pen`."
- `data-lose`: "It's `Pen`. The second number is where to stop, and it is **not** included. You get positions 0, 1, 2 — three characters."

**Reveal explanation:** `substring(start, end)` takes everything from `start` up to but not
including `end`. A handy consequence: the number of characters you get is always
`end - start`. Here that's `3 - 0 = 3`.

### Challenge 2 — Predict the output  (`data-kind="text"`)
Prompt: "Read line 2 very carefully. What is printed?"
```java
String name = "Intake";
name.toUpperCase();
System.out.println(name);
```
**Answer key:** `data-answer="Intake"` — **verified.**
- `data-win`: "Exactly. Line 2 built an uppercase copy and threw it away. Strings can't be modified — only replaced."
- `data-lose`: "It prints `Intake`. `toUpperCase()` doesn't change `name`; it *returns* a new String. With no `=` to catch it, that new String is discarded."

### Challenge 3 — Predict the output  (`data-kind="text"`)
Prompt: "What single word does this print?"
```java
String s = "  Intake  ";
System.out.println(s.trim().toLowerCase());
```
**Answer key:** `data-answer="intake"` — **verified.**
- `data-win`: "Yes — trimmed first, then lowercased. Each dot works on whatever the call before it produced."
- `data-lose`: "It's `intake`, with no spaces and no capital. Read chains strictly left to right: trim the spaces off, then lowercase the result."

### Challenge 4 — Fill in the blanks  (`data-kind="fib"`)
Prompt: "Complete each line so it does what the comment says."
```
String label = "  Arm  ";
System.out.println(label.______());          // prints Arm with no spaces
System.out.println(label.trim().______());   // prints ARM
System.out.println(label.trim().______("Arm"));  // prints true
```
Blanks: `data-answer="trim"`, `data-answer="toUpperCase"`, `data-answer="equals"`
- `data-win`: "All three. Clean it, shout it, compare it — that's most of what you ever do to text."
- `data-lose`: "Strip the spaces with `trim`, raise the case with `toUpperCase`, and compare text with `equals`."

### Challenge 5 — Multiple choice  (`data-kind="mcq"`)
Prompt: "`String s = \"Penguin\";` — which call gives you the **last** character?"

| Option | Correct | `data-explain` |
|---|---|---|
| `s.charAt(s.length())` | | `length()` is 7, and position 7 doesn't exist — this crashes with `StringIndexOutOfBoundsException`. |
| `s.charAt(s.length() - 1)` | ✅ | Correct, and this is the pattern you'll use forever. 7 characters live at positions 0–6, so the last one is at `length() - 1`. |
| `s.charAt(-1)` | | Java has no wrap-around indexing; a negative position is out of bounds and crashes. |
| `s.last()` | | There is no `last()` method on String. The compiler will say *cannot find symbol*. |

### Challenge 6 — Multiple choice  (`data-kind="mcq"`)
Prompt: "Two labels look identical on screen but a comparison keeps coming out `false`. What is the most likely reason?"

| Option | Correct | `data-explain` |
|---|---|---|
| Java is unreliable with text | | The same comparison gives the same answer every time. Something really is different about the two strings. |
| One of them has invisible whitespace or different capitalisation | ✅ | Yes — the two classic causes. `trim()` handles the spaces; `equalsIgnoreCase(...)` handles the case. Printing them inside `[` `]` makes stray spaces visible. |
| `.equals()` only works on short strings | | Length has nothing to do with it. |
| You need to convert them to numbers first | | Text comparison works fine on text; converting would only lose information. |

---

## MISCONCEPTIONS

1. **"`toUpperCase()` changes the string."**
   → Strings are immutable. Every text method hands back a **new** string; the original is
   untouched, so you must store what you get.
2. **"The first character is at position 1."**
   → It is at `0`, and the last is at `length() - 1`. This is true for arrays too, which
   is why it's worth burning in now.
3. **"`substring(0, 6)` gives me 7 characters."**
   → The end index is excluded, so you get exactly `6 - 0 = 6` characters.
4. **"`length` and `length()` are the same."**
   → For a String it's the method `length()`, with parentheses. (Arrays use `length` with
   no parentheses — a genuinely annoying inconsistency you'll meet in J4.)
5. **"Two strings that look the same must match."**
   → A trailing space or one capital letter is enough to make `.equals(...)` say `false`.
   Print them inside brackets to see what's really there.
6. **"I should memorise every String method."**
   → Know that `length`, `charAt`, `substring`, `trim`, `contains`, `indexOf` and `equals`
   exist. Look up the rest when you need them, forever.

---

## EXERCISE

### Mini-project: The Match Console Header
At the start of a match the robot should print a header block that a person can read at a
glance while looking away from the screen. Build it.

**Task:**
1. Start from these variables:
   `String subsystem = "  arm  ";`, `int canId = 3;`, `double position = 8.9732;`,
   `boolean atSetpoint = true;`
2. Make a `String clean` that holds `ARM` — chained `trim()` then `toUpperCase()`.
3. Print `=== CONSOLE ===`, then `ARM (CAN 3)`.
4. Print the position with `printf` to **two** decimal places, and the `atSetpoint` flag.
5. **Bonus:** print the label's length, its first character, and whether it
   `equalsIgnoreCase("arm")`.

Starter code: as Sandbox 2 above.

**Reference solution:** as Sandbox 2's reference.
**Verified output:**
```
=== CONSOLE ===
ARM (CAN 3)
  position   8.97
  atSetpoint true
  label len  3
  first char A
  is arm?    true
```
Closing note for the reveal: *"Compare this to `0.42` on its own. Same information, but one
of them you can read from four feet away while the match is running. That is the entire
point."*

---

## CHECKPOINT

**Q1.** `"Penguin".length()` gives 7. What is the position of the last character?
- *7* — `data-explain`: "Position 7 does not exist — asking for it crashes the program with `StringIndexOutOfBoundsException`."
- *6* — ✅ `data-explain`: "Right. Positions run 0 to `length() - 1`, so 0 through 6."
- *It depends on the string* — `data-explain`: "The rule never changes: the last position is always `length() - 1`."

**Q2.** After `String s = "Arm"; s.toLowerCase();` — what does `s` hold?
- *`"arm"`* — `data-explain`: "That's the value the method *returned*, but nothing caught it. `s` was never modified — Strings can't be."
- *`"Arm"`* — ✅ `data-explain`: "Correct. The lowercase version was created and immediately discarded because there was no `=` to store it."
- *Nothing — `s` is now empty* — `data-explain`: "Calling a method never empties a variable. `s` still holds exactly what it always held."

**Q3.** Which is the right way to ask whether two pieces of text are the same?
- *`a.equals(b)`* — ✅ `data-explain`: "Yes — that's the safe, correct answer for text, today and forever."
- *`a.same(b)`* — `data-explain`: "There's no `same` method; the compiler will say *cannot find symbol*."
- *`a.contains(b)`* — `data-explain`: "`contains` asks whether `b` appears *somewhere inside* `a` — a different question. `\"Intake\".contains(\"take\")` is true, but they're not the same string."

**Q4.** What does `System.out.println("A\tB");` print?
- *`A\tB`* — `data-explain`: "The backslash isn't printed — it's an instruction to the compiler about the character that follows."
- *`A` and `B` separated by a tab* — ✅ `data-explain`: "Correct. `\\t` is one tab character, which is how you line up console columns."
- *Two separate lines* — `data-explain`: "That's `\\n`. `\\t` moves across, `\\n` moves down."

**Q5.** Why prefer `System.out.printf("%.2f%n", value)` over `System.out.println(value)` for a decimal?
- *It's faster* — `data-explain`: "Speed is irrelevant here — this is about the human reading the console."
- *It controls how many decimal places appear* — ✅ `data-explain`: "Right. A raw `double` can print as `90.47619047619048`, which nobody can read during a match. `%.2f` gives you `90.48`."
- *It's the only way to print a decimal* — `data-explain`: "`println` prints decimals perfectly well — just with every digit the machine is holding."

---

## PHASE 2 FORESHADOWING
- **Zero-based indexing** planted here is the load-bearing idea for `j-arrays`,
  `j-2d-arrays`, and the whole Kitchen grid.
- `System.out.println` lands in the **Driver Station console** (U2) — every string skill on
  this page becomes match-day telemetry.
- Telemetry naming (`arm/position`, not `value1`) in U2's dashboards lesson is the same
  discipline, applied to a dashboard key instead of a console line.
- `StringIndexOutOfBoundsException` shown here is deliberately un-handled; `j-debugging`
  reads it and `j-exceptions-null` catches it.
