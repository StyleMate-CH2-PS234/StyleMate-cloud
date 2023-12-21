const express = require('express');
const { getNearby, getMaps } = require('../controller/controller');
const router = express.Router();

router.get('/static/:location/:keyword', getMaps);
router.get('/search/:location/:keyword', getNearby);

module.exports = router;