import { useRef, useEffect, useCallback } from 'react';
import { traverseTree } from '@/lib/helperFunctions';
import { type KanbanTask } from '@/models/kanbanTaskModels';
import { useThrottledCallback } from 'use-debounce';
import useDndStore, { type Pos } from '@/stores/useDndStore';

function useDrag(item: KanbanTask) {
  const ref = useRef<HTMLDivElement>(null);
  const pointerId = useRef<number>(null);
  const cursorOffsetRef = useRef<{ x: number; y: number }>(null);
  const isDraggingRef = useRef(false);
  const ghostImageRef = useRef<HTMLDivElement>(null);

  const dropTargetsRef = useDndStore((state) => state.dropTargetsRef);
  const setActiveItem = useDndStore((state) => state.setActiveItem);
  const setActiveStatus = useDndStore((state) => state.setActiveStatus);
  const setDropPlacement = useDndStore((state) => state.setDropPlacement);
  const moveActiveItem = useDndStore((state) => state.moveActiveItem);

  const pollDropTargetsCb = useCallback(
    (pos: Pos) => {
      if (!isDraggingRef.current) return;

      if (!dropTargetsRef.current?.some((dropTarget) => dropTarget.handleOver(pos))) {
        setActiveStatus(null);
        setDropPlacement(null);
      }
    },
    [dropTargetsRef, setActiveStatus, setDropPlacement],
  );

  const pollDropTargets = useThrottledCallback((pos: Pos) => pollDropTargetsCb(pos), 100);

  const onDrag = useCallback(
    (e: PointerEvent) => {
      const el = ref.current;

      if (el && isDraggingRef.current) {
        e.stopPropagation();
        if (ghostImageRef.current) {
          ghostImageRef.current.style.transform = `translate(${1000 + e.pageX - (cursorOffsetRef.current?.x ?? 0)}px, ${1000 + e.pageY - (cursorOffsetRef.current?.y ?? 0)}px)`;
          // ghostImageRef.current.style.left = `${e.pageX - (cursorOffsetRef.current?.x ?? 0)}px`;
          // ghostImageRef.current.style.top = `${e.pageY - (cursorOffsetRef.current?.y ?? 0)}px`;
        }
        pollDropTargets({ x: e.clientX, y: e.clientY });
      }
    },
    [pollDropTargets],
  );

  const onDragEnd = useCallback(() => {
    if (ghostImageRef.current) {
      document.body.removeChild(ghostImageRef.current);
      ghostImageRef.current = null;
    }

    const el = ref.current;

    if (el && isDraggingRef.current) {
      moveActiveItem();
      setActiveItem(null);
      setActiveStatus(null);
      setDropPlacement(null);

      isDraggingRef.current = false;
      el.removeEventListener('pointerup', onDragEnd);
      el.removeEventListener('pointermove', onDrag);
      if (pointerId.current) el.releasePointerCapture(pointerId.current);
    }
  }, [moveActiveItem, onDrag, setActiveItem, setActiveStatus, setDropPlacement]);

  const onDragStart = useCallback(
    (e: PointerEvent) => {
      if (
        isDraggingRef.current ||
        e.button != 0 ||
        ['button', 'input', 'select', 'option', 'textarea'].some((s) => (e.target as HTMLElement).closest(s) !== null)
      )
        return;

      const el = ref.current;

      if (el) {
        e.preventDefault();
        e.stopPropagation();
        pointerId.current = e.pointerId;
        el.setPointerCapture(pointerId.current);
        el.addEventListener('pointermove', onDrag);
        el.addEventListener('pointerup', onDragEnd);
        isDraggingRef.current = true;

        const elRect = el.getBoundingClientRect();

        const clone = el.cloneNode(true) as HTMLDivElement;
        clone.removeAttribute('id');
        clone.style.width = `${el.clientWidth}px`;
        clone.style.height = `${el.clientHeight}px`;
        clone.style.top = `2px`;
        clone.style.left = `2px`;
        clone.style.outline = '2px solid var(--color-blue-600)';
        clone.style.cursor = 'grabbing';

        const container = document.createElement('div');
        container.style.width = `${el.clientWidth + 4}px`;
        container.style.height = `${el.clientHeight + 4}px`;
        container.style.position = 'absolute';
        container.style.left = '-1000px';
        container.style.top = '-1000px';
        container.style.zIndex = '100';
        container.style.opacity = '0.85';
        container.appendChild(clone);

        ghostImageRef.current = container;
        document.body.appendChild(container);

        cursorOffsetRef.current = { x: e.clientX - elRect.x, y: e.clientY - elRect.y };

        setActiveItem(item);
      }
    },
    [item, onDrag, onDragEnd, setActiveItem],
  );

  useEffect(() => {
    const el = ref.current;

    if (el) {
      traverseTree(el, (node) => {
        if (node.tagName.toLowerCase() === 'img') node.setAttribute('draggable', 'false');
      });

      el.addEventListener('pointerdown', onDragStart);

      return () => {
        onDragEnd();
        el.removeEventListener('pointerdown', onDragStart);
      };
    }
  }, [onDragEnd, onDragStart]);

  return { ref };
}

export default useDrag;
