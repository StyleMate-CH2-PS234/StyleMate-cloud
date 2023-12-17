const express = require('express');
const { uploadImage } = require('../controller/controller');
const multerMiddleware = require('../middleware/multerMiddleware');
const router = express.Router();

router.post('/uploadImage', multerMiddleware, uploadImage);

module.exports = router;