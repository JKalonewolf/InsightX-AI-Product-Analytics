import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE = window.location.protocol === 'file:' ? 'http://127.0.0.1:3000' : '';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Configure token injection from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('insightx_auth_token');
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (err) => Promise.reject(err));

// ==========================================
// REACT QUERY HOOKS
// ==========================================

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/api/v1/analytics/dashboard');
      return res.data;
    },
    refetchInterval: 10000 // Poll every 10 seconds
  });
}

export function useFunnelMetrics(funnelId?: string | null) {
  return useQuery({
    queryKey: ['funnels', funnelId],
    queryFn: async () => {
      const res = await api.get(`/api/v1/analytics/funnels?funnel_id=${funnelId || ''}`);
      return res.data;
    }
  });
}

export function useFunnelsList() {
  return useQuery({
    queryKey: ['funnels-list'],
    queryFn: async () => {
      const res = await api.get('/api/v1/funnels');
      return res.data;
    }
  });
}

export function useCreateFunnel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; steps: string[] }) => {
      const res = await api.post('/api/v1/funnels', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funnels-list'] });
    }
  });
}

export function useRetentionCohorts(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['retention', params],
    queryFn: async () => {
      const res = await api.get('/api/v1/analytics/retention', { params });
      return res.data;
    }
  });
}

export function useExperimentsList() {
  return useQuery({
    queryKey: ['experiments-list'],
    queryFn: async () => {
      const res = await api.get('/api/v1/experiments');
      return res.data;
    }
  });
}

export function useCreateExperiment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/api/v1/experiments', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments-list'] });
    }
  });
}

export function useExperimentResults(experimentId?: string) {
  return useQuery({
    queryKey: ['experiments', experimentId],
    queryFn: async () => {
      const res = await api.get('/api/v1/experiments/results', {
        params: experimentId ? { experiment_id: experimentId } : {}
      });
      return res.data;
    }
  });
}

export function usePredictChurn() {
  return useQuery({
    queryKey: ['ai-churn'],
    queryFn: async () => {
      const res = await api.post('/api/v1/ai/predict-churn', {});
      return res.data;
    }
  });
}

export function useRevenueForecast() {
  return useQuery({
    queryKey: ['ai-forecast'],
    queryFn: async () => {
      const res = await api.get('/api/v1/ai/forecast-revenue');
      return res.data;
    }
  });
}

export function useAiInsights() {
  return useQuery({
    queryKey: ['ai-insights'],
    queryFn: async () => {
      const res = await api.get('/api/v1/ai/insights');
      return res.data;
    }
  });
}

export function useAskAiMutation() {
  return useMutation({
    mutationFn: async (queryText: string) => {
      const res = await api.post('/api/v1/ai/query', { query: queryText });
      return res.data;
    }
  });
}

export function useDocsList() {
  return useQuery({
    queryKey: ['docs'],
    queryFn: async () => {
      // Direct mappings to static public docs
      const list = [
        { id: 'BRD', title: 'Business Requirements (BRD.md)', path: '/docs/BRD.md' },
        { id: 'PRD', title: 'Product Requirements (PRD.md)', path: '/docs/PRD.md' },
        { id: 'VISION', title: 'Product Vision & Strategy (VISION_STRATEGY.md)', path: '/docs/VISION_STRATEGY.md' },
        { id: 'ROADMAP', title: 'Feature Product Roadmap (ROADMAP.md)', path: '/docs/ROADMAP.md' },
        { id: 'PERSONAS', title: 'Personas & Journeys (PERSONAS_JOURNEYS.md)', path: '/docs/PERSONAS_JOURNEYS.md' },
        { id: 'METRICS', title: 'Telemetry Metrics Plan (METRICS.md)', path: '/docs/METRICS.md' },
        { id: 'USER_STORIES', title: 'User Stories & Checklist (USER_STORIES.md)', path: '/docs/USER_STORIES.md' },
        { id: 'GTM', title: 'GTM Strategy Launch (GTM_STRATEGY.md)', path: '/docs/GTM_STRATEGY.md' },
      ];
      return list;
    }
  });
}

