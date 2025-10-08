import { useState, useRef, useEffect, useCallback } from 'react';
import { useThrottledCallback } from 'use-debounce';
import useDndStore from '@/stores/useDndStore';

function useDrop<TItem extends { id: number }>(itemType: string, items: TItem[], itemStatus: number) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const ref: React.RefObject<HTMLDivElement | null> = useRef(null);

  const activeStatusRef = useDndStore((state) => state.activeStatusRef);
  const currentPositionRef = useDndStore((state) => state.currentPositionRef);
  const setActiveStatus = useDndStore((state) => state.setActiveStatus);
  const setDropPlacement = useDndStore((state) => state.setDropPlacement);
  const updateItemLocation = useDndStore((state) => state.updateItemLocation);

  const calculatePlacement = useCallback(
    (y: number) => {
      let idAfter: number = 0,
        idBefore: number = 0;

      for (const item of items) {
        const id = item.id;
        const card = document.getElementById(`${itemType}_${id}`);

        if (card) {
          const rect = card.getBoundingClientRect();
          // console.log(`y: ${y}; id: ${id}; bottom: ${rect.bottom} top: ${rect.top}`);
          if (y < rect.top + (rect.bottom - rect.top) / 2) {
            idBefore = item.id;
            break;
          } else {
            idAfter = item.id;
          }
        }
      }

      return { idAfter, idBefore };
    },
    [itemType, items],
  );

  const setStatuses = useCallback(
    (isOver: boolean) => {
      setIsDraggingOver(isOver);
      setActiveStatus(isOver ? itemStatus : null);
      setDropPlacement(isOver && currentPositionRef.current ? calculatePlacement(currentPositionRef.current.y) : null);
    },
    [calculatePlacement, currentPositionRef, setActiveStatus, setDropPlacement, itemStatus],
  );

  const throttledSetStatuses = useThrottledCallback(
    (isOver: boolean) => {
      if (activeStatusRef.current === itemStatus) setStatuses(isOver);
    },
    100,
    { leading: true },
  );

  const onDragEnter = useCallback(
    (e: DragEvent) => {
      if (e.dataTransfer?.types.includes(itemType)) {
        e.preventDefault();
        currentPositionRef.current = { x: e.x, y: e.y };
        activeStatusRef.current = itemStatus;
        throttledSetStatuses(true);
      }
    },
    [activeStatusRef, currentPositionRef, itemStatus, itemType, throttledSetStatuses],
  );

  const onDragLeave = useCallback(
    (e: DragEvent) => {
      if (e.dataTransfer?.types.includes(itemType)) {
        e.preventDefault();
        currentPositionRef.current = { x: e.x, y: e.y };

        const el = ref.current;

        if (el) {
          const rect = el.getBoundingClientRect();

          if (!(e.x >= rect.left && e.x <= rect.right && e.y >= rect.top && e.y <= rect.bottom)) {
            throttledSetStatuses(false);
          }
        }
      }
    },
    [currentPositionRef, itemType, throttledSetStatuses],
  );

  const onDragOver = useCallback(
    (e: DragEvent) => {
      if (e.dataTransfer?.types.includes(itemType)) {
        e.preventDefault();
        currentPositionRef.current = { x: e.x, y: e.y };
        activeStatusRef.current = itemStatus;
        throttledSetStatuses(true);
      }
    },
    [itemType, currentPositionRef, activeStatusRef, itemStatus, throttledSetStatuses],
  );

  const onDrop = useCallback(
    (e: DragEvent) => {
      if (e.dataTransfer?.types.includes(itemType)) {
        e.preventDefault();
        updateItemLocation(e.dataTransfer?.getData(itemType) ?? '');
        activeStatusRef.current = null;
        setStatuses(false);
      }
    },
    [activeStatusRef, itemType, setStatuses, updateItemLocation],
  );

  useEffect(() => {
    const el = ref.current;

    if (el) {
      el.addEventListener('dragenter', onDragEnter);
      el.addEventListener('dragleave', onDragLeave);
      el.addEventListener('dragover', onDragOver);
      el.addEventListener('drop', onDrop);

      return () => {
        el.removeEventListener('dragenter', onDragEnter);
        el.removeEventListener('dragleave', onDragLeave);
        el.removeEventListener('dragover', onDragOver);
        el.removeEventListener('drop', onDrop);
        setStatuses(false);
      };
    }
  }, [ref, onDragEnter, onDragLeave, onDragOver, onDrop, setStatuses]);

  return { ref, isDraggingOver };
}

export default useDrop;
