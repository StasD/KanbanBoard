import { Tooltip, Avatar } from '@heroui/react';
import { type heroColor, type heroSize } from '@/lib/heroTypes';

function UserAvatar({
  userName = '',
  photoUrl = '',
  isBordered = true,
  color = 'default' as heroColor,
  size = 'md' as heroSize,
}) {
  const avatar = (
    <Avatar
      className="shrink-0 touch-none select-none"
      showFallback
      isBordered={isBordered}
      color={color}
      size={size}
      src={photoUrl}
    />
  );

  return userName ? <Tooltip content={userName}>{avatar}</Tooltip> : avatar;
}

export default UserAvatar;
