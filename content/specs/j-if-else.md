# j-if-else · if / else Decisions
unit: J2 · Logic & Flow   |   duration: 25 min   |   difficulty: Beginner

---

## INTRODUCES
`if-statement` · `condition` · `block` (`{ }`) · `else` · `else-if-chain` ·
`first-match-wins` · `default-branch` · `nested-if` · `guard-condition` ·
`braces-are-not-optional` · `no-semicolon-after-if` · `ternary-operator` (`? :`) ·
`branch-coverage-thinking` (what happens when nothing matches)

## ASSUMES
`program`, `sequential-execution`, `literal-machine`, `bug` *(j-what-is-programming)* ·
`class`, `main-method`, `println`, `statement`, `semicolon`, `comment` *(j-first-program)* ·
`variable`, `int`, `double`, `boolean`, `String-type`, `final-variable` *(j-variables)* ·
`expression`, `math-class`, `clamping`, `operator-precedence` *(j-operators)* ·
`escape-sequence`, `printf-formatting` *(j-strings)* ·
`logic-error`, `print-debugging` *(j-debugging)* ·
`boolean-expression`, `comparison-operators`, `logical-and`, `logical-or`, `logical-not`,
`named-condition`, `tolerance-comparison`, `short-circuit-evaluation` *(j-booleans)*

## GOAL
Make the program take one path or another based on a condition — and be able to say, for
any set of inputs, exactly which branch runs.

## HOOK
**Section title: "Every season, something breaks"**

Team story for `callout--why`, title **"The cheapest safety device you own"**: every single
season, something on the robot breaks because of control code — a bent part, a mechanism
that falls off, an arm that drives itself into its own hard stop and keeps pushing.

None of that is a mechanical failure. It's a **missing question**.

The arm is at the bottom. The driver holds "down". The code, having been asked to run the
motor down, runs the motor down — because a computer is literal and nobody told it
otherwise. The motor pushes against a metal stop until something gives.

The fix is four words of code:

```java
if (!atLowerLimit) {
    // only now is it safe to go down
}
```

An `if` is the cheapest safety device on the robot. It costs nothing, weighs nothing, and
it is the difference between a mechanism that survives the season and one that doesn't.

---

## EXPLAIN

**Beat 1 — `if` runs a block only when a condition is true.**
The shape, and the sentence to repeat: **"if, parentheses, condition, braces, body."**

```java
if (hasGamePiece) {
    System.out.println("Raising arm to score.");
}
```

The thing inside `( )` must be a `boolean` — exactly the kind of expression you built in
`j-booleans`. If it's `true`, the block runs. If it's `false`, Java skips the whole block
and carries on with the next line after the `}`.

`callout--pitfall`, title **"No semicolon after the `)`"**: `if (x > 5);` compiles and does
absolutely nothing — the `;` becomes the entire body, and the block that follows runs no
matter what. This is a genuinely nasty one because there is no error message. If a branch
seems to run every time, look for a stray semicolon.

**Beat 2 — `else` is "otherwise".**
```java
if (hasGamePiece) {
    System.out.println("Raising arm to score.");
} else {
    System.out.println("Nothing to score. Running intake.");
}
```
**Exactly one** of the two blocks runs. Not zero, not both. After either one, execution
continues at the line below the whole structure — sequential execution never stopped, it
just took a detour.

Analogy: **the fork in the field.** Both routes end up at the same place; the condition only
decides which one you drove.

**Beat 3 — `else if`: a chain, checked in order, first match wins.**
```java
if (batteryVoltage >= 12.0) {
    System.out.println("Battery: GOOD");
} else if (batteryVoltage >= 11.5) {
    System.out.println("Battery: OK");
} else if (batteryVoltage >= 11.0) {
    System.out.println("Battery: LOW - swap after this match");
} else {
    System.out.println("Battery: CRITICAL - do not play");
}
```

Two rules, both load-bearing:

1. **Java checks top to bottom and stops at the first `true`.** With `batteryVoltage = 11.4`,
   it checks `>= 12.0` (no), `>= 11.5` (no), `>= 11.0` (yes) — prints `LOW` and **never
   looks at the rest**.
