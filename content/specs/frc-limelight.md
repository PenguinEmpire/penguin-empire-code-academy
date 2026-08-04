# frc-limelight · Limelight & AprilTags
unit: 10 · Seeing   |   duration: 25 min   |   difficulty: Advanced
interactivity: NO-COMPILER (**TX/TY AprilTag visualizer** widget — this is its home lesson)

> Read `_shared-conventions.md` first, and **check `content/research/vision-pathplanner.md`**
> before finalising any API name. Two source corrections apply here (§5 of the conventions file):
> spell it **AprilTag**, and **do not attribute the Limelight to any company or team** — the
> source's attribution is unverified.

INTRODUCES:
- `limelight` — a smart camera that finds AprilTags and reports angles to them
- `apriltag` — a fiducial marker; a QR-code-like square placed around the field
- `fiducial-id` — which tag you're looking at
- `tx` — horizontal angle to the tag
- `ty` — vertical angle to the tag
- `limelight-config` — configured over the network; re-tuned per venue
- `pipeline` — a saved vision configuration you switch between
- `limelight-subsystem-wrapper` — the team's best practice: wrap it in your own subsystem

ASSUMES:
- `subsystembase`, `subsystem-periodic` (`frc-subsystems`)
- `field-centric`, `gyro-heading` (`frc-swerve-concept`)
- `dashboard`, `networktables` (`frc-dashboards`)
- `error`, `setpoint` (`frc-pid-concept`) — TX is about to become an error term
- `constants-file-pattern` (`frc-constants`)

GOAL:
Explain what a Limelight reports and how TX, TY and the tag ID each turn into something a robot
can act on.

HOOK: **Re-tune it for every venue** (`_shared-conventions.md` §6 story 17). `callout--why`.
The Limelight is configured through a web page — brightness, exposure, and how it decides what
counts as a target. The source's instruction is unambiguous: **re-tune before every competition,
for that venue's lighting.**

Think about what that implies. A gym with skylights at 10 a.m. is a different optical environment
from the same gym under floodlights at 8 p.m., and both are different from your workshop. Your
vision code doesn't change. Your robot doesn't change. But a camera tuned for a dim workshop can
be blind in a bright arena — and the failure looks exactly like broken code.

Add it to the game-day checklist you started in `frc-game-tools`. It's one of the few programming
tasks that has to be done **at the venue**, and it takes fifteen minutes you won't have if you
haven't planned for it.

EXPLAIN:

1. **What an AprilTag is.** A flat, printed, square marker — visually a bit like a chunky QR code
   — with a number encoded in its pattern. The field has them in known, published positions.
   Analogy: a **street sign a robot can read**. It doesn't say much; it says exactly enough:
   *this is sign number 7, and you're looking at it from this angle.*
   Spelling note for the author: **AprilTag**, one word, capital A and T. The source writes "April
   Tag"; standardise to AprilTag throughout the track.
   `[NEEDS RESEARCH: how many tags and which layout for the 2026 game — this is game-specific and
   changes annually. Do not state a count. content/research/vision-pathplanner.md]`

2. **What a Limelight is and does.** A camera with a processor inside. It doesn't hand your robot
   images — it does the vision work on-camera and publishes **numbers**: is there a target, what
   angle is it at, which tag is it.
   Why that matters: the RoboRIO never processes an image, so your 20 ms loop stays fast. You get
   a handful of doubles and act on them.
   Attribution warning: the source names a team as the maker. **Do not repeat it.** Say "a smart
   camera used widely across FRC" and move on.

3. **The three readings.** Reproduce the source's table — this is the core of the lesson:

| Reading | Geometry | What you do with it |
|---|---|---|
| **TX** | Horizontal angle to the tag (overhead view) | PID until TX → 0 to **aim** at the target |
| **TY** | Vertical angle to the tag (side view) | Changes with distance → PID your **range** |
| **ID** | Which AprilTag you're seeing | Choose which tags to act on and which to ignore |

   Mark: [FROM PDF page 15, §10.2 table]
   Analogy for TX: **point at it with your nose.** If the tag is 12° to your right, TX is 12. Turn
   right until it's 0 and you're facing it.
   Analogy for TY: **a tall thing looks higher up when you're close.** TY doesn't measure distance
   directly, but it *changes with* distance, which is enough to control on.

4. **The idea that makes Unit 10 work: TX is already an error.**
   Stop and make this explicit, because it's the unit's whole payoff. In Unit 6 you built
   controllers around `error = setpoint − current`. Here the setpoint is **0** (facing the tag),
   and the Limelight hands you the error **directly**. No subtraction, no encoder, no conversion:
   TX *is* the number you feed to a PID controller.
   The source says it plainly: *this unit is where PID (Unit 6) and swerve (Unit 9) pay off:
   vision gives the error, PID drives it to zero.* Next lesson writes that code.

