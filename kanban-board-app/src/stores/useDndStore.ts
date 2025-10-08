import { createRef } from 'react';
import { create } from 'zustand';
import { kanbanTaskItemType, type KanbanTaskStatusEnum, type KanbanTask } from '@/models/kanbanTaskModels';
import useKanbanTasksStore from '@/stores/useKanbanTasksStore';

const ghostImageRef = createRef<HTMLDivElement>();
const activeStatusRef = createRef<number>();
const currentPositionRef = createRef<{ x: number; y: number }>();

interface DropPlacement {
  idAfter: number;
  idBefore: number;
}

interface DndStore<TItem extends { id: number }> {
  activeItem: TItem | null;
  activeStatus: number | null;
  dropPlacement: DropPlacement | null;
  ghostImageRef: React.RefObject<HTMLDivElement | null>;
  activeStatusRef: React.RefObject<number | null>;
  currentPositionRef: React.RefObject<{ x: number; y: number } | null>;
  setActiveItem: <T>(item: T | null) => void;
  setActiveStatus: (itemStatus: number | null) => void;
  setDropPlacement: (dropPlacement: DropPlacement | null) => void;
  updateItemLocation: (eventData: string) => void;
}

const useDndStore = create<DndStore<KanbanTask>>()((set, get) => ({
  activeItem: null,
  activeStatus: null,
  dropPlacement: null,
  ghostImageRef: ghostImageRef,
  activeStatusRef: activeStatusRef,
  currentPositionRef: currentPositionRef,
  setActiveItem: (item) => set({ activeItem: item as KanbanTask | null }),
  setActiveStatus: (itemStatus) => set({ activeStatus: itemStatus }),
  setDropPlacement: (dropPlacement) => set({ dropPlacement }),
  updateItemLocation: (eventData: string) => {
    const state = get();
    if (
      state.activeItem &&
      eventData === `${kanbanTaskItemType}_${state.activeItem.id}` &&
      state.activeStatus !== null &&
      state.dropPlacement
    )
      useKanbanTasksStore
        .getState()
        .updateTaskLocation(
          state.activeItem.id,
          state.activeStatus as KanbanTaskStatusEnum,
          state.dropPlacement.idAfter,
          state.dropPlacement.idBefore,
        );
  },
}));

export { useDndStore as default, type DropPlacement };
