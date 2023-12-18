const express = require('express');
const { getNearby } = require('../controller/controller');
const router = express.Router();

router.get('/search/:location/:keyword', getNearby);

module.exports = router;