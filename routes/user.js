const express = require('express');
const { login, register, changePassword, changeName, changePhoto } = require('../controller/controller');
const multerMiddleware = require('../middleware/multerMiddleware');
const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/password',changePassword)
router.post('/name',changeName)
router.post('/photo', multerMiddleware, changePhoto)

module.exports = router;