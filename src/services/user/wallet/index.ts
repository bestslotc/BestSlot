import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { QUERY_KEYS } from '@/lib/constant';

export function useUserBalance() {
	return useQuery({
		queryKey: [QUERY_KEYS.USER_BALANCE],
		queryFn: async () => {
			const response = await axios.get(`/api/users/wallet/balance`);
			return response.data;
		},
	});
}
