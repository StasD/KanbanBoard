import { useState, useCallback, useEffect, useRef, useMemo, type FormEvent } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Form,
  Chip,
  Select,
  SelectItem,
  Avatar,
  Progress,
  Textarea,
  addToast,
} from '@heroui/react';
import useFetchFunction from '@/hooks/useFetchFunction';
import { getUsers } from '@/api/usersApi';
import { getKanbanTask, createKanbanTask, updateKanbanTask } from '@/api/kanbanTasksApi';
import {
  kanbanTaskStatuses,
  type KanbanTaskStatusEnum,
  type KanbanTaskModel,
  type KanbanTask,
} from '@/models/kanbanTaskModels';
import { getFullName } from '@/models/userModels';
import useDisplayErrorToast from '@/hooks/useDisplayErrorToast';
import DisplayError from '@/components/DisplayError';
import useKanbanTasksStore from '@/stores/useKanbanTasksStore';
import { utcDateToDateTimeStr } from '@/lib/helperFunctions';

function KanbanTaskCreateEditModal({
  kanbanTaskId,
  isOpen,
  onOpenChange,
}: {
  kanbanTaskId?: number;
  isOpen: boolean;
  onOpenChange: () => void;
}) {
  // setting up

  const formatErrors = ({ validationErrors }: { validationErrors: string[] }) => (
    <ul>
      {validationErrors.map((error, i) => (
        <li key={i}>{error}</li>
      ))}
    </ul>
  );

  const onCloseRef = useRef<(() => void) | null>(null);

  const emptyKanbanTask = {
    title: '',
    description: '',
    status: null,
    assignedUserId: null,
  };

  const [originalKanbanTask, setOriginalKanbanTask] = useState<KanbanTaskModel>(emptyKanbanTask);
  const [kanbanTask, setKanbanTask] = useState<KanbanTaskModel>(emptyKanbanTask);

  // users

  const {
    data: unsortedUsers,
    isLoading: isLoadingUsers,
    loadingError: usersLoadingError,
  } = useFetchFunction(getUsers);

  const usersLoadingErrorAlert = useMemo(
    () =>
      usersLoadingError ? (
        <DisplayError error={usersLoadingError} title="Could not load users" isInToast={true} />
      ) : null,
    [usersLoadingError],
  );

  useDisplayErrorToast(usersLoadingError, usersLoadingErrorAlert);

  const users = unsortedUsers?.sort((u1, u2) => getFullName(u1).localeCompare(getFullName(u2))) ?? [];

  // kanbanTaskToEdit

  const retrieveKanbanTask = useCallback(
    () => (kanbanTaskId !== undefined ? getKanbanTask(kanbanTaskId) : null),
    [kanbanTaskId],
  );

  const retrieveKanbanTaskCb = useCallback((_kanbanTask: KanbanTask | null) => {
    if (_kanbanTask) {
      const kanbanTaskModel = {
        title: _kanbanTask.title,
        description: _kanbanTask.description,
        status: _kanbanTask.status,
        assignedUserId: _kanbanTask.assignedUserId,
      };
      setOriginalKanbanTask(kanbanTaskModel);
      setKanbanTask(kanbanTaskModel);
    }
  }, []);

  const {
    data: kanbanTaskToEdit,
    isLoading: kanbanTaskToEditLoading,
    loadingError: kanbanTaskToEditLoadingError,
  } = useFetchFunction(retrieveKanbanTask, retrieveKanbanTaskCb);

  const kanbanTaskToEditLoadingErrorAlert = useMemo(
    () =>
      kanbanTaskToEditLoadingError ? (
        <DisplayError
          error={kanbanTaskToEditLoadingError}
          title="Could not retrieve kanban task data."
          isInToast={true}
        />
      ) : null,
    [kanbanTaskToEditLoadingError],
  );

  useDisplayErrorToast(kanbanTaskToEditLoadingError, kanbanTaskToEditLoadingErrorAlert);

  // kanbanTaskNewOrUpdated

  const createUpdateKanbanTask = useCallback(
    () => (kanbanTaskId !== undefined ? updateKanbanTask(kanbanTaskId, kanbanTask) : createKanbanTask(kanbanTask)),
    [kanbanTask, kanbanTaskId],
  );

  const addUpdateKanbanTask = useKanbanTasksStore((state) => state.addUpdateKanbanTask);

  const createUpdateKanbanTaskCb = useCallback(
    (kanbanTaskNewOrUpdated?: KanbanTask | null) => {
      if (kanbanTaskNewOrUpdated) {
        addUpdateKanbanTask(kanbanTaskNewOrUpdated);
        addToast({
          color: 'success',
          title: <p className="font-semibold">Success!</p>,
          description:
            kanbanTaskId !== undefined
              ? `Kanban task #${kanbanTaskNewOrUpdated.id} has been successfully updated.`
              : `New kanban task has been successfully created. Task Id: #${kanbanTaskNewOrUpdated.id}`,
        });
        if (onCloseRef.current) onCloseRef.current();
      }
    },
    [addUpdateKanbanTask, kanbanTaskId],
  );

  const {
    // data: kanbanTaskNewOrUpdated,
    isLoading: kanbanTaskCreateUpdateIsLoading,
    loadingError: kanbanTaskCreateUpdateError,
    fetchData: fetchCreateUpdateKanbanTask,
  } = useFetchFunction(createUpdateKanbanTask, createUpdateKanbanTaskCb, false);

  const kanbanTaskCreateUpdateErrorAlert = useMemo(
    () =>
      kanbanTaskCreateUpdateError ? (
        <DisplayError
          error={kanbanTaskCreateUpdateError}
          title={`Could not ${kanbanTaskId !== undefined ? 'update' : 'create'} kanban task`}
          isInToast={true}
        />
      ) : null,
    [kanbanTaskCreateUpdateError, kanbanTaskId],
  );

  useDisplayErrorToast(kanbanTaskCreateUpdateError, kanbanTaskCreateUpdateErrorAlert);

  // other

  const isLoading = isLoadingUsers || kanbanTaskToEditLoading || kanbanTaskCreateUpdateIsLoading;
  const isDisabled = isLoading || usersLoadingError !== null || kanbanTaskToEditLoadingError !== null;
  const isChanged = JSON.stringify(kanbanTask) !== JSON.stringify(originalKanbanTask);

  const firstInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    firstInput.current?.focus();
  }, [firstInput, isDisabled, kanbanTaskCreateUpdateError]);

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      await fetchCreateUpdateKanbanTask();
    },
    [fetchCreateUpdateKanbanTask],
  );

  return (
    <>
      <Modal size="2xl" isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange}>
        <Form
          onSubmit={onSubmit}
          validationErrors={kanbanTaskCreateUpdateError?.response?.data?.errors ?? undefined}
          autoComplete="off"
        >
          <ModalContent>
            {(onClose) => {
              onCloseRef.current = onClose;

              return (
                <>
                  <div className="h-1">
                    {isLoading && <Progress isIndeterminate aria-label="Loading..." className="w-full h-1" />}
                  </div>
                  <ModalHeader className="flex flex-col gap-1">
                    {kanbanTaskId !== undefined ? `Edit Kanban Task (Id: ${kanbanTaskId})` : 'New Kanban Task'}
                  </ModalHeader>
                  <ModalBody className="gap-2">
                    <div>
                      <Input
                        ref={firstInput}
                        name="title"
                        label="Title"
                        labelPlacement="outside"
                        placeholder="Enter task title"
                        isDisabled={isDisabled}
                        value={kanbanTask.title}
                        onValueChange={(v) => setKanbanTask({ ...kanbanTask, title: v })}
                        onBlur={() => setKanbanTask({ ...kanbanTask, title: kanbanTask.title.trim() })}
                        validate={(value) => (!value ? 'Title is required' : null)}
                        errorMessage={formatErrors}
                        maxLength={100}
                        variant="bordered"
                        isRequired
                      />
                    </div>
                    <div>
                      <Textarea
                        name="description"
                        label="Description"
                        labelPlacement="outside"
                        placeholder="Enter task description"
                        isDisabled={isDisabled}
                        value={kanbanTask.description}
                        onValueChange={(v) => setKanbanTask({ ...kanbanTask, description: v })}
                        onBlur={() => setKanbanTask({ ...kanbanTask, description: kanbanTask.description.trim() })}
                        validate={(value) => (!value ? 'Description is required' : null)}
                        errorMessage={formatErrors}
                        maxLength={2000}
                        variant="bordered"
                        isRequired
                      />
                    </div>
                    <div className="flex flex-wrap items-start justify-start gap-2">
                      <div className="grow">
                        <Select
                          name="status"
                          classNames={{
                            base: 'grow min-w-3xs',
                            trigger: 'h-12',
                            label:
                              'group-data-[has-helper=true]:-translate-y-[calc(100%_+_var(--heroui-font-size-small)/2_+_20px)] group-data-[invalid=true]:-translate-y-[calc(100%_+_var(--heroui-font-size-small)/2_+_30px)]',
                          }}
                          label="Status"
                          labelPlacement="outside"
                          placeholder="Select task status"
                          isDisabled={isDisabled}
                          validate={(value) => (!value ? 'Status is required' : null)}
                          errorMessage={formatErrors}
                          variant="bordered"
                          isRequired
                          disallowEmptySelection
                          isClearable={true}
                          items={kanbanTaskStatuses}
                          selectedKeys={[kanbanTask.status !== null ? `${kanbanTask.status}` : '']}
                          onSelectionChange={(v) =>
                            setKanbanTask({
                              ...kanbanTask,
                              status: v.currentKey ? (Number(v.currentKey) as KanbanTaskStatusEnum) : null,
                            })
                          }
                          renderValue={(items) => {
                            return items.map((item) => (
                              <Chip
                                key={item.key}
                                classNames={{
                                  base: `rounded-large border ${item.data?.chipBaseStyle}`,
                                  content: `drop-shadow-xs shadow-black font-semibold ${item.data?.chipContentStyle}`,
                                }}
                              >
                                {item.data?.title}
                              </Chip>
                            ));
                          }}
                        >
                          {(taskStatusConfig) => (
                            <SelectItem key={taskStatusConfig.status} textValue={taskStatusConfig.title}>
                              <Chip
                                classNames={{
                                  base: `rounded-large border ${taskStatusConfig.chipBaseStyle}`,
                                  content: `drop-shadow-xs shadow-black font-semibold ${taskStatusConfig.chipContentStyle}`,
                                }}
                              >
                                {taskStatusConfig.title}
                              </Chip>
                            </SelectItem>
                          )}
                        </Select>
                      </div>
                      <div className="grow">
                        <Select
                          name="assignedUserId"
                          classNames={{
                            base: 'grow min-w-xs',
                            trigger: 'h-12',
                            label:
                              'group-data-[has-helper=true]:-translate-y-[calc(100%_+_var(--heroui-font-size-small)/2_+_20px)] group-data-[invalid=true]:-translate-y-[calc(100%_+_var(--heroui-font-size-small)/2_+_30px)]',
                          }}
                          label="Assigned to"
                          labelPlacement="outside"
                          placeholder="Select user to whom the task is assigned"
                          isDisabled={isDisabled}
                          errorMessage={formatErrors}
                          variant="bordered"
                          disallowEmptySelection
                          isClearable={true}
                          items={users}
                          selectedKeys={[kanbanTask.assignedUserId !== null ? `${kanbanTask.assignedUserId}` : '']}
                          onSelectionChange={(v) =>
                            setKanbanTask({
                              ...kanbanTask,
                              assignedUserId: v.currentKey ? (Number(v.currentKey) as KanbanTaskStatusEnum) : null,
                            })
                          }
                          renderValue={(items) => {
                            return items.map((item) => (
                              <div key={item.key} className="flex items-center gap-2">
                                <Avatar
                                  alt={getFullName(item.data)}
                                  className="shrink-0"
                                  size="sm"
                                  src={item.data?.photoUrl}
                                />
                                <div className="flex flex-col">
                                  <span>{getFullName(item.data)}</span>
                                  <span className="text-default-500 text-tiny">({item.data?.email})</span>
                                </div>
                              </div>
                            ));
                          }}
                        >
                          {(user) => (
                            <SelectItem key={user.id} textValue={user.email}>
                              <div className="flex gap-2 items-center">
                                <Avatar alt={getFullName(user)} className="shrink-0" size="sm" src={user.photoUrl} />
                                <div className="flex flex-col">
                                  <span className="text-small">{getFullName(user)}</span>
                                  <span className="text-tiny text-default-400">{user.email}</span>
                                </div>
                              </div>
                            </SelectItem>
                          )}
                        </Select>
                      </div>
                    </div>
                  </ModalBody>
                  <ModalFooter className="items-center">
                    {kanbanTaskToEdit && (
                      <div className="flex flex-col grow gap-1">
                        <small className="text-default-500 wrap-break-word">{`Created ${utcDateToDateTimeStr(kanbanTaskToEdit.createdAt)}${kanbanTaskToEdit.createdByUser ? ` by ${getFullName(kanbanTaskToEdit.createdByUser)} ` : ''}`}</small>
                        <small className="text-default-500 wrap-break-word">{`Updated ${utcDateToDateTimeStr(kanbanTaskToEdit.updatedAt)}${kanbanTaskToEdit.updatedByUser ? ` by ${getFullName(kanbanTaskToEdit.updatedByUser)} ` : ''}`}</small>
                      </div>
                    )}
                    <Button variant="flat" onPress={onClose}>
                      Cancel
                    </Button>
                    <Button color="primary" type="submit" isDisabled={isDisabled || !isChanged}>
                      {kanbanTaskId !== undefined ? 'Save Task' : 'Create Task'}
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

export default KanbanTaskCreateEditModal;
