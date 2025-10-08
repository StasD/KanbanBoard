import { useEffect, type ReactNode } from 'react';
import { addToast } from '@heroui/react';
import { type AxiosError } from '@/lib/errors';

function useDisplayErrorToast(error: AxiosError | null, node: ReactNode, onClose: () => void) {
  useEffect(() => {
    if (error) {
      addToast({
        color: 'danger',
        hideIcon: true,
        classNames: {
          base: 'rounded-lg shadow-lg',
        },
        onClose,
        description: node,
      });
    }
  }, [error, node, onClose]);
}

export default useDisplayErrorToast;
