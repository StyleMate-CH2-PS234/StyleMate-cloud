const express = require('express');
const { loadModel, listModel, updateModel } = require('../controller/controller');
const { recommendModel } = require('../controller/recommend');
const router = express.Router();

router.get('/load', loadModel);
router.get('/list', listModel);
router.get('/update', updateModel);
router.get('/recommend', recommendModel);

module.exports = router;