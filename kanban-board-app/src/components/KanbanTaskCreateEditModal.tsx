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
import { createKanbanTask } from '@/api/kanbanTasksApi'; // getKanbanTask,
import { kanbanTaskStatuses, type KanbanTaskStatusEnum, type KanbanTaskModel } from '@/models/kanbanTaskModels'; // , type KanbanTask
import { getFullName } from '@/models/userModels';
import useDisplayErrorToast from '@/hooks/useDisplayErrorToast';
import DisplayError from '@/components/DisplayError';
import useKanbanTasksStore from '@/stores/useKanbanTasksStore';

function KanbanTaskCreateEditModal({
  kanbanTaskId = null,
  isOpen,
  onOpenChange,
}: {
  kanbanTaskId?: number | null;
  isOpen: boolean;
  onOpenChange: () => void;
}) {
  const onCloseRef = useRef<(() => void) | null>(null);

  const addKanbanTask = useKanbanTasksStore((state) => state.addKanbanTask);

  const [kanbanTask, setKanbanTask] = useState<KanbanTaskModel>({
    title: '',
    description: '',
    status: null,
    assignedUserId: null,
  });

  const {
    data: unsortedUsers,
    isLoading: isLoadingUsers,
    loadingError: usersLoadingError,
    resetLoadingError: resetUsersLoadingError,
  } = useFetchFunction(getUsers);

  const {
    data: newKanbanTask,
    isLoading: isLoadingCreateKanbanTask,
    loadingError: createKanbanTaskError,
    // resetLoadingError: resetCreateKanbanTaskError,
    fetchData: fetchCreateKanbanTask,
  } = useFetchFunction(() => createKanbanTask(kanbanTask), null, false);

  const users = unsortedUsers?.sort((u1, u2) => getFullName(u1).localeCompare(getFullName(u2))) ?? [];

  const isLoading = isLoadingUsers || isLoadingCreateKanbanTask;

  useEffect(() => {
    if (newKanbanTask) {
      addKanbanTask(newKanbanTask);
      addToast({
        color: 'success',
        title: <p className="font-semibold">Success!</p>,
        description: `New kanban task has been successfully created. Task Id: #${newKanbanTask.id}`,
        classNames: {
          base: 'rounded-lg shadow-lg',
        },
      });
      if (onCloseRef.current) onCloseRef.current();
    }
  }, [addKanbanTask, newKanbanTask]);

  useDisplayErrorToast(
    usersLoadingError,
    usersLoadingError ? <DisplayError error={usersLoadingError} title="Could not load users" isInToast={true} /> : null,
    resetUsersLoadingError,
  );

  const createKanbanTaskErrorAlert = useMemo(
    () =>
      createKanbanTaskError ? (
        <DisplayError error={createKanbanTaskError} title="Could not create kanban task" isInToast={true} />
      ) : null,
    [createKanbanTaskError],
  );

  useDisplayErrorToast(createKanbanTaskError, createKanbanTaskErrorAlert);

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      await fetchCreateKanbanTask();
    },
    [fetchCreateKanbanTask],
  );

  return (
    <>
      <Modal size="2xl" isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange}>
        <Form
          onSubmit={onSubmit}
          validationErrors={createKanbanTaskError?.response?.data?.errors ?? undefined}
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
                    {kanbanTaskId ? 'Edit Kanban Task' : 'New Kanban Task'}
                  </ModalHeader>
                  <ModalBody className="gap-2">
                    <div>
                      <Input
                        name="Title"
                        label="Title"
                        labelPlacement="outside"
                        placeholder="Enter task title"
                        isDisabled={isLoading}
                        value={kanbanTask.title}
                        onValueChange={(v) => setKanbanTask({ ...kanbanTask, title: v })}
                        onBlur={() => setKanbanTask({ ...kanbanTask, title: kanbanTask.title.trim() })}
                        // validate={(value) => (!value ? 'Title is required' : null)}
                        variant="bordered"
                        // isRequired
                      />
                    </div>
                    <div>
                      <Textarea
                        name="Description"
                        label="Description"
                        labelPlacement="outside"
                        placeholder="Enter task description"
                        isDisabled={isLoading}
                        value={kanbanTask.description}
                        onValueChange={(v) => setKanbanTask({ ...kanbanTask, description: v })}
                        onBlur={() => setKanbanTask({ ...kanbanTask, description: kanbanTask.description.trim() })}
                        // validate={(value) => (!value ? 'Description is required' : null)}
                        variant="bordered"
                        // isRequired
                      />
                    </div>
                    <div className="flex flex-wrap items-start justify-start gap-2">
                      <div className="grow">
                        <Select
                          name="Status"
                          classNames={{
                            base: 'grow min-w-3xs',
                            trigger: 'h-12',
                          }}
                          label="Status"
                          labelPlacement="outside"
                          placeholder="Select task status"
                          isDisabled={isLoading}
                          // validate={(value) => (!value ? 'Status is required' : null)}
                          variant="bordered"
                          // isRequired
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
                          name="AssignedUserId"
                          classNames={{
                            base: 'grow min-w-xs',
                            trigger: 'h-12',
                          }}
                          label="Assigned to"
                          labelPlacement="outside"
                          placeholder="Select user to whom the task is assigned"
                          isDisabled={isLoading}
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
                  <ModalFooter>
                    <Button variant="flat" onPress={onClose}>
                      Close
                    </Button>
                    <Button color="primary" type="submit" isDisabled={isLoading}>
                      {kanbanTaskId ? 'Save Task' : 'Create Task'}
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
