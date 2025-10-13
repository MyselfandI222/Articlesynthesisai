import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const url = queryKey[0] as string;
        const response = await fetch(url, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error(`${response.status}: ${response.statusText}`);
        }
        return response.json();
      },
      retry: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export const apiRequest = async (
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  data?: any
) => {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `${response.status}: ${response.statusText}`);
  }
  
  return response;
};

export const getQueryFn = ({ on401 }: { on401?: 'returnNull' } = {}) => {
  return async ({ queryKey }: { queryKey: readonly unknown[] }) => {
    const url = queryKey[0] as string;
    const response = await fetch(url, {
      credentials: 'include',
    });
    
    if (response.status === 401 && on401 === 'returnNull') {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  };
};