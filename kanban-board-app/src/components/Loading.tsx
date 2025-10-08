import { CircularProgress } from '@heroui/react';
import { type heroColor, type heroSize } from '@/lib/heroTypes';

function Loading({ label = 'Loading...', color = 'primary' as heroColor, size = 'md' as heroSize }) {
  return <CircularProgress label={label} color={color} size={size} />;
}

export default Loading;
