import { QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import { store } from '@/app/store';
import { queryClient } from '@/app/queryClient';
import AppRouter from '@/app/AppRouter';

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </Provider>
  );
}
