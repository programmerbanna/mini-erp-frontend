import { useEffect } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';

interface LowStockEvent {
  productId: string;
  name: string;
  sku: string;
  stockQuantity: number;
}

export function useLowStockSocket(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();

    function handleLowStock(event: LowStockEvent) {
      toast.warning(`${event.name} is low on stock (${event.stockQuantity} left)`);
      // Invalidating here (rather than in the page) keeps the "live update" behavior
      // working for any consumer of dashboard-stats, not just whichever component happens
      // to be mounted when the event fires.
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }

    socket.on('low-stock', handleLowStock);
    return () => {
      socket.off('low-stock', handleLowStock);
    };
  }, [queryClient]);
}