2. **Order matters enormously.** Put `>= 11.0` first and every healthy battery reports
   `LOW`, because 12.6 is also `>= 11.0`. In a chain of overlapping conditions, go from
   most specific to least.

The final bare `else` is the **default** — the "none of the above" case. Get in the habit of
asking: *what happens if none of my conditions are true?* If the answer is "nothing", make
sure that's deliberate.

`callout--tip`, title **"This shape has a name"**: a long chain of `else if` checks against
the *same* variable is common enough that Java has a second way to write it, called
`switch`. That's the next lesson. Everything you learn here still applies.

**Beat 4 — Braces are not optional. (They technically are. Use them anyway.)**
Java lets you drop the braces when the body is a single statement. Watch what that costs:

```java
if (!atLowerLimit)
    System.out.println("Lowering arm");
    System.out.println("Motor commanded to -0.4");
```

The indentation says both lines belong to the `if`. Java disagrees — **only the first line
is the body.** The second line is a plain statement that runs unconditionally. With the arm
sitting on its lower limit, the guard is skipped and the motor command runs anyway.

That's the hook's bent mechanism, in three lines, with no error message.

> **Team rule: always write the braces.** They cost two keystrokes and they make the
> indentation tell the truth.

**Beat 5 — Nesting: a question inside a question.**
```java
if (hasGamePiece) {
    if (tagVisible) {
        System.out.println("Score it.");
    } else {
        System.out.println("Hold position and look for the tag.");
    }
}
```
Perfectly legal, and readable up to about two levels. Past that, prefer combining with `&&`
(from `j-booleans`) or naming the condition. `if (hasGamePiece && tagVisible)` says the same
thing at one level.

**Beat 6 — `if` as a value-chooser: the clamp, again.**
You wrote the 80 % clamp with `Math.min`/`Math.max` in `j-operators`. Here it is as a chain:

```java
if (requested > 0.8) {
    commanded = 0.8;
} else if (requested < -0.8) {
    commanded = -0.8;
} else {
    commanded = requested;
}
```

Identical behaviour, more lines, and **more room to say why** — you can print a message in
each branch explaining what happened, which the `Math` version can't. Both are correct code.
Choosing between them is a readability decision, and readability decisions are real
engineering.

Note the declaration pattern: `double commanded;` on its own first (declared, not
initialised — the empty bin from `j-variables`), then every branch assigns it. Java checks
that *every* path assigns it before you use it. If you forget the final `else`, you get
**"variable commanded might not have been initialized"** — the compiler catching a missing
branch for you.

**Beat 7 — The ternary: a compact `if` that produces a value.**
```java
String status = tagVisible ? "TRACKING" : "SEARCHING";
```
Read it as: **condition ? value-if-true : value-if-false.** It is an *expression*, so it
produces a value you can store or print — unlike `if`, which is a statement that does
things.

Use it for exactly this: picking one of two values. Don't use it to hide logic. If you can't
read it out loud in one breath, use a real `if`.