5. **Wrap it in your own subsystem.** The source's stated best practice: Limelight provides a
   **helper file** — a collection of static methods — rather than a class you instantiate. Don't
   scatter calls to it through your codebase. Write a `LimelightSubsystem` exposing readable
   methods.
   Mark: [FROM PDF page 15, §10.2 — "wrap these in your own Limelight subsystem with readable
   method names"]
   Three concrete reasons, worth listing:
   - Your commands read `limelight.getAngleToTag()`, not a static call with a string argument.
   - When the vendor's API changes between seasons, **one file** changes.
   - You can add the safety logic in one place: "is there even a target?" (see beat 6).

6. **The reading that isn't there.** The most important practical point on the page, and neither
   source states it, so state it as reasoning:
   **What does TX read when no tag is visible?** Usually 0 — which is indistinguishable from
   *perfectly aimed*. A robot that trusts TX blindly will decide it's aligned the moment the tag
   leaves the frame, and stop turning.
   So every vision subsystem needs a `hasTarget()` check, and every vision command must ask it
   before acting. `frc-vision-pid` builds exactly that.
   `[NEEDS RESEARCH: the actual "has target" reading (tv?) and its type, plus what TX returns with
   no target, for the current Limelight software — content/research/vision-pathplanner.md]`

7. **Pipelines and configuration.** Configured over the network via the Limelight's own web page:
   exposure, brightness, and which detection mode is active. A **pipeline** is a saved
   configuration you can switch between (one tuned for AprilTags, one for something else). Name
   it, one paragraph.
   `[NEEDS RESEARCH: the current configuration address/host name and whether "limelight.local"
   remains correct; the current pipeline-switching API — content/research/vision-pathplanner.md.
   The source says limelight.local; treat as season-flagged.]`

CODE:
**Show at most the three readings, and only if cited.** The source names `getTX`, `getTY`,
`getFiducialID` on a helper called `LimelightHelpers`, but does not give signatures — and these
methods take a Limelight *name* argument in practice.
`[NEEDS RESEARCH: exact LimelightHelpers method signatures for the current Limelight software —
do these take a String name? Is there a NetworkTables-only alternative worth showing? —
content/research/vision-pathplanner.md]`

Until cited, show only the **wrapper shape**, with the vendor calls as comments:
```java
import edu.wpi.first.wpilibj2.command.SubsystemBase;

public class LimelightSubsystem extends SubsystemBase {

    // Readable names for the rest of the robot. The vendor calls live HERE and
    // nowhere else, so a season's API change touches one file.

    public double getAngleToTag() {
        // return LimelightHelpers.getTX(...);   <-- see the season callout
        return 0.0;
    }

    public double getVerticalAngleToTag() {
        // return LimelightHelpers.getTY(...);
        return 0.0;
    }

    public int getTagId() {
        // return (int) LimelightHelpers.getFiducialID(...);
        return -1;
    }

    public boolean hasTarget() {
        // Critical: TX reads 0 with no target, which looks exactly like "aimed".
        return false;
    }
}
```
Annotate: the method *names* are the deliverable — `getAngleToTag()` says what it means where
`getTX()` doesn't; the commented vendor calls are where the season flag lives; `hasTarget()` is
the guard everything else depends on.
If the factsheet lands before authoring, fill the bodies in with cited calls inside a
`callout--verified` **and** a `callout--season`.

SANDBOX: none — NO-COMPILER lesson. There is no camera, and faking image processing would teach
nothing true. The *next* lesson puts a documented stand-in Limelight in a sandbox so the control
loop can be real; say so here.

Interactive load: the **TX/TY AprilTag visualizer** (plan §6, U10 — this is its home).
Required behaviours:
- A top-down field view with the robot and a draggable AprilTag.
- Live readout of **TX**, **TY** and **ID** as the tag is dragged.
- Rotating the robot changes TX; moving the tag closer/further changes TY.
- A second tag with a different ID, so the student sees ID used to choose a target.
- **A "tag out of frame" state** where `hasTarget` goes false and TX reads 0 — the beat-6 hazard,
  made visible. This is the single most valuable state in the widget.
*Fallback:* three static annotated diagrams (tag left → TX negative or positive as documented; tag
centred → TX ≈ 0; tag out of frame → TX also 0, `hasTarget` false) plus challenges 1 and 4.

CHALLENGES:

1. **MCQ · what TX means** — "The Limelight reports TX = 12. What do you know?"
   - a) The tag is 12 metres away — "TX is an angle, not a distance."
   - b) ✓ **The tag is 12° off-centre horizontally, so the robot isn't facing it** — "Right, and
     driving that to 0 is how you aim."
   - c) You're looking at tag number 12 — "That's the fiducial ID, a separate reading."
   - d) The camera is 12 % bright — "Brightness is a configuration setting, not a reading."

