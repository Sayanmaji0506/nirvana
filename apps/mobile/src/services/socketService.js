import { io } from 'socket.io-client';
import { CONFIG } from '../config';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = {
      reroute: [],
      roadUpdate: [],
      newReport: []
    };
  }

  connect(userId = null) {
    if (this.socket && this.socket.connected) return;

    this.socket = io(CONFIG.SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      timeout: 5000
    });

    this.socket.on('connect', () => {
      console.log('[MOBILE SOCKET] Connected to NIRVANA backend:', this.socket.id);
      this.socket.emit('join-driver', { userId });
    });

    this.socket.on('emergency-reroute-alert', (data) => {
      console.log('[MOBILE SOCKET] EMERGENCY REROUTE ALERT RECEIVED:', data);
      this.listeners.reroute.forEach(cb => cb(data));
    });

    this.socket.on('road-status-update', (data) => {
      console.log('[MOBILE SOCKET] Road status updated:', data);
      this.listeners.roadUpdate.forEach(cb => cb(data));
    });

    this.socket.on('new-report', (data) => {
      console.log('[MOBILE SOCKET] New hazard report:', data);
      this.listeners.newReport.forEach(cb => cb(data));
    });

    this.socket.on('disconnect', () => {
      console.log('[MOBILE SOCKET] Disconnected from backend');
    });
  }

  onRerouteAlert(cb) {
    this.listeners.reroute.push(cb);
    return () => {
      this.listeners.reroute = this.listeners.reroute.filter(f => f !== cb);
    };
  }

  onRoadStatusUpdate(cb) {
    this.listeners.roadUpdate.push(cb);
    return () => {
      this.listeners.roadUpdate = this.listeners.roadUpdate.filter(f => f !== cb);
    };
  }

  onNewReport(cb) {
    this.listeners.newReport.push(cb);
    return () => {
      this.listeners.newReport = this.listeners.newReport.filter(f => f !== cb);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new SocketService();
