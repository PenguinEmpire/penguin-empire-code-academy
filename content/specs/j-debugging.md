# j-debugging · Reading Errors & Debugging
unit: J1 · Getting Started   |   duration: 25 min   |   difficulty: Beginner

---

## INTRODUCES
`compiler-error` · `runtime-error` · `exception` · `logic-error` ·
`error-message-anatomy` (file : line : `error:` : message : caret) ·
`missing-semicolon-error` · `cannot-find-symbol` · `reached-end-of-file` ·
`stack-trace` · `exception-type` · `exception-message` · `at-frame` ·
`fix-the-first-error-first` · `print-debugging` · `labelled-debug-print` ·
`halving-the-search` (isolate, don't stare) · `red-vs-yellow-squiggle`

## ASSUMES
`program`, `syntax`, `compiler`, `bug`, `literal-machine` *(j-what-is-programming)* ·
`class`, `main-method`, `println`, `statement`, `semicolon`, `case-sensitivity`
*(j-first-program)* ·
`variable`, `declaration`, `int`, `double`, `String-type`, `type-mismatch-error`,
`string-concatenation` *(j-variables)* ·
`integer-division`, `explicit-cast`, `expression` *(j-operators)* ·
`dot-notation`, `zero-based-index`, `charAt`, `length()` *(j-strings)*

> **Author note:** the student does not know `if`, loops, methods or `try`/`catch` yet.
> Every example on this page is straight-line code. This lesson is about **reading** errors,
> not catching them — `j-exceptions-null` (Unit J4) does the catching. Say that out loud
> once so nobody feels they're missing something.

## GOAL
Look at a red wall of text, say what kind of problem it is, name the line it happened on,
and find a wrong answer that produced no error at all.

## HOOK
**Section title: "Code, wiring, or build?"**

Team story for `callout--why`, title **"Stop arguing. Isolate."**: when a mechanism doesn't
move, three sub-teams each have an opinion. Software says it's wiring. Electrical says it's
code. Build says it's definitely not build. That argument can burn an entire meeting.

The team's answer is a procedure, not an opinion: open the vendor's hardware client and
**apply a test voltage directly to the motor**, with no robot code involved at all.

- Motor spins → the wiring is fine and the hardware is fine. It's code.
- Motor doesn't spin → it was never going to be code.

One action, and half the possibilities are gone. That is what debugging actually is.
Not staring harder at the screen. **Cutting the search space in half, then in half again,
until only one thing is left.**

The same team once spent **two full days** hunting a bug that turned out to be a single
number set too high. Two days is what it costs when you search by staring instead of by
halving.

This lesson gives you the three tools for doing that in code.

---

## EXPLAIN

**Beat 1 — There are exactly three kinds of wrong, and they are not equally expensive.**

Present as a `.diagram` / three-column table. This taxonomy is the spine of the lesson —
every later section refers back to it.

| Kind | When you find out | How helpful is it | Rough cost |
|---|---|---|---|
| **Compiler error** | before it ever runs | tells you the file, the line, and usually the exact character | minutes |
| **Runtime error** (an *exception*) | while it's running, and it stops | tells you the type, a message, and the line it died on | minutes to hours |
| **Logic error** | never, unless you notice | tells you **nothing at all** | the two days |

Land the counter-intuitive point hard: **a compiler error is the best news you can get.**
It is the computer refusing to let you make a mistake, for free, before anything moves. The
error you should be afraid of is the one that produces no error.

`callout--tip`: red squiggle = an **error**, the code will not build. Yellow squiggle = a
**warning**, usually something declared and never used — annoying, not a blocker. Learn to
tell them apart at a glance; you'll see both constantly in Phase 2.

**Beat 2 — A compiler error has four parts. Learn them once.**

```
Main.java:3: error: ';' expected
        int canId = 2
                     ^
1 error
```

| Part | Here | Means |
|---|---|---|
| **file** | `Main.java` | which file |
| **line** | `:3` | which line — start here |
| **`error:`** | | this is fatal, not a warning |
| **message** | `';' expected` | what the compiler wanted and didn't get |
| **caret `^`** | under the end of line 3 | the exact character it gave up at |

Then the sentence that saves the most time on this page: **the caret points at where the
compiler noticed, which is often just past where you went wrong.** A missing semicolon on
line 3 is frequently reported at line 4, because the compiler kept reading, hoping. **When
the reported line looks fine, check the line above it.**

**Beat 3 — The four compiler errors you will actually see this year.**

Present each as a `.code` block with the real message next to it. Every one of these is
verified output from a real compiler.

*(a) `';' expected` — the missing semicolon*
```java
int canId = 2
System.out.println(canId);
```
```
Main.java:3: error: ';' expected
        int canId = 2
                     ^
```
Fix: add the `;`. Note the caret sits at the end of the *previous* line's content.

*(b) `cannot find symbol` — a name Java has never heard of*
```java
int canId = 2;
System.out.println(canID);
```
```
Main.java:4: error: cannot find symbol
        System.out.println(canID);
                           ^
  symbol:   variable canID
  location: class Main
```
This is the **typo error**, and Java tells you exactly which name it couldn't find:
`symbol: variable canID`. `canId` and `canID` are different names — Java is case-sensitive.
This same message appears when you misspell a method (`printline`), forget to declare a
variable at all, or write `string` instead of `String`.

*(c) `incompatible types` — the wrong shape of thing*
```java
int ticks = 4.0;
```
```
Main.java:3: error: incompatible types: possible lossy conversion from double to int
        int ticks = 4.0;
                    ^
```
The message names **both** types and which direction the problem runs. You met this in
`j-variables`; now you can read it fluently. "Lossy" means something would have to be
thrown away, and Java refuses to do that behind your back.

*(d) `reached end of file while parsing` — a missing `}`*
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Booting");
    }
