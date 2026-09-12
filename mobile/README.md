# 3D Tactical HUD Mining Safety Wristband

## Stack
- **React Native** + **React Native Web**
- **react-native-svg** — SVG bezel ring + step arc gauge
- **Three.js** — real-time interactive 3D wristband model
- **Firebase Firestore** — live telemetry database
- **Express.js** — backend API server (backend/)
- **Metro** — bundler (via Expo CLI for web)

## Quick Start

### Frontend (Web)
```bash
cd mobile
npm install
npm start
```
Open `http://localhost:8081` (or the port shown in terminal) in your browser.

### Backend (optional - for REST API + remote database)
```bash
cd backend
npm install
npm start
```
Server starts on `http://localhost:3001`.

### Build for production (web)
```bash
cd mobile
npx expo export --platform web
npx serve dist
```

## Configuration

### Firebase Setup
1. Create a project at https://console.firebase.google.com
2. Enable Firestore Database
3. Copy config from Project Settings → Your Apps → Web app
4. Update `.env` with your values

### Backend on Another Machine
1. Copy `backend/` to the target machine
2. Run `npm install && npm start`
3. Note the machine's local IP (e.g., `192.168.1.100`)
4. Update `mobile/.env`:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.1.100:3001
   ```

### Multiple Devices
- Each phone gets a unique worker ID automatically (stored in localStorage)
- Or use a URL param: `http://your-server:9090?worker=MINER_001`

## Features
- Interactive 3D drag-to-rotate wristband model
- Live tactical HUD canvas on watch face
- AI status light: **blue solid** when connected to backend, **blue blinking** when connecting
- Red light on vital spike detection (HR >130 or temp >38.5°C)
- Purple flashing when band is removed
- Rear biosensor housing with glowing green PPG LEDs
- Cream white silicone straps with grip ribs
- Two control buttons + USB-C charging port
- Real-time telemetry sync to Firestore + REST API

## Project Structure
```
mobile/
├── App.js
├── backend/
│   └── server.js          # Express backend (REST endpoint)
├── src/
│   ├── constants/theme.js
│   ├── hooks/
│   │   ├── usePedometer.js
│   │   └── useTelemetrySync.js
│   ├── services/
│   │   └── firebase.js
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
