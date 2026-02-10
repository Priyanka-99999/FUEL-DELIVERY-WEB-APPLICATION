const express = require('express');
const { getBunkDetails, createBunk, updateBunk } = require('../controllers/bunkController');
const router = express.Router();

router.post('/details', getBunkDetails);
router.post('/create', createBunk);
router.post('/update', updateBunk);

module.exports = router;
