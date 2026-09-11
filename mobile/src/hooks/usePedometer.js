import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

export function usePedometer() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [totalSteps, setTotalSteps]   = useState(0);
  const [error, setError]             = useState(null);
  const intervalRef = useRef(null);
  const baselineRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    if (Platform.OS === 'web') {
      setIsAvailable(false);
      setError('Web Browser Mode (Pedometer Simulated)');
      let stepCount = 0;
      intervalRef.current = setInterval(() => {
        if (!mounted) return;
        stepCount += Math.floor(Math.random() * 3);
        setTotalSteps(stepCount);
      }, 2000);
      return () => {
        mounted = false;
        clearInterval(intervalRef.current);
      };
    }

    const bootstrap = async () => {
      try {
        const { Pedometer } = require('expo-sensors');
        const { granted } = await Pedometer.requestPermissionsAsync();
        if (!granted) {
          setError('Motion permission denied');
          return;
        }

        const available = await Pedometer.isAvailableAsync();
        if (!mounted) return;

        if (!available) {
          setError('Pedometer not available on this device');
          setIsAvailable(false);
          return;
        }

        setIsAvailable(true);
        const subscription = Pedometer.watchStepCount(({ steps }) => {
          if (!mounted) return;
          if (baselineRef.current === null) {
            baselineRef.current = steps;
          }
          setTotalSteps(steps - baselineRef.current);
        });

        return () => subscription.remove();
      } catch (err) {
        if (mounted) setError(err.message);
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  return { isAvailable, totalSteps, error };
}
