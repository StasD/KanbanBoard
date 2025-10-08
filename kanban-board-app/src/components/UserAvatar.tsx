import { Tooltip, Avatar } from '@heroui/react';
import { type heroColor, type heroSize } from '@/lib/heroTypes';

function UserAvatar({
  userName = '',
  photoUrl = '',
  isBordered = true,
  color = 'default' as heroColor,
  size = 'md' as heroSize,
}) {
  return (
    <Tooltip content={userName}>
      <Avatar showFallback isBordered={isBordered} color={color} size={size} src={photoUrl} />
    </Tooltip>
  );
}

export default UserAvatar;
