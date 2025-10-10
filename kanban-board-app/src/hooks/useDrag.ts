import { useState, useRef, useEffect, useCallback } from 'react';
import { traverseTree } from '@/lib/helperFunctions';
import useDndStore from '@/stores/useDndStore';

function useDrag<TItem extends { id: number }>(itemType: string, item: TItem) {
  const ref: React.RefObject<HTMLDivElement | null> = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const ghostImageRef = useDndStore((state) => state.ghostImageRef);
  const setActiveItem = useDndStore((state) => state.setActiveItem);

  const onDragStart = useCallback(
    (e: DragEvent) => {
      const el = ref.current;

      if (el && e.dataTransfer) {
        e.stopPropagation();
        setIsDragging(true);

        const elRect = el.getBoundingClientRect();

        ghostImageRef.current = el.cloneNode(true) as HTMLDivElement;

        ghostImageRef.current.style.width = `${el.clientWidth}px`;
        ghostImageRef.current.style.position = 'absolute';
        ghostImageRef.current.style.left = '-1000px';
        ghostImageRef.current.style.top = '-1000px';

        document.body.appendChild(ghostImageRef.current);

        e.dataTransfer.clearData();
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setDragImage(ghostImageRef.current, e.clientX - elRect.x, e.clientY - elRect.y);
        e.dataTransfer.items.add(`${itemType}_${item.id}`, itemType);

        setActiveItem<TItem>(item);
      }
    },
    [ghostImageRef, itemType, item, setActiveItem],
  );

  const onDragEnd = useCallback(() => {
    if (ghostImageRef.current) {
      document.body.removeChild(ghostImageRef.current);
      ghostImageRef.current = null;
    }
    setActiveItem<TItem>(null);
    setIsDragging(false);
  }, [ghostImageRef, setActiveItem]);

  useEffect(() => {
    const el = ref.current;

    if (el) {
      el.setAttribute('draggable', 'true');
      traverseTree(el, (node) => {
        if (node.tagName.toLowerCase() === 'img') node.setAttribute('draggable', 'false');
      });

      el.addEventListener('dragstart', onDragStart);
      el.addEventListener('dragend', onDragEnd);

      return () => {
        el.removeEventListener('dragstart', onDragStart);
        el.removeEventListener('dragend', onDragEnd);
        onDragEnd();
      };
    }
  }, [ref, onDragStart, onDragEnd]);

  return { ref, isDragging };
}

export default useDrag;
