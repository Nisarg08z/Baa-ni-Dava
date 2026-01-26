const express = require('express');
const router = express.Router();
const { saveHistory, getHistory } = require('../controllers/historyController');

router.route('/').get(getHistory).post(saveHistory);

module.exports = router;
