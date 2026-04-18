# cdtKitchenKlock – Documentation (English)

A full-screen kitchen clock for Raspberry Pi with HDMI display. Designed to be readable from across the room. Clock, date, weather and background animations — all configured through a built-in web interface.

---

## Contents

- [Features](#features)
- [Clock Styles](#clock-styles)
- [Background Types](#background-types)
- [Configuration](#configuration)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start – Ubuntu/Linux](#quick-start--ubuntulinux)
- [Raspberry Pi Installation](#raspberry-pi-installation)
- [Weather Services](#weather-services)
- [Hardware Requirements](#hardware-requirements)

---

## Features

| Feature | Description |
|---------|-------------|
| **9 clock styles** | 5 digital + 4 analog, selected via a visual grid with live previews |
| **Automatic rotation** | Choose any combination of clocks — multiple selected = random shuffle |
| **Weather** | Fetches from SMHI, YR.no or AccuWeather, alternates clock ↔ weather automatically |
| **Temperature corner** | Current temperature shown in any corner while in clock mode |
| **Background animations** | Solid color, lava lamp or animated night sky with stars |
| **Screen dimming** | Automatic dimming at specified times (CSS + DDC/CI hardware control) |
| **Multilingual** | Swedish and English, switchable in configuration |
| **12h/24h** | Selectable time format with AM/PM support |
| **Date format** | Fully configurable with tokens (YYYY, MM, dddd, WW etc.) |
| **Randomize colors** | Generates high-contrast clock colors automatically against any background |
| **Kiosk mode** | Chromium launches automatically in full-screen on Raspberry Pi startup |
| **WiFi watchdog** | Automatic reconnection if WiFi is lost |

---

## Clock Styles

### Digital

| Style | Description |
|-------|-------------|
| **Default** | Classic monospace, large and legible |
| **LED** | 7-segment display with configurable inactive segment visibility |
| **Sci-Fi** | Metallic, futuristic style |
| **Flip clock** | Retro split-flap animation, digits "flip" on change |
| **Globe** | Pre-rendered 3D glass spheres in selectable color (purple, red, green, blue) |

### Analog

| Style | Description |
|-------|-------------|
| **Classic** | Round face with numerals 1–12, hour/minute/second hands |
| **Pilot** | IWC-inspired instrument look with subtle details |
| **Vintage** | Antique style with warm patina |
| **Cosmic** | Night sky as the clock face background |

### Clock Grid

The configuration shows all clocks in a grid with live previews scaled to fit each card. Check the clocks you want to use:

- **1 checked** → that clock is always shown
- **Multiple checked** → rotates automatically in shuffled order
- Clocks with settings (Globe, LED) show a ⚙ icon that opens a modal

---

## Background Types

### Solid
Any background color. Clock color and date color are chosen separately, with an option to randomize high-contrast colors automatically.

### Lava Lamp
Animated blobs moving and merging. Clock and background colors are set automatically to white/transparent for best contrast.

### Night Sky
Canvas-based animation featuring:
- 300 stars in realistic colors (O/B/A/F/G/K/M spectral types) with individual twinkling
- Stars drift slowly right to left (astronomically correct)
- 10 constellation patterns (Orion, Big Dipper, Cassiopeia, Pleiades etc.) scroll past
- Shooting stars every 45–120 seconds
- Configurable star size (0.5×–3.0×) — important for readability at distance

> The dimming feature only affects clock content — background animations are left unaffected for a more natural feel.

---

## Configuration

Open `http://localhost:8080/config` in a browser. Click the **⚙ settings** link at the top of the clock screen.

Config is saved to `~/.kitchenklock/config.json` and loaded automatically. New fields are migrated automatically on upgrade.

### Tabs

**Clock**
- Choose clocks (visual grid with live previews)
- Rotation: switch every X minutes, or on each return from weather screen
- Time format: 24h / 12h (AM/PM)
- Show date on/off
- Temperature corner: position and on/off

**Date**
- Date format with freely entered tokens

| Token | Example |
|-------|---------|
| `YYYY` | 2026 |
| `YY` | 26 |
| `MMMM` | April |
| `MMM` | Apr |
| `MM` | 04 |
| `dddd` | Thursday |
| `ddd` | Thu |
| `DD` | 09 |
| `WW` | 15 (week number) |

**Appearance**
- Background type: solid / lava lamp / night sky
- Star size (night sky only)
- Background color, clock color, date color
- Randomize clock color / date color
- Automatic dimming: time window, brightness level (5–95%), combines CSS and DDC/CI

**Weather**
- Show weather on/off
- Display duration for clock and weather (seconds)
- Show time in corner of weather screen
- Weather service: SMHI / YR.no / AccuWeather
- Coordinates (lat/lon) and city name
- Fetch interval (minutes)
- Temperature unit: Celsius / Fahrenheit

---

## Tech Stack

### Backend
| Component | Version |
|-----------|---------|
| Scala | 3.6.3 |
| ZIO | 2.1.14 |
| ZIO-HTTP | 3.0.1 |
| ZIO-JSON | 0.7.3 |
| ZIO-Cache | 0.2.4 |
| Java | 21 |
| sbt-assembly | Fat JAR |

### Frontend
| Component | Version |
|-----------|---------|
| React | 18 |
| TypeScript | 5 |
| Vite | 6 |

### Deployment
A single fat JAR serves both the REST API and the compiled React app as static files. Port 8080.

---

## Project Structure

```
cdtKitchenKlock/
├── backend/
│   ├── build.sbt
│   └── src/main/
│       ├── resources/
│       │   ├── locales/          sv.json, en.json
│       │   └── public/           compiled frontend (generated by Vite)
│       └── scala/com/cdt/kitchenklock/
│           ├── Main.scala
│           ├── Server.scala       (named AppServer to avoid collision with zio.http.Server)
│           ├── api/
│           │   ├── ConfigRoutes.scala
│           │   ├── DimRoutes.scala
│           │   ├── LocalesRoutes.scala
│           │   ├── VersionRoutes.scala
│           │   └── WeatherRoutes.scala
│           ├── config/
│           │   ├── AppConfig.scala
│           │   └── ConfigService.scala
│           └── weather/
│               ├── SmhiWeather.scala
│               ├── YrWeather.scala
│               ├── AccuWeatherService.scala
│               ├── WeatherService.scala
│               ├── WeatherModels.scala
│               └── WeatherRouter.scala
├── frontend/
│   ├── public/
│   │   └── spheres/              PNG images for the globe clock
│   └── src/
│       ├── App.tsx               root component, background/content layer split
│       ├── clockRegistry.ts      central clock registry – add new clocks here
│       ├── types/index.ts
│       ├── hooks/
│       │   ├── useClock.ts
│       │   ├── useConfig.ts
│       │   └── useVersionCheck.ts
│       ├── i18n/
│       │   └── TranslationContext.tsx
│       ├── utils/
│       │   ├── colors.ts          random high-contrast color generation
│       │   └── formatDate.ts      date formatting with tokens
│       └── components/
│           ├── ClockView.tsx
│           ├── ClockPreview.tsx   scaled live preview (ResizeObserver)
│           ├── DigitalClock.tsx
│           ├── LedClock.tsx
│           ├── SciFiClock.tsx
│           ├── FlipClock.tsx
│           ├── GlobeClock.tsx
│           ├── AnalogClock.tsx
│           ├── PilotClock.tsx
│           ├── VintageClock.tsx
│           ├── CosmicClock.tsx
│           ├── WeatherView.tsx
│           ├── TemperatureCorner.tsx
│           ├── TimeCorner.tsx
│           ├── LavaLamp.tsx
│           ├── StarfieldBackground.tsx
│           └── config/
│               ├── ConfigPage.tsx
│               ├── ClockGrid.tsx
│               └── ClockSettingsModal.tsx
├── start.sh                      build + start locally (Ubuntu)
├── start-pi.sh                   start on Raspberry Pi
├── install-service.sh            install as systemd service + kiosk
├── wifi_watchdog.sh              automatic WiFi reconnection
└── CLAUDE.md                     project description and instructions
```

---

## Running Locally (Ubuntu/Linux)

### 1. Install Prerequisites

**Java 21**
```bash
sudo apt update
sudo apt install openjdk-21-jdk
java -version   # should show openjdk 21
```

**Node.js 18+**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # should show v20.x or later
```

**sbt** (Scala Build Tool)
```bash
echo "deb https://repo.scala-sbt.org/scalasbt/debian all main" | sudo tee /etc/apt/sources.list.d/sbt.list
curl -sL "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x2EE0EA64E40A89B84B2DF73499E82A75642AC823" | sudo apt-key add
sudo apt update
sudo apt install sbt
```

### 2. Get the Project

```bash
git clone <repo-url>
cd cdtKitchenKlock
```

### 3. Build and Start

**Option A — automatic build via start.sh**

`start.sh` builds frontend and backend automatically if they don't already exist:

```bash
./start.sh
```

> Note: if the JAR already exists it is **not** rebuilt automatically — this is intentional for fast restarts. Run `sbt assembly` manually when you change code.

**Option B — manual build (recommended during development)**

```bash
# Build frontend (required when React code changes)
cd frontend
npm install        # first time, or when package.json changes
npm run build      # compiles to backend/src/main/resources/public/
cd ..

# Build backend JAR (required when Scala code or locale files change)
cd backend
sbt assembly       # creates target/scala-3.6.3/kitchenklock-assembly.jar
cd ..

# Start
java -jar backend/target/scala-3.6.3/kitchenklock-assembly.jar
```

### 4. Open in Browser

| URL | Description |
|-----|-------------|
| `http://localhost:8080` | Clock display |
| `http://localhost:8080/config` | Configuration UI |

### When to Rebuild

| Change | What to run |
|--------|-------------|
| React code (`.tsx`) | `cd frontend && npm run build` |
| Scala code (`.scala`) | `cd backend && sbt assembly` |
| Locale files (`sv.json`, `en.json`) | `cd backend && sbt assembly` |
| None — just restart | `java -jar backend/target/scala-3.6.3/kitchenklock-assembly.jar` |

---

## Raspberry Pi Installation

### Prerequisites on the Pi

**Raspberry Pi OS Bookworm with desktop** (Wayland/labwc) is recommended.

**Java 21** (runs on Pi, not needed for building):
```bash
sudo apt update
sudo apt install openjdk-21-jre-headless
java -version   # should show openjdk 21
```

**Create user** (if it doesn't exist):
```bash
sudo adduser kitchenklockadmin
sudo usermod -a -G sudo kitchenklockadmin
```

> Raspberry Pi 5 is recommended. Pi 2 and Pi 3 have a GPU blocklist in Chromium 146 that forces background animations to render on the CPU — works but noticeably slower.

---

> **Note – username:** `install-service.sh` has the username `pi` hardcoded in several places (`/home/pi`, `User=pi`, `chown pi:pi` etc.). If your Pi user has a different name, edit the script and replace `pi` with the correct username before running it.

### Option A — First Installation (from scratch)

Run on your **development machine** (Ubuntu):

```bash
# 1. Build
cd frontend && npm run build && cd ..
cd backend && sbt assembly && cd ..

# 2. Copy JAR and installation scripts to Pi
scp backend/target/scala-3.6.3/kitchenklock-assembly.jar \
    kitchenklockadmin@kitchenklock:~/
scp install-service.sh wifi_watchdog.sh \
    kitchenklockadmin@kitchenklock:~/
```

Then run this **on the Pi** (via SSH):

```bash
ssh kitchenklockadmin@kitchenklock

# 3. Install as systemd service
sudo bash install-service.sh
```

`install-service.sh` automatically:
- Creates `/opt/kitchenklock/` and copies the JAR there
- Creates and enables a `systemd` service (`kitchenklock.service`) that starts at boot
- Installs `ddcutil` for hardware screen brightness control (DDC/CI)
- Adds the user to the `i2c` group (required for DDC/CI)
- Configures Chromium kiosk autostart via `~/.config/labwc/autostart`
- Creates an invisible mouse cursor theme (blank cursor)
- Optionally installs and enables the WiFi watchdog service (prompts for confirmation)

```bash
# 4. Verify the service started
systemctl status kitchenklock
```

---

### Option B — Update After Code Change

Run on your **development machine**:

```bash
# Build (frontend and/or backend depending on what changed)
cd frontend && npm run build && cd ..
cd backend && sbt assembly && cd ..

# Copy and restart
scp backend/target/scala-3.6.3/kitchenklock-assembly.jar \
    kitchenklockadmin@kitchenklock:~/
ssh kitchenklockadmin@kitchenklock \
    "sudo cp ~/kitchenklock-assembly.jar /opt/kitchenklock/ && sudo systemctl restart kitchenklock && echo OK"
```

---

### Systemd Commands

```bash
# Status
systemctl status kitchenklock
systemctl status wifi-watchdog

# Restart
sudo systemctl restart kitchenklock

# Live logs
journalctl -u kitchenklock -f

# WiFi watchdog log
tail -f ~/wifi_history.log
```

---

### Kiosk Mode (Chromium Full-screen)

Chromium launches automatically in full-screen 8 seconds after login and opens `http://localhost:8080`. The mouse cursor is invisible.

Autostart file: `~/.config/labwc/autostart`

> **Important:** The Chromium language dialog is suppressed via `master_preferences` and a policy file — do **not** add `--lang=sv` as a startup flag, it triggers a new confirmation dialog.

---

### WiFi Watchdog

`wifi_watchdog.sh` periodically checks the WiFi connection and reboots the device if connectivity is repeatedly lost. Installation is **optional** — `install-service.sh` will ask whether you want to install it. Logs to `~/wifi_history.log`.

> **Note:** The default router address in `wifi_watchdog.sh` is `192.168.1.1`. Change it to match your router's IP address if it differs.

---

## Weather Services

| Service | API Key | Notes |
|---------|---------|-------|
| **SMHI** | No | Free, good coverage for Sweden |
| **YR.no** | No | Free, Nordic meteorological institute |
| **AccuWeather** | Yes | 50 calls/day free, global coverage |

Weather data is cached and fetched every 10 minutes (on failure: retries every 15 seconds until the first successful call).

Coordinates and city name are set in configuration.
Default: Gråbo, Sweden (57.837°N, 12.310°E).

---

## Hardware Requirements

| Component | Requirement |
|-----------|-------------|
| Raspberry Pi | Pi 5 recommended (Pi 2/3 work with limitations) |
| Display | Any HDMI screen |
| Network | Required for weather data |
| Java | 21 |
| Node.js | 18+ (to build frontend) |
| sbt | 1.x (to build backend) |

### GPU and Raspberry Pi Versions

Chromium 146 has a built-in GPU blocklist that affects VideoCore IV (Pi 2 and Pi 3). This means background animations (lava lamp, night sky) are rendered via CPU rather than GPU, resulting in noticeably worse performance. Raspberry Pi 5 with VideoCore VII has no such issues.

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/config` | GET | Fetch current configuration |
| `POST /api/config` | POST | Save configuration |
| `GET /api/weather` | GET | Fetch weather data (cached) |
| `POST /api/dim?level=N` | POST | Set screen brightness via DDC/CI (0–100) |
| `GET /api/version` | GET | Latest version from GitHub |
| `GET /api/locales/:lang` | GET | Fetch translations |

---

## Adding a New Clock Style

1. Create `frontend/src/components/MyClock.tsx`
2. Add the style to `frontend/src/clockRegistry.ts`:
   ```ts
   { key: 'digital-myclock', nameKey: 'config.clocks.myClockName', hasSettings: false }
   ```
3. Wire the style into `DigitalClock.tsx` or `AnalogClock.tsx`
4. Add the clock name to `locales/sv.json` and `locales/en.json`
5. Build and deploy — the grid and shuffle logic handle the rest automatically
