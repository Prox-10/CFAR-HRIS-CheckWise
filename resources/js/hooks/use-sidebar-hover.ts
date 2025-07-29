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

  // No auto-hide on mouse leave anymore
  const handleMouseLeave = useCallback(() => {
    // Do nothing
  }, []);

  return { isHovering, handleMouseEnter, handleMouseLeave };
}
