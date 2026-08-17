import { useState, useEffect, useCallback } from 'react';

export function useFetchData<T>(url: string, pollIntervalMs: number = 10000) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
    if (pollIntervalMs > 0) {
      const interval = setInterval(fetchData, pollIntervalMs);
      return () => clearInterval(interval);
    }
  }, [fetchData, pollIntervalMs]);

  return { data, loading, error, refetch: fetchData };
}
