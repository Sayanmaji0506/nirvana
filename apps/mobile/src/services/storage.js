import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  AUTH_TOKEN: '@nirvana_auth_token',
  USER_DATA: '@nirvana_user_data',
  OFFLINE_REPORTS_QUEUE: '@nirvana_offline_reports',
  CACHED_ROADS: '@nirvana_cached_roads',
  CACHED_ROUTE: '@nirvana_cached_route'
};

class StorageService {
  async setToken(token) {
    await AsyncStorage.setItem(KEYS.AUTH_TOKEN, token);
  }

  async getToken() {
    return await AsyncStorage.getItem(KEYS.AUTH_TOKEN);
  }

  async setUser(user) {
    await AsyncStorage.setItem(KEYS.USER_DATA, JSON.stringify(user));
  }

  async getUser() {
    const raw = await AsyncStorage.getItem(KEYS.USER_DATA);
    return raw ? JSON.parse(raw) : null;
  }

  async clearAuth() {
    await AsyncStorage.removeItem(KEYS.AUTH_TOKEN);
    await AsyncStorage.removeItem(KEYS.USER_DATA);
  }

  // Offline Reports Queue
  async queueReport(report) {
    const existing = await this.getQueuedReports();
    const queuedItem = {
      ...report,
      tempId: 'offline_' + Date.now(),
      queuedAt: new Date().toISOString(),
      synced: false
    };
    existing.push(queuedItem);
    await AsyncStorage.setItem(KEYS.OFFLINE_REPORTS_QUEUE, JSON.stringify(existing));
    return queuedItem;
  }

  async getQueuedReports() {
    const raw = await AsyncStorage.getItem(KEYS.OFFLINE_REPORTS_QUEUE);
    return raw ? JSON.parse(raw) : [];
  }

  async removeQueuedReport(tempId) {
    const existing = await this.getQueuedReports();
    const filtered = existing.filter(r => r.tempId !== tempId);
    await AsyncStorage.setItem(KEYS.OFFLINE_REPORTS_QUEUE, JSON.stringify(filtered));
  }

  // Map Cache
  async cacheRoadSegments(features) {
    await AsyncStorage.setItem(KEYS.CACHED_ROADS, JSON.stringify(features));
  }

  async getCachedRoadSegments() {
    const raw = await AsyncStorage.getItem(KEYS.CACHED_ROADS);
    return raw ? JSON.parse(raw) : null;
  }
}

export default new StorageService();
