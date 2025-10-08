import { useState, useEffect } from 'react';
import { type AxiosError } from '@/lib/errors';

function useFetchFunction<T>(fetchFunction: () => Promise<T>, cb?: (_data: T | null) => void) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<AxiosError | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const _data = await fetchFunction();
        setIsLoading(false);
        setData(_data);
        cb?.(_data);
      } catch (e) {
        setIsLoading(false);
        setLoadingError(e as AxiosError | null);
      }
    }
    fetchData();
  }, [fetchFunction, cb]);

  return {
    data,
    isLoading,
    loadingError,
  };
}

export default useFetchFunction;