2. **MCQ · which reading?** — "You want the robot to stop at a consistent distance from the goal.
   Which reading?"
   - a) TX — "TX tells you *which way*, not how far."
   - b) ✓ **TY** — "Yes — the vertical angle changes with distance, so you can control on it."
   - c) ID — "That only tells you which tag you're seeing."
   - d) The encoder — "Encoders measure your own wheels; they don't know where the goal is."

3. **MCQ · the wrapper** — "Why wrap `LimelightHelpers` in your own subsystem?"
   - a) It runs faster — "No performance difference."
   - b) ✓ **Readable method names, one place to change when the vendor API shifts, and one place
     for the has-target guard** — "Exactly the source's stated best practice, plus the reason
     that matters most in February."
   - c) It's required by WPILib — "Nothing requires it."
   - d) Helpers can't be called from commands — "They can; it's just a worse design."

4. **Predict / short answer** — "The tag goes out of the camera's view and TX reads 0. Your aiming
   code drives TX to 0. What does the robot do?"
   `data-answer="stops|it stops|stops turning|thinks its aimed|thinks it's aimed|nothing|stops moving"`
   Win: "It stops, believing it's perfectly aimed. That's why `hasTarget()` has to be checked
   before you trust any reading."
   Lose: "It stops turning, because 0 means 'aimed'. A missing target and a perfect alignment
   produce the same number — check `hasTarget()` first, every time."

5. **MCQ · game day** — "You arrive at a competition venue with vision that worked all week in the
   workshop. What's on your checklist?"
   - a) Nothing — the code is the same — "The code is; the lighting isn't."
   - b) ✓ **Re-tune the Limelight for this venue's lighting** — "Yes — the source says to do this
     before every competition, and a mis-tuned camera looks exactly like broken code."
   - c) Reinstall the vendor library — "Libraries don't change at a venue."
   - d) Re-tune the arm's PID — "Mechanical gains don't change with the lighting."

MISCONCEPTIONS:
- *"The Limelight sends video to the robot."*
  → "It processes on-camera and publishes numbers. Your RoboRIO never touches an image, which is
  why your loop stays fast."
- *"TX is a distance."*
  → "TX and TY are both **angles**. TY changes with distance, which is how you use it for range,
  but neither is a measured distance."
- *"TX = 0 means the target is centred."*
  → "Or that there is no target at all. Check `hasTarget()` before you believe it."
- *"AprilTags are QR codes."*
  → "Similar idea, different system. A tag carries an ID, not a URL, and the field's tag positions
  are published so the robot can locate itself."
- *"Once configured, the Limelight is set."*
  → "Re-tune for every venue's lighting. It's on the game-day checklist."
- *"I'll call `LimelightHelpers` directly from my commands."*
  → "Then next season's API change touches every command instead of one subsystem."

EXERCISE: **PenguinBot gets eyes.**
*Where we are:* PenguinBot can score from one button and drive field-centrically. It has no idea
where the goal is.

Task: design and write `LimelightSubsystem`.
1. `extends SubsystemBase`.
2. Readable methods: `getAngleToTag()`, `getVerticalAngleToTag()`, `getTagId()`, `hasTarget()`.
3. `isTargetValid()` — true only if there's a target **and** its ID is one PenguinBot should act
   on. Put the acceptable IDs in `Constants` as a `VisionConstants` block.
4. `periodic()` publishes TX, TY, ID and `hasTarget` so you can see them on a dashboard while
   debugging.
5. Leave the vendor calls **commented**, with a note naming which factsheet fills them in.
6. Write the two sentences you'd put in the game-day checklist about this camera.

