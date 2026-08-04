# frc-chain-of-command · The Chain of Command
unit: 3 · Project Anatomy   |   duration: 25 min   |   difficulty: Beginner
interactivity: NO-COMPILER (annotated hierarchy diagram + drag-to-order + "where does it go?" sorting + MCQ)

> Read `_shared-conventions.md` first. The source says this is **the most important conceptual
> lesson in the course** — everything from Unit 7 onward hangs on it. It is also the last
> lesson before the student writes robot code. Give it the weight.

INTRODUCES:
- `command-based-framework` — the structure the whole team's code follows
- `chain-of-command` — RobotContainer → Command → Subsystem → Motor
- `subsystem-role` — owns hardware; **the only place motors are touched**
- `command-role` — a unit of behaviour with a clear **end**
- `robotcontainer-role` — wires inputs to commands; holds autonomous
- `command-end-condition` — why "having an end" is the whole point
- `hardware-ownership` — one owner per mechanism, no exceptions

ASSUMES:
- `src-tree`, `subsystems-folder`, `commands-folder`, `robotcontainer-file` (`frc-src-tree`)
- `motor-vs-motor-controller` (`frc-motors`), `signal-path` (`frc-roborio-radio-can`)
- Java classes, methods, objects (Phase 1).
- **Not** `motor.set()` — that's the very next lesson. Refer to "telling a motor to spin"
  rather than showing the call.

GOAL:
Given any piece of robot behaviour, say which of the four layers it belongs in and why.

HOOK: **The flywheel** (`_shared-conventions.md` §6 story 11). `callout--why`.
A flywheel is a heavy spinning disc — high moment of inertia. It's hard to get started and,
once moving, it stays moving. You cannot shoot until it's up to speed, say 4000 RPM.

