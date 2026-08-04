# j-what-is-programming · What Programming Really Is
unit: J1 · Getting Started   |   duration: 15 min   |   difficulty: Beginner

> **Author note:** this is lesson **1 of the entire course**. The reader may never have
> opened a code editor. Assume nothing — not even that they know what a "file" is.
> Do **not** explain `public class Main` here; that is lesson 2's whole job. Here the
> student runs code they don't fully understand yet, on purpose, so lesson 2 has
> something to dissect.

---

## INTRODUCES
`program` · `instruction` · `sequential-execution` · `algorithm` · `source-code` ·
`programming-language` · `java-language` · `compiler` · `syntax` · `bug` ·
`literal-machine` (computers do exactly what you say) · `input-process-output`

## ASSUMES
Nothing. This is the first lesson in the course.

## GOAL
Explain in your own words what a program is, put a set of instructions in the correct
order, and run your first piece of Java in the browser.

## HOOK
**Section title: "The robot did exactly what we told it to."**

Open with the team story: the code said *drive forward for two seconds*, the drivers
expected it to stop at the line, and instead the robot **drove straight into the wall**.
Nothing was broken. No motor failed. The robot did precisely what the code said — the
code just said the wrong thing.

Land the point in one sentence: *A computer is not smart and it is not stupid. It is
literal.* Everything else in this course is you learning to say exactly what you mean.

Use `callout--why`, title **"Ramming speed"**.

---

## EXPLAIN

**Beat 1 — A program is an ordered list of instructions.**
Analogy: **a recipe**. A recipe is useless as a pile of unordered steps. "Bake for 20
minutes" before "mix the batter" produces garbage. Order is not a detail; order *is* the
program. Introduce the term **sequential execution**: top to bottom, one line at a time,
no skipping.

**Beat 2 — An algorithm is the plan; a program is the plan written in a language a
computer accepts.**
Analogy: **the pit crew checklist**. Before a match, someone reads a checklist aloud:
battery in, bumpers on, tether unplugged, robot on the field. That checklist is an
*algorithm* — a finite list of unambiguous steps that gets a job done. Write that same
checklist in Java and it is a *program*.
Drive home: **you already write algorithms all the time.** Programming is only the
translation step.

**Beat 3 — Computers only accept very precise languages.**
Analogy: **ordering food in a language you barely speak.** One wrong word and you get
nothing, not a helpful guess. The rules of that language are its **syntax**. We use
**Java**, because that is what FRC robots are programmed in.

**Beat 4 — Source code → compiler → running program.**
Analogy: **the translator on a headset.** You write **source code** (text a human can
read). A **compiler** checks it for syntax mistakes and translates it into something the
machine can execute. If the compiler finds a mistake it refuses to translate and tells
you where it choked. That refusal is a *feature* — it catches your typo before the robot
does something expensive.
Foreshadow: "Lesson J1-6 is entirely about reading what the compiler tells you."

**Beat 5 — Every program is input → process → output.**
Analogy: **the intake.** Game piece goes in (input), rollers grab and index it
(process), shooter fires it out (output). A program that reads a joystick, decides a
motor speed, and sets the motor is the same three steps. On this page our "output" is
text on the screen; in Phase 2 the output is a spinning motor.

**Beat 6 — A bug is a mismatch between what you said and what you meant.**
Reframe it so nobody feels stupid: a bug is not a moral failure, it is a *translation
error*. Every programmer on the team writes bugs every single meeting. The skill being
taught in this course is not "avoid bugs," it is "find them fast."

Use `callout--tip`, title **"Mental model"**:
> You are writing a recipe for the most obedient, least imaginative chef alive. It will
> follow every step perfectly, and it will never once notice that a step is missing.

---

## CODE

### Sample A — a program is just steps in order (annotate)
Presented as a static `.code.with-lines` block with a **"Try it Yourself"** affordance.

```java
public class Main {
    public static void main(String[] args) {
        // Step 1
        System.out.println("Battery installed");
        // Step 2
        System.out.println("Bumpers attached");
        // Step 3
        System.out.println("Robot on the field");
    }
}
```

**Annotate lines:**
- line 1 — "A named container for the program. We take this apart in the next lesson —
  for now, copy it."
- line 2 — "The starting line. The computer looks for this and begins here."
- lines 4, 6, 8 — "One instruction each. `System.out.println(...)` means *print this text
  on its own line*."

Then state the output explicitly, on its own, so the student can compare:
```
Battery installed
Bumpers attached
Robot on the field
```
And say the load-bearing sentence: **the output order is the code order. Always.**

### Sample B — the same three instructions, reordered (annotate)
Show the identical program with lines 4 and 8 swapped, and its output:
```
Robot on the field
Bumpers attached
Battery installed
```
Point out that this is **valid Java** and the compiler is perfectly happy with it. The
computer cannot tell that putting the robot on the field before installing the battery is
nonsense. **Only you know the intent.** This is the single most important idea on the page.

