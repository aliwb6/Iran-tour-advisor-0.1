import { QueryClient } from '@tanstack/react-query';


export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			staleTime: 60_000,
			gcTime: 10 * 60_000,
			retry: 1,
		},
	},
});