`callout--note`: *"You'll see this constantly in Phase 2 — `double speed = reversed ? -0.7 :
0.7;` and similar. Recognising it matters more than writing it."*

---

## CODE

### Sample A — if / else (annotate)
`.code.with-lines`, file label `Main.java`:
```java
public class Main {
    public static void main(String[] args) {
        boolean hasGamePiece = true;

        if (hasGamePiece) {
            System.out.println("Raising arm to score.");
        } else {
            System.out.println("Nothing to score. Running intake.");
        }

        System.out.println("Loop done.");
    }
}
```
**Verified output:**
```
Raising arm to score.
Loop done.
```
**Annotate:** line 5 "no semicolon after the `)`"; line 8 "this block was skipped entirely";
line 11 "runs either way — it's outside the whole structure". Then flip `hasGamePiece` to
`false` and show the **verified** alternative output:
```
Nothing to score. Running intake.
Loop done.
```

### Sample B — an else-if chain (annotate)
```java
public class Main {
    public static void main(String[] args) {
        double batteryVoltage = 11.4;

        if (batteryVoltage >= 12.0) {
            System.out.println("Battery: GOOD");
        } else if (batteryVoltage >= 11.5) {
            System.out.println("Battery: OK");
        } else if (batteryVoltage >= 11.0) {
            System.out.println("Battery: LOW - swap after this match");
        } else {
            System.out.println("Battery: CRITICAL - do not play");
        }
    }
}
```
**Verified output:**
```
Battery: LOW - swap after this match
```
**Annotate:** line 5 "checked first: 11.4 is not ≥ 12.0"; line 7 "checked second: not ≥
11.5"; line 9 "**match** — this block runs"; line 11 "never even evaluated". Add the
one-line takeaway: *"Exactly one line of output, no matter what the voltage is. That's the
guarantee an if/else-if/else chain gives you."*

### Sample C — the missing braces (annotate)
Show inside a `callout--pitfall`, marked **"this compiles, and it is wrong"**:
```java
public class Main {
    public static void main(String[] args) {
        boolean atLowerLimit = true;

        if (!atLowerLimit)
            System.out.println("Lowering arm");
            System.out.println("Motor commanded to -0.4");

        System.out.println("done");
    }
}
```
**Verified output:**
```
Motor commanded to -0.4
done
```
**Annotate:** "the arm **is** at the lower limit, so the guard correctly skipped line 6…";
"…and line 7 ran anyway, because it was never part of the `if`. The indentation lied.";
"this is the bent-mechanism bug from the top of the page." Then show the fixed version with
braces and its **verified** output:
```
done
```

### Sample D — the clamp as a chain (annotate)
```java
public class Main {
    public static void main(String[] args) {
        double requested = 0.95;
        double commanded;

        if (requested > 0.8) {
            commanded = 0.8;
        } else if (requested < -0.8) {
            commanded = -0.8;
        } else {
            commanded = requested;
        }

        System.out.println("requested: " + requested);
        System.out.println("commanded: " + commanded);
    }
}
```
**Verified output:**
```
requested: 0.95
commanded: 0.8
```
**Annotate:** line 4 "declared but empty — legal, because every branch below fills it";
line 10 "delete this `else` and the compiler says *variable commanded might not have been
initialized*. That's the compiler noticing you forgot a case."

### Sample E — ternary (annotate)
```java
public class Main {
    public static void main(String[] args) {
        boolean tagVisible = false;
        String status = tagVisible ? "TRACKING" : "SEARCHING";
        System.out.println(status);

        double speed = 0.7;
        String dir = speed >= 0 ? "forward" : "reverse";
        System.out.println("Running " + dir + " at " + Math.abs(speed));
    }
}
```
**Verified output:**
```
SEARCHING
Running forward at 0.7
```
**Annotate:** line 4 "condition, `?`, value if true, `:`, value if false"; line 8 "the whole
thing is an expression, so it can sit on the right of an `=`".

---

## SANDBOX

### Sandbox 1 — "Walk through it": drive the chain
`data-title="Live Java Sandbox"`
```java
public class Main {
    public static void main(String[] args) {
        double batteryVoltage = 11.4;

        if (batteryVoltage >= 12.0) {
            System.out.println("Battery: GOOD");
        } else if (batteryVoltage >= 11.5) {
            System.out.println("Battery: OK");
        } else if (batteryVoltage >= 11.0) {
            System.out.println("Battery: LOW - swap after this match");
        } else {
            System.out.println("Battery: CRITICAL - do not play");
        }

        // Try it, one at a time:
        //  1. 12.6 -> GOOD      2. 11.6 -> OK
        //  3. 10.2 -> CRITICAL  4. exactly 11.5 -> which one? predict first.
        //  5. Now MOVE the ">= 11.0" branch to the top and re-run 12.6.
    }
}
```
**Verified outputs:** `12.6` → `Battery: GOOD`; `11.6` → `Battery: OK`;
`11.4` → `Battery: LOW - swap after this match`; `10.2` → `Battery: CRITICAL - do not play`;
`11.5` → `Battery: OK` (because `>=` includes the boundary).
**Verified after step 5** (moving `>= 11.0` to the top) with `12.6`:
`Battery: LOW - swap after this match` — the wrong answer, produced by correct-looking code
in the wrong order.
**What the student changes:** the voltage, then the branch order. Step 5 is the whole point:
**in an overlapping chain, order is part of the logic.**

### Sandbox 2 — "Build it": the arm safety gate
`data-title="Project Sandbox"`
```java
public class Main {
    public static void main(String[] args) {
        // The arm must refuse unsafe commands. Rules, in priority order:
        //   1. at the lower limit and asked to go DOWN  -> command 0.0, print BLOCKED
        //   2. at the upper limit and asked to go UP    -> command 0.0, print BLOCKED
        //   3. request above  0.8  -> clamp to  0.8, print CLAMPED
        //   4. request below -0.8  -> clamp to -0.8, print CLAMPED
        //   5. otherwise           -> pass it through, print OK
        //
        // Build ONE if / else-if chain. Then test all five cases.

        double  armPosition    = 0.0;
        double  requestedSpeed = -0.4;
        boolean atLowerLimit   = true;
        boolean atUpperLimit   = false;

        double commanded;
        // TODO: the chain

        System.out.println("position:  " + armPosition);
        System.out.println("requested: " + requestedSpeed);
        System.out.println("commanded: " + commanded);
    }
}
```
**Reference (author check, not shown on the page):**
```java
public class Main {
    public static void main(String[] args) {
        double  armPosition    = 0.0;
        double  requestedSpeed = -0.4;
        boolean atLowerLimit   = true;
        boolean atUpperLimit   = false;

        double commanded;

        if (atLowerLimit && requestedSpeed < 0) {
            commanded = 0.0;
            System.out.println("BLOCKED: at lower limit, refusing to go down");
        } else if (atUpperLimit && requestedSpeed > 0) {
            commanded = 0.0;
            System.out.println("BLOCKED: at upper limit, refusing to go up");
        } else if (requestedSpeed > 0.8) {
            commanded = 0.8;
            System.out.println("CLAMPED: request above the 80% rule");
        } else if (requestedSpeed < -0.8) {
            commanded = -0.8;
            System.out.println("CLAMPED: request below the 80% rule");
        } else {
            commanded = requestedSpeed;
            System.out.println("OK: request allowed");
        }

        System.out.println("position:  " + armPosition);
        System.out.println("requested: " + requestedSpeed);
        System.out.println("commanded: " + commanded);
    }
}
```
**Verified output (as shipped — at the lower limit, asked to go down):**
```
BLOCKED: at lower limit, refusing to go down
position:  0.0
requested: -0.4
commanded: 0.0
```
**Verified with `atLowerLimit = false`, `requestedSpeed = -0.95`:**
```
CLAMPED: request below the 80% rule
position:  0.0
requested: -0.95
commanded: -0.8
```
**Verified with `atLowerLimit = false`, `requestedSpeed = 0.5`:**
```
OK: request allowed
position:  0.0
requested: 0.5
commanded: 0.5
```
**Target:** every one of the five rules is reachable, and the student can name the input
that reaches it.

---

## CHALLENGES

### Challenge 1 — Predict the output  (`data-kind="text"`)
Prompt: "`batteryVoltage` is `11.5`. Which single word appears after `Battery: `?"
```java
if (batteryVoltage >= 12.0) {
    System.out.println("Battery: GOOD");
} else if (batteryVoltage >= 11.5) {
    System.out.println("Battery: OK");
} else if (batteryVoltage >= 11.0) {
    System.out.println("Battery: LOW");
}
```
**Answer key:** `data-answer="OK"` — **verified.**
- `data-win`: "Right. `>=` includes the boundary, so 11.5 matches the second branch — and the chain stops there."
- `data-lose`: "It's `OK`. 11.5 is not ≥ 12.0, but it *is* ≥ 11.5 because `>=` includes equality. First match wins, so `LOW` is never checked."

**Reveal explanation:** boundary values are where branch bugs live. Whenever you write a
chain, deliberately test the exact number on each boundary — `12.0`, `11.5`, `11.0` — and
decide which side you meant it to fall on.

### Challenge 2 — Predict the output  (`data-kind="text"`)
Prompt: "`atLowerLimit` is `true`. Type the exact output (one line)."
```java
if (!atLowerLimit)
    System.out.println("Lowering arm");
    System.out.println("Motor commanded to -0.4");