```
```
Main.java:4: error: reached end of file while parsing
    }
     ^
```
This one is a liar about location — it always points at the **last** line, because that's
where the compiler finally ran out of file still waiting for a closing brace. Fix: count
your braces. Every `{` needs a `}`.

**Beat 4 — Fix the first error, then recompile. Always.**
One missing semicolon can produce fifteen errors, because everything after it confused the
parser. Students delete code in a panic. Don't.

> **Rule: fix the topmost error, recompile, and look again.** Very often fourteen of the
> fifteen were never real.

**Beat 5 — Runtime errors: it compiled, then it died.**
An **exception** is the program hitting something impossible *while running* and stopping
rather than continuing with nonsense. Java prints a **stack trace**:

```
Reading sensors...
Exception in thread "main" java.lang.ArithmeticException: / by zero
	at Main.main(Main.java:6)
```

Read it in three moves:
1. **What type?** `ArithmeticException` — a maths problem.
2. **What message?** `/ by zero` — you divided by zero.
3. **Where?** `at Main.main(Main.java:6)` — file `Main.java`, **line 6**.

Note the first line of output: `Reading sensors...` **did** print. Everything before the
crash ran normally. The crash line tells you how far it got. That's information.

`callout--note`, title **"Read the bottom of the trace, not the top"**: a real stack trace
can be a dozen `at ...` lines deep, most of them inside Java's own code with names like
`java.base/java.lang.String.charAt`. **The line you care about is the one with your file
name in it** — `Main.java`. `j-scope` in Unit J3 explains why the list exists at all and
how to read the whole thing.

**Beat 6 — The three exceptions you'll hit first.**

| You wrote | You get |
|---|---|
| `100 / 0` with two `int`s | `ArithmeticException: / by zero` |
| `"Penguin".charAt(7)` | `StringIndexOutOfBoundsException: Index 7 out of bounds for length 7` |
| `.length()` on a String that is `null` | `NullPointerException: Cannot invoke "String.length()" because ... is null` |

Say it plainly: **the exception type is a category and the message is the specifics.** You
will get very fast at this — after ten of them you'll read `Index 7 out of bounds for
length 7` and know the answer before you've found the line.

(`null` gets its own full lesson in J4. For now: it means "this box is empty — there is no
thing here to ask.")

**Beat 7 — Logic errors: no red, no crash, wrong answer.**
Here is a program that compiles cleanly, runs cleanly, and lies to you:

```java
int encoderTicks = 90;
int ticksPerRotation = 20;
double rotations = encoderTicks / ticksPerRotation;
double degrees = rotations * 360;
System.out.println("Arm is at " + degrees + " degrees");
```

It prints `Arm is at 1440.0 degrees`. The right answer is **1620.0**. 90 ÷ 20 is 4.5
rotations, and 4.5 × 360 is 1620. The program said 1440 because `90 / 20` is **integer
division** — the `.5` was thrown away — exactly the silent zero from `j-operators`, wearing
a different hat.

Nothing on your screen is red. On a real robot, this arm stops 180° short and everyone
blames the encoder.

**Beat 8 — Print debugging: make the invisible visible.**
You cannot see inside a running program. So you make it talk. Put a `println` after every
step that produces a value, and **label every one**:

```java
System.out.println("DEBUG rotations       = " + rotations);
```

Three rules for debug prints:
1. **Label them.** A bare `4.0` in the console is worthless. `DEBUG rotations = 4.0` is an
   answer.
2. **Print the inputs too**, not just the output. Half the time the bug is that an input
   isn't what you assumed.
3. **Print early, print often, delete afterwards.** Debug prints are scaffolding.

Now run it and read down the column:
```
DEBUG encoderTicks    = 90     <- correct
DEBUG ticksPerRotation= 20     <- correct
DEBUG rotations       = 4.0    <- WRONG. should be 4.5
DEBUG degrees         = 1440.0
```
Two correct inputs and a wrong output means the bug is **on the line between them**. You
didn't find it by being clever; you found it by halving the search — the same move as
applying a test voltage.

**Beat 9 — The debugging procedure, as a checklist.**
Give this as a numbered `.vocab`-style block the student can come back to all season:

1. **Read the message.** Out loud if necessary. Most of them say exactly what is wrong.
2. **Go to the line it names.** If that line looks perfect, check the line above.
3. **Fix one thing. Re-run.** Never change three things at once — then you can't tell which
   one helped. (This becomes a formal rule in Phase 2's PID tuning: *one variable at a
   time.*)
4. **If there's no message, make one.** Add labelled prints and find the first value that
   isn't what you expected.
5. **Halve the search.** Known-good above, known-bad below: the bug is between them.
6. **Say it to a person.** Describing the bug out loud finds an astonishing number of bugs
   before the other person has spoken.

`callout--tip`, title **"Errors are not judgement"**: everybody on this team gets errors
every single meeting. The difference between a new programmer and an experienced one is not
how many errors they cause — it is how many **seconds** it takes them to read one.

---

## CODE

### Sample A — anatomy of a compiler error (annotate)
Show inside `callout--pitfall`, clearly marked **"this does not compile"**:
```java
public class Main {
    public static void main(String[] args) {
        int canId = 2
        System.out.println(canId);
    }
}
```
**Verified compiler output:**
```
Main.java:3: error: ';' expected
        int canId = 2
                     ^