**Full reference solution** (`details.reveal`):
```java
// Constants.java -- new block
public static final class VisionConstants {
    public static final String kLimelightName   = "limelight";
    public static final double kAimToleranceDeg = 1.0;      // used next lesson
    public static final int[]  kScoringTagIds   = { 7, 8 }; // VERIFY FOR THIS SEASON'S GAME
}
```
```java
// subsystems/LimelightSubsystem.java
import edu.wpi.first.wpilibj2.command.SubsystemBase;
import static frc.robot.Constants.VisionConstants;

public class LimelightSubsystem extends SubsystemBase {

    // ---- readings -------------------------------------------------------
    // The vendor calls live ONLY in this file. When the API changes between
    // seasons, this is the only file that changes.
    // See content/research/vision-pathplanner.md for the verified calls.

    public double getAngleToTag() {
        // return LimelightHelpers.getTX(VisionConstants.kLimelightName);
        return 0.0;
    }

    public double getVerticalAngleToTag() {
        // return LimelightHelpers.getTY(VisionConstants.kLimelightName);
        return 0.0;
    }

    public int getTagId() {
        // return (int) LimelightHelpers.getFiducialID(VisionConstants.kLimelightName);
        return -1;
    }

    public boolean hasTarget() {
        // TX reads 0 with no target -- identical to "perfectly aimed".
        // Nothing may trust a reading without checking this first.
        return false;
    }

    // ---- the guard everything else uses ---------------------------------
    public boolean isTargetValid() {
        if (!hasTarget()) return false;
        int id = getTagId();
        for (int allowed : VisionConstants.kScoringTagIds) {
            if (id == allowed) return true;
        }
        return false;      // a real tag, but not one we should aim at
    }

    @Override
    public void periodic() {
        // Publish for debugging. Vision problems are invisible without this.
        System.out.printf("limelight: tx %.2f  ty %.2f  id %d  target %b%n",
                          getAngleToTag(), getVerticalAngleToTag(),
                          getTagId(), hasTarget());
    }
}
```
> **Game-day checklist lines:**
> 1. *Re-tune the Limelight for this venue's lighting before the first match — brightness and
>    exposure, at the field if we can get access.*
> 2. *Confirm the tag IDs in `VisionConstants.kScoringTagIds` match this game's field layout, and
>    watch the published `id` on the dashboard during a practice match to make sure we're seeing
>    the tags we think we are.*

Solution notes for the author:
- `isTargetValid()` combining "is there a target" with "is it one of ours" is the method every
  command should call. Aiming at the wrong alliance's tag is a real and embarrassing failure.
- `kScoringTagIds` carries an explicit **verify for this season** comment because tag layouts are
  game-specific. That comment is doing real work.
- The commented vendor calls are not a placeholder for laziness — they're the honest state of the
  lesson until the factsheet lands, and the structure teaches the wrapper pattern regardless.

Tease: "TX is an error, and you know exactly what to do with an error. Next lesson: PID it to
zero, and PenguinBot aims itself."

CHECKPOINT: (5 questions, every option explained)

**Q1.** What does a Limelight send to the RoboRIO?
- a) A video stream to process — "It processes on-camera; the RIO would never keep up."
- b) ✓ **Numbers — angles to the target, the tag's ID, whether there's a target at all** — "Right,
  a handful of doubles, which is why it's cheap for your loop."
- c) Motor commands — "It has no idea your robot has motors."
- d) A field map — "The field layout is published data, not something the camera sends."

**Q2.** TX tells you…
- a) How far away the tag is — "That's closer to TY's job, and even then only indirectly."
- b) ✓ **The horizontal angle to the tag** — "Yes — drive it to 0 and you're facing the target."
- c) Which tag it is — "That's the fiducial ID."
- d) The camera's exposure — "A configuration setting, not a reading."

**Q3.** Why does the source recommend wrapping the Limelight helper in your own subsystem?
- a) The helper doesn't work otherwise — "It works fine; the wrapper is about design."
- b) ✓ **Readable names, a single place to absorb API changes, and one home for the has-target
  guard** — "Exactly, and the second reason is the one that saves a February afternoon."
- c) Subsystems are faster — "No performance difference."
- d) So it appears on the dashboard — "Publishing is something you choose to do, not a
  consequence."

**Q4.** TX reads 0.0. What can you conclude?
- a) You're perfectly aimed — "Or there's no target at all."
- b) There's no target — "Or you're perfectly aimed."
- c) ✓ **Nothing, until you check `hasTarget()`** — "Correct. Two very different situations, one
  number."
- d) The camera is broken — "Both of the above are normal states."

**Q5.** What has to be done at the competition venue?
- a) Reinstall the vendor library — "That's done long before."
- b) ✓ **Re-tune the camera for the venue's lighting** — "Yes — the source says before every
  competition, and it needs to be on the checklist."
- c) Re-measure the robot — "Dimensions don't change at a venue."
- d) Nothing — "The lighting is different, and your camera cares."

SEASON-FLAGS: **Heavy — this and `frc-swerve-generators` are the two most volatile lessons.**
- `callout--season` on: every API name, the configuration address (`limelight.local`), pipeline
  handling, and **all AprilTag IDs and field layouts** (game-specific, changes annually).
- `[NEEDS RESEARCH: LimelightHelpers method signatures; the has-target reading; the current
  configuration host; pipeline switching; 2026 field tag layout —
  content/research/vision-pathplanner.md]`
- `[NEEDS RESEARCH: whether a NetworkTables-direct read is worth teaching as a
  vendor-independent alternative]`
- Do not attribute the Limelight to any company or team (conventions §5).
- **AprilTag**, one word — apply track-wide.

WIDGET-REQUEST: none new — the **TX/TY visualizer** is already scoped in plan §6 for Unit 10.
Required behaviours listed under SANDBOX, including the "tag out of frame, TX still 0" state,
which is the most valuable thing it can show. Static-diagram fallback specified.
