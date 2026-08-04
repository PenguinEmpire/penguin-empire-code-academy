# j-nested-loops · Nested Loops & Patterns
unit: J2 · Logic & Flow   |   duration: 25 min   |   difficulty: Beginner

---

## INTRODUCES
`nested-loop` · `outer-loop` / `inner-loop` · `row-and-column-thinking` ·
`iteration-multiplication` (outer × inner passes) · `print-vs-println-for-rows` ·
`row-terminator` (`System.out.println()` with no argument) ·
`meaningful-loop-names` (`row`/`col`, not `i`/`j`) · `grid-rendering` ·
`coordinate-pair` · `one-based-vs-zero-based-coordinates`

## ASSUMES
`program`, `sequential-execution`, `algorithm` *(j-what-is-programming)* ·
`class`, `main-method`, `println`, `print-vs-println`, `comment` *(j-first-program)* ·
`variable`, `int`, `final-variable`, `string-concatenation` *(j-variables)* ·
`arithmetic-operators`, `modulo` *(j-operators)* ·
`escape-sequence` *(j-strings)* ·
`print-debugging` *(j-debugging)* ·
`comparison-operators`, `logical-and`, `equality-operator` *(j-booleans)* ·
`if-statement`, `else-if-chain`, `block` *(j-if-else)* ·
`for-loop`, `while-loop`, `loop-variable`, `off-by-one`, `infinite-loop`,
`loop-variable-scope` *(j-loops)*

## GOAL
Put one loop inside another to walk a grid row by row, and draw that grid on the screen.

## HOOK
**Section title: "Two sides, two motors each"**

Team story for `callout--why`, title **"Four motors, one idea"**: the ChairBot — the team's
first teaching robot, a chair you could drive — had **two sides**, two wheels per side, and
**two motors driving each side**. Four motors in total, declared as four variables and
driven by two methods.

Two sides. Two motors per side. That is not a list — it is a **grid**, and a grid is what
you get when one repetition sits inside another. *For each side: for each motor on that
side, do the thing.*

And it's about to matter a great deal. Alice's kitchen — the capstone this whole track is
building toward — is a grid of **5 rows and 7 columns**, and the very first thing you'll
have to do with it is draw it on the screen. Thirty-five squares, in rows, without typing
thirty-five lines. That's this lesson.

---

## EXPLAIN

**Beat 1 — A loop inside a loop.**
Nothing new is happening. A loop body can hold any statements, and a loop is a statement.

```java
for (int row = 0; row < 3; row++) {
    for (int col = 0; col < 3; col++) {
        System.out.println("row " + row + ", col " + col);
    }
}
```

The order of events, said slowly because this is the whole lesson:

> The **outer** loop starts at `row = 0`. The **inner** loop then runs *all the way through*
> — col 0, 1, 2 — and finishes. Only then does the outer loop tick over to `row = 1`, and
> the inner loop runs *completely again*, from `col = 0`.

Analogy: **reading a page.** The outer loop is the line you're on; the inner loop is the
word you're on. You finish every word on line 1 before you move to line 2, and when you do
move, you go back to the start of the line.

**Beat 2 — Count the passes: outer × inner.**
3 rows × 3 columns = **9** passes through the inner body. Five rows × seven columns = 35.

That multiplication is the thing to internalise, and it comes with a warning: a loop of
1,000 inside a loop of 1,000 is a million passes. Nested loops are how a program that felt
instant becomes a program that doesn't finish. On a robot, inside a 20 ms cycle, that
matters.

**Beat 3 — Name the loop variables after what they mean.**
You'll see `i` and `j` everywhere in code on the internet, and in a grid they are a trap:
`grid[j][i]` versus `grid[i][j]` is a bug you cannot see. Write `row` and `col`. Write
`side` and `motor`. Write `canId`.

> **If a mistake in your loop variables would be invisible, name them so it isn't.**

**Beat 4 — Drawing a grid: `print` for the row, `println` to end it.**
This is the mechanical trick that makes grids possible, and it uses the `print` vs `println`
distinction from `j-first-program`.

```java
for (int row = 0; row < 3; row++) {
    for (int col = 0; col < 3; col++) {
        System.out.print("[ ] ");     // stays on the same line
    }
    System.out.println();             // ends the row
}
```