```
**Answer key:** `data-answer="Motor commanded to -0.4"` — **verified.**
- `data-win`: "Exactly — and that's the bug. Without braces, only the first line belongs to the `if`; the second runs unconditionally."
- `data-lose`: "It prints `Motor commanded to -0.4`. The guard correctly skipped line 2, but line 3 was never part of the `if` — the indentation only fooled you, not Java."

### Challenge 3 — Fill in the blanks  (`data-kind="fib"`)
Prompt: "Complete the guard so the arm only lowers when it is *not* at the lower limit."
```
______ (______atLowerLimit) {
    armMotor.set(-0.4);
}
```
Blanks: `data-answer="if"`, `data-answer="!"`
- `data-win`: "That's the guard. Ask before you act — it costs nothing and it saves mechanisms."
- `data-lose`: "The keyword is `if`, and 'not at the lower limit' is `!atLowerLimit` — the `!` flips a boolean."

### Challenge 4 — Multiple choice  (`data-kind="mcq"`)
Prompt: "In an `if / else if / else` chain, how many blocks run?"

| Option | Correct | `data-explain` |
|---|---|---|
| All the ones whose condition is true | | That's what separate `if` statements would do. A chain is different: it stops at the first match. |
| Exactly one | ✅ | Correct — the first branch whose condition is true, or the final `else` if none matched. Exactly one, always. |
| At most one, possibly none | | True only if there's **no** final `else`. With a bare `else` at the end, one block always runs. |
| It depends on the order | | Order decides *which* one runs, not *how many*. |

### Challenge 5 — Multiple choice  (`data-kind="mcq"`)
Prompt: "Why does `if (speed > 0.8);` behave strangely?"

| Option | Correct | `data-explain` |
|---|---|---|
| The semicolon is the entire body, so the block after it runs every time | ✅ | Yes. `;` on its own is a legal empty statement, and the `if` happily takes it as its body. The braces below then run unconditionally. |
| It's a compiler error | | It compiles cleanly, which is exactly what makes it dangerous. |
| The condition is evaluated twice | | It's evaluated once. The problem is that the answer is thrown away. |
| `>` doesn't work on doubles | | It works fine. Only `==` is unreliable on doubles. |

### Challenge 6 — Multiple choice  (`data-kind="mcq"`)
Prompt: "You delete the final `else` from Sample D's clamp. What happens?"

| Option | Correct | `data-explain` |
|---|---|---|
| It still works; `commanded` just stays empty | | There is no "empty" for a local `double` — Java refuses to let you read one that might never have been set. |
| The compiler refuses to build it: *variable commanded might not have been initialized* | ✅ | Right, and it's the compiler doing you a favour — it has spotted a path through your code where you forgot to decide anything. |
| It compiles but crashes at runtime | | Java catches this at compile time, before anything runs. |
| `commanded` defaults to 0.0 | | Fields default; **local variables do not**. That distinction returns in Unit J5. |

---

## MISCONCEPTIONS

1. **"Indentation controls what belongs to the `if`."**
   → **Braces** control it. Java ignores whitespace entirely; indentation is a note to
   humans, and it can lie.
2. **"`else if` checks everything."**
   → It stops at the first true condition. Everything below is never evaluated.
3. **"Order in a chain doesn't matter."**
   → With overlapping conditions it decides the answer. Most specific first.
4. **"`if (x = 5)` compares x to 5."**
   → That's assignment. Java usually rejects it with *incompatible types: int cannot be
   converted to boolean* — but with booleans it compiles and is a real bug.
5. **"A semicolon after `if (...)` is harmless."**
   → It silently becomes the body, and the block below runs every time. No warning.
6. **"Nested ifs are the way to combine conditions."**
   → Sometimes. Often `&&` says the same thing at one level and reads better. Prefer flat.
7. **"I don't need an `else` — the other case can't happen."**
   → Write it anyway, even if it just prints something. The case you were sure couldn't
   happen is the one that shows up at competition.

---

## EXERCISE

### Mini-project: The Arm Safety Gate
In `j-booleans` you built a panel that reported whether the robot was *allowed* to score.
Now build the thing that actually enforces a rule: an arm that refuses commands that would
damage it.

**Task:**
1. Start from the four inputs in Sandbox 2: `armPosition`, `requestedSpeed`,
   `atLowerLimit`, `atUpperLimit`.
2. Declare `double commanded;` with no value.
3. Write **one** `if / else if / … / else` chain implementing the five rules in priority
   order — the two limit blocks first, then the two clamps, then pass-through.
4. Each branch prints a one-line reason (`BLOCKED: …`, `CLAMPED: …`, `OK: …`).
5. Print position, requested and commanded at the end, always.
6. **Bonus:** add a `String verdict` set by a ternary to `"MOVING"` or `"HOLDING"`
   depending on whether `commanded` is 0.0, and print it.

Starter code and **reference solution:** as Sandbox 2 above.
**Verified outputs:** the three verified blocks in Sandbox 2 (BLOCKED / CLAMPED / OK).

Closing note for the reveal: *"Notice that the limit checks come **before** the clamps. If
you clamp first, a request of −0.95 at the lower limit becomes −0.8 and still drives into
the hard stop — just more politely. Priority order is not decoration; it is the safety
logic."*

---

## CHECKPOINT

**Q1.** What must go inside the parentheses of an `if`?
- *Any expression* — `data-explain`: "It has to be a **boolean** expression specifically. `if (5)` is a compiler error in Java, unlike some other languages."
- *An expression that produces `true` or `false`* — ✅ `data-explain`: "Right — exactly the kind of comparison or `&&`/`||` combination you built in `j-booleans`."
- *A number* — `data-explain`: "Java refuses to treat a number as a yes/no. You'd get *incompatible types: int cannot be converted to boolean*."

**Q2.** `batteryVoltage` is 12.6 and the `>= 11.0` branch has been moved to the top of the chain. What prints?
- *`GOOD`* — `data-explain`: "That branch is now below a condition that 12.6 also satisfies, so it's never reached."
- *`LOW`* — ✅ `data-explain`: "Correct, and it's a real bug: 12.6 *is* ≥ 11.0, and first match wins. Overlapping conditions must go most-specific first."
- *Both `GOOD` and `LOW`* — `data-explain`: "A chain runs exactly one block. Two outputs would need two separate `if` statements."

**Q3.** Why write braces even for a one-line body?
- *Java requires them* — `data-explain`: "It doesn't — which is precisely the problem. The code compiles either way."
- *So that adding a second line later doesn't silently fall outside the `if`* — ✅ `data-explain`: "Yes. The bug isn't in the code you write today; it's in the line someone adds next week."
- *They make it run faster* — `data-explain`: "Zero difference at runtime. This is entirely about the next person to edit the file."

**Q4.** `String s = ready ? "GO" : "WAIT";` — what is `s` when `ready` is `false`?
- *`"GO"`* — `data-explain`: "The value before the `:` is the *true* case. `false` takes the other one."
- *`"WAIT"`* — ✅ `data-explain`: "Right: condition, `?`, value-if-true, `:`, value-if-false."
- *`null`* — `data-explain`: "A ternary always produces one of its two values; it never produces nothing."

**Q5.** In the arm gate, why do the limit checks come before the clamps?
- *Alphabetical order* — `data-explain`: "Branch order encodes priority, never spelling."
- *Because a clamped-but-still-downward command would still drive into the hard stop* — ✅ `data-explain`: "Exactly. Clamping −0.95 to −0.8 makes it gentler, not safe. The limit has to win first."
- *Because clamping is slower* — `data-explain`: "Both are instant. This is about which rule outranks which."

---

## PHASE 2 FORESHADOWING
- The limit-switch guard is the shape of every safety check you'll write in U5–U7.
- The else-if chain over battery voltage is the same shape as a state machine — and Phase 2's
  scheduler decides *which command runs* using very similar logic.
- `commanded` being assigned in every branch is the same discipline as a `Command`'s
  `end(boolean interrupted)` always stopping the motor: **cover every exit.**
- The ternary appears in real WPILib-style code constantly; recognising `cond ? a : b` on
  sight is the goal, not writing clever ones.
