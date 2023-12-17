const express = require('express');
const { uploadImage } = require('../controller/controller');
const router = express.Router();

const uploadStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/images')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

const upload = multer({ storage: uploadStorage }).single('image');

router.post('/uploadImage', upload, uploadImage);

module.exports = router;