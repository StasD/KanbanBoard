import { Card, CardHeader, CardBody, CardFooter } from '@heroui/react';
import { kanbanTaskItemType, type KanbanTask } from '@/models/kanbanTaskModels';
import { utcDateToDateStr } from '@/lib/helperFunctions';
import UserAvatar from '@/components/UserAvatar';
import useDrag from '@/hooks/useDrag';

function KanbanCard({ kanbanTask, cardStyle }: { kanbanTask: KanbanTask; cardStyle?: string }) {
  const assignedUser = kanbanTask.assignedUser;
  const assignedUserName = assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}`.trim() : '';
  const assignedTo = assignedUser ? `Assigned to ${assignedUserName}` : 'Unassigned';
  const assignedUserUrl = assignedUser?.photoUrl;
  const assignedAt = kanbanTask.assignedAt;

  const { ref, isDragging } = useDrag(kanbanTaskItemType, kanbanTask);

  return (
    <Card
      id={`${kanbanTaskItemType}_${kanbanTask.id}`}
      ref={ref}
      shadow="sm"
      className={`shrink-0 min-w-[250px] max-w-[300px] py-2 ${cardStyle} ${isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab'}`}
    >
      <CardHeader className="flex-col items-start px-4 py-2">
        <h4 className="font-semibold text-medium">
          {`#${kanbanTask.id}`} {kanbanTask.title}
        </h4>
      </CardHeader>
      <CardBody className="px-4 py-2">
        <p className="text-medium">{kanbanTask.description}</p>
      </CardBody>
      <CardFooter className="text-small justify-between px-4 py-2">
        <div>
          <p>{assignedTo}</p>
          <p>
            <small className="text-default-500">
              {assignedAt ? `Since ${utcDateToDateStr(assignedAt)}` : '&nbsp;'}
            </small>
          </p>
        </div>
        <UserAvatar userName={assignedUserName} photoUrl={assignedUserUrl} />
      </CardFooter>
    </Card>
  );
}

export default KanbanCard;
