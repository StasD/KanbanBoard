import { type User } from '@/models/userModels';

const kanbanTaskItemType = 'kanban_task';

const KanbanTaskStatus = {
  None: 0,
  ToDo: 1,
  InProgress: 2,
  Done: 3,
} as const;

const kanbanTaskStatuses = [
  {
    status: KanbanTaskStatus.None,
    title: 'Backlog',
    bgColor: 'bg-gray-200',
    borderColor: 'border-gray-200',
    chipBaseStyle: 'bg-gray-50 border-gray-600/50',
    chipContentStyle: 'text-gray-600',
  },
  {
    status: KanbanTaskStatus.ToDo,
    title: 'To Do',
    bgColor: 'bg-amber-200',
    borderColor: 'border-amber-200',
    chipBaseStyle: 'bg-amber-50 border-amber-600/50',
    chipContentStyle: 'text-amber-600',
  },
  {
    status: KanbanTaskStatus.InProgress,
    title: 'In Progress',
    bgColor: 'bg-blue-200',
    borderColor: 'border-blue-200',
    chipBaseStyle: 'bg-blue-50 border-blue-600/50',
    chipContentStyle: 'text-blue-600',
  },
  {
    status: KanbanTaskStatus.Done,
    title: 'Done',
    bgColor: 'bg-green-200',
    borderColor: 'border-green-200',
    chipBaseStyle: 'bg-green-50 border-green-600/50',
    chipContentStyle: 'text-green-600',
  },
];

type KanbanTaskStatusEnum = (typeof KanbanTaskStatus)[keyof typeof KanbanTaskStatus];

interface KanbanTaskModel {
  title: string;
  description: string;
  status: KanbanTaskStatusEnum | null;
  assignedUserId: number | null;
}

interface KanbanTaskCommon {
  id: number;
  title: string;
  description: string;
  status: KanbanTaskStatusEnum;
  priority: number;

  assignedUserId: number | null;
  createdByUserId: number | null;
  updatedByUserId: number | null;

  assignedUser: User | null;
  createdByUser: User | null;
  updatedByUser: User | null;
}

interface KanbanTaskServer extends KanbanTaskCommon {
  assignedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface KanbanTask extends KanbanTaskCommon {
  assignedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export {
  kanbanTaskItemType,
  KanbanTaskStatus,
  kanbanTaskStatuses,
  type KanbanTaskStatusEnum,
  type KanbanTaskModel,
  type KanbanTaskServer,
  type KanbanTask,
};
