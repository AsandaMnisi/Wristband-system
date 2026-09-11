# 3D Tactical HUD Mining Safety Wristband

## Stack
- **React Native** + **React Native Web**
- **react-native-svg** — SVG bezel ring + step arc gauge
- **Three.js** — real-time interactive 3D wristband model
- **Metro** — bundler (via Expo CLI for web)

## Quick Start

```bash
cd mobile
npm install
npm start
```

Open `http://localhost:8081` (or the port shown in terminal) in your browser.

## Features
- Interactive 3D drag-to-rotate wristband model
- Live tactical HUD canvas on watch face with step arc, tri-vitals, and miner ID
- AI connection status indicator (green = live feed, orange = idle, red = offline)
- Rear biosensor housing with glowing green PPG LEDs
- Silicone straps with grip ribs
- Red SOS emergency crown with raycast click detection
- Anomaly detection with red strobe alert ring
- Preset camera angles: Front HUD, Rear Sensors, SOS Crown

## Project Structure

```
mobile/
├── App.js
├── src/
│   ├── constants/theme.js
│   ├── hooks/
│   │   ├── usePedometer.js
│   │   └── useTelemetrySync.js
│   ├── components/
│   │   ├── WristbandModel3D.js
│   │   ├── TacticalWristband.js
│   │   ├── WatchBezel3D.js
│   │   ├── WatchCase.js
│   │   ├── WatchStrap.js
│   │   ├── SapphireGlass.js
│   │   ├── BezelRing.js
│   │   ├── StepArcGauge.js
│   │   ├── VitalSlider.js
│   │   ├── HeatStrokeSwitch.js
│   │   ├── AlertBanner.js
│   │   └── RivetCorner.js
│   └── screens/HUDScreen.js
```
