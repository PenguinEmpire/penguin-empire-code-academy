/* ============================================================================
   course.js · single source of truth for the whole curriculum.
   Drives the sidebar, the syllabus page, progress tracking, and prev/next.
   Set ready:true once a lesson page is built; others render as "coming soon".
   ============================================================================ */
window.COURSE = {
  meta: {
    team: "Penguin Empire Robotics 2551",
    storageKey: "pe2551.progress.v1",
  },
  tracks: [
    {
      id: "java",
      tag: "Phase 1",
      label: "Java & Object-Oriented Programming",
      blurb: "Start from zero. By the end you can read and write real Java — the language FRC robots are programmed in.",
      icon: "java",
      units: [
        {
          id: "j1", num: "J1", title: "Getting Started",
          sub: "What code is, and how to make the computer do things.",
          lessons: [
            { id: "j-what-is-programming", t: "What Programming Really Is", ready: true, href: "/lessons/java/what-is-programming", dur: "15 min", diff: "Beginner" },
            { id: "j-first-program", t: "Your First Java Program", ready: true, href: "/lessons/java/first-program", dur: "20 min", diff: "Beginner" },
            { id: "j-variables", t: "Variables & Data Types", ready: true, href: "/lessons/java/variables", dur: "20 min", diff: "Beginner" },
            { id: "j-operators", t: "Operators & Expressions", ready: true, href: "/lessons/java/operators", dur: "20 min", diff: "Beginner" },
            { id: "j-strings", t: "Working with Text (Strings)", ready: true, href: "/lessons/java/strings", dur: "25 min", diff: "Beginner" },
            { id: "j-debugging", t: "Reading Errors & Debugging", ready: true, href: "/lessons/java/debugging", dur: "25 min", diff: "Beginner" },
          ],
        },
        {
          id: "j2", num: "J2", title: "Logic & Flow",
          sub: "Making decisions and repeating work.",
          lessons: [
            { id: "j-booleans", t: "Booleans & Comparisons", ready: true, href: "/lessons/java/booleans", dur: "15 min", diff: "Beginner" },
            { id: "j-if-else", t: "if / else Decisions", ready: true, href: "/lessons/java/if-else", dur: "20 min", diff: "Beginner" },
            { id: "j-switch", t: "switch Statements", ready: true, href: "/lessons/java/switch", dur: "15 min", diff: "Beginner" },
            { id: "j-loops", t: "Loops: while & for", ready: true, href: "/lessons/java/loops", dur: "20 min", diff: "Beginner" },
            { id: "j-nested-loops", t: "Nested Loops & Patterns", ready: true, href: "/lessons/java/nested-loops", dur: "20 min", diff: "Beginner" },
          ],
        },
        {
          id: "j3", num: "J3", title: "Methods",
          sub: "Packaging logic into reusable, named blocks.",
          lessons: [
            { id: "j-methods", t: "Writing Methods", ready: true, href: "/lessons/java/methods", dur: "20 min", diff: "Beginner" },
            { id: "j-params-return", t: "Parameters & Return Values", ready: true, href: "/lessons/java/params-return", dur: "25 min", diff: "Beginner" },
            { id: "j-scope", t: "Scope & the Call Stack", ready: true, href: "/lessons/java/scope", dur: "20 min", diff: "Beginner" },
            { id: "j-overloading", t: "Method Overloading", ready: true, href: "/lessons/java/overloading", dur: "15 min", diff: "Beginner" },
          ],
        },
        {
          id: "j4", num: "J4", title: "Data Structures",
          sub: "Storing many values at once — the backbone of the kitchen project.",
          lessons: [
            { id: "j-arrays", t: "Arrays (1D)", ready: true, href: "/lessons/java/arrays", dur: "25 min", diff: "Beginner" },
            { id: "j-2d-arrays", t: "2D Arrays (Grids)", ready: true, href: "/lessons/java/2d-arrays", dur: "25 min", diff: "Beginner" },
            { id: "j-arraylist", t: "ArrayList & Collections", ready: true, href: "/lessons/java/arraylist", dur: "20 min", diff: "Beginner" },
            { id: "j-exceptions-null", t: "Exceptions & the Null Trap", ready: true, href: "/lessons/java/exceptions-null", dur: "25 min", diff: "Beginner" },
          ],
        },
        {
          id: "j5", num: "J5", title: "Object-Oriented Programming",
          sub: "The big one — modeling the world as objects. This is how WPILib is built.",
          lessons: [
            { id: "j-classes-objects", t: "Classes & Objects", ready: true, href: "/lessons/java/classes-objects", dur: "25 min", diff: "Intermediate" },
            { id: "j-fields-constructors", t: "Fields, Constructors & this", ready: true, href: "/lessons/java/fields-constructors", dur: "25 min", diff: "Intermediate" },
            { id: "j-instance-methods", t: "Methods That Act on Objects", ready: true, href: "/lessons/java/instance-methods", dur: "20 min", diff: "Intermediate" },
            { id: "j-static-vs-instance", t: "static vs. Instance", ready: true, href: "/lessons/java/static-vs-instance", dur: "20 min", diff: "Intermediate" },
            { id: "j-encapsulation", t: "Encapsulation (public / private)", ready: true, href: "/lessons/java/encapsulation", dur: "20 min", diff: "Intermediate" },
            { id: "j-inheritance", t: "Inheritance (extends, super)", ready: true, href: "/lessons/java/inheritance", dur: "25 min", diff: "Intermediate" },
            { id: "j-polymorphism", t: "Abstraction & Polymorphism", ready: true, href: "/lessons/java/polymorphism", dur: "25 min", diff: "Intermediate" },
            { id: "j-interfaces", t: "Interfaces & Abstract Classes", ready: true, href: "/lessons/java/interfaces", dur: "25 min", diff: "Intermediate" },
            { id: "j-enums", t: "Enums & Constants", ready: true, href: "/lessons/java/enums", dur: "20 min", diff: "Intermediate" },
            { id: "j-lambdas", t: "Lambdas & Functional Interfaces", ready: true, href: "/lessons/java/lambdas", dur: "25 min", diff: "Intermediate" },
          ],
        },
        {
          id: "j6", num: "J6", title: "Capstone Project",
          sub: "Put it all together before touching a robot. Four stages, one growing program.",
          lessons: [
            { id: "j-kitchen-1", t: "Alice's Kitchen 1 · Meet Alice", ready: true, href: "/lessons/java/kitchen-1", dur: "45 min", diff: "Project" },
            { id: "j-kitchen-2", t: "Alice's Kitchen 2 · The Kitchen Grid", ready: true, href: "/lessons/java/kitchen-2", dur: "50 min", diff: "Project" },
            { id: "j-kitchen-3", t: "Alice's Kitchen 3 · Appliances & Inventory", ready: true, href: "/lessons/java/kitchen-3", dur: "60 min", diff: "Project" },
            { id: "j-kitchen-4", t: "Alice's Kitchen 4 · Recipes & Health", ready: true, href: "/lessons/java/kitchen-4", dur: "60 min", diff: "Project" },
          ],
        },
      ],
    },
    {
      id: "frc",
      tag: "Phase 2",
      label: "FRC Robot Programming (WPILib)",
      blurb: "Now apply your Java to a real robot: motors, sensors, PID, swerve, vision, and autonomous.",
      icon: "robot",
      units: [
        {
          id: "u0", num: "0", title: "Orientation",
          sub: "What a programmer actually does on the team.",
          lessons: [
            { id: "frc-what-programmers-do", t: "What an FRC Programmer Does", ready: true, href: "/lessons/frc/what-programmers-do", dur: "15 min", diff: "Beginner" },
          ],
        },
        {
          id: "u1", num: "1", title: "The Robot's Body",
          sub: "Hardware & wiring: how signals travel through the robot.",
          lessons: [
            { id: "frc-roborio-radio-can", t: "RoboRIO, Radio & the CAN Bus", ready: true, href: "/lessons/frc/roborio-radio-can", dur: "20 min", diff: "Beginner" },
            { id: "frc-motors", t: "Motors & Motor Controllers", ready: true, href: "/lessons/frc/motors", dur: "20 min", diff: "Beginner" },
          ],
        },
        {
          id: "u2", num: "2", title: "The Toolchain",
          sub: "What to install and why.",
          lessons: [
            { id: "frc-game-tools", t: "FRC Game Tools & Driver Station", ready: true, href: "/lessons/frc/game-tools", dur: "20 min", diff: "Beginner" },
            { id: "frc-wpilib-vscode", t: "WPILib + VS Code", ready: true, href: "/lessons/frc/wpilib-vscode", dur: "20 min", diff: "Beginner" },
            { id: "frc-vendordeps", t: "Vendor Libraries (REVLib)", ready: true, href: "/lessons/frc/vendordeps", dur: "15 min", diff: "Beginner" },
            { id: "frc-vendor-clients", t: "REV & CTRE Hardware Clients", ready: true, href: "/lessons/frc/vendor-clients", dur: "20 min", diff: "Beginner" },
            { id: "frc-can-ids", t: "CAN IDs", ready: true, href: "/lessons/frc/can-ids", dur: "15 min", diff: "Beginner" },
            { id: "frc-dashboards", t: "Dashboards & AdvantageScope", ready: true, href: "/lessons/frc/dashboards", dur: "20 min", diff: "Beginner" },
          ],
        },
        {
          id: "u3", num: "3", title: "Project Anatomy",
          sub: "The mental model everything else hangs on.",
          lessons: [
            { id: "frc-src-tree", t: "The src Tree", ready: true, href: "/lessons/frc/src-tree", dur: "20 min", diff: "Beginner" },
            { id: "frc-chain-of-command", t: "The Chain of Command", ready: true, href: "/lessons/frc/chain-of-command", dur: "25 min", diff: "Beginner" },
          ],
        },
        {
          id: "u4", num: "4", title: "Moving a Motor",
          sub: "Your first robot output.",
          lessons: [
            { id: "frc-moving-a-motor", t: "Moving a Motor with motor.set()", ready: true, href: "/lessons/frc/moving-a-motor", dur: "25 min", diff: "Beginner" },
          ],
        },
        {
          id: "u5", num: "5", title: "Sensing",
          sub: "Encoders: knowing where a mechanism is.",
          lessons: [
            { id: "frc-encoders", t: "Reading Position & Velocity", ready: true, href: "/lessons/frc/encoders", dur: "25 min", diff: "Intermediate" },
            { id: "frc-relative-absolute", t: "Relative vs. Absolute Encoders", ready: true, href: "/lessons/frc/relative-absolute", dur: "20 min", diff: "Intermediate" },
          ],
        },
        {
          id: "u6", num: "6", title: "Closed-Loop Control (PID)",
          sub: "A powerful ally and a dangerous foe.",
          lessons: [
            { id: "frc-pid-concept", t: "What P, I and D Do" },
            { id: "frc-pid-tuning", t: "The Tuning Recipe" },
            { id: "frc-pid-syntax", t: "PIDController in Code" },
          ],
        },
        {
          id: "u7", num: "7", title: "Structuring Behavior",
          sub: "Commands, Subsystems, Constants.",
          lessons: [
            { id: "frc-command-lifecycle", t: "The Command Lifecycle" },
            { id: "frc-subsystems", t: "Subsystem Anatomy" },
            { id: "frc-constants", t: "Constants" },
          ],
        },
        {
          id: "u8", num: "8", title: "Wiring It Together",
          sub: "RobotContainer & Robot.java.",
          lessons: [
            { id: "frc-controllers", t: "Controllers, Ports & the Driver Station" },
            { id: "frc-robotcontainer", t: "RobotContainer & Button Bindings" },
            { id: "frc-command-groups", t: "Sequential & Parallel Groups" },
            { id: "frc-robot-java", t: "Robot.java Modes" },
          ],
        },
        {
          id: "u9", num: "9", title: "Driving (Swerve)",
          sub: "Field-centric control.",
          lessons: [
            { id: "frc-swerve-concept", t: "Field-Centric Swerve" },
            { id: "frc-swerve-generators", t: "CTRE Generator vs. YAGSL" },
          ],
        },
        {
          id: "u10", num: "10", title: "Seeing (Vision)",
          sub: "Limelight & AprilTags. (Researched from WPILib + Limelight docs.)",
          lessons: [
            { id: "frc-limelight", t: "Limelight & AprilTags" },
            { id: "frc-vision-pid", t: "Vision-Aligned PID (TX / TY)" },
          ],
        },
        {
          id: "u11", num: "11", title: "Autonomous",
          sub: "PathPlanner — build it last.",
          lessons: [
            { id: "frc-pathplanner", t: "The PathPlanner Workflow" },
            { id: "frc-auto-routines", t: "Building an Auto Routine" },
          ],
        },
        {
          id: "u12", num: "12", title: "Game Day",
          sub: "Competition responsibilities.",
          lessons: [
            { id: "frc-game-day", t: "At the Competition" },
          ],
        },
      ],
    },
  ],

  /* ---- Reference section (not lessons — never counted in progress) ------ */
  resources: [
    { id: "ref-java", t: "Java Syntax Cheat-Sheet", href: "/reference/java",
      sub: "Every bit of syntax from Phase 1, on one page." },
    { id: "ref-wpilib", t: "WPILib Cheat-Sheet", href: "/reference/wpilib",
      sub: "Motors, encoders, PID, commands, bindings — the competition quick-reference." },
    { id: "ref-glossary", t: "Glossary", href: "/reference/glossary",
      sub: "Every term in the course, defined in one sentence." },
    { id: "ref-docs", t: "Official Docs Index", href: "/reference/docs",
      sub: "WPILib, REV, CTRE, Limelight, PathPlanner — and what to re-check each season." },
  ],

  /* ---- Phase exams ------------------------------------------------------ */
  exams: [
    { id: "exam-java", t: "Phase 1 Exam · Java & OOP", href: "/exam/java", trackId: "java",
      sub: "Prove you're ready for robot code." },
    { id: "exam-frc", t: "Phase 2 Exam · FRC Robot Programming", href: "/exam/frc", trackId: "frc",
      sub: "Prove you're ready for build season." },
  ],
};

/* ---- helpers shared by site.js + syllabus + lesson pages ---------------- */
window.COURSE.allLessons = function () {
  const out = [];
  this.tracks.forEach((tr) =>
    tr.units.forEach((u) =>
      u.lessons.forEach((l) => out.push({ ...l, trackId: tr.id, unitId: u.id, unitNum: u.num, unitTitle: u.title }))
    )
  );
  return out;
};
window.COURSE.find = function (id) {
  return this.allLessons().find((l) => l.id === id) || null;
};
window.COURSE.readyList = function () {
  return this.allLessons().filter((l) => l.ready);
};
// Reference pages and exams sit outside the lesson sequence on purpose: they
// must not dilute the progress percentage, so allLessons() never returns them.
window.COURSE.readyResources = function () {
  return (this.resources || []).filter((r) => r.ready);
};
window.COURSE.examFor = function (trackId) {
  return (this.exams || []).find((e) => e.trackId === trackId) || null;
};
window.COURSE.counts = function () {
  return this.tracks.map((tr) => ({
    id: tr.id,
    units: tr.units.length,
    lessons: tr.units.reduce((n, u) => n + u.lessons.length, 0),
  }));
};
