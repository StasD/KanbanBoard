import { useState, useEffect, useCallback } from 'react';
import { type AxiosError } from '@/lib/errors';

function useFetchFunction<T>(
  fetchFunction: () => Promise<T> | null,
  cb: ((_data: T | null) => void) | null = null,
  runImmediately = true,
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingError, setLoadingError] = useState<AxiosError | null>(null);

  const fetchData = useCallback(async () => {
    setData(null);
    setIsLoading(true);
    setLoadingError(null);

    try {
      const _data = await fetchFunction();
      setData(_data);
      cb?.(_data);
    } catch (e) {
      setLoadingError(e as AxiosError | null);
    } finally {
      setIsLoading(false);
    }
  }, [cb, fetchFunction]);

  useEffect(() => {
    if (runImmediately) fetchData();
  }, [fetchData, runImmediately]);

  return {
    data,
    isLoading,
    loadingError,
    fetchData,
  };
}

export default useFetchFunction;
