const express = require('express');
const { login, register, changePassword, changeName } = require('../controller/controller');
const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/password', changePassword)
router.post('/name', changeName)

module.exports = router;