# cdtKitchenKlock – Dokumentation (Svenska)

En fullskärms köksklocka för Raspberry Pi med HDMI-skärm. Designad för att avläsas på långt håll. Klocka, datum, väder och bakgrundsanimationer — allt konfigureras via ett inbyggt webbgränssnitt.

---

## Innehåll

- [Funktioner](#funktioner)
- [Klockstilar](#klockstilar)
- [Bakgrundstyper](#bakgrundstyper)
- [Konfiguration](#konfiguration)
- [Teknikstack](#teknikstack)
- [Projektstruktur](#projektstruktur)
- [Snabbstart – Ubuntu/Linux](#snabbstart--ubuntulinux)
- [Installation på Raspberry Pi](#installation-på-raspberry-pi)
- [Vädertjänster](#vädertjänster)
- [Hårdvara och krav](#hårdvara-och-krav)

---

## Funktioner

| Funktion | Beskrivning |
|----------|-------------|
| **9 klockstilar** | 5 digitala + 4 analoga, väljs i en visuell grid med live-förhandsvisning |
| **Automatisk rotation** | Välj valfri kombination av klockor — fler valda = automatisk slumpväxling |
| **Väder** | Hämtar från SMHI, YR.no eller AccuWeather, växlar klocka ↔ väder automatiskt |
| **Temperaturhörn** | Aktuell temperatur visas i valfritt hörn vid klockläget |
| **Bakgrundsanimationer** | Enfärgad, lava-lampa eller levande natthimmel med stjärnor |
| **Skärmdimning** | Automatisk dimning vid angiven tid (CSS + DDC/CI hårdvarustyrning) |
| **Flerspråkigt** | Svenska och engelska, växlas i konfigurationen |
| **12h/24h** | Valbart tidsformat med AM/PM-stöd |
| **Datumformat** | Fullt konfigurerbart med tokens (YYYY, MM, dddd, WW m.fl.) |
| **Slumpa färger** | Genererar kontrastrika klockfärger automatiskt mot valfri bakgrund |
| **Kiosk-läge** | Chromium startar automatiskt i fullskärm vid uppstart på Raspberry Pi |
| **WiFi watchdog** | Automatisk återanslutning om WiFi tappas |

---

## Klockstilar

### Digitala

| Stil | Beskrivning |
|------|-------------|
| **Standard** | Klassisk monospace, stor och tydlig |
| **LED** | 7-segmentsdisplay med konfigurerbar synlighet på inaktiva segment |
| **Sci-Fi** | Metallisk, framtidsinspirerad stil |
| **Flipklocka** | Retro split-flap-animation, siffror "vänds" vid byte |
| **Glaskula** | Förrenderade 3D-glaskupor i valfri färg (lila, röd, grön, blå) |

### Analoga

| Stil | Beskrivning |
|------|-------------|
| **Klassisk** | Rund urtavla med siffror 1–12, tim/min/sek-visare |
| **Pilot** | IWC-inspirerat instrumentutseende med subtila detaljer |
| **Vintage** | Antik stil med varm patina |
| **Kosmisk** | Natthimmel som bakgrund i urtavlan |

### Klockgrid

Konfigurationen visar alla klockor i ett rutnät med live-förhandsvisning skalad till kortets bredd. Kryssa i de klockor du vill använda:

- **1 ikryssad** → den klockan visas alltid
- **Flera ikryssade** → roterar automatiskt i slumpad ordning
- Klockor med inställningar (Glaskula, LED) har ett ⚙-ikon som öppnar en modal

---

## Bakgrundstyper

### Enfärgad
Valfri bakgrundsfärg. Klockfärg och datumfärg väljs separat, med möjlighet att slumpa kontrastrika färger automatiskt.

### Lava-lampa
Animerade blobs som rör sig och smälter samman. Klockfärg och bakgrundsfärg sätts automatiskt till vit/transparent för bästa kontrast.

### Natthimmel
Canvas-baserad animation med:
- 300 stjärnor i realistiska färger (O/B/A/F/G/K/M-typer) med individuell twinkle
- Stjärnorna rör sig sakta från höger till vänster (astronomiskt korrekt)
- 10 konstellationsmönster (Orion, Karlavagnen, Cassiopeia, Plejaderna m.fl.) passerar förbi
- Stjärnfall var 45–120 sekund
- Konfigurerbar stjärnstorlek (0,5×–3,0×) — viktigt för avläsbarhet på avstånd

> Dimningsfunktionen påverkar enbart klockinnehållet — bakgrundsanimationen lämnas orörd för naturligare känsla.

---

## Konfiguration

Öppna `http://localhost:8080/config` i webbläsaren. Klicka på **⚙ inställningar**-länken längst upp på klockskärmen.

Config sparas i `~/.kitchenklock/config.json` och läses in automatiskt. Nya fält migreras automatiskt vid uppgradering.

### Flikar

**Klocka**
- Välj klockor (visuell grid med förhandsvisning)
- Rotation: byt var X minuter, eller vid varje återgång från väderskärm
- Tidsformat: 24h / 12h (AM/PM)
- Visa datum på/av
- Temperaturhörn: position och på/av

**Datum**
- Datumformat med fritt angivna tokens

| Token | Exempel |
|-------|---------|
| `YYYY` | 2026 |
| `YY` | 26 |
| `MMMM` | April |
| `MMM` | Apr |
| `MM` | 04 |
| `dddd` | Torsdag |
| `ddd` | Tor |
| `DD` | 09 |
| `WW` | 15 (veckonummer) |

**Utseende**
- Bakgrundstyp: enfärgad / lava-lampa / natthimmel
- Stjärnstorlek (vid natthimmel)
- Bakgrundsfärg, klockfärg, datumfärg
- Slumpa klockfärg / datumfärg
- Automatisk dimning: tid, nivå (5–95%), kombinerar CSS och DDC/CI

**Väder**
- Visa väder på/av
- Visningstider för klocka och väder (sekunder)
- Visa tid i hörnet på väderskärmen
- Vädertjänst: SMHI / YR.no / AccuWeather
- Koordinater (lat/lon) och ortsnamn
- Hämtningsintervall (minuter)
- Temperaturenhet: Celsius / Fahrenheit

---

## Teknikstack

### Backend
| Komponent | Version |
|-----------|---------|
| Scala | 3.6.3 |
| ZIO | 2.1.14 |
| ZIO-HTTP | 3.0.1 |
| ZIO-JSON | 0.7.3 |
| ZIO-Cache | 0.2.4 |
| Java | 21 |
| sbt-assembly | Fat JAR |

### Frontend
| Komponent | Version |
|-----------|---------|
| React | 18 |
| TypeScript | 5 |
| Vite | 6 |

### Deployment
Ett enda fat JAR serverar både REST API:et och den kompilerade React-appen som statiska filer. Port 8080.

---

## Projektstruktur

```
cdtKitchenKlock/
├── backend/
│   ├── build.sbt
│   └── src/main/
│       ├── resources/
│       │   ├── locales/          sv.json, en.json
│       │   └── public/           kompilerad frontend (genereras av Vite)
│       └── scala/com/cdt/kitchenklock/
│           ├── Main.scala
│           ├── Server.scala       (heter AppServer för att undvika namnkollision med zio.http.Server)
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
│   │   └── spheres/              PNG-bilder för glaskule-klockan
│   └── src/
│       ├── App.tsx               rotkomponent, bakgrundslager/innehållslager
│       ├── clockRegistry.ts      centralt klockregister – lägg till nya klockor här
│       ├── types/index.ts
│       ├── hooks/
│       │   ├── useClock.ts
│       │   ├── useConfig.ts
│       │   └── useVersionCheck.ts
│       ├── i18n/
│       │   └── TranslationContext.tsx
│       ├── utils/
│       │   ├── colors.ts          slumpa kontrastrika färger
│       │   └── formatDate.ts      datumformatering med tokens
│       └── components/
│           ├── ClockView.tsx
│           ├── ClockPreview.tsx   skalad live-förhandsvisning (ResizeObserver)
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
├── start.sh                      bygg + starta lokalt (Ubuntu)
├── start-pi.sh                   starta på Raspberry Pi
├── install-service.sh            installera som systemd-tjänst + kiosk
├── wifi_watchdog.sh              automatisk WiFi-återanslutning
└── CLAUDE.md                     projektbeskrivning och instruktioner
```

---

## Köra lokalt (Ubuntu/Linux)

### 1. Installera förutsättningar

**Java 21**
```bash
sudo apt update
sudo apt install openjdk-21-jdk
java -version   # ska visa openjdk 21
```

**Node.js 18+**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # ska visa v20.x eller senare
```

**sbt** (Scala Build Tool)
```bash
echo "deb https://repo.scala-sbt.org/scalasbt/debian all main" | sudo tee /etc/apt/sources.list.d/sbt.list
curl -sL "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x2EE0EA64E40A89B84B2DF73499E82A75642AC823" | sudo apt-key add
sudo apt update
sudo apt install sbt
```

### 2. Hämta projektet

```bash
git clone <repo-url>
cd cdtKitchenKlock
```

### 3. Bygg och starta

**Alternativ A — automatisk byggning via start.sh**

`start.sh` bygger frontend och backend automatiskt om de inte redan finns:

```bash
./start.sh
```

> Obs: om JAR:en redan finns byggs den **inte** om automatiskt — det är avsiktligt för snabb omstart. Kör `sbt assembly` manuellt när du ändrat kod.

**Alternativ B — manuell byggning (rekommenderas vid utveckling)**

```bash
# Bygg frontend (måste göras om React-kod ändras)
cd frontend
npm install        # första gången, eller när package.json ändrats
npm run build      # kompilerar till backend/src/main/resources/public/
cd ..

# Bygg backend JAR (måste göras om Scala-kod eller locale-filer ändrats)
cd backend
sbt assembly       # skapar target/scala-3.6.3/kitchenklock-assembly.jar
cd ..

# Starta
java -jar backend/target/scala-3.6.3/kitchenklock-assembly.jar
```

### 4. Öppna i webbläsaren

| URL | Beskrivning |
|-----|-------------|
| `http://localhost:8080` | Klockskärmen |
| `http://localhost:8080/config` | Konfigurationsgränssnitt |

### Bygga om efter ändringar

| Ändring | Vad du behöver köra |
|---------|---------------------|
| React-kod (`.tsx`) | `cd frontend && npm run build` |
| Scala-kod (`.scala`) | `cd backend && sbt assembly` |
| Locale-filer (`sv.json`, `en.json`) | `cd backend && sbt assembly` |
| Inget — bara omstart | `java -jar backend/target/scala-3.6.3/kitchenklock-assembly.jar` |

---

## Installation på Raspberry Pi

### Förutsättningar på Pi

**Raspberry Pi OS Bookworm med skrivbord** (Wayland/labwc) rekommenderas.

**Java 21** (körs på Pi, behövs inte för byggning):
```bash
sudo apt update
sudo apt install openjdk-21-jre-headless
java -version   # ska visa openjdk 21
```

**Skapa användare** (om den inte finns):
```bash
sudo adduser kitchenklockadmin
sudo usermod -a -G sudo kitchenklockadmin
```

> Raspberry Pi 5 rekommenderas. Pi 2 och Pi 3 har en GPU-blocklista i Chromium 146 som gör att bakgrundsanimationer renderas via CPU — fungerar men är märkbart långsammare.

---

> **OBS – användarnamn:** `install-service.sh` använder hårdkodat användarnamnet `pi` på flera ställen (`/home/pi`, `User=pi`, `chown pi:pi` m.m.). Om din Pi-användare heter något annat måste du redigera skriptet och byta ut `pi` mot rätt användarnamn innan du kör det.

### Alternativ A — Första installationen (från grunden)

Kör detta på **din utvecklingsmaskin** (Ubuntu):

```bash
# 1. Bygg
cd frontend && npm run build && cd ..
cd backend && sbt assembly && cd ..

# 2. Kopiera JAR och installationsskriptet till Pi
scp backend/target/scala-3.6.3/kitchenklock-assembly.jar \
    kitchenklockadmin@kitchenklock:~/
scp install-service.sh wifi_watchdog.sh \
    kitchenklockadmin@kitchenklock:~/
```

Kör sedan detta **på Pi** (via SSH):

```bash
ssh kitchenklockadmin@kitchenklock

# 3. Installera som systemd-tjänst
sudo bash install-service.sh
```

`install-service.sh` gör följande automatiskt:
- Skapar `/opt/kitchenklock/` och kopierar JAR:en dit
- Skapar och aktiverar en `systemd`-tjänst (`kitchenklock.service`) som startar vid uppstart
- Installerar `ddcutil` för hårdvarustyrning av skärmens ljusstyrka (DDC/CI)
- Lägger till användaren i `i2c`-gruppen (krävs för DDC/CI)
- Konfigurerar Chromium kiosk-autostart via `~/.config/labwc/autostart`
- Skapar ett osynligt muspekartemma (blank cursor)
- Frågar om WiFi watchdog ska installeras (valfritt)

```bash
# 4. Kontrollera att tjänsten startat
systemctl status kitchenklock
```

---

### Alternativ B — Uppdatera efter kodändring

Kör på **din utvecklingsmaskin**:

```bash
# Bygg (frontend och/eller backend beroende på vad som ändrats)
cd frontend && npm run build && cd ..
cd backend && sbt assembly && cd ..

# Kopiera och starta om
scp backend/target/scala-3.6.3/kitchenklock-assembly.jar \
    kitchenklockadmin@kitchenklock:~/
ssh kitchenklockadmin@kitchenklock \
    "sudo cp ~/kitchenklock-assembly.jar /opt/kitchenklock/ && sudo systemctl restart kitchenklock && echo OK"
```

---

### Systemd-kommandon

```bash
# Status
systemctl status kitchenklock
systemctl status wifi-watchdog

# Starta om
sudo systemctl restart kitchenklock

# Loggar (live)
journalctl -u kitchenklock -f

# WiFi watchdog-logg
tail -f ~/wifi_history.log
```

---

### Kiosk-läge (Chromium fullskärm)

Chromium startar automatiskt i fullskärm 8 sekunder efter inloggning och öppnar `http://localhost:8080`. Muspekaren är osynlig.

Autostartfilen: `~/.config/labwc/autostart`

> **Viktigt:** Språkdialogen i Chromium undertrycks via `master_preferences` och en policy-fil — lägg **inte** till `--lang=sv` som startflagga, det triggar en ny bekräftelsedialog.

---

### WiFi watchdog

`wifi_watchdog.sh` kontrollerar WiFi-anslutningen periodiskt och startar om enheten om WiFi-anslutningen tappas upprepade gånger. Installationen är **valfri** — `install-service.sh` frågar om du vill installera den. Loggar till `~/wifi_history.log`.

> **OBS:** Standardadressen i `wifi_watchdog.sh` är `192.168.1.1`. Byt ut den mot din routers IP-adress om din router har en annan adress.

---

## Vädertjänster

| Tjänst | API-nyckel | Kommentar |
|--------|-----------|-----------|
| **SMHI** | Nej | Gratis, bra täckning för Sverige |
| **YR.no** | Nej | Gratis, nordisk meteorologi |
| **AccuWeather** | Ja | 50 anrop/dag gratis, global täckning |

Väderdata cachelagras och hämtas var 10:e minut (vid misslyckande: retry var 15:e sekund tills första lyckade anropet).

Koordinater och ortsnamn ställs in i konfigurationen.
Standard: Gråbo (57.837°N, 12.310°E).

---

## Hårdvara och krav

| Komponent | Krav |
|-----------|------|
| Raspberry Pi | Pi 5 rekommenderas (Pi 2/3 fungerar men med begränsningar) |
| Skärm | Valfri HDMI-skärm |
| Nätverk | Krävs för väderdata |
| Java | 21 |
| Node.js | 18+ (för att bygga frontend) |
| sbt | 1.x (för att bygga backend) |

### Om GPU och Raspberry Pi-versioner

Chromium 146 har en inbyggd GPU-blocklista som drabbar VideoCore IV (Pi 2 och Pi 3). Det innebär att bakgrundsanimationer (lava-lampa, natthimmel) renderas via CPU istället för GPU, vilket ger märkbart sämre prestanda. Raspberry Pi 5 med VideoCore VII har inga sådana problem.

---

## API-endpoints

| Endpoint | Metod | Beskrivning |
|----------|-------|-------------|
| `GET /api/config` | GET | Hämta aktuell konfiguration |
| `POST /api/config` | POST | Spara konfiguration |
| `GET /api/weather` | GET | Hämta väderdata (cachad) |
| `POST /api/dim?level=N` | POST | Sätt skärmljusstyrka via DDC/CI (0–100) |
| `GET /api/version` | GET | Senaste version från GitHub |
| `GET /api/locales/:lang` | GET | Hämta översättningar |

---

## Lägga till en ny klockstil

1. Skapa `frontend/src/components/MyClock.tsx`
2. Lägg till stilen i `frontend/src/clockRegistry.ts`:
   ```ts
   { key: 'digital-myclock', nameKey: 'config.clocks.myClockName', hasSettings: false }
   ```
3. Koppla in stilen i `DigitalClock.tsx` eller `AnalogClock.tsx`
4. Lägg till klocknamn i `locales/sv.json` och `locales/en.json`
5. Bygg och deploya — griden och shuffle-logiken hanterar resten automatiskt
