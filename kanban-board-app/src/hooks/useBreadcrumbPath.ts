import { useEffect } from 'react';
import { useOutletContext } from 'react-router';
import { type OutletContext } from '@/lib/outletContext'

function useBreadcrumbPath(breadcrumbPath: string) {
  const setBreadcrumbPath = useOutletContext<OutletContext>().setBreadcrumbPath;

  useEffect(() => {
    setBreadcrumbPath(breadcrumbPath);
  }, [setBreadcrumbPath, breadcrumbPath]);
}

export default useBreadcrumbPath;
