import { useState, useEffect, useCallback } from 'react';
import { type AxiosError } from '@/lib/errors';

function useFetchFunction<T>(
  fetchFunction: () => Promise<T>,
  cb: ((_data: T | null) => void) | null = null,
  runImmediately = true,
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingError, setLoadingError] = useState<AxiosError | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setData(null);
      setLoadingError(null);
      setIsLoading(true);

      const _data = await fetchFunction();

      setIsLoading(false);
      setData(_data);
      cb?.(_data);
    } catch (e) {
      setIsLoading(false);
      setLoadingError(e as AxiosError | null);
    }
  }, [cb, fetchFunction]);

  useEffect(() => {
    if (runImmediately) fetchData();
  }, [fetchData, runImmediately]);

  return {
    data,
    isLoading,
    loadingError,
    resetLoadingError: () => setLoadingError(null),
    fetchData,
  };
}

export default useFetchFunction;