- `System.out.print(...)` writes and **stays put** — so the inner loop builds one row across.
- `System.out.println()` with **nothing in the parentheses** just ends the line.
- And crucially: that `println()` is in the **outer** loop's body, *after* the inner loop.
  It runs once per row, not once per square.

Move it inside the inner loop and you get 9 lines of one square. Delete it and you get all
9 squares on a single line. Both are verified below, because seeing it is worth more than
reading it.

`callout--tip`, title **"Where the line break goes tells you which loop you're in"**: if
your grid comes out as one long line, your `println()` is missing. If it comes out as a
single column, your `println()` is one level too deep.

**Beat 5 — Deciding what to draw: an `if` inside the inner loop.**
Now combine everything from Unit J2. Inside the innermost body you know exactly which square
you're standing on — `row` and `col` — so you can ask what belongs there:

```java
if (row == aliceRow && col == aliceCol) {
    System.out.print("[A]");
} else {
    System.out.print("[ ]");
}
```

That is a complete grid renderer. Every square, one question, one character. Alice's
`printKitchen` is this and nothing more.

**Beat 6 — A coordinate is two numbers, and the order is a decision.**
`(row, col)` is a convention, and you must pick one and never waver. This course uses
**row first, then column** — the same order a spreadsheet cell reference doesn't use, which
is exactly why it needs saying out loud.

And a warning worth planting now: the kitchen project brief describes Alice's position as
*"the second square of the third row"* and writes it as **(3, 2)** — counting from **one**,
the way a person counts. Java counts from **zero**. The third row is index `2` and the
second square is index `1`.

> Human "(3, 2)" → Java `row = 2, col = 1`.

`callout--pitfall`, title **"Off by one, in two dimensions"**: mixing 1-based descriptions
with 0-based code puts Alice in the wrong square and produces a grid that looks *nearly*
right, which is the hardest kind of wrong to spot. Decide once, write it in a comment, and
never mix.

**Beat 7 — Nesting isn't only for grids.**
Anything of the shape *"for each X, do something for each Y"*:

```java
for (int side = 1; side <= 2; side++) {
    for (int motor = 1; motor <= 2; motor++) {
        // command this motor on this side
    }
}
```
Four motor commands from four lines of code — the ChairBot from the hook. In Phase 2 you'll
see the same shape over four swerve modules, each with a drive motor and a steer motor.

---

## CODE

### Sample A — the visit order (annotate)
`.code.with-lines`, file label `Main.java`:
```java
public class Main {
    public static void main(String[] args) {
        for (int row = 0; row < 3; row++) {
            for (int col = 0; col < 3; col++) {
                System.out.println("row " + row + ", col " + col);
            }
        }
    }
}
```
**Verified output:**
```
row 0, col 0
row 0, col 1
row 0, col 2
row 1, col 0
row 1, col 1
row 1, col 2
row 2, col 0
row 2, col 1
row 2, col 2
```
**Annotate:** "read the left column: `row` changes slowly"; "read the right column: `col`
resets to 0 every time `row` ticks over"; "9 lines from 3 × 3 — count them".

### Sample B — drawing a grid (annotate)
```java
public class Main {
    public static void main(String[] args) {
        for (int row = 0; row < 3; row++) {
            for (int col = 0; col < 3; col++) {
                System.out.print("[ ] ");
            }
            System.out.println();
        }
    }
}
```
**Verified output:**
```
[ ] [ ] [ ] 
[ ] [ ] [ ] 
[ ] [ ] [ ] 
```
**Annotate:** line 5 "`print`, not `println` — stay on this line"; line 7 "**outside** the
inner loop, **inside** the outer one: once per row"; "the empty parentheses mean 'just end
the line'".

### Sample C — the same code with the row terminator removed (annotate)
Show inside a `callout--pitfall`:
```java
public class Main {
    public static void main(String[] args) {
        for (int row = 0; row < 3; row++) {
            for (int col = 0; col < 3; col++) {
                System.out.print("[ ] ");
            }
        }
        System.out.println();
    }
}
```
**Verified output:**
```
[ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] 
```
**Annotate:** "all nine squares, one line. The loops ran correctly; only the *presentation*
broke."; "the `println()` moved outside both loops, so it ran once at the very end instead
of once per row."