Now try to write that with nothing but "turn the motor on":
- Turn it on at full power to get there fast → you fry the motor (Unit 4's story).
- Turn it on gently → how do you know when to shoot? Something has to *wait* and *decide*.
- Turn it on and immediately run the feeder → you shoot into a wheel that isn't ready.

What's missing isn't a motor call. It's a **behaviour with an end**: run the flywheel *until*
it reaches 4000 RPM, and only then report finished, so the next step can begin. That's a
**Command**, and this is the reason command-based robots exist.

EXPLAIN:

1. **The four layers.** Lead with the diagram, straight from the source, and keep this exact
   wording everywhere in the track:

```
RobotContainer     binds a button press to…
      ↓
   Command         a unit of behaviour with a clear END; tells…
      ↓
  Subsystem        owns the hardware; calls…
      ↓
    Motor          finally spins
```
   Mark: [FROM PDF page 7, §3.2]

2. **Subsystems own hardware. Full stop.**
   The rule: **subsystems are the only place you actually touch motors.**
   Analogy: a subsystem is a department with a locked equipment cupboard. Everyone else *asks*
   the department; nobody walks in and takes a drill.
   Why the rule exists — give the concrete failure, don't just assert it: if two different
   pieces of code can command the arm motor directly, then an "arm up" behaviour and an "arm to
   stow" behaviour can fight each other, 50 times a second, and the arm judders in place while
   both are technically working correctly. One owner means there is always exactly one answer
   to "what is the arm doing?"
   Beat: the subsystem exposes *verbs* — `runRoller(speed)`, `stop()`, `goToScore()` — not the
   motor object. From the intro notes: variables (motors) at the top, methods at the bottom.

3. **Commands have an end. That's their defining feature.**
   Analogy: a subsystem method is "push the button." A command is "hold the button until the
   light comes on, then let go, and tell me when you're done."
   Why an end matters: because it lets you **sequence**. "Arm up, *then* outtake, *then* arm
   down" is only expressible if each step can say when it's finished. A method call can't; it
   returns immediately, and 20 ms later the loop runs again.
   Beat: introduce the four lifecycle pieces **by name only** as a forward reference —
   `initialize`, `execute`, `isFinished`, `end`. One line: "Unit 7 makes these real." Do not
   teach them here. The temptation to teach them now is the main risk to this lesson's length.

4. **RobotContainer wires it together.**
   Analogy: the fuse box / patch panel. Nothing happens *in* it; everything is *connected*
   there. Buttons in, commands out, plus the autonomous setup.
   Beat: it also *owns the instances*. One `ArmSubsystem` object exists, created in
   `RobotContainer`, and every command that needs the arm gets handed that same object. From the
   intro notes: you can't call subsystem methods off the class name — they aren't static; you
   need an instance. (Link to Phase 1's `j-static-vs-instance`; don't re-teach it.)

5. **Trace a real press end to end.** This is the payoff and it comes straight from the intro
   notes' §9. Number it, because the student will re-read it:

```
1. The driver presses the cross button.
2. RobotContainer has bound that button to a command.
3. The command starts. Every 20 ms it does its job and is asked "are you finished?"
4. The command calls a method on the Intake subsystem: runRoller(0.7).
5. The subsystem — the only code that owns the motor — tells the motor to spin at 0.7.
6. The roller spins, and keeps spinning at that speed until something changes it.
```
   Mark: [FROM INTRO NOTES page 7, §9 "Full Signal Flow"]
   Then connect it to Unit 1: step 5 hands off to the *hardware* signal path
   (RIO → CAN → SparkMax → Neo → spin). **Two chains, joined end to end** — software chain of
   command, then hardware signal path. Draw them as one continuous diagram. That single image
   is the best thing this lesson can give a student, and nothing later in the course replaces it.

6. **When you can skip layers — be honest.**
   From the intro notes: for a simple project you **don't need commands at all**. A subsystem
   plus a button binding that calls a subsystem method covers a lot of ground, and that is
   exactly what the ChairBot did.
   The rule of thumb to teach:
   - Behaviour is instantaneous ("set the roller to 0.7") → a subsystem method, bound directly.
   - Behaviour takes time and must *finish* ("get to 4000 RPM", "raise the arm to the setpoint")
     → a command.
   Saying this makes the framework feel like a tool rather than a ritual, and it sets up
   `InstantCommand` in Unit 8 as the bridge between the two cases.

CODE:
**No runnable samples.** Structural sketches only, comment-only bodies, so nothing here can be
mistaken for verified API:
```java
// SHAPE ONLY — Unit 7 writes the real versions.

// subsystems/IntakeSubsystem.java  — owns the motor
//   motor object at the top
//   runRoller(double speed) { ... }   ← the only code that touches the motor
//   stop()                  { ... }

// commands/SpinUpFlywheel.java     — behaviour with an end
//   initialize()  once at the start
//   execute()     every 20 ms
//   isFinished()  true when the flywheel reaches 4000 RPM
//   end()         once when it stops

// RobotContainer.java              — wiring
//   one IntakeSubsystem instance
//   cross button  →  the command
```
Author instruction: keep these as comments, not compilable code. If a student copies this, it
should obviously be a sketch.

SANDBOX: none — NO-COMPILER lesson. The scheduler *is* observable, and the student will watch
it run for real in `frc-command-lifecycle` (Unit 7) on PenguinSim. Say that here, explicitly:
"In Unit 7 you'll watch this run, tick by tick, and see the order it happens in." Promising
the payoff is better than faking it now.

Interactive load: the joined software-chain + hardware-path diagram (annotated, author-drawn),
plus challenges 1–3.

CHALLENGES:

1. **Sorting / "where does it go?"** — implemented as four MCQs or as drag-to-order into three
   buckets if the widget supports it. Each item goes to Subsystem / Command / RobotContainer:
   - "A `SparkMax` object for the arm motor" → **Subsystem** — "Subsystems own hardware; the
     motor object is declared at the top of the subsystem."
   - "`whenever the cross button is pressed, run the intake`" → **RobotContainer** — "Bindings
     live in `RobotContainer`; that's its whole job."
   - "`return flywheelRPM >= 4000;`" → **Command** — "That's an end condition, which only a
     command has."
   - "`public void runRoller(double speed)`" → **Subsystem** — "A verb the subsystem exposes so
     nobody else has to touch the motor."

2. **Drag-to-order · the press.** Items (shuffled): *The roller spins* · *The driver presses
   cross* · *The subsystem tells the motor to run at 0.7* · *RobotContainer's binding starts the
   command* · *The command calls `runRoller(0.7)`*.
   **Answer key:** presses cross → binding starts the command → command calls `runRoller(0.7)` →
   subsystem tells the motor → roller spins.
   Win: "Five steps, every time. Memorise this and half of Unit 8 is already done."
   Lose: "Button → RobotContainer's binding → the command → the subsystem's method → the motor.
   Nothing skips a layer."
   *Fallback: MCQ over three orderings.*

3. **MCQ · why commands need an end** — "Why does a Command have an `isFinished` at all?"
   - a) So it doesn't crash — "Nothing crashes from running; the loop just keeps going."
   - b) ✓ **So behaviours can be sequenced — "arm up, *then* outtake" needs each step to say when
     it's done** — "Exactly. That's the whole reason the framework exists."
   - c) To save battery — "Not a factor here."
   - d) Because Java requires it — "Java requires nothing of the sort; it's a framework design."

