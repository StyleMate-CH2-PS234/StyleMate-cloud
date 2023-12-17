const multer = require('multer');

const uploadStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/images')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

const upload = multer({ storage: uploadStorage });

module.exports = function (req, res, next) {
    upload.single('image')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            return res.status(500).json({ message: err.message });
        } else if (err) {
            // An unknown error occurred when uploading.
            return res.status(500).json({ message: err.message });
        }
        // Everything went fine.
        next();
    });
};