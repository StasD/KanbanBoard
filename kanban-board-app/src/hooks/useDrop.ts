import { useRef, useEffect, useCallback } from 'react';
import useDndStore, { type Pos } from '@/stores/useDndStore';
import { type KanbanTaskStatusEnum, type KanbanTask } from '@/models/kanbanTaskModels';

function useDrop(itemType: string, items: KanbanTask[], itemStatus: KanbanTaskStatusEnum) {
  const ref = useRef<HTMLDivElement>(null);
  const dropTargetId = useRef<number>(0);

  const addDropTarget = useDndStore((state) => state.addDropTarget);
  const removeDropTarget = useDndStore((state) => state.removeDropTarget);
  const setActiveStatus = useDndStore((state) => state.setActiveStatus);
  const setDropPlacement = useDndStore((state) => state.setDropPlacement);

  const calculatePlacement = useCallback(
    (y: number) => {
      let idAfter: number = 0,
        idBefore: number = 0;

      for (const item of items) {
        const id = item.id;
        const card = document.getElementById(`${itemType}_${id}`);

        if (card) {
          const rect = card.getBoundingClientRect();

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

  const handleOver = useCallback(
    (pos: Pos) => {
      const el = ref.current;

      if (el) {
        const rect = el.getBoundingClientRect();

        const isOver = pos.x >= rect.left && pos.x <= rect.right && pos.y >= rect.top && pos.y <= rect.bottom;

        if (isOver) {
          setActiveStatus(itemStatus);
          setDropPlacement(calculatePlacement(pos.y));
        }

        return isOver;
      }

      return false;
    },
    [calculatePlacement, itemStatus, setActiveStatus, setDropPlacement],
  );

  useEffect(() => {
    const el = ref.current;

    if (el) {
      dropTargetId.current = addDropTarget({ id: 0, handleOver });
      return () => {
        removeDropTarget(dropTargetId.current);
      };
    }
  }, [addDropTarget, handleOver, removeDropTarget]);

  return { ref };
}

export default useDrop;
