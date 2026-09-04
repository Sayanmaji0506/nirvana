let ioInstance = null;

function initSocket(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`[SOCKET.IO] Client connected: ${socket.id}`);

    // Join driver room or user specific room
    socket.on('join-driver', (data) => {
      socket.join('drivers');
      if (data && data.userId) {
        socket.join(`user_${data.userId}`);
      }
      console.log(`[SOCKET.IO] Socket ${socket.id} joined 'drivers' room`);
    });

    socket.on('join-room', (room) => {
      socket.join(room);
    });

    socket.on('disconnect', () => {
      console.log(`[SOCKET.IO] Client disconnected: ${socket.id}`);
    });
  });
}

function getIO() {
  return ioInstance;
}

/**
 * Broadcast emergency reroute alert to active drivers
 */
function emitEmergencyReroute(alertData) {
  if (ioInstance) {
    console.log(`[SOCKET.IO ALERT] Emitting emergency-reroute-alert:`, alertData.message);
    ioInstance.to('drivers').emit('emergency-reroute-alert', alertData);
    ioInstance.emit('emergency-reroute-alert', alertData); // Also broadcast to general listeners
  }
}

/**
 * Broadcast road status update
 */
function emitRoadStatusUpdate(segmentData) {
  if (ioInstance) {
    console.log(`[SOCKET.IO] Emitting road-status-update for segment ${segmentData.id}: ${segmentData.status}`);
    ioInstance.emit('road-status-update', segmentData);
  }
}

/**
 * Broadcast newly submitted report
 */
function emitNewReport(reportData) {
  if (ioInstance) {
    console.log(`[SOCKET.IO] Emitting new-report: ${reportData.type} at (${reportData.lat}, ${reportData.lng})`);
    ioInstance.emit('new-report', reportData);
  }
}

module.exports = {
  initSocket,
  getIO,
  emitEmergencyReroute,
  emitRoadStatusUpdate,
  emitNewReport
};
