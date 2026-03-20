'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'sonner';

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
                refetchOnWindowFocus: false,
                retry: (failureCount, error: any) => {
                    // Do not retry if the error is an auth failure (401/403)
                    if (error?.response?.status === 401 || error?.response?.status === 403) {
                        return false;
                    }
                    // Otherwise, retry up to 3 times 
                    return failureCount < 3;
                },
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <Toaster position="top-right" richColors />
        </QueryClientProvider>
    );
}