1 error
```
**Annotate:** "`Main.java:3` — the file and line"; "`error:` — fatal, not a warning";
"`';' expected` — what it wanted"; "the `^` is under the last character it read before
giving up".

### Sample B — `cannot find symbol` (annotate)
```java
public class Main {
    public static void main(String[] args) {
        int canId = 2;
        System.out.println(canID);
    }
}
```
**Verified compiler output:**
```
Main.java:4: error: cannot find symbol
        System.out.println(canID);
                           ^
  symbol:   variable canID
  location: class Main
1 error
```
**Annotate:** "`symbol: variable canID` — the compiler is telling you the exact name it
looked for and could not find"; "`canId` was declared; `canID` was used. One capital letter."

### Sample C — a stack trace (annotate)
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Reading sensors...");
        int totalTicks = 100;
        int motors = 0;
        int ticksPerMotor = totalTicks / motors;
        System.out.println("Ticks per motor: " + ticksPerMotor);
    }
}
```
**Verified output:**
```
Reading sensors...
Exception in thread "main" java.lang.ArithmeticException: / by zero
	at Main.main(Main.java:6)
```
**Annotate:** line 3's output "this printed — the program was fine until line 6";
"`ArithmeticException` = the type"; "`/ by zero` = the message"; "`Main.java:6` = the line";
"line 7 never ran — output stops at the crash".

