import { useEffect, useMemo } from 'react';
import { getKanbanTasks } from '@/api/kanbanTasksApi';
import { kanbanTaskStatuses } from '@/models/kanbanTaskModels';
import useFixedLayout from '@/hooks/useFixedLayout';
import useBreadcrumbPath from '@/hooks/useBreadcrumbPath';
import useFetchFunction from '@/hooks/useFetchFunction';
import useDisplayErrorToast from '@/hooks/useDisplayErrorToast';
import DisplayError from '@/components/DisplayError';
import KanbanColumn from '@/components/KanbanColumn';
import KanbanTaskCreateEditModal from '@/components/KanbanTaskCreateEditModal';
import Loading from '@/components/Loading';
import useKanbanTasksStore from '@/stores/useKanbanTasksStore';
import { Button, useDisclosure } from '@heroui/react';
import { DocumentPlusIcon } from '@heroicons/react/24/solid';

function BoardPage({ breadcrumbPath = '' }) {
  useFixedLayout(true);
  useBreadcrumbPath(breadcrumbPath);

  const kanbanTasks = useKanbanTasksStore((state) => state.kanbanTasks);
  const updateTaskLocationError = useKanbanTasksStore((state) => state.updateTaskLocationError);
  const resetUpdateTaskLocationError = useKanbanTasksStore((state) => state.resetUpdateTaskLocationError);
  const setKanbanTasks = useKanbanTasksStore((state) => state.setKanbanTasks);

  const updateTaskLocationErrorAlert = useMemo(
    () =>
      updateTaskLocationError ? (
        <DisplayError error={updateTaskLocationError} title="Could not update Kanban Task" isInToast={true} />
      ) : null,
    [updateTaskLocationError],
  );

  useDisplayErrorToast(updateTaskLocationError, updateTaskLocationErrorAlert, resetUpdateTaskLocationError);

  useEffect(() => {
    setKanbanTasks(null);
  }, [setKanbanTasks]);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { isLoading, loadingError } = useFetchFunction(getKanbanTasks, setKanbanTasks);

  return (
    <>
      <div className="flex items-center justify-between px-4">
        <p className="text-3xl font-semibold my-5">Kanban Board</p>
        <Button color="primary" onPress={onOpen}>
          <DocumentPlusIcon className="w-6" />
          <span>New Kanban Task</span>
        </Button>
      </div>
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
        <div className="flex flex-row grow overflow-auto w-full justify-between p-2 gap-2">
          {kanbanTaskStatuses.map((ts) => (
            <KanbanColumn key={ts.status} kanbanTasks={kanbanTasks} taskStatus={ts.status} />
          ))}
        </div>
      )}
      {isOpen && <KanbanTaskCreateEditModal isOpen={isOpen} onOpenChange={onOpenChange} />}
    </>
  );
}

export default BoardPage;
