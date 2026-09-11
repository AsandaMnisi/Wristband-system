import { useState, useEffect, useRef, useCallback } from 'react';

const POLL_INTERVAL_MS = 3000;

// ─── Local rule-based mock (used when backend is unavailable) ────────────────
function localRuleCheck({ heart_rate, skin_temp }) {
  const anomalyReasons = [];
  if (heart_rate > 130)  anomalyReasons.push(`HR ${heart_rate} bpm exceeds 130 bpm limit`);
  if (skin_temp  > 38.5) anomalyReasons.push(`Skin temp ${skin_temp}°C exceeds 38.5°C limit`);
  const is_anomaly = anomalyReasons.length > 0;
  return {
    is_anomaly,
    anomaly_reason: is_anomaly ? anomalyReasons.join(' | ') : null,
    calculated_shift_steps: 0,
    source: 'mock',
  };
}

/**
 * useTelemetrySync
 *
 * Sends a telemetry payload to the backend every POLL_INTERVAL_MS.
 * Falls back to local rule-check when the backend is unreachable.
 *
 * @param {object}  vitals         – { heart_rate, breathing_rate, skin_temp }
 * @param {number}  totalSteps     – raw pedometer step count
 * @param {string}  minerId        – miner identifier
 * @param {string}  apiUrl         – base URL of backend (empty → always mock)
 *
 * Returns:
 *   serverResponse – { is_anomaly, anomaly_reason, calculated_shift_steps, source }
 *   isSyncing      – bool, true while a request is in-flight
 *   lastSyncAt     – Date | null
 */
export function useTelemetrySync(vitals, totalSteps, minerId = 'MINER_001', apiUrl = '') {
  const [serverResponse, setServerResponse] = useState({
    is_anomaly:            false,
    anomaly_reason:        null,
    calculated_shift_steps: 0,
    source:                'idle',
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState(null);

  const vitalsRef   = useRef(vitals);
  const stepsRef    = useRef(totalSteps);
  const intervalRef = useRef(null);

  // Keep refs fresh without re-scheduling the interval
  useEffect(() => { vitalsRef.current = vitals; }, [vitals]);
  useEffect(() => { stepsRef.current  = totalSteps; }, [totalSteps]);

  const sync = useCallback(async () => {
    const payload = {
      miner_id:          minerId,
      total_watch_steps: stepsRef.current,
      heart_rate:        vitalsRef.current.heart_rate,
      breathing_rate:    vitalsRef.current.breathing_rate,
      skin_temp:         vitalsRef.current.skin_temp,
    };

    // ── Try real backend ──────────────────────────────────────────────────
    if (apiUrl) {
      setIsSyncing(true);
      try {
        const res = await fetch(`${apiUrl}/api/v1/telemetry`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload),
          signal:  AbortSignal.timeout(4000),
        });

        if (res.ok) {
          const data = await res.json();
          setServerResponse({ ...data, source: 'server' });
          setLastSyncAt(new Date());
          setIsSyncing(false);
          return;
        }
      } catch {
        // Fall through to mock
      }
      setIsSyncing(false);
    }

    // ── Local mock fallback ──────────────────────────────────────────────
    const mockResult = localRuleCheck(payload);
    setServerResponse(mockResult);
    setLastSyncAt(new Date());
  }, [apiUrl, minerId]);

  useEffect(() => {
    // Fire immediately then every 3 s
    sync();
    intervalRef.current = setInterval(sync, POLL_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [sync]);

  return { serverResponse, isSyncing, lastSyncAt };
}