### Sample D — the same crash from a String (annotate)
```java
public class Main {
    public static void main(String[] args) {
        String s = "Penguin";
        System.out.println(s.charAt(7));
    }
}
```
**Verified output** (abridged — the real trace has several `at java.base/...` lines in the
middle, which you skip):
```
Exception in thread "main" java.lang.StringIndexOutOfBoundsException: Index 7 out of bounds for length 7
	...
	at Main.main(Main.java:4)
```
**Annotate:** "the message does the whole job: index 7, length 7, and you already know
positions stop at 6"; "ignore every `at` line that isn't yours — find `Main.java`".

### Sample E — the error with no error message (annotate)
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("=== START ===");

        int encoderTicks = 90;
        int ticksPerRotation = 20;
        double rotations = encoderTicks / ticksPerRotation;
        double degrees = rotations * 360;

        System.out.println("Arm is at " + degrees + " degrees");
    }
}
```
**Verified output:**
```
=== START ===
Arm is at 1440.0 degrees
```
**Annotate:** "compiles, runs, no red anywhere"; "and it is wrong — 90 ÷ 20 is 4.5, so the
answer should be 1620.0"; line 7 "both sides are `int`, so the `.5` was silently discarded".

### Sample F — the same program, instrumented (annotate)
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("=== START ===");

        int encoderTicks = 90;
        int ticksPerRotation = 20;
        System.out.println("DEBUG encoderTicks    = " + encoderTicks);
        System.out.println("DEBUG ticksPerRotation= " + ticksPerRotation);

        double rotations = encoderTicks / ticksPerRotation;
        System.out.println("DEBUG rotations       = " + rotations);

        double degrees = rotations * 360;
        System.out.println("DEBUG degrees         = " + degrees);

        System.out.println("Arm is at " + degrees + " degrees");
    }
}
```
**Verified output:**
```
=== START ===
DEBUG encoderTicks    = 90
DEBUG ticksPerRotation= 20
DEBUG rotations       = 4.0
DEBUG degrees         = 1440.0
Arm is at 1440.0 degrees
```
**Annotate:** "the first three lines are what you expected"; "`rotations = 4.0` is the first
line that is **not** what you expected — the bug is on the line that produced it";
"everything after this point is downstream damage, not a second bug".

### Sample G — fixed
```java
double rotations = (double) encoderTicks / ticksPerRotation;
```
**Verified output of the fixed program:**
```
=== START ===
Arm is at 1620.0 degrees
```

---

## SANDBOX

### Sandbox 1 — "Walk through it": break it on purpose, four times
`data-title="Live Java Sandbox"`
```java
public class Main {
    public static void main(String[] args) {
        int canId = 2;
        String name = "Intake";
        System.out.println(name + " is on CAN " + canId);

        // Run it once -- it works. Now break it, ONE change at a time,
        // and read the message BEFORE you undo it:
        //  1. delete the ; at the end of line 3
        //  2. change canId on line 5 to canID
        //  3. change int on line 3 to String
        //  4. delete the very last }
    }
}
```
**Verified output as shipped:**
```
Intake is on CAN 2
```
**Verified messages for each break** (author reference — the page shows these in a
`details.reveal` so students can check themselves):
1. `Main.java:3: error: ';' expected`
2. `Main.java:5: error: cannot find symbol` … `symbol: variable canID`
3. `Main.java:3: error: incompatible types: int cannot be converted to String`
4. `Main.java:N: error: reached end of file while parsing`

**What the student changes:** exactly one thing at a time, then undo it. Instruction to
include verbatim: *"Undo before the next one. Two breaks at once and you can't tell which
message came from which — which is the same mistake as changing two PID gains at once."*

