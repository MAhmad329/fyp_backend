const express = require('express');
const { createDispute, resolveDispute ,getDisputeByProjectId} = require('../controllers/dispute');
const router = express.Router();

// Route to create a dispute
router.route('/dispute/create').post(createDispute);

// Route to resolve a dispute
router.route('/dispute/:disputeId/resolve').put(resolveDispute);
router.route('/dispute/project/:projectId').get(getDisputeByProjectId);

module.exports = router;