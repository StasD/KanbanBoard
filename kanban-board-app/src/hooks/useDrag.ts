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
  const cloneRef = useRef<HTMLDivElement>(null);
  const onDragEndRef = useRef<(e?: PointerEvent, cancelled?: boolean) => void>(null);

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
        e.preventDefault();
        e.stopPropagation();
        if (cloneRef.current) {
          cloneRef.current.style.left = `${e.pageX - (cursorOffsetRef.current?.x ?? 0)}px`;
          cloneRef.current.style.top = `${e.pageY - (cursorOffsetRef.current?.y ?? 0)}px`;
        }
        pollDropTargets({ x: e.clientX, y: e.clientY });
      }
    },
    [pollDropTargets],
  );

  const onCancel = useCallback((e: PointerEvent) => {
    onDragEndRef.current?.(e, true);
  }, []);

  const onDragEnd = useCallback(
    (e?: PointerEvent, cancelled = false) => {
      const clone = cloneRef.current;

      if (clone) {
        if (onDragEndRef.current) clone.removeEventListener('pointerup', onDragEndRef.current);
        clone.removeEventListener('pointermove', onDrag);
        clone.removeEventListener('pointercancel', onCancel);

        if (pointerId.current) {
          clone.releasePointerCapture(pointerId.current);
          pointerId.current = null;
        }

        document.body.removeChild(clone);
        cloneRef.current = null;
      }

      const el = ref.current;

      if (el && isDraggingRef.current) {
        e?.preventDefault();
        e?.stopPropagation();
        pollDropTargets.cancel();

        if (!cancelled) moveActiveItem();
        setActiveItem(null);
        setActiveStatus(null);
        setDropPlacement(null);

        isDraggingRef.current = false;
      }
    },
    [moveActiveItem, onCancel, onDrag, pollDropTargets, setActiveItem, setActiveStatus, setDropPlacement],
  );

  const onDragStart = useCallback(
    (e: PointerEvent) => {
      if (
        isDraggingRef.current ||
        !e.isPrimary ||
        e.button != 0 ||
        ['button', 'input', 'select', 'option', 'textarea'].some((s) => (e.target as HTMLElement).closest(s) !== null)
      )
        return;

      const el = ref.current;

      if (el) {
        e.preventDefault();
        e.stopPropagation();
        isDraggingRef.current = true;

        const elRect = el.getBoundingClientRect();
        cursorOffsetRef.current = { x: e.clientX - elRect.x, y: e.clientY - elRect.y };

        const clone = el.cloneNode(true) as HTMLDivElement;
        clone.removeAttribute('id');
        clone.style.width = `${el.clientWidth}px`;
        clone.style.height = `${el.clientHeight}px`;
        clone.style.position = 'absolute';
        clone.style.left = `${e.pageX - (cursorOffsetRef.current?.x ?? 0)}px`;
        clone.style.top = `${e.pageY - (cursorOffsetRef.current?.y ?? 0)}px`;
        clone.style.outline = '2px solid var(--color-blue-600)';
        clone.style.zIndex = '100';
        clone.style.opacity = '0.9';
        clone.style.cursor = 'grabbing';

        cloneRef.current = clone;
        document.body.appendChild(clone);

        pointerId.current = e.pointerId;
        clone.setPointerCapture(pointerId.current);
        clone.addEventListener('pointermove', onDrag);
        clone.addEventListener('pointerup', onDragEnd);
        clone.addEventListener('pointercancel', onCancel);

        setActiveItem(item);
      }
    },
    [item, onCancel, onDrag, onDragEnd, setActiveItem],
  );

  useEffect(() => {
    onDragEndRef.current = onDragEnd;

    const el = ref.current;

    if (el) {
      traverseTree(el, (node) => {
        if (node.tagName.toLowerCase() === 'img') {
          node.setAttribute('draggable', 'false');
          (node as HTMLElement).style.touchAction = 'none';
          (node as HTMLElement).style.setProperty('-webkit-touch-callout', 'none');
        }
      });

      el.addEventListener('pointerdown', onDragStart);

      return () => {
        onDragEnd();
        onDragEndRef.current = null;
        el.removeEventListener('pointerdown', onDragStart);
      };
    }
  }, [onDragStart, onDragEnd]);

  return { ref };
}

export default useDrag;