### Sandbox 2 — "Build it": find the lie
`data-title="Project Sandbox"`
```java
public class Main {
    public static void main(String[] args) {
        // This program says the arm is at 1440 degrees.
        // The correct answer is 1620. Nothing is red. Nothing crashes.
        //
        // 1. Add a labelled DEBUG println after EACH of the four values below.
        // 2. Run it. Read down the column and find the FIRST value that is wrong.
        // 3. Fix that one line. Do not touch any other line.

        int encoderTicks = 90;
        int ticksPerRotation = 20;
        double rotations = encoderTicks / ticksPerRotation;
        double degrees = rotations * 360;

        System.out.println("Arm is at " + degrees + " degrees");
    }
}
```
**Target:** the program prints `Arm is at 1620.0 degrees`, and the student can point at the
single line that was wrong and say why.
**Reference (author check, not shown on the page):** Sample F for the instrumented version,
Sample G for the one-line fix.
**Verified fixed output:**
```
=== START ===
Arm is at 1620.0 degrees
```
(Or without the `=== START ===` line if the student didn't add it — accept either.)

---

## CHALLENGES

### Challenge 1 — Fill in the blanks  (`data-kind="fib"`)
Prompt: "Read this error message and fill in what it is telling you."
```
Main.java:6: error: cannot find symbol
        System.out.println(speeed);
                           ^
  symbol:   variable speeed
```
```
The problem is on line ______, and the name Java could not find is ______.
```
Blanks: `data-answer="6"`, `data-answer="speeed"`
- `data-win`: "That's the whole skill. File, line, and the exact symbol it went looking for."
- `data-lose`: "The number after the file name is the line — 6. And `symbol: variable speeed` names exactly what it couldn't find. Three e's."

### Challenge 2 — Multiple choice  (`data-kind="mcq"`)
Prompt: "Which of these is the **most expensive** kind of bug?"

| Option | Correct | `data-explain` |
|---|---|---|
| A compiler error | | The cheapest kind. It's caught before anything runs, and it names the line. |
| A runtime exception | | Costly, but it hands you a type, a message and a line number. You have a starting point. |
| A logic error — it compiles, runs, and gives the wrong answer | ✅ | Right. No message, no line, no clue. This is the one that costs two days, because you have to notice it before you can even start looking. |
| A yellow warning squiggle | | Usually just an unused variable. Worth tidying, almost never the reason a mechanism doesn't move. |

### Challenge 3 — Predict the output  (`data-kind="text"`)
Prompt: "This program crashes. Which line number appears in the stack trace?"
```java
1  public class Main {
2      public static void main(String[] args) {
3          System.out.println("start");
4          int a = 10;
5          int b = 0;
6          System.out.println(a / b);
7      }
8  }
```
**Answer key:** `data-answer="6"` — **verified.** (The trace reads
`at Main.main(Main.java:6)`.)
- `data-win`: "Yes — line 6 is where the division actually happens. Lines 4 and 5 are innocent; they just set up the values."
- `data-lose`: "It's line 6. Setting `b = 0` on line 5 is perfectly legal — nothing goes wrong until something *divides* by it on line 6."

**Reveal explanation:** the trace reads
`Exception in thread "main" java.lang.ArithmeticException: / by zero` then
`at Main.main(Main.java:6)`. Also note `start` **does** print first: everything up to the
crash ran normally.

### Challenge 4 — Multiple choice  (`data-kind="mcq"`)
Prompt: "The compiler reports `';' expected` on line 12. Line 12 looks completely fine. What now?"

| Option | Correct | `data-explain` |
|---|---|---|
| Delete line 12 and retype it | | You'd be retyping a line that isn't wrong, and you'd still have the error. |
| Check line 11 | ✅ | Correct. The compiler reads until it's confused, so a missing semicolon at the end of line 11 is usually reported at line 12. When the named line is fine, look up. |
| Restart the compiler | | The message is deterministic — you'll get exactly the same one. |
| Add a semicolon to line 12 to be safe | | Now you have two problems. Guessing at fixes is how a one-line bug becomes a three-line bug. |

### Challenge 5 — Multiple choice  (`data-kind="mcq"`)
Prompt: "Your program produces the wrong number and no error. What is the **first** thing to do?"

| Option | Correct | `data-explain` |
|---|---|---|
| Rewrite it from scratch | | You'd very likely rewrite the same misunderstanding, and now you have no working reference to compare against. |
| Add labelled `println` lines after each value and find the first one that's wrong | ✅ | Yes. That's print debugging, and it turns an invisible problem into a visible one. The first surprising value tells you which line to look at. |
| Change several things and see if it fixes itself | | Then you can't tell which change helped, and you may have added a second bug. One change, one run. |
| Assume the computer made a mistake | | It didn't. It did exactly what the code said — that's the whole premise of lesson 1. |

### Challenge 6 — Fill in the blanks  (`data-kind="fib"`)
Prompt: "Complete the three-part reading of this stack trace."
```
Exception in thread "main" java.lang.StringIndexOutOfBoundsException: Index 7 out of bounds for length 7
	at Main.main(Main.java:4)
```
```
Type: ______Exception.   Line: ______.   The largest valid index was ______.
```
Blanks: `data-answer="StringIndexOutOfBounds"`, `data-answer="4"`, `data-answer="6"`
- `data-win`: "All three. Type, line, and the fact that a length of 7 means valid positions 0 through 6."
- `data-lose`: "The type is `StringIndexOutOfBoundsException`, the line is 4 (from `Main.java:4`), and since length is 7 the last valid index is `7 - 1 = 6`."

---

## MISCONCEPTIONS

1. **"An error means I'm bad at this."**
   → It means the compiler is doing its job. Everyone on the team sees these every meeting;
   the only variable is how fast you read them.
2. **"Fifteen errors means fifteen problems."**
   → Usually it means one problem and fourteen consequences. Fix the top one and recompile
   before you believe the rest.
3. **"The line number in the error is always where the mistake is."**
   → It's where the compiler *noticed*. For missing semicolons and braces, the mistake is
   usually earlier.
4. **"If it runs, it's right."**
   → `1440.0` ran perfectly. Running and being correct are unrelated properties.
5. **"I should read the whole stack trace."**
   → Read the first line (type + message) and the first `at` line containing **your** file.
   The rest is Java's own plumbing.
6. **"Print debugging is what you do when you don't know the real tools."**
   → It is a real tool, and on a robot forty feet away with no debugger attached, it is
   frequently the *only* tool. In Phase 2 those prints land in the Driver Station console.
7. **"I'll just change a few things and see."**
   → Change one thing, run, look. Otherwise you learn nothing from the result.

---

## EXERCISE

### Mini-project: The Broken Startup Report
Someone left a status report in the repo that doesn't build, and once it builds, it lies.
Get it working and get it *correct*.

**Task:**
1. **Make it compile.** There are three compiler errors. Fix the **first** one, re-run, and
   only then look at what's left. Write down each message you saw.
2. **Make it correct.** Once it runs, one printed number is wrong. Find it with labelled
   `DEBUG` prints — do not fix anything until you can point at the line.
3. Fix that one line.
4. **Bonus:** remove your DEBUG prints and leave the report clean.

Starter code (**does not compile — that's the point**):
```java
public class Main {
    public static void main(String[] args) {
        String subsystem = "Arm"
        int encoderTicks = 90;
        int ticksPerRotation = 20;

        double rotations = encoderTicks / ticksPerRotation;
        double degrees = rotation * 360;

        int ticks = 4.0;

        System.out.println(subsystem + " startup report");
        System.out.println("  rotations: " + rotations);
        System.out.println("  degrees:   " + degrees);
        System.out.println("  ticks:     " + ticks);
    }
}
```
**Verified error sequence** — this is the whole point of the exercise, so put it in the
`details.reveal` exactly as the student will experience it:

*Run 1 — one error only:*
```
Main.java:3: error: ';' expected
        String subsystem = "Arm"
                                ^
1 error
```
*Run 2, after adding the semicolon — now two errors appear that were hidden behind the
first one:*
```
Main.java:8: error: cannot find symbol
        double degrees = rotation * 360;
                         ^
  symbol:   variable rotation
  location: class Main
Main.java:10: error: incompatible types: possible lossy conversion from double to int
        int ticks = 4.0;
                    ^
2 errors
```
*Run 3, after fixing `rotation` → `rotations`:*
```
Main.java:10: error: incompatible types: possible lossy conversion from double to int
        int ticks = 4.0;
                    ^
1 error
```
*Run 4, after `int ticks = 4;` — it compiles.*

This sequence is the lesson: **the compiler could not even see errors 2 and 3 until error 1
was fixed.** That is why you fix the top one and re-run instead of trying to read them all
at once.

Then the logic error: `rotations` prints `4.0` instead of `4.5`, because `90 / 20` is
integer division.

**Reference solution:**
```java
public class Main {
    public static void main(String[] args) {
        String subsystem = "Arm";
        int encoderTicks = 90;
        int ticksPerRotation = 20;

        double rotations = (double) encoderTicks / ticksPerRotation;
        double degrees = rotations * 360;

        int ticks = 4;

        System.out.println(subsystem + " startup report");
        System.out.println("  rotations: " + rotations);
        System.out.println("  degrees:   " + degrees);
        System.out.println("  ticks:     " + ticks);
    }
}
```
**Verified output:**
```
Arm startup report
  rotations: 4.5
  degrees:   1620.0
  ticks:     4
```
Closing note for the reveal: *"Three errors cost you about ninety seconds, because each one
named its own line. The fourth problem — the one with no error message — is the one you had
to go looking for. Now you know which kind to be afraid of."*

---

## CHECKPOINT

**Q1.** `Main.java:12: error: cannot find symbol` usually means…
- *The file is missing* — `data-explain`: "The compiler found the file fine — it's reading line 12 of it. It's a *name* inside the file it can't resolve."
- *You used a name Java has never seen declared — often a typo or a capitalisation slip* — ✅ `data-explain`: "Exactly, and the message even prints `symbol: variable ...` telling you which name."
- *Your program is too long* — `data-explain`: "Length is never the problem. Java compiles files thousands of lines long without complaint."

**Q2.** What is the difference between a compiler error and a runtime exception?
- *Compiler errors happen before the program runs; exceptions happen while it's running* — ✅ `data-explain`: "Right. One stops it from ever starting; the other stops it partway through, which is why you also get output up to the crash."
- *They're the same thing with different names* — `data-explain`: "Different timing and different information. A compiler error has no stack trace; an exception has no caret."
- *Exceptions are more serious* — `data-explain`: "Not necessarily — and the *least* serious-looking bug, the one with no message at all, is usually the most expensive."

**Q3.** Which line does this trace point at?
```
Exception in thread "main" java.lang.ArithmeticException: / by zero
	at Main.main(Main.java:6)
```
- *Line 1* — `data-explain`: "Line 1 is where the class is declared; nothing can go wrong there at runtime."
- *Line 6* — ✅ `data-explain`: "Correct — `Main.java:6`. The number after the colon is the line."
- *There's no way to tell* — `data-explain`: "The trace always names a file and a line. That's what it's for."

**Q4.** Your debug prints show a correct input on one line and a wrong value on the next. Where is the bug?
- *Somewhere earlier in the program* — `data-explain`: "Everything earlier already printed correctly, so it isn't earlier. That's exactly what the prints ruled out."
- *On the line that produced the wrong value* — ✅ `data-explain`: "Yes. Known-good above, known-bad below: the bug is between them. That's the halving move."
- *Later, once it finishes* — `data-explain`: "Later lines are consuming an already-wrong value. Fixing them would just hide the problem."

**Q5.** You get fifteen compiler errors after adding one line. What do you do?
- *Fix the first error and recompile* — ✅ `data-explain`: "Right — one missing brace or semicolon confuses everything after it. Very often fourteen of the fifteen vanish."
- *Fix them from the bottom up* — `data-explain`: "The later ones are usually consequences of the first. You'd be fixing imaginary problems."
- *Undo everything and start the file again* — `data-explain`: "You'd lose working code to avoid reading one message. Read the top one first."

---

## PHASE 2 FORESHADOWING
- "Isolate: code, wiring or build?" is the *literal* procedure from U2's vendor-clients
  lesson. Say that this page is that procedure applied to software.
- "One change, one run" becomes the formal PID rule in U6: **one variable at a time.**
- Every `System.out.println` you add here shows up in the **Driver Station console** on
  game day — and watching that console is your actual job during a match (U12).
- The stack trace gets its full treatment in `j-scope`, where a trace becomes several lines
  deep and each `at` line is a method that called the next.
