import { useCallback, useRef, useMemo, type FormEvent } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  Progress,
  addToast,
} from '@heroui/react';
import useFetchFunction from '@/hooks/useFetchFunction';
import { deleteKanbanTask } from '@/api/kanbanTasksApi';
import { type KanbanTask } from '@/models/kanbanTaskModels';
import useDisplayErrorToast from '@/hooks/useDisplayErrorToast';
import DisplayError from '@/components/DisplayError';
import useKanbanTasksStore from '@/stores/useKanbanTasksStore';

function KanbanTaskDeleteModal({
  kanbanTask,
  isOpen,
  onOpenChange,
}: {
  kanbanTask: KanbanTask;
  isOpen: boolean;
  onOpenChange: () => void;
}) {
  const onCloseRef = useRef<(() => void) | null>(null);

  const deleteKanbanTaskFetchFunction = useCallback(() => deleteKanbanTask(kanbanTask.id + 300), [kanbanTask]);

  const removeKanbanTask = useKanbanTasksStore((state) => state.removeKanbanTask);

  const deleteKanbanTaskCb = useCallback(() => {
    removeKanbanTask(kanbanTask.id);
    addToast({
      color: 'success',
      title: <p className="font-semibold">Success!</p>,
      description: `Kanban task #${kanbanTask.id} has been successfully deleted.`,
    });
    if (onCloseRef.current) onCloseRef.current();
  }, [kanbanTask.id, removeKanbanTask]);

  const {
    isLoading: isDeletingKanbanTask,
    loadingError: kanbanTaskDeleteError,
    fetchData: fetchDeleteKanbanTask,
  } = useFetchFunction(deleteKanbanTaskFetchFunction, deleteKanbanTaskCb, false);

  const kanbanTaskDeleteErrorAlert = useMemo(
    () =>
      kanbanTaskDeleteError ? (
        <DisplayError error={kanbanTaskDeleteError} title={`Could not delete kanban task`} isInToast={true} />
      ) : null,
    [kanbanTaskDeleteError],
  );

  useDisplayErrorToast(kanbanTaskDeleteError, kanbanTaskDeleteErrorAlert);

  const isLoading = isDeletingKanbanTask;
  const isDisabled = isLoading;

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      await fetchDeleteKanbanTask();
    },
    [fetchDeleteKanbanTask],
  );

  return (
    <>
      <Modal size="2xl" isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange}>
        <Form onSubmit={onSubmit}>
          <ModalContent>
            {(onClose) => {
              onCloseRef.current = onClose;

              return (
                <>
                  <div className="h-1">
                    {isLoading && <Progress isIndeterminate aria-label="Loading..." className="w-full h-1" />}
                  </div>
                  <ModalHeader className="flex flex-col gap-1">
                    {`Delete Kanban Task (Id: ${kanbanTask.id})`}
                  </ModalHeader>
                  <ModalBody className="gap-3">
                    <p>Are you sure you want to delete this task?</p>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-start gap-2">
                        <div className="shrink-0 w-[80px]">Task Id:</div>
                        <div className="grow font-semibold">{kanbanTask.id}</div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="shrink-0 w-[80px]">Title:</div>
                        <div className="grow min-w-0 break-words font-semibold">{kanbanTask.title}</div>
                      </div>
                    </div>
                  </ModalBody>
                  <ModalFooter className="items-center">
                    <Button variant="flat" onPress={onClose}>
                      Cancel
                    </Button>
                    <Button color="danger" type="submit" isDisabled={isDisabled}>
                      Delete
                    </Button>
                  </ModalFooter>
                </>
              );
            }}
          </ModalContent>
        </Form>
      </Modal>
    </>
  );
}

export default KanbanTaskDeleteModal;
