// apps/dashboard/src/lib/apiClient.ts
import axios from 'axios';

import { DASHBOARD_API_URL } from '@/config/config';

const apiClient = axios.create({
	baseURL: DASHBOARD_API_URL,
	timeout: 10_000,
	headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
	(response) => response,
	(error) => {
		console.error('API-Fehler:', error);
		return Promise.reject(error);
	}
);

export default apiClient;