### Sample D — a real kitchen grid, with Alice in it (annotate)
```java
public class Main {
    public static void main(String[] args) {
        final int ROWS = 5;
        final int COLS = 7;
        int aliceRow = 2;
        int aliceCol = 1;

        for (int row = 0; row < ROWS; row++) {
            for (int col = 0; col < COLS; col++) {
                if (row == aliceRow && col == aliceCol) {
                    System.out.print("[A]");
                } else {
                    System.out.print("[ ]");
                }
            }
            System.out.println();
        }
    }
}
```
**Verified output:**
```
[ ][ ][ ][ ][ ][ ][ ]
[ ][ ][ ][ ][ ][ ][ ]
[ ][A][ ][ ][ ][ ][ ]
[ ][ ][ ][ ][ ][ ][ ]
[ ][ ][ ][ ][ ][ ][ ]
```
**Annotate:** lines 3–4 "`final` so the size lives in exactly one place — change 5 to 8 and
everything below follows"; line 10 "the innermost body knows exactly which square it's on";
"Alice is at row 2, column 1 — which the project brief calls *the second square of the third
row*, counting from one".

### Sample E — the ChairBot's four motors (annotate)
```java
public class Main {
    public static void main(String[] args) {
        int passes = 0;
        for (int side = 1; side <= 2; side++) {
            for (int motor = 1; motor <= 2; motor++) {
                passes++;
                System.out.println("side " + side + " motor " + motor + "  (pass " + passes + ")");
            }
        }
        System.out.println("total motor commands: " + passes);
    }
}
```
**Verified output:**
```
side 1 motor 1  (pass 1)
side 1 motor 2  (pass 2)
side 2 motor 1  (pass 3)
side 2 motor 2  (pass 4)
total motor commands: 4
```
**Annotate:** "2 × 2 = 4, exactly as counted"; "`passes` is declared outside **both** loops
— it has to survive everything".

---

## SANDBOX

### Sandbox 1 — "Walk through it": move the line break
`data-title="Live Java Sandbox"`
```java
public class Main {
    public static void main(String[] args) {
        for (int row = 0; row < 3; row++) {
            for (int col = 0; col < 3; col++) {
                System.out.print("[ ] ");
            }
            System.out.println();
        }

        // Try it, undoing each change before the next:
        //  1. move the println() INSIDE the inner loop -- predict first
        //  2. move it OUTSIDE both loops
        //  3. change print to println on line 5
        //  4. change ROWS-equivalent 3 on line 3 to 5, and the inner 3 to 7
    }
}
```
**Verified output as shipped:** a 3 × 3 block of `[ ] `.
**Verified for step 1** (`println()` inside the inner loop): nine lines, each a single
`[ ] `.
**Verified for step 2** (outside both loops): one line of nine `[ ] `.
**Verified for step 3** (`println` instead of `print` on line 5): twelve lines — three lines
of a single `[ ] ` followed by one blank line, repeated three times. The blank lines are the
row terminators, now terminating an already-terminated line.
**Verified for step 4:** a 5 × 7 block — Alice's kitchen, empty.
**What the student changes:** the four moves above. The point to land: *the loops didn't
change at all. Where the line ending goes is the entire difference between a grid and a
column.*

