const express = require('express');
const { createDispute, resolveDispute ,getDisputeByProjectId,getAllDisputes} = require('../controllers/dispute');
const router = express.Router();

// Route to create a dispute
router.route('/dispute/create').post(createDispute);

// Route to resolve a dispute
router.route('/dispute/:disputeId/resolve').put(resolveDispute);
router.route('/dispute/project/:projectId').get(getDisputeByProjectId);

router.route('/dispute/all').get(getAllDisputes);

module.exports = router;