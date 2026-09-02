const express = require('express')
const aiController = require('../controllers/aiController');

const router = express.Router();

router.post('/evaluate', aiController.evaluateRoute);

module.exports = router
