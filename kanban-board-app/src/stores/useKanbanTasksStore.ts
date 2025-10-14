import { create } from 'zustand';
import { type KanbanTaskStatusEnum, type KanbanTask } from '@/models/kanbanTaskModels';
import { updateKanbanTaskLocation } from '@/api/kanbanTasksApi';
import { type AxiosError } from '@/lib/errors';
import { findPos } from '@/lib/helperFunctions';

let lastAddedIdResetTimer: number;

interface KanbanTasksStore {
  kanbanTasks: KanbanTask[] | null;
  isUpdatingTaskLocation: boolean;
  updateTaskLocationError: AxiosError | null;
  lastAddedId: number | null;
  setKanbanTasks: (kanbanTasks: KanbanTask[] | null) => void;
  addUpdateKanbanTask: (kanbanTask: KanbanTask) => void;
  removeKanbanTask: (kanbanTaskId: number) => void;
  resetUpdateTaskLocationError: () => void;
  updateTaskLocation: (
    kanbanTaskId: number,
    newStatus: KanbanTaskStatusEnum,
    idAfter: number,
    idBefore: number,
  ) => Promise<void>;
}

const useKanbanTasksStore = create<KanbanTasksStore>()((set, get) => ({
  kanbanTasks: null,
  isUpdatingTaskLocation: false,
  updateTaskLocationError: null,
  lastAddedId: null,

  setKanbanTasks: (kanbanTasks) => set({ kanbanTasks }),

  addUpdateKanbanTask: (kanbanTask) => {
    const state = get();
    const kanbanTasks = state.kanbanTasks;

    if (kanbanTasks) {
      const posKanbanTask = findPos(kanbanTasks, kanbanTask.id);
      set({
        kanbanTasks:
          posKanbanTask >= 0
            ? [...kanbanTasks.slice(0, posKanbanTask), kanbanTask, ...kanbanTasks.slice(posKanbanTask + 1)]
            : [...kanbanTasks, kanbanTask],
        lastAddedId: kanbanTask.id,
      });
      clearTimeout(lastAddedIdResetTimer);
      lastAddedIdResetTimer = setTimeout(() => set({ lastAddedId: null }), 6000);
    }
  },

  removeKanbanTask: (kanbanTaskId) => {
    const state = get();
    const kanbanTasks = state.kanbanTasks;

    if (kanbanTasks) {
      const posKanbanTask = findPos(kanbanTasks, kanbanTaskId);
      if (posKanbanTask >= 0) {
        set({
          kanbanTasks: [...kanbanTasks.slice(0, posKanbanTask), ...kanbanTasks.slice(posKanbanTask + 1)],
        });
      }
    }
  },

  resetUpdateTaskLocationError: () => set({ updateTaskLocationError: null }),

  updateTaskLocation: async (kanbanTaskId, newStatus, idAfter, idBefore) => {
    if (idAfter === kanbanTaskId || idBefore === kanbanTaskId) return; // same place, there is nothing to do

    const state = get();

    const kanbanTasks = state.kanbanTasks;

    if (!kanbanTasks) return;

    const posKanbanTask = findPos(kanbanTasks, kanbanTaskId);
    const posTaskAfter = findPos(kanbanTasks, idAfter);
    const posTaskBefore = findPos(kanbanTasks, idBefore);

    if (posKanbanTask === null || (idAfter > 0 && posTaskAfter === null) || (idBefore > 0 && posTaskBefore === null))
      return; // this should not happen

    const taskAfter = posTaskAfter === null ? null : kanbanTasks[posTaskAfter];
    const taskBefore = posTaskBefore === null ? null : kanbanTasks[posTaskBefore];

    if ((taskAfter && taskAfter.status !== newStatus) || (taskBefore && taskBefore.status !== newStatus)) return; // this should not happen

    set({ isUpdatingTaskLocation: true, updateTaskLocationError: null });

    // all good, send update request to the server
    try {
      const updatedTask = await updateKanbanTaskLocation(kanbanTaskId, newStatus, idAfter, idBefore);
      state.addUpdateKanbanTask(updatedTask);
      set({ isUpdatingTaskLocation: false, updateTaskLocationError: null });
    } catch (e) {
      set({ isUpdatingTaskLocation: false, updateTaskLocationError: e as AxiosError });
    }
  },
}));

export default useKanbanTasksStore;
