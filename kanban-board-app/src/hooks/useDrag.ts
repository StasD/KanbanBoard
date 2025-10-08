import { useState, useRef, useEffect, useCallback } from 'react';
import { traverseTree } from '@/lib/helperFunctions';
import useDndStore from '@/stores/useDndStore';

function useDrag<TItem extends { id: number }>(itemType: string, item: TItem) {
  const ref: React.RefObject<HTMLDivElement | null> = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const ghostImage = useDndStore((state) => state.ghostImageRef);
  const setActiveItem = useDndStore((state) => state.setActiveItem);

  const onDragStart = useCallback(
    (e: DragEvent) => {
      const el = ref.current;

      if (el && e.dataTransfer) {
        e.stopPropagation();
        setIsDragging(true);

        const elRect = el.getBoundingClientRect();

        ghostImage.current = el.cloneNode(true) as HTMLDivElement;

        ghostImage.current.style.width = `${el.clientWidth}px`;
        ghostImage.current.style.position = 'absolute';
        ghostImage.current.style.left = '-1000px';
        ghostImage.current.style.top = '-1000px';

        document.body.appendChild(ghostImage.current);

        e.dataTransfer.clearData();
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setDragImage(ghostImage.current, e.clientX - elRect.x, e.clientY - elRect.y);
        e.dataTransfer.items.add(`${itemType}_${item.id}`, itemType);

        setActiveItem<TItem>(item);
      }
    },
    [ghostImage, itemType, item, setActiveItem],
  );

  const onDragEnd = useCallback(() => {
    if (ghostImage.current) {
      document.body.removeChild(ghostImage.current);
      ghostImage.current = null;
    }
    setActiveItem<TItem>(null);
    setIsDragging(false);
  }, [ghostImage, setActiveItem]);

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
