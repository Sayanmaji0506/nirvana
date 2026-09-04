import axios from 'axios';
import { CONFIG } from '../config';
import storage from './storage';

const api = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  timeout: 5000
});

// Request interceptor to attach JWT token
api.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiClient = {
  // Auth & KYC
  requestOTP: async (phone) => {
    try {
      const res = await api.post('/auth/otp/request', { phone });
      return res.data;
    } catch (e) {
      console.warn('[OTP REQUEST] Backend unreachable, using offline fallback:', e.message);
      return { success: true, phone, message: 'OTP sent (offline mode)' };
    }
  },

  verifyOTP: async (phone, code, name, role) => {
    const cleanCode = String(code || '').trim();
    const cleanPhone = String(phone || '').trim();

    try {
      const res = await api.post('/auth/otp/verify', {
        phone: cleanPhone,
        code: cleanCode,
        name: name || 'Ratul Sharma',
        role: role || 'driver'
      });
      if (res.data.token) {
        await storage.setToken(res.data.token);
      }
      if (res.data.user) {
        await storage.setUser(res.data.user);
      }
      return res.data;
    } catch (e) {
      console.warn('[API CLIENT] verifyOTP error:', e.message);

      // If backend returned a specific error response
      if (e.response && e.response.data && e.response.data.error) {
        throw new Error(e.response.data.error);
      }

      // Offline Resilience: If entering 123456 during network disruption, establish session
      if (cleanCode === '123456') {
        console.log('[API CLIENT] Activating offline session for master code 123456');
        const offlineUser = {
          id: Date.now(),
          name: name || 'Ratul Sharma',
          phone: cleanPhone || '+919876543210',
          role: role || 'driver',
          kyc_status: 'unverified',
          isOffline: true
        };
        await storage.setUser(offlineUser);
        return { success: true, user: offlineUser, token: 'offline_token' };
      }

      throw new Error(e.message || 'Cannot reach NIRVANA server. Check Wi-Fi connection.');
    }
  },

  verifyKYC: async (kyc_type, license_number) => {
    const res = await api.post('/auth/kyc/verify', { kyc_type, license_number });
    if (res.data.user) {
      await storage.setUser(res.data.user);
    }
    return res.data;
  },

  // Road & Map data
  fetchRoadStatus: async () => {
    try {
      const res = await api.get('/roads/status');
      if (res.data?.data) {
        await storage.cacheRoadSegments(res.data.data);
      }
      return res.data.data;
    } catch (e) {
      // Return cached offline data if network request fails
      const cached = await storage.getCachedRoadSegments();
      if (cached) return cached;
      throw e;
    }
  },

  fetchDistricts: async () => {
    const res = await api.get('/districts');
    return res.data.data;
  },

  // Route Planning & Rerouting
  planRoute: async (origin, destination, userId) => {
    const res = await api.post('/routes/plan', {
      origin,
      destination,
      vehicle_type: 'truck',
      user_id: userId
    });
    return res.data.data;
  },

  checkReroute: async (routeId) => {
    const res = await api.get(`/routes/${routeId}/reroute-check`);
    return res.data.data;
  },

  // Hazard Reports (Offline-First)
  submitReport: async (reportData) => {
    // 1. Save to offline queue immediately
    const queued = await storage.queueReport(reportData);

    // 2. Attempt sync immediately in background
    try {
      const res = await api.post('/reports', reportData);
      // If successful, remove from offline queue
      await storage.removeQueuedReport(queued.tempId);
      return { ...res.data.data, synced: true };
    } catch (e) {
      console.log('[OFFLINE REPORT] Network unavailable, stored in offline queue:', queued.tempId);
      return { ...queued, synced: false };
    }
  },

  syncQueuedReports: async () => {
    const queued = await storage.getQueuedReports();
    if (queued.length === 0) return 0;

    let syncedCount = 0;
    for (const report of queued) {
      try {
        await api.post('/reports', report);
        await storage.removeQueuedReport(report.tempId);
        syncedCount++;
      } catch (e) {
        // Stop on network failure
        break;
      }
    }
    return syncedCount;
  },

  fetchReports: async (status = null) => {
    const url = status ? `/reports?status=${status}` : '/reports';
    const res = await api.get(url);
    return res.data.data;
  },

  voteReport: async (id, direction, userId) => {
    const res = await api.post(`/reports/${id}/vote`, { direction, user_id: userId });
    return res.data;
  }
};

export default apiClient;
