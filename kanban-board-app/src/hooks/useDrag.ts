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

        const clone = el.cloneNode(true) as HTMLDivElement;
        clone.style.width = `${el.clientWidth}px`;
        clone.style.height = `${el.clientHeight}px`;
        clone.style.top = `2px`;
        clone.style.left = `2px`;
        clone.style.outline = '2px solid var(--color-blue-600)';

        const container = document.createElement('div');
        container.style.width = `${el.clientWidth + 4}px`;
        container.style.height = `${el.clientHeight + 4}px`;
        container.style.position = 'absolute';
        container.style.left = '-1000px';
        container.style.top = '-1000px';
        container.appendChild(clone);

        ghostImageRef.current = container;
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
