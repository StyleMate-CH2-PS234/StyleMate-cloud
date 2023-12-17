const express = require('express');
const { loadModel, listModel } = require('../controller/controller');
const router = express.Router();

router.get('/load', loadModel);
router.get('/list', listModel);

module.exports = router;