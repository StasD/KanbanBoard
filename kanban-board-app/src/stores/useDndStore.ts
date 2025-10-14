import { createRef } from 'react';
import { create } from 'zustand';
import { type KanbanTaskStatusEnum, type KanbanTask } from '@/models/kanbanTaskModels';
import useKanbanTasksStore from '@/stores/useKanbanTasksStore';
import { findPos } from '@/lib/helperFunctions';

interface Pos {
  x: number;
  y: number;
}

interface DropPlacement {
  idAfter: number;
  idBefore: number;
}

interface DropTarget {
  id: number;
  handleOver: (pos: Pos) => boolean;
}

const dropTargetsRef = createRef<DropTarget[]>();
const dropTargetIdCounterRef = createRef<number>();

interface DndStore {
  activeItem: KanbanTask | null;
  activeStatus: KanbanTaskStatusEnum | null;
  dropPlacement: DropPlacement | null;
  dropTargetsRef: React.RefObject<DropTarget[] | null>;
  setActiveItem: (item: KanbanTask | null) => void;
  setActiveStatus: (itemStatus: KanbanTaskStatusEnum | null) => void;
  setDropPlacement: (dropPlacement: DropPlacement | null) => void;
  addDropTarget: (dropTarget: DropTarget) => number;
  removeDropTarget: (dropTargetId: number) => void;
  moveActiveItem: () => void;
}

const useDndStore = create<DndStore>()((set, get) => ({
  activeItem: null,
  activeStatus: null,
  dropPlacement: null,
  dropTargetsRef: dropTargetsRef,
  setActiveItem: (item) => set({ activeItem: item }),
  setActiveStatus: (itemStatus) => set({ activeStatus: itemStatus }),
  setDropPlacement: (dropPlacement) => set({ dropPlacement }),
  addDropTarget: (dropTarget) => {
    const state = get();
    const dropTargets = state.dropTargetsRef.current;
    const dropTargetId = (dropTargetIdCounterRef.current ?? 0) + 1;
    dropTargetIdCounterRef.current = dropTargetId;
    state.dropTargetsRef.current = [...(dropTargets ?? []), { ...dropTarget, id: dropTargetId }];
    return dropTargetId;
  },
  removeDropTarget: (dropTargetId) => {
    const state = get();
    const dropTargets = state.dropTargetsRef.current;
    if (dropTargets) {
      const posDropTarget = findPos(dropTargets, dropTargetId);
      if (posDropTarget >= 0)
        state.dropTargetsRef.current = [
          ...dropTargets.slice(0, posDropTarget),
          ...dropTargets.slice(posDropTarget + 1),
        ];
    }
  },
  moveActiveItem: () => {
    const state = get();
    if (state.activeItem && state.activeStatus !== null && state.dropPlacement)
      useKanbanTasksStore
        .getState()
        .updateTaskLocation(
          state.activeItem.id,
          state.activeStatus,
          state.dropPlacement.idAfter,
          state.dropPlacement.idBefore,
        );
  },
}));

export { useDndStore as default, type Pos, type DropPlacement, type DropTarget };
