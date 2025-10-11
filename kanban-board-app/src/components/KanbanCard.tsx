import { Card, CardHeader, CardBody, CardFooter } from '@heroui/react';
import { kanbanTaskItemType, type KanbanTask } from '@/models/kanbanTaskModels';
import { getFullName } from '@/models/userModels';
import { utcDateToDateStr } from '@/lib/helperFunctions';
import UserAvatar from '@/components/UserAvatar';
import useDrag from '@/hooks/useDrag';

function KanbanCard({ kanbanTask, cardStyle }: { kanbanTask: KanbanTask; cardStyle?: string }) {
  const assignedUser = kanbanTask.assignedUser;
  const assignedUserName = getFullName(assignedUser);
  const assignedTo = assignedUser ? `Assigned to ${assignedUserName}` : 'Unassigned';
  const assignedUserUrl = assignedUser?.photoUrl;
  const assignedAt = kanbanTask.assignedAt;

  const { ref, isDragging } = useDrag(kanbanTaskItemType, kanbanTask);

  return (
    <Card
      id={`${kanbanTaskItemType}_${kanbanTask.id}`}
      ref={ref}
      shadow="sm"
      className={`shrink-0 w-full py-2 ${cardStyle} ${isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab'}`}
    >
      <CardHeader className="items-start px-4 py-2">
        <h4 className="w-full break-words font-semibold text-medium">{`#${kanbanTask.id}\u00A0${kanbanTask.title}`}</h4>
      </CardHeader>
      <CardBody className="px-4 py-2">
        <p className="text-medium">{kanbanTask.description}</p>
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
