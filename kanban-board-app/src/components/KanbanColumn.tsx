import { Fragment, useMemo } from 'react';
import { Chip, Divider } from '@heroui/react';
import {
  kanbanTaskItemType,
  kanbanTaskStatuses,
  type KanbanTaskStatusEnum,
  type KanbanTask,
} from '@/models/kanbanTaskModels';
import KanbanCard from '@/components/KanbanCard';
import useDndStore from '@/stores/useDndStore';
import useDrop from '@/hooks/useDrop';

function KanbanColumn({ kanbanTasks, taskStatus }: { kanbanTasks: KanbanTask[]; taskStatus: KanbanTaskStatusEnum }) {
  const kanbanTasksToDisplay = useMemo(
    () => kanbanTasks.filter((kt) => kt.status === taskStatus).sort((kt1, kt2) => kt1.priority - kt2.priority),
    [kanbanTasks, taskStatus],
  );

  const taskStatusConfig = kanbanTaskStatuses[taskStatus];

  const { ref } = useDrop(kanbanTaskItemType, kanbanTasksToDisplay, taskStatus);

  const activeStatus = useDndStore((state) => state.activeStatus);
  const dropPlacement = useDndStore((state) => state.dropPlacement);

  let idAfter: number = 0,
    idBefore: number = 0;

  return (
    <div
      ref={ref}
      className={`flex flex-col overflow-auto items-start flex-1 min-w-[280px] max-w-[300px] ${taskStatusConfig.bgColor} rounded-md border-2 ${activeStatus === taskStatus ? 'border-blue-600' : taskStatusConfig.borderColor}`}
    >
      <div className="flex w-full items-center justify-between py-3 px-2">
        <Chip
          classNames={{
            base: `rounded-large border ${taskStatusConfig.chipBaseStyle}`,
            content: `drop-shadow-xs shadow-black font-semibold ${taskStatusConfig.chipContentStyle}`,
          }}
        >
          {taskStatusConfig.title}
        </Chip>
        <Chip
          classNames={{
            base: `rounded-lg border border-gray-100/50 bg-white`,
            content: `text-xs drop-shadow-xs shadow-black font-semibold text-foreground/80 dark:text-background/80 px-0`,
          }}
        >
          {kanbanTasksToDisplay.length}
        </Chip>
      </div>
      <div
        className="flex flex-col grow w-full overflow-auto items-start gap-[3px] px-2 mb-2"
        style={{ scrollbarWidth: 'thin' }}
      >
        {kanbanTasksToDisplay.map((kt) => {
          idAfter = idBefore;
          idBefore = kt.id;
          return (
            <Fragment key={kt.id}>
              <Divider
                className={`h-0.5 ${activeStatus === taskStatus && dropPlacement?.idAfter === idAfter && dropPlacement?.idBefore === idBefore ? 'bg-blue-600' : taskStatusConfig.bgColor}`}
              />
              <KanbanCard kanbanTask={kt} />
            </Fragment>
          );
        })}
        <Divider
          className={`h-0.5 ${activeStatus === taskStatus && dropPlacement?.idAfter === idBefore && dropPlacement?.idBefore === 0 ? 'bg-blue-600' : taskStatusConfig.bgColor}`}
        />
      </div>
    </div>
  );
}

export default KanbanColumn;