---

## SANDBOX

### Sandbox 1 — "Walk through it": Fix the checklist order
`data-title="Live Java Sandbox"`

Starter code (compiles and runs as-is — it just prints a *wrong* order):
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Robot on the field");
        System.out.println("Battery installed");
        System.out.println("Bumpers attached");
        System.out.println("Tether unplugged");
    }
}
```
**What the student changes:** press Run first and read the (wrong) order. Then reorder the
four lines by cutting and pasting whole lines until the output reads:
```
Battery installed
Bumpers attached
Tether unplugged
Robot on the field
```
Instruction to include verbatim: *"You do not need to understand a single word inside the
lines. Move whole lines around. That is already programming."*

### Sandbox 2 — "Build it": Write your own algorithm
`data-title="Project Sandbox"`

Starter code:
```java
public class Main {
    public static void main(String[] args) {
        // Write one println for each step of your morning routine.
        // Keep them in the order you actually do them.
        System.out.println("Step 1: wake up");

    }
}
```
**What the student changes:** add at least four more `System.out.println("...");` lines so
the program prints a five-step routine in order. Rule they must follow: every line ends
with `;` and the text lives inside `"` quotes. Encourage them to deliberately break it
once — delete a `;`, hit Run, and *look* at what the compiler says. They will not
understand the message yet; the point is to learn that a red error is information, not
punishment.

---

## CHALLENGES

### Challenge 1 — Predict the output  (`data-kind="text"`)
Prompt: "Java runs these lines top to bottom. Type exactly what gets printed, one line
per line."

```java
System.out.println("Enable");
System.out.println("Drive");
System.out.println("Shoot");
```

**Answer key:** `data-answer` accepts
`Enable Drive Shoot|Enable, Drive, Shoot|Enable\nDrive\nShoot`
(Because the widget's answer input is a single-line text field, phrase the prompt as
*"type the three words in the order they appear, separated by spaces"* and set
`data-answer="Enable Drive Shoot"`.)

- `data-win`: "Exactly. Top to bottom, no surprises — the output order is the code order."
- `data-lose`: "Java does not reorder your lines or sort them. It runs line 1, then line
  2, then line 3, exactly as written."

**Reveal explanation:** Each `println` prints its text on its own line. Nothing in the
program says "sort these" or "pick the important one," so the order printed is simply the
order typed.

### Challenge 2 — Multiple choice: what is an algorithm?  (`data-kind="mcq"`)
Prompt: "Which of these is an **algorithm**?"

| Option | Correct | `data-explain` |
|---|---|---|
| "Make the robot better" | | Too vague to follow. An algorithm has to be steps someone could carry out without guessing. |
| "1. Drive to the line. 2. Turn 90°. 3. Shoot." | ✅ | Right — a finite list of clear, ordered, unambiguous steps. That is exactly what an algorithm is. |
| "Java" | | Java is a *programming language* — the thing you write an algorithm **in**, not the algorithm itself. |
| "A robot" | | A robot is hardware. The algorithm is the plan the code makes it follow. |

### Challenge 3 — Fill in the blanks  (`data-kind="fib"`)
Prompt: "Fill in the two words that complete the sentence about how code gets run."

```
The text you write is called source ______, and the tool that checks it and
translates it for the machine is called a ______.
```
Blanks: `data-answer="code"`, `data-answer="compiler"`

- `data-win`: "That's the pipeline: you write source code, the compiler checks and
  translates it, then it runs."
- `data-lose`: "You write source *code*; the tool that translates it is the *compiler*."

### Challenge 4 — Multiple choice: the literal machine  (`data-kind="mcq"`)
Prompt: "You told the robot to drive forward for 2 seconds. It drove into the wall. What
almost certainly happened?"

| Option | Correct | `data-explain` |
|---|---|---|
| The robot decided to ignore the code | | Code is never ignored or overruled by the robot's own judgement — it has none. |
| The code said 2 seconds, but 2 seconds of driving is farther than the wall | ✅ | Yes. The robot did exactly what it was told; what it was told was wrong. That's a bug — a gap between what you said and what you meant. |
| Java is unreliable | | The same code produces the same behaviour every time. That reliability is *why* we can debug at all. |
| The compiler should have caught it | | The compiler only catches *grammar* mistakes. "Drive 2 seconds" is perfectly grammatical — and perfectly wrong. |

---

## MISCONCEPTIONS

1. **"The computer will figure out what I meant."**
   → It will not: a computer has no idea what you meant, only what you wrote — which is
   why being exact is the whole skill.
2. **"Programming means memorising a lot of commands."**
   → You will look syntax up forever; what you actually build is the habit of breaking a
   job into ordered, unambiguous steps.