4. **MCQ · the ownership rule** — "Two different commands both write directly to the arm motor,
   each every 20 ms. What happens?"
   - a) The second one wins permanently — "Neither wins; they alternate."
   - b) ✓ **They fight, and the arm judders — with no error, because both are 'working'** —
     "Right, and that's why one subsystem owns the hardware and everything else asks it."
   - c) The code won't compile — "It compiles fine. That's what makes it dangerous."
   - d) The CAN bus times out — "Nothing is wrong with the bus; the commands just disagree."

MISCONCEPTIONS:
- *"Commands and subsystems are basically the same thing."*
  → "A subsystem is a *noun* that owns hardware; a command is a *verb* that has an end. One
  arm, many things you can ask it to do."
- *"I can just call the motor from RobotContainer — it's shorter."*
  → "It works right up until two pieces of code want the arm at once, and then it fails in a way
  that produces no error at all."
- *"Every behaviour needs a command class."*
  → "No. Instantaneous behaviour can bind straight to a subsystem method — the ChairBot never
  used a single command. Commands earn their place when behaviour takes time and must finish."
- *"`execute()` is the subsystem's `periodic()`."*
  → "Two different methods on the same 20 ms loop: `periodic()` belongs to the subsystem and
  always runs; `execute()` belongs to a command and runs only while that command is scheduled."
- *"RobotContainer runs the robot."*
  → "It *wires* the robot. It runs once at startup to set up connections, and then it mostly
  sits there."

EXERCISE: **Design PenguinBot's layers (on paper).**
*Where we are:* you have the project map (`frc-src-tree`). Next lesson you write your first real
motor code — so decide now where each piece of PenguinBot's scoring behaviour belongs.

Task: PenguinBot must do this when the driver presses one button: **raise the arm to the scoring
position, then spit the game piece out, then lower the arm back to stowed.** Write out, for each
of the three layers, exactly what you'd put there — class names and method names, no bodies.
Then answer: which of the three steps *needs* to be a command rather than a direct method call,
and why?

