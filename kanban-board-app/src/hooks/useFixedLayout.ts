import { useEffect } from 'react';
import { useOutletContext } from 'react-router';
import { type OutletContext } from '@/lib/outletContext';

function useFixedLayout(enable: boolean) {
  const setUseFixedLayout = useOutletContext<OutletContext>().setUseFixedLayout;

  useEffect(() => {
    setUseFixedLayout(enable);
  }, [setUseFixedLayout, enable]);
}

export default useFixedLayout;