### Sandbox 2 — "Build it": print the kitchen
`data-title="Project Sandbox"`
```java
public class Main {
    public static void main(String[] args) {
        // Draw Alice's 5 x 7 kitchen with four things in it.
        //
        // 1. Print a header row of column numbers 0..6.
        // 2. For each row: print "row N " then one symbol per square, then end the line.
        // 3. Symbols: A = Alice, F = fridge, S = sink, T = stove, . = empty floor.
        // 4. Finish with the total number of squares (ROWS * COLS).
        //
        // NOTE: the project brief says Alice is in "the second square of the third row".
        // People count from 1; Java counts from 0. That is row 2, column 1.

        final int ROWS = 5;
        final int COLS = 7;

        int aliceRow  = 2;  int aliceCol  = 1;
        int fridgeRow = 0;  int fridgeCol = 0;
        int sinkRow   = 0;  int sinkCol   = 6;
        int stoveRow  = 4;  int stoveCol  = 3;

        // TODO
    }
}
```
**Reference (author check, not shown on the page):**
```java
public class Main {
    public static void main(String[] args) {
        final int ROWS = 5;
        final int COLS = 7;

        int aliceRow  = 2;
        int aliceCol  = 1;
        int fridgeRow = 0;
        int fridgeCol = 0;
        int sinkRow   = 0;
        int sinkCol   = 6;
        int stoveRow  = 4;
        int stoveCol  = 3;

        System.out.print("      ");
        for (int col = 0; col < COLS; col++) {
            System.out.print(col + "  ");
        }
        System.out.println();

        for (int row = 0; row < ROWS; row++) {
            System.out.print("row " + row + " ");
            for (int col = 0; col < COLS; col++) {
                if (row == aliceRow && col == aliceCol) {
                    System.out.print("A  ");
                } else if (row == fridgeRow && col == fridgeCol) {
                    System.out.print("F  ");
                } else if (row == sinkRow && col == sinkCol) {
                    System.out.print("S  ");
                } else if (row == stoveRow && col == stoveCol) {
                    System.out.print("T  ");
                } else {
                    System.out.print(".  ");
                }
            }
            System.out.println();
        }

        System.out.println();
        System.out.println("squares: " + (ROWS * COLS));
    }
}
```
**Verified output:**
```
      0  1  2  3  4  5  6  
row 0 F  .  .  .  .  .  S  
row 1 .  .  .  .  .  .  .  
row 2 .  A  .  .  .  .  .  
row 3 .  .  .  .  .  .  .  
row 4 .  .  .  T  .  .  .  

squares: 35
```
**Target:** change `ROWS` to 8 and `COLS` to 4 and **everything** — the header, the grid,
the square count — follows without another edit. If anything needs a second edit, the size
is hard-coded somewhere it shouldn't be.

---

## CHALLENGES

### Challenge 1 — Predict the output  (`data-kind="text"`)
Prompt: "How many lines of output does this produce?"
```java
for (int row = 0; row < 4; row++) {
    for (int col = 0; col < 3; col++) {
        System.out.println(row + "," + col);
    }
}
```
**Answer key:** `data-answer="12"` — **verified.**
- `data-win`: "Right — 4 × 3. The inner loop runs completely for every single pass of the outer one."
- `data-lose`: "Twelve. The inner loop's 3 passes happen once for each of the outer loop's 4 passes, so you multiply: 4 × 3 = 12."

**Reveal explanation:** total passes through the innermost body is always outer × inner.
This is also the warning: nest a 1,000-loop inside a 1,000-loop and you have a million
passes.

### Challenge 2 — Predict the output  (`data-kind="text"`)
Prompt: "This prints exactly one line. Type it, using a space between squares."
```java
for (int row = 0; row < 2; row++) {
    for (int col = 0; col < 3; col++) {
        System.out.print("[ ] ");
    }
}
```
**Answer key:** `data-answer="[ ] [ ] [ ] [ ] [ ] [ ] "` — **verified**; accept also
`[ ] [ ] [ ] [ ] [ ] [ ]` without the trailing space.
- `data-win`: "Yes — six squares, all on one line, because nothing ever ends the line."
- `data-lose`: "Six `[ ] ` in a row on a single line. The loops are fine; there's simply no `System.out.println()` to break the rows apart."

### Challenge 3 — Fill in the blanks  (`data-kind="fib"`)
Prompt: "Complete the grid printer so it produces 5 rows of 7 squares."
```
for (int row = 0; row < ROWS; row++) {
    for (int col = 0; col < COLS; col++) {
        System.out.______("[ ]");
    }
    System.out.______();
}
```
Blanks: `data-answer="print"`, `data-answer="println"`
- `data-win`: "`print` builds the row across; `println()` with empty parentheses ends it, once per row."
- `data-lose`: "Inside the inner loop you want `print` so squares stay on one line. After the inner loop you want `println()` to end the row."

### Challenge 4 — Multiple choice  (`data-kind="mcq"`)
Prompt: "The grid prints as a single tall column — one square per line. What's wrong?"

| Option | Correct | `data-explain` |
|---|---|---|
| The loops are nested in the wrong order | | Swapping them would change *which* coordinate moves fastest, not how many lines appear. |
| `println` is being used where `print` should be | ✅ | Correct. `println` ends the line after every square, so no two squares can share a row. |
| `ROWS` and `COLS` are swapped | | That would change the shape from 5 × 7 to 7 × 5 — still a grid, not a column. |
| The `if` is inside the wrong loop | | The `if` decides *what* to draw, never *where the line ends*. |

