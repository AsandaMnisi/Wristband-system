import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'telemetry.sqlite');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const db = await open({
  filename: DB_PATH,
  driver: sqlite3.Database,
});

await db.exec(`
  CREATE TABLE IF NOT EXISTS telemetry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    miner_id TEXT,
    device_id TEXT,
    total_watch_steps INTEGER,
    heart_rate INTEGER,
    breathing_rate INTEGER,
    skin_temp REAL,
    battery_level INTEGER,
    battery_charging INTEGER,
    is_anomaly INTEGER,
    anomaly_reason TEXT,
    band_removed INTEGER,
    latitude REAL,
    longitude REAL,
    location_accuracy REAL,
    firmware_version TEXT,
    connection_status TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log('🗄️  SQLite database ready:', DB_PATH);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/v1/telemetry/:minerId', async (req, res) => {
  const rows = await db.all(
    'SELECT * FROM telemetry WHERE miner_id = ? ORDER BY created_at DESC LIMIT 100',
    [req.params.minerId]
  );
  res.json(rows);
});

app.post('/api/v1/telemetry', async (req, res) => {
  const payload = req.body;

  console.log('📡 Telemetry received:', {
    miner_id: payload.miner_id,
    heart_rate: payload.heart_rate,
    skin_temp: payload.skin_temp,
    is_anomaly: payload.is_anomaly,
    band_removed: payload.band_removed,
  });

  if (payload.is_anomaly) {
    console.log(`🔴 ALERT: ${payload.anomaly_reason}`);
  }

  if (payload.band_removed) {
    console.log(`⚪ Band removed — vitals unavailable`);
  }

  await db.run(
    `INSERT INTO telemetry (
      miner_id, device_id, total_watch_steps, heart_rate, breathing_rate,
      skin_temp, battery_level, battery_charging, is_anomaly, anomaly_reason,
      band_removed, latitude, longitude, location_accuracy, firmware_version,
      connection_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.miner_id,
      payload.device_id,
      payload.total_watch_steps,
      payload.heart_rate,
      payload.breathing_rate,
      payload.skin_temp,
      payload.battery_level,
      payload.battery_charging ? 1 : 0,
      payload.is_anomaly ? 1 : 0,
      payload.anomaly_reason,
      payload.band_removed ? 1 : 0,
      payload.location?.latitude,
      payload.location?.longitude,
      payload.location?.accuracy,
      payload.firmware_version,
      payload.connection_status,
    ]
  );

  res.json({
    received: true,
    miner_id: payload.miner_id,
    is_anomaly: payload.is_anomaly,
    anomaly_reason: payload.anomaly_reason,
    calculated_shift_steps: 0,
    source: 'server',
    processed_at: new Date().toISOString(),
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend ready on http://0.0.0.0:${PORT}`);
  console.log(`Telemetry endpoint: POST http://0.0.0.0:${PORT}/api/v1/telemetry`);
  console.log(`Health check: GET http://0.0.0.0:${PORT}/health`);
  console.log(`View data: GET http://0.0.0.0:${PORT}/api/v1/telemetry/:minerId`);
  console.log(`SQLite database: ${DB_PATH}`);
});
