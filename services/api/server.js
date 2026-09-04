require('dotenv').config();
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const { initSocket } = require('./src/socket/socketHandler');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const roadRoutes = require('./src/routes/roadRoutes');
const districtRoutes = require('./src/routes/districtRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const routeRoutes = require('./src/routes/routeRoutes');
const riskRoutes = require('./src/routes/riskRoutes');
const weatherRoutes = require('./src/routes/weatherRoutes');
const gatewayRoutes = require('./src/routes/gatewayRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});
initSocket(io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoints
app.get(['/health', '/api/v1/health'], (req, res) => {
  res.status(200).json({
    status: 'success',
    service: 'nirvana-api',
    message: 'NIRVANA Smart Logistics API is live and operational'
  });
});

// Mount Routes (supporting both /<path> and /api/v1/<path>)
app.use(['/auth', '/api/v1/auth'], authRoutes);
app.use(['/users', '/api/v1/users'], userRoutes);
app.use(['/roads', '/api/v1/roads'], roadRoutes);
app.use(['/districts', '/api/v1/districts'], districtRoutes);
app.use(['/reports', '/api/v1/reports'], reportRoutes);
app.use(['/routes', '/api/v1/routes'], routeRoutes);
app.use(['/risk', '/api/v1/risk'], riskRoutes);
app.use(['/weather', '/api/v1/weather'], weatherRoutes);
app.use(['/webhooks/gateway', '/api/v1/webhooks/gateway'], gatewayRoutes);

// Backward compatibility: POST /api/v1/routes/evaluate
app.post('/api/v1/routes/evaluate', (req, res, next) => {
  req.url = '/evaluate';
  return riskRoutes(req, res, next);
});

// 404 handler for undefined routes
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl} - Endpoint not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, error: 'Invalid JSON payload' });
  }

  return res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`========================================================`);
  console.log(`🚀 NIRVANA API Server listening on http://localhost:${PORT}`);
  console.log(`📡 Socket.IO real-time engine initialized`);
  console.log(`📍 Northeast India corridor monitoring active`);
  console.log(`========================================================`);
});