### Challenge 5 — Multiple choice  (`data-kind="mcq"`)
Prompt: "The project brief says Alice is in 'the second square of the third row'. What are her Java indices?"

| Option | Correct | `data-explain` |
|---|---|---|
| `row = 3, col = 2` | | That's the human description copied straight into code — and it puts her one row down and one column right of where she belongs. |
| `row = 2, col = 1` | ✅ | Right. People count from 1; Java counts from 0. Third row → index 2, second square → index 1. |
| `row = 1, col = 2` | | Right numbers, wrong order. This course writes coordinates as (row, col). |
| `row = 2, col = 2` | | The row is right, but the *second* square is index 1, not 2. |

### Challenge 6 — Multiple choice  (`data-kind="mcq"`)
Prompt: "Why write `row` and `col` instead of `i` and `j`?"

| Option | Correct | `data-explain` |
|---|---|---|
| Java requires descriptive loop variables | | Java accepts any legal name, including single letters. |
| Because swapping `i` and `j` by accident is an invisible bug, and swapping `row` and `col` is an obvious one | ✅ | Exactly. In a grid, the two indices mean completely different things, and the compiler cannot tell you when you've mixed them up. The name is your only defence. |
| `i` and `j` are reserved words | | They aren't reserved; they're just uninformative. |
| Longer names run faster | | Identical machine code. This is entirely about the human reading it. |

---

## MISCONCEPTIONS

1. **"The two loops run at the same time."**
   → They don't. The inner loop finishes completely for every single pass of the outer one.
2. **"`println()` with nothing in it is an error."**
   → It's the standard way to end a row — it prints nothing and moves to the next line.
3. **"The line break goes at the end of the inner loop's body."**
   → Then it fires once per square. It belongs *after* the inner loop, inside the outer.
4. **"Nested loops are slow."**
   → They're multiplicative. 5 × 7 is nothing; 1,000 × 1,000 is a million. Know which one
   you've written.
5. **"`i` and `j` are what real programmers use."**
   → For a grid they're a bug waiting to happen. Reserve short names for loops where the
   variable genuinely has no meaning.
6. **"(3, 2) in the project brief means `[3][2]` in code."**
   → The brief counts from 1. Java counts from 0. That's `row = 2, col = 1`.

---

## EXERCISE

### Mini-project: Print the Kitchen
The capstone project's very first visible milestone is a method called `printKitchen`. You
don't have classes or arrays yet — but you already have everything you need to draw the
picture.

**Task:**
1. Declare `final int ROWS = 5;` and `final int COLS = 7;`.
2. Declare row/column pairs for Alice (2, 1), the fridge (0, 0), the sink (0, 6) and the
   stove (4, 3).
3. Print a header line of the column numbers `0`–`6`.
4. Nested loops: for each row print `row N `, then one symbol per square
   (`A`, `F`, `S`, `T`, or `.`), then end the line.
5. Print the total number of squares as `ROWS * COLS`.
6. **Bonus:** change `ROWS` and `COLS` to 8 and 4 and confirm the whole picture adapts with
   no other edit.

Starter code and **reference solution:** as Sandbox 2 above.
**Verified output:** as Sandbox 2.

Closing note for the reveal: *"Look at what you just wrote: five separate `int` pairs, and
a chain of `else if` that has to grow by two lines every time the kitchen gains an object.
That works for four objects. It will not work for twenty. The next unit gives you a
container that holds the whole grid in one variable — and `printKitchen` collapses back
down to the version in Sample B."*

---

## PHASE 2 FORESHADOWING
- This exact nested loop becomes `printKitchen()` in Unit J6, walking a 2D array instead of
  a pile of loose coordinates.
- `for each side, for each motor` is the ChairBot; in Phase 2 it becomes *for each of four
  swerve modules, for each of its two motors*.
- The `ROWS`/`COLS` `final` values are a preview of `Constants.java`: one place to change a
  number that the whole program depends on.
- Rendering a grid to the console is exactly what a **dashboard** does with robot state —
  turn numbers into a picture a human can read at a glance (U2).