3. **"If it's not broken it must be right."**
   → Code that runs without an error can still do the wrong thing — a program that
   compiles is only a program that is *grammatical*.
4. **"Real programmers don't get errors."**
   → Everyone on this team gets errors every meeting; the difference is only how fast
   they read them.
5. **"I need a good laptop / to install stuff before I can start."**
   → You need this browser tab (callback to the `callout--why` in `j-first-program` about
   the captain's broken laptop).

---

## EXERCISE

### Mini-project: The Pit Crew Checklist
Every match, someone on 2551 runs a pre-match checklist out loud. Your job is to turn a
real checklist into a program.

**Task:**
1. Print a header line: `PRE-MATCH CHECKLIST`
2. Print these five steps, **each on its own line, in a sensible order**: battery
   installed and strapped, bumpers on and correct colour, tether unplugged, robot
   powered on, robot placed on the starting line.
3. Print a closing line: `Ready to play.`
4. **Bonus:** number your steps in the printed text (`1. ...`, `2. ...`) so a human
   reading the console can follow along.

Starter code:
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("PRE-MATCH CHECKLIST");
        // TODO: print the five steps, in order

    }
}
```

**Reference solution** (put in `<details class="reveal">`):
```java
public class Main {
    public static void main(String[] args) {
        // A pre-match checklist, printed one step at a time
        System.out.println("PRE-MATCH CHECKLIST");
        System.out.println("1. Battery installed and strapped in");
        System.out.println("2. Bumpers on, correct alliance colour");
        System.out.println("3. Tether unplugged");
        System.out.println("4. Robot powered on");
        System.out.println("5. Robot on the starting line");
        System.out.println("Ready to play.");
    }
}
```
**Verified output:**
```
PRE-MATCH CHECKLIST
1. Battery installed and strapped in
2. Bumpers on, correct alliance colour
3. Tether unplugged
4. Robot powered on
5. Robot on the starting line
Ready to play.
```
Closing note for the reveal: *"Any order that makes physical sense is a correct answer —
but 'robot on the field' before 'battery installed' is how you lose a match. The compiler
would have accepted it happily."*

---

## CHECKPOINT

**Q1.** A program is best described as…
- *A list of instructions the computer follows in order* — ✅ `data-explain`: "Correct. Ordered instructions, run top to bottom — that's the whole definition."
- *A description of what you want to happen* — `data-explain`: "That's a goal, not a program. A program has to spell out the steps that achieve it."
- *A machine that thinks for itself* — `data-explain`: "Nothing in this course thinks. Every decision a program makes is one you wrote."

**Q2.** Why do we say a computer is "literal"?
- *Because it only prints text* — `data-explain`: "Printing text is just today's output; in Phase 2 the output is a motor. Being literal is about *interpretation*, not output."
- *Because it does exactly what the code says, even when that's clearly not what you meant* — ✅ `data-explain`: "Exactly — and that's why the wall-ramming robot wasn't broken. It obeyed."
- *Because it fixes small mistakes for you* — `data-explain`: "It never fixes your logic. The compiler catches grammar mistakes only, and even then it just refuses and points."

**Q3.** What is a compiler's job?
- *To run your program faster* — `data-explain`: "Speed is a side effect at best. Its job is checking and translating."
- *To check your code's syntax and translate it into something the machine can run* — ✅ `data-explain`: "Right. And if the syntax is wrong it refuses to translate and tells you where — which is help, not punishment."
- *To find all the mistakes in your logic* — `data-explain`: "It cannot. `driveForward(2)` is perfectly grammatical even when 2 is the wrong number."

**Q4.** These two programs contain the exact same three `println` lines, in different
orders. Are they the same program?
- *Yes — same lines, same program* — `data-explain`: "No: order *is* the program. Swap two steps in a recipe and you get a different result."
- *No — they will print in different orders* — ✅ `data-explain`: "Correct. Sequential execution means the order you write is the order that happens."
- *Only if one of them has an error* — `data-explain`: "Both are error-free. That's the uncomfortable part — being wrong and being broken are not the same thing."

**Q5.** You wrote code and got a red error message. What is the right reaction?
- *Read it — it names the problem and usually the line* — ✅ `data-explain`: "Yes. Errors are the compiler helping. Lesson J1-6 is entirely about reading them."
- *Delete everything and start over* — `data-explain`: "Almost never necessary. The message is pointing at a small, specific problem."
- *Assume you're bad at this* — `data-explain`: "Everyone on the team hits errors constantly. Reading them fast is the actual skill being taught."

---

## PHASE 2 FORESHADOWING
- The wall-ramming story returns in Unit U6 as the reason PID control exists.
- "input → process → output" is reused verbatim in Unit U8 to describe
  controller → `RobotContainer` → `motor.set()`.
- The pit-crew checklist becomes a real deliverable in Unit U12 (game-day checklist).
