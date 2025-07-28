import { useSidebar } from '@/components/ui/sidebar';
import { useCallback, useState } from 'react';

export function useSidebarHover() {
  const { state, setOpen } = useSidebar();
  const [isHovering, setIsHovering] = useState(false);

  // Show sidebar on hover when collapsed
  const handleMouseEnter = useCallback(() => {
    if (state === 'collapsed') {
      setIsHovering(true);
      setOpen(true);
    }
  }, [state, setOpen]);

  // Hide sidebar when mouse leaves if it was shown by hover
  const handleMouseLeave = useCallback(() => {
    if (isHovering && state === 'expanded') {
      setIsHovering(false);
      setOpen(false);
    }
  }, [isHovering, state, setOpen]);

  return { isHovering, handleMouseEnter, handleMouseLeave };
}
