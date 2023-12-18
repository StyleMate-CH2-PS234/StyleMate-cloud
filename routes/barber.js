const express = require('express');
const { getAllBarber, getBarberByQuery } = require('../controller/controller');
const router = express.Router();

router.get('/barber', getAllBarber);
router.get('/barber/', getBarberByQuery);

module.exports = router;