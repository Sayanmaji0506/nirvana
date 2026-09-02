const express =require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/', reportController.getReports);
router.post('/', reportController.submitReport);

module.exports=router; 