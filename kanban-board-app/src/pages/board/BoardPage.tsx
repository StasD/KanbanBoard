import { useEffect } from 'react';
import { getKanbanTasks } from '@/api/kanbanTasksApi'; // , getKanbanTask , createKanbanTask
import { kanbanTaskStatuses } from '@/models/kanbanTaskModels';
import useFixedLayout from '@/hooks/useFixedLayout';
import useBreadcrumbPath from '@/hooks/useBreadcrumbPath';
import useFetchFunction from '@/hooks/useFetchFunction';
import useDisplayErrorToast from '@/hooks/useDisplayErrorToast';
import DisplayError from '@/components/DisplayError';
import KanbanColumn from '@/components/KanbanColumn';
import Loading from '@/components/Loading';
import useKanbanTasksStore from '@/stores/useKanbanTasksStore';

function BoardPage({ breadcrumbPath = '' }) {
  useFixedLayout(true);
  useBreadcrumbPath(breadcrumbPath);

  const kanbanTasks = useKanbanTasksStore((state) => state.kanbanTasks);
  const updateTaskLocationError = useKanbanTasksStore((state) => state.updateTaskLocationError);
  const resetUpdateTaskLocationError = useKanbanTasksStore((state) => state.resetUpdateTaskLocationError);
  const setKanbanTasks = useKanbanTasksStore((state) => state.setKanbanTasks);

  useDisplayErrorToast(
    updateTaskLocationError,
    updateTaskLocationError ? (
      <DisplayError error={updateTaskLocationError} title="Could not update Kanban Task" isInToast={true} />
    ) : null,
    resetUpdateTaskLocationError,
  );

  useEffect(() => {
    setKanbanTasks(null);
  }, [setKanbanTasks]);

  // const taskId = 2345;
  // const fetchFunction = useCallback(() => getKanbanTask(taskId), [taskId]);

  const { isLoading, loadingError } = useFetchFunction(getKanbanTasks, setKanbanTasks); // data: kanbanTasks,

  return (
    <>
      <p className="text-3xl font-semibold my-5 mx-auto">Kanban Board</p>
      {isLoading && (
        <div className="flex flex-col items-center justify-center grow w-full p-2">
          <Loading size="lg" />
        </div>
      )}
      {loadingError && (
        <div className="flex flex-wrap items-start gap-2 grow w-full p-2">
          <DisplayError error={loadingError} title="Could not load Kanban Tasks" />
        </div>
      )}
      {kanbanTasks && (
        <div className="flex flex-row grow overflow-auto w-full justify-between p-2 gap-2 border-0 border-amber-500">
          {kanbanTaskStatuses.map((ts) => (
            <KanbanColumn key={ts.status} kanbanTasks={kanbanTasks} taskStatus={ts.status} />
          ))}
        </div>
      )}
    </>
  );
}

export default BoardPage;
