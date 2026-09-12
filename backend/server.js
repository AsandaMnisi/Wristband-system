import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT || '{}'
);

let db = null;

if (serviceAccount && Object.keys(serviceAccount).length > 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  db = admin.firestore();
  console.log('🔥 Firebase Admin connected to project:', serviceAccount.project_id);
} else {
  console.log('⚠️  No FIREBASE_SERVICE_ACCOUNT env var — API works in demo mode');
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/v1/telemetry/:minerId', async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'Firestore not configured on backend' });
  }
  try {
    const snapshot = await db
      .collection('telemetry')
      .where('miner_id', '==', req.params.minerId)
      .orderBy('created_at', 'desc')
      .limit(100)
      .get();
    const docs = snapshot.docs.map(d => d.data());
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/telemetry', async (req, res) => {
  const payload = req.body;

  if (db) {
    try {
      const docRef = await db.collection('telemetry').add({
        ...payload,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`🔥 Telemetry written to Firestore: ${docRef.id} [${payload.miner_id}]`);
    } catch (firestoreErr) {
      console.error('Firestore write error:', firestoreErr.message);
    }
  } else {
    console.log('📡 Telemetry (demo mode):', payload.miner_id, payload.heart_rate, payload.breath_temp);
  }

  res.json({
    received: true,
    miner_id: payload.miner_id,
    is_anomaly: payload.is_anomaly,
    anomaly_reason: payload.anomaly_reason,
    calculated_shift_steps: payload.total_watch_steps || 0,
    source: db ? 'firestore' : 'demo',
    processed_at: new Date().toISOString(),
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend ready on http://0.0.0.0:${PORT}`);
  console.log(`Telemetry endpoint: POST http://0.0.0.0:${PORT}/api/v1/telemetry`);
  console.log(`Health check: GET http://0.0.0.0:${PORT}/health`);
  console.log(`View data: GET http://0.0.0.0:${PORT}/api/v1/telemetry/:minerId`);
});
