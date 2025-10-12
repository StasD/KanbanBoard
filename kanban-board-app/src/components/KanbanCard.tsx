import type { Key } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  useDisclosure,
} from '@heroui/react';
import { kanbanTaskItemType, type KanbanTask } from '@/models/kanbanTaskModels';
import { getFullName } from '@/models/userModels';
import { utcDateToDateStr } from '@/lib/helperFunctions';
import UserAvatar from '@/components/UserAvatar';
import useDrag from '@/hooks/useDrag';
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid';
import KanbanTaskCreateEditModal from '@/components/KanbanTaskCreateEditModal';

function KanbanCard({ kanbanTask, cardStyle }: { kanbanTask: KanbanTask; cardStyle?: string }) {
  const assignedUser = kanbanTask.assignedUser;
  const assignedUserName = getFullName(assignedUser);
  const assignedTo = assignedUser ? `Assigned to ${assignedUserName}` : 'Unassigned';
  const assignedUserUrl = assignedUser?.photoUrl;
  const assignedAt = kanbanTask.assignedAt;

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { ref, isDragging } = useDrag(kanbanTaskItemType, kanbanTask);

  const onAction = (key: Key) => {
    if (key === 'edit') onOpen();
    // else if (key === 'delete') onDelete();
  };

  return (
    <Card
      id={`${kanbanTaskItemType}_${kanbanTask.id}`}
      ref={ref}
      shadow="sm"
      className={`shrink-0 w-full py-2 ${cardStyle} ${isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab'}`}
    >
      <CardHeader className="items-start justify-between px-4 py-2 gap-2">
        <h4 className="grow-1 min-w-0 break-words font-semibold text-medium line-clamp-3">{`#${kanbanTask.id}\u00A0${kanbanTask.title}`}</h4>
        <Dropdown
          placement="bottom-end"
          classNames={{
            content: 'min-w-[100px]',
          }}
        >
          <DropdownTrigger>
            <Button isIconOnly size="sm" className="shrink-0 rounded-full" variant="light">
              <EllipsisVerticalIcon className="w-4" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu variant="flat" onAction={onAction}>
            <DropdownItem key="edit">Edit</DropdownItem>
            <DropdownItem key="delete" className="text-danger" color="danger">
              Delete
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        {isOpen && (
          <KanbanTaskCreateEditModal kanbanTaskId={kanbanTask.id} isOpen={isOpen} onOpenChange={onOpenChange} />
        )}
      </CardHeader>
      <CardBody className="px-4 py-2">
        <p className="text-medium line-clamp-7">{kanbanTask.description}</p>
      </CardBody>
      <CardFooter className="text-small items-center justify-between px-4 py-2 gap-2">
        <div>
          <p>{assignedTo}</p>
          {assignedAt && (
            <p>
              <small className="text-default-500">{`Since ${utcDateToDateStr(assignedAt)}`}</small>
            </p>
          )}
        </div>
        <UserAvatar userName={assignedUserName} photoUrl={assignedUserUrl} />
      </CardFooter>
    </Card>
  );
}

export default KanbanCard;
