import { useState, useEffect, useRef, useCallback } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getDb } from '../services/firebase';

const POLL_INTERVAL_MS = 3000;

function localRuleCheck({ heart_rate, breathing_rate, skin_temp }) {
  const anomalyReasons = [];
  if (heart_rate > 130) anomalyReasons.push(`HR ${heart_rate} bpm exceeds 130 bpm limit`);
  if (skin_temp > 38.5) anomalyReasons.push(`Skin temp ${skin_temp}°C exceeds 38.5°C limit`);
  const is_anomaly = anomalyReasons.length > 0;
  return {
    is_anomaly,
    anomaly_reason: is_anomaly ? anomalyReasons.join(' | ') : null,
    calculated_shift_steps: 0,
  };
}

export function useTelemetrySync(vitals, totalSteps, minerId, apiUrl, batteryLevel, batteryCharging, rfidWorkerId, isPoweredOn, bandRemoved) {
  const [serverResponse, setServerResponse] = useState({
    is_anomaly: false,
    anomaly_reason: null,
    calculated_shift_steps: 0,
    source: 'idle',
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const vitalsRef = useRef(vitals);
  const stepsRef = useRef(totalSteps);
  const batteryRef = useRef(batteryLevel);
  const chargingRef = useRef(batteryCharging);
  const rfidRef = useRef(rfidWorkerId);
  const poweredRef = useRef(isPoweredOn);
  const bandRemovedRef = useRef(bandRemoved);
  const intervalRef = useRef(null);

  useEffect(() => { vitalsRef.current = vitals; }, [vitals]);
  useEffect(() => { stepsRef.current = totalSteps; }, [totalSteps]);
  useEffect(() => { batteryRef.current = batteryLevel; }, [batteryLevel]);
  useEffect(() => { chargingRef.current = batteryCharging; }, [batteryCharging]);
  useEffect(() => { rfidRef.current = rfidWorkerId; }, [rfidWorkerId]);
  useEffect(() => { poweredRef.current = isPoweredOn; }, [isPoweredOn]);
  useEffect(() => { bandRemovedRef.current = bandRemoved; }, [bandRemoved]);

  const sync = useCallback(async () => {
    if (!poweredRef.current) {
      setConnectionStatus('disconnected');
      return;
    }

    setIsSyncing(true);
    setConnectionStatus('connecting');

    const payload = {
      miner_id: rfidRef.current || minerId,
      total_watch_steps: stepsRef.current,
      heart_rate: vitalsRef.current.heart_rate,
      breathing_rate: vitalsRef.current.breathing_rate,
      skin_temp: vitalsRef.current.skin_temp,
      battery_level: batteryRef.current,
      battery_charging: chargingRef.current,
      is_anomaly: false,
      anomaly_reason: null,
      band_removed: bandRemovedRef.current,
      connection_status: 'connected',
      timestamp: new Date().toISOString(),
      location: {
        latitude: 40.7128 + (Math.random() - 0.5) * 0.01,
        longitude: -74.0060 + (Math.random() - 0.5) * 0.01,
        accuracy: 5,
      },
      device_id: `${minerId}_wristband_001`,
      firmware_version: '2.1.0',
    };

    if (bandRemovedRef.current) {
      payload.is_anomaly = true;
      payload.anomaly_reason = 'Band removed - unable to measure vitals';
      payload.band_removed = true;
    } else if (vitalsRef.current.heart_rate > 130 || vitalsRef.current.skin_temp > 38.5) {
      payload.is_anomaly = true;
      payload.anomaly_reason = localRuleCheck(vitalsRef.current).anomaly_reason;
    }

    try {
      const db = getDb();
      if (db) {
        const docRef = await addDoc(collection(db, 'telemetry'), {
          ...payload,
          created_at: serverTimestamp(),
        });
        const mockResult = localRuleCheck(vitalsRef.current);
        setServerResponse({
          ...mockResult,
          is_anomaly: payload.is_anomaly,
          anomaly_reason: payload.anomaly_reason,
          source: 'firestore',
          doc_id: docRef.id,
        });
        setLastSyncAt(new Date());
        setConnectionStatus('connected');
        setIsSyncing(false);
      } else {
        throw new Error('Firestore not initialized');
      }
    } catch (firestoreErr) {
      console.error('Firestore write failed:', firestoreErr.message);
      const mockResult = localRuleCheck(vitalsRef.current);
      setServerResponse({
        ...mockResult,
        source: 'mock',
      });
      setLastSyncAt(new Date());
    }
  }, [minerId]);

  useEffect(() => {
    if (!isPoweredOn) {
      setConnectionStatus('disconnected');
      return;
    }
    sync();
    intervalRef.current = setInterval(sync, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef);
    };
  }, [sync, isPoweredOn]);

  return { serverResponse, isSyncing, lastSyncAt, connectionStatus };
}
