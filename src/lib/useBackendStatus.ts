import { useEffect, useState, useCallback } from 'react';

type ConnectionStatus = 'checking' | 'online' | 'offline';

const HEALTH_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'}/health`;
const CHECK_INTERVAL_MS = 30_000; // re-check every 30 seconds
const TIMEOUT_MS = 5_000;

export function useBackendStatus() {
  const [status, setStatus] = useState<ConnectionStatus>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const check = useCallback(async () => {
    setStatus('checking');
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const res = await fetch(HEALTH_URL, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timer);
      setStatus(res.ok ? 'online' : 'offline');
    } catch {
      setStatus('offline');
    }
    setLastChecked(new Date());
  }, []);

  useEffect(() => {
    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [check]);

  return { status, lastChecked, retry: check };
}
