import type {
  UmbrellaListItem,
  UmbrellaDetail,
  StagnationWithUmbrella,
  CreatePastingRecordRequest,
  CreatePastingRecordResponse,
  CreateUmbrellaRequest,
  ResolveStagnationRequest,
  CompleteUmbrellaRequest,
  ApiResponse,
} from '@shared/types';

const API_BASE = '/api';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data: ApiResponse<T> = await response.json();

  if (!data.success || !response.ok) {
    throw new Error(data.error || '请求失败');
  }

  return data.data as T;
}

export const umbrellaApi = {
  getUmbrellas: (status?: string, search?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<UmbrellaListItem[]>(`/umbrellas${query}`);
  },

  getUmbrellaDetail: (id: string) =>
    request<UmbrellaDetail>(`/umbrellas/${id}`),

  createUmbrella: (data: CreateUmbrellaRequest) =>
    request<UmbrellaDetail>(`/umbrellas`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  addPastingRecord: (id: string, data: CreatePastingRecordRequest) =>
    request<CreatePastingRecordResponse>(`/umbrellas/${id}/pasting`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  completeUmbrella: (id: string, data: CompleteUmbrellaRequest) =>
    request<UmbrellaDetail>(`/umbrellas/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const stagnationApi = {
  getStagnations: (resolved?: boolean) => {
    const query = resolved !== undefined ? `?resolved=${resolved}` : '';
    return request<StagnationWithUmbrella[]>(`/stagnations${query}`);
  },

  resolveStagnation: (id: string, data: ResolveStagnationRequest) =>
    request<StagnationWithUmbrella>(`/stagnations/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
