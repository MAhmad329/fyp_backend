const express = require('express');
const router = express.Router();
const {getProjectStatusCounts}=require('../controllers/admin');

// Route to get the count of projects by status
router.route('/admin/projects/status-count').get(getProjectStatusCounts);

module.exports = router;