**Reference solution** (`details.reveal`):
> **Subsystems** — own the hardware, expose verbs:
> - `IntakeSubsystem` : `runRoller(double speed)`, `outtake()`, `stop()`  *(motor on CAN ID 2)*
> - `ArmSubsystem` : `setSpeed(double)`, `getPosition()`, `goToScore()`, `stop()`
>   *(motor on CAN ID 3)*
>
> **Commands** — behaviour with an end:
> - `ArmToScoreCommand` — runs until the arm reaches the scoring setpoint, then finishes
> - `ArmToStowCommand` — the same, back to stowed
> - `ScoreSequence` — `ArmToScoreCommand` → outtake → `ArmToStowCommand`, in order
>
> **RobotContainer** — wiring:
> - one `IntakeSubsystem`, one `ArmSubsystem` instance
> - `driver.cross()` → `ScoreSequence`
>
> **Which step needs to be a command?** Both arm moves. Raising the arm takes *time* — the
> motor has to run for many 20 ms cycles and stop at the right place — so something must decide
> when it has arrived and report finished. "Spit the piece out" is instantaneous: set the roller
> and move on, which is a direct subsystem call (in Unit 8 you'll wrap it in an
> `InstantCommand` so it can sit in a sequence).
>
> And the reason it *must* be a sequence: if you fired all three at once, you'd outtake into the
> floor while the arm was still moving.

Tease: "That's the design. Next lesson you write the bottom layer for real — the line that makes
a motor spin."

CHECKPOINT: (5 questions, every option explained)

**Q1.** Which layer is the only one allowed to touch a motor?
- a) RobotContainer — "It wires things; it doesn't drive hardware."
- b) Command — "Commands ask subsystems. They don't hold motor objects."
- c) ✓ **Subsystem** — "Correct — one owner per mechanism, which is what prevents two
  behaviours fighting."
- d) `Robot.java` — "That's mode lifecycle."

**Q2.** What makes a Command different from a subsystem method?
- a) It's faster — "Speed isn't the distinction; both run on the same loop."
- b) ✓ **It has a defined end, so it can be sequenced** — "Yes — that's its defining feature."
- c) It can touch motors directly — "It shouldn't; that's the subsystem's job."
- d) It runs only in autonomous — "Commands run in teleop too — most of them do."

**Q3.** Where do button bindings live?
- a) In the subsystem — "Subsystems don't know a controller exists."
- b) In the command — "Commands don't know what started them."
- c) ✓ **In `RobotContainer`** — "Right — inputs in, commands out. That's the file's purpose."
- d) In `Constants.java` — "The controller *port number* might live there; the binding doesn't."

**Q4.** The flywheel example — why can't "spin up the flywheel" just be a method call?
- a) Methods can't set motors — "They can, and do."
- b) ✓ **A method returns immediately; something needs to keep checking and report when 4000 RPM
  is reached** — "Exactly — that check-and-report is what a command adds."
- c) Flywheels need PID — "They usually do, but that's Unit 6 and a separate concern."
- d) The motor would be damaged — "Only if you set it too high, which is a different problem."

**Q5.** Is it ever acceptable to have no commands at all?
- a) Never — "The team's own ChairBot had none."
- b) ✓ **Yes — for simple, instantaneous behaviour, a subsystem method bound to a button is
  enough** — "Correct, and the intro notes say so directly. Commands earn their place when
  behaviour takes time."
- c) Only in autonomous — "Autonomous is the case that needs commands *most*."
- d) Only if you have one motor — "Motor count isn't the deciding factor; whether behaviour has
  duration is."

SEASON-FLAGS:
- The chain of command is a **framework design**, not an API, so it's stable. Minimal flagging.
- One `callout--season` on the forward reference to lifecycle method names — those are real
  WPILib method names (`initialize`, `execute`, `isFinished`, `end`) and stable, but flag with
  "verify against the current season's WPILib command-based docs" since the whole track does.
- Do **not** flag the diagram or the layer rules; they haven't changed in a decade.

WIDGET-REQUEST: none. Uses drag-to-order (in-flight) and MCQs, with fallbacks stated. The
joined software-chain + hardware-path diagram is an author-drawn static `.diagram` block — and
it should be the most carefully made graphic in Unit 3.
