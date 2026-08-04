# Research · Units 0–5 (hardware, toolchain, project anatomy, encoders)

Every claim below carries a citation. Facts that are **not** in this file and **not** in
`content/source/frc-curriculum-reference.txt` may not appear in a code block.
Target season: **2026**. Verified 2026-08-01.

---

## 1. Control system hardware

| Fact | Detail | Source |
|---|---|---|
| roboRIO role | "the main robot controller used for FRC", "serves as the 'brain' for the robot running team-generated code that commands all of the other hardware" | [WPILib Hardware Component Overview](https://docs.wpilib.org/en/stable/docs/controls-overviews/control-system-hardware.html) |
| Radio (current) | **Vivid-Hosting VH-109**. "uses Wi-Fi 6E to avoid the common congestion problems that plague 2.4 GHz Wi-Fi networks". Has 4 Ethernet ports, "reducing the need for an additional network switch" | [WPILib Hardware Component Overview](https://docs.wpilib.org/en/stable/docs/controls-overviews/control-system-hardware.html) |
| Radio config | Web interface at `http://radio.local/`, connect over Ethernet. You enter your **team number**, an optional suffix, and WPA/SAE keys. | [WPILib Programming your Radio](https://docs.wpilib.org/en/stable/docs/zero-to-robot/step-3/radio-programming.html) |
| Radio at competition | "At competition, configuration will be done by a provided computer and manual configuration using this page **should not be used**." | [WPILib Programming your Radio](https://docs.wpilib.org/en/stable/docs/zero-to-robot/step-3/radio-programming.html) |
| REV PDH | "20 high-current (40A max) channels, 3 low-current (15A max), and 1 switchable low-current channel"; connects "over CAN or USB-C to the REV Hardware Client" | [WPILib Hardware Component Overview](https://docs.wpilib.org/en/stable/docs/controls-overviews/control-system-hardware.html) |
| CTRE PDP | distributes "power from a 12VDC battery to various robot components through auto-resetting circuit breakers" | same |
| SPARK MAX | "can be controlled over PWM, CAN, or USB" | same |
| TalonFX | "integrated into the Falcon 500, Kraken X60, and Kraken X44 brushless motors" | same |

**Team-2551 statement kept from the source PDF (not from WPILib):** their team used roboRIO 1
and expected to move to roboRIO 2. Treat the roboRIO generation as season/team specific.

## 2. CAN addressing

| Fact | Detail | Source |
|---|---|---|
| Arbitration ID | 29-bit, five fields: device type (5 bits), manufacturer (8), API class (6), API index (4), **device number (6 bits)** | [WPILib CAN Addressing](https://docs.wpilib.org/en/stable/docs/software/can-devices/can-addressing.html) |
| Device number range | **0–63** | same |
| roboRIO heartbeat | roboRIO sends a universal CAN heartbeat, ID `0x01011840`, **every 20 ms** | same |
| Default device ID | devices "should default to device ID 0"; a "user selectable device number" is required to run more than one of the same device | same |

WPILib does **not** publish a "IDs 0 and 1 are reserved" rule. That is a **team convention**
(source PDF p.5) and every lesson must present it as such.

## 3. Software install

| Fact | Detail | Source |
|---|---|---|
| FRC Game Tools contents | "LabVIEW Update, FRC Driver Station, FRC roboRIO Imaging Tool and Images" | [WPILib FRC Game Tools](https://docs.wpilib.org/en/stable/docs/zero-to-robot/step-2/frc-game-tools.html) |
| Game Tools OS | "Windows 10 or higher (Windows 10, 11)". No macOS or Linux build exists. | same |
| WPILib OS support | "Windows 10 & 11, 64 bit only", "Ubuntu 22.04 & 24.04, 64 bit", "macOS 13.3 or higher, both Intel and Arm" | [WPILib Installation Guide](https://docs.wpilib.org/en/stable/docs/zero-to-robot/step-2/wpilib-setup.html) |
| Separate VS Code | "WPILib installs a separate version of VS Code. It does not use an already existing installation. Each year has it's own copy of the tools appended with the year." | same |
| WPILib installer contents | VS Code, C++ compiler, Gradle, Java JDK/JRE, SmartDashboard, Shuffleboard, **AdvantageScope**, **Elastic**, Glass, RobotBuilder, PathWeaver, SysId, OpenCV, the VS Code extensions | same |

**This resolves the source PDF's "Macs can't run the Driver Station" story:** WPILib itself runs
on macOS, the **Driver Station does not**, because it ships only inside the Windows-only Game Tools.

## 4. VS Code workflow

| Fact | Detail | Source |
|---|---|---|
| New project | Command palette (`Ctrl+Shift+P`) → "Create a new project". Choose project type (template/example), language, base folder, project location, name, **team number** | [WPILib Creating a Robot Program](https://docs.wpilib.org/en/stable/docs/software/vscode-overview/creating-robot-program.html) |
| Templates | TimedRobot, Command Robot, Skeleton variants, plus example projects | same |
| Build | "Build Robot Code" from the command palette, the ellipsis menu in the top-right, or right-click on `build.gradle` | [WPILib Deploying Robot Code](https://docs.wpilib.org/en/stable/docs/software/vscode-overview/deploying-robot-code.html) |
| Deploy | "Deploy Robot Code ... will build (if necessary) and deploy the robot program to the roboRIO." On success you get "Build Successful" and the **RioLog** opens with console output. | same |
| Deploy warning | "Avoid powering off the robot while deploying robot code. Interrupting the deployment process can corrupt the roboRIO filesystem and prevent your code from working until the roboRIO is re-imaged." | same |

## 5. Driver Station

| Fact | Detail | Source |
|---|---|---|
| Modes | TeleOperated, Autonomous, Practice, Test. Teleoperated "causes the robot to run the code in the Teleoperated portion of the match"; Practice cycles through match transitions automatically | [WPILib Driver Station](https://docs.wpilib.org/en/stable/docs/software/driverstation/driver-station.html) |
| Communications light | "indicates whether the DS is currently communicating with the FRC Network Communications Task" | same |
| Robot Code light | "shows whether the team Robot Code is currently running" | same |
| Joysticks light | "shows if at least one joystick is plugged in and recognized" | same |
| Messages tab | "displays diagnostic messages from the DS, WPILib, User Code, and/or the roboRIO" | same |
| Shortcuts | `Enter` disables the robot. `Space` **emergency-stops** the robot. `F1` forces a joystick refresh. `[ + ] + \` enables. | same |

Note the correction this forces on the source PDF: the console the narrator describes is the
Driver Station **Messages** tab, and `System.out.println` output also appears in the **RioLog**
inside VS Code after a deploy.

## 6. Dashboards

| Dashboard | WPILib's own description | Status |
|---|---|---|
| Glass | "Robot data visualization tool", "a programmer's tool rather than a proper dashboard in a competition environment, with a focus on high performance real time plotting" | supported |
| Elastic | "Simple and modern Shuffleboard alternative made by Team 353. It is meant to serve as a dashboard for competition but can also be used for testing." | supported, third party, ships with WPILib |
| AdvantageScope | "Robot diagnostics, log review/analysis, and data visualization application", reads multiple log formats "plus live robot data viewing" | supported, third party, ships with WPILib |
| Shuffleboard | "Straightforward and easily customizable dashboard" with "tabs, recording / playback, and advanced custom widgets" | **deprecated** |
| SmartDashboard | "Simple and efficient dashboard that uses relatively few computer resources" | **deprecated** |

> WPILib states directly that SmartDashboard and Shuffleboard "do not have a person to maintain
> them" and "are deprecated and will be removed for the 2027 season."
> Source: [WPILib Dashboard Introduction](https://docs.wpilib.org/en/stable/docs/software/dashboards/dashboard-intro.html)

This confirms and dates the source PDF's "SmartDashboard was being banned, we moved to Glass"
story. Do not say "banned" in a lesson. Say **deprecated, scheduled for removal in 2027**.

## 7. Command-based project structure

All quotes from [WPILib Structuring a Command-Based Robot Project](https://docs.wpilib.org/en/stable/docs/software/commandbased/structuring-command-based-project.html).

| File | WPILib's description |
|---|---|
| `Main.java` | "New users _should not_ touch this class." |
| `Robot.java` | "Responsible for the main control flow of the robot code." Instantiates `RobotContainer` and calls `CommandScheduler.getInstance().run()` in `robotPeriodic()`. |
| `RobotContainer.java` | "Holds robot subsystems and commands, and is where most of the declarative robot setup (e.g. button bindings) is performed." |
| `Constants.java` | "Holds globally-accessible constants to be used throughout the robot." |
| `subsystems/` | "Contains all user-defined subsystem classes." |
| `commands/` | "Contains all user-defined command classes." |

WPILib also states subsystems should be "declared as private fields in `RobotContainer`" and
passed to commands by dependency injection rather than made global.

## 8. REVLib (vendordep + encoders)

| Fact | Detail | Source |
|---|---|---|
| Vendordep URL | `https://software-metadata.revrobotics.com/REVLib-2026.json` | [REVLib Installation](https://docs.revrobotics.com/revlib/install) |
| Install path in VS Code | command palette → "Manage Vendor Libraries" → "Install new library (online)" | same |
| Offline install location | `C:\Users\Public\wpilib\2026` on Windows, `~/wpilib/2026` on Unix-like systems | same |
| Motor type in constructor | "Motor type is the only configuration parameter that must be set outside of a configuration object, specifically through the constructor" — because "driving a brushless motor in brushed mode can permanently damage the motor" | [Configuring a SPARK](https://docs.revrobotics.com/revlib/spark/configuring-a-spark) |
| Config classes | `SparkMaxConfig` / `SparkFlexConfig`, both extending `SparkBaseConfig`; applied with `spark.configure(config, ResetMode.kResetSafeParameters, PersistMode.kPersistParameters)` | same |
| Encoder accessors | `SparkBase.getEncoder()` returns a `RelativeEncoder`; `getAbsoluteEncoder()` returns a `SparkAbsoluteEncoder`; `SparkMax.getAlternateEncoder()` for a quadrature encoder on the data port | [RelativeEncoder API](https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder), [SparkBase API](https://codedocs.revrobotics.com/java/com/revrobotics/spark/sparkbase) |
| Default position unit | **rotations** | [REVLib Units](https://docs.revrobotics.com/revlib/spark/closed-loop/units) |
| Default velocity unit | **RPM** | same |
| Conversion factors | `EncoderConfig.positionConversionFactor(double)` and `velocityConversionFactor(double)`. They are independent: "the velocity factor does not rely on the position factor, so different units can be used for each" and "both need to be set" to change both. Degrees = 360, radians = 2π, a 10:1 gearbox at the output = 0.1. | same |
| `setPosition` | `RelativeEncoder.setPosition(double)` writes the current reading. This is the homing call. | [RelativeEncoder API](https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder) |

### Encoder hardware facts (REV)

All from [Using Encoders with the SPARK MAX](https://docs.revrobotics.com/brushless/spark-max/encoders).

- "Incremental encoders measure a change in position as a mechanism rotates while absolute
  encoders will report an exact position at any time, including at startup."
- "Running a brushless motor, like the NEO and NEO 550, without the integrated encoder plugged
  into the SPARK MAX's Encoder Port can damage your motor."
- A NEO's internal encoder **must** be connected to the SPARK MAX Encoder Port.
- Absolute encoders connect through the **Data Port**, and need SPARK MAX firmware 1.6.0 or newer.
- The REV Through Bore Encoder (REV-11-1271) can be used either way: as an absolute encoder
  through the Absolute Encoder Adapter, or as an incremental encoder through the Alternate
  Encoder Adapter (which requires configuring Alternate Encoder Mode).
- "Receiving both Incremental and Absolute encoder feedback from a single encoder through the
  SPARK MAX directly is not currently supported."
- Limit-switch inputs "cannot be used at the same time as an Alternate Encoder Mode."

## 9. REV Hardware Client

From [REV Hardware Client · SPARK MAX](https://docs.revrobotics.com/rev-hardware-client/ion/spark-max).

- Connect a SPARK MAX over **USB-C**; the client scans and connects automatically.
- **Basic tab**: Device Identify (blinks the LED), **CAN ID** ("Any configured SPARK MAX must
  have a CAN ID"), saved configurations, and parameters such as motor type and idle mode.
- **Advanced tab**: every configurable parameter without writing code.
- **Run tab**: drive the motor over USB "without the need for a full control system", in duty
  cycle, position, or velocity mode, with live PIDF editing. This is the "apply a test voltage"
  step in the team's fried-motor story.
- **Update tab**: shows firmware version and updates it.
- As of client version 1.7.0, **"Burn Flash" was renamed to "Persist Parameters"**.
- REV ION products on REVLib 2026 or newer must use **REV Hardware Client 2**.

## 10. Things deliberately left out of code blocks

- Exact roboRIO 2 imaging steps (season tool, changes yearly). Prose only.
- CTRE Phoenix Tuner X screen-by-screen instructions. Prose only, cite CTRE docs.
- Any claim about who manufactures the Limelight (the source PDF's attribution is unverified).
- Any "SmartDashboard is banned" phrasing. Use "deprecated, removal targeted for 2027".
