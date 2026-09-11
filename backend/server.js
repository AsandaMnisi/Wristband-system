import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/v1/telemetry', (req, res) => {
  const payload = req.body;

  console.log('📡 Telemetry received:', {
    miner_id: payload.miner_id,
    connection_status: payload.connection_status,
    band_removed: payload.band_removed,
    heart_rate: payload.heart_rate,
    skin_temp: payload.skin_temp,
    is_anomaly: payload.is_anomaly,
    anomaly_reason: payload.anomaly_reason,
    location: payload.location,
    timestamp: payload.timestamp,
  });

  if (payload.is_anomaly) {
    console.log(`🔴 ALERT: ${payload.anomaly_reason}`);
  }

  if (payload.band_removed) {
    console.log(`⚪ Band removed — vitals unavailable`);
  }

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

app.listen(PORT, () => {
  console.log(`Backend ready on http://localhost:${PORT}`);
  console.log(`Telemetry endpoint: POST http://localhost:${PORT}/api/v1/telemetry`);
});
