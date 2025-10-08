import axios from '@/api/axios';
import {
  type KanbanTaskModel,
  type KanbanTaskServer,
  type KanbanTaskStatusEnum,
  type KanbanTask,
} from '@/models/kanbanTaskModels';

const _kanbanTasksUrl = '/KanbanTasks';

const _transformKanbanTask = (kanbanTask: KanbanTaskServer): KanbanTask => ({
  ...kanbanTask,
  assignedAt: kanbanTask.assignedAt ? new Date(kanbanTask.assignedAt) : null,
  createdAt: new Date(kanbanTask.createdAt),
  updatedAt: new Date(kanbanTask.updatedAt),
});

const _transformKanbanTasks = (kanbanTasks: KanbanTaskServer[]): KanbanTask[] => kanbanTasks.map(_transformKanbanTask);

const getKanbanTasks = () => axios.get(_kanbanTasksUrl).then(({ data }) => _transformKanbanTasks(data));

const getKanbanTask = (id: number) =>
  axios.get(`${_kanbanTasksUrl}/${id}`).then(({ data }) => _transformKanbanTask(data));

const createKanbanTask = (kanbanTaskModel: KanbanTaskModel) =>
  axios.post(_kanbanTasksUrl, kanbanTaskModel).then(({ data }) => _transformKanbanTask(data));

const updateKanbanTask = (id: number, kanbanTaskModel: KanbanTaskModel) =>
  axios.put(`${_kanbanTasksUrl}/${id}`, kanbanTaskModel).then(({ data }) => _transformKanbanTask(data));

const deleteKanbanTask = (id: number) => axios.delete(`${_kanbanTasksUrl}/${id}`).then(() => {});

const updateKanbanTaskLocation = (id: number, newStatus: KanbanTaskStatusEnum, idAfter: number, idBefore: number) =>
  axios
    .post(`${_kanbanTasksUrl}/${id}/UpdateLocation`, {}, { params: { newStatus, idAfter, idBefore } })
    .then(({ data }) => _transformKanbanTask(data));

export {
  getKanbanTasks,
  getKanbanTask,
  createKanbanTask,
  updateKanbanTask,
  deleteKanbanTask,
  updateKanbanTaskLocation,
};