export function useDocContent(path: string | null) {
  return useQuery({
    queryKey: ['doc-content', path],
    queryFn: async () => {
      if (!path) return '';
      // Read raw markdown served statically
      const res = await api.get(path);
      return res.data;
    },
    enabled: !!path
  });
}

export function useUserJourney() {
  return useQuery({
    queryKey: ['user-journey'],
    queryFn: async () => {
      const res = await api.get('/api/v1/analytics/journey');
      return res.data;
    },
    refetchInterval: 5000
  });
}

export function useUserSegmentation(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['segmentation', params],
    queryFn: async () => {
      const res = await api.get('/api/v1/analytics/segmentation', { params });
      return res.data;
    }
  });
}

export function useFeatureFlagsList() {
  return useQuery({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      const res = await api.get('/api/v1/flags');
      return res.data;
    }
  });
}

export function useCreateFeatureFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/api/v1/flags', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    }
  });
}

export function useToggleFeatureFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const res = await api.put(`/api/v1/flags/${id}/toggle`, { active });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    }
  });
}

export function useUpdateFlagRollout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, rollout_percentage }: { id: string; rollout_percentage: number }) => {
      const res = await api.put(`/api/v1/flags/${id}/rollout`, { rollout_percentage });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    }
  });
}

export function useUpdateFlagBeta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, rules }: { id: string; rules: string[] }) => {
      const res = await api.put(`/api/v1/flags/${id}/beta`, { rules });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    }
  });
}

export function useAiUserClustering() {
  return useQuery({
    queryKey: ['ai-user-clustering'],
    queryFn: async () => {
      const res = await api.get('/api/v1/ai/user-clustering');
      return res.data;
    }
  });
}

export function useAiFeatureRecommendations() {
  return useQuery({
    queryKey: ['ai-feature-recommendations'],
    queryFn: async () => {
      const res = await api.get('/api/v1/ai/feature-recommendation');
      return res.data;
    }
  });
}

export function useReportsList() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const res = await api.get('/api/v1/reports');
      return res.data;
    }
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/api/v1/reports', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/api/v1/reports/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });
}

export function useTriggerReport() {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/api/v1/reports/${id}/trigger`);
      return res.data;
    }
  });
}

export function useAlertChannelsList() {
  return useQuery({
    queryKey: ['alert-channels'],
    queryFn: async () => {
      const res = await api.get('/api/v1/alerts/channels');
      return res.data;
    }
  });
}

export function useCreateAlertChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/api/v1/alerts/channels', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-channels'] });
    }
  });
}

export function useDeleteAlertChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/api/v1/alerts/channels/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-channels'] });
    }
  });
}

export function useTestAlertChannel() {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/api/v1/alerts/channels/${id}/test`);
      return res.data;
    }
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get('/api/v1/admin/users');
      return res.data;
    }
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const res = await api.put(`/api/v1/admin/users/${id}/role`, { role });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });
}

export function useAdminProjects() {
  return useQuery({
    queryKey: ['admin-projects'],
    queryFn: async () => {
      const res = await api.get('/api/v1/admin/projects');
      return res.data;
    }
  });
}

export function useAdminLogs() {
  return useQuery({
    queryKey: ['admin-logs'],
    queryFn: async () => {
      const res = await api.get('/api/v1/admin/logs');
      return res.data;
    }
  });
}

export function useOrganizationInvoices(orgId: string) {
  return useQuery({
    queryKey: ['invoices', orgId],
    queryFn: async () => {
      const res = await api.get(`/api/v1/organizations/${orgId}/invoices`);
      return res.data;
    },
    enabled: !!orgId
  });
}

export function useUpdateOrganizationBilling() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orgId, billing_plan }: { orgId: string; billing_plan: string }) => {
      const res = await api.put(`/api/v1/organizations/${orgId}/billing`, { billing_plan });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.orgId] });
    }
  });
}
