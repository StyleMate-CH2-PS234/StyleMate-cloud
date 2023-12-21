const { Storage } = require('@google-cloud/storage');
require('dotenv').config();

const bucketName = process.env.GCS_BUCKET_NAME;

const recommendModel = (req, res) => {
  const faceClassification = req.query.face; // Get the face classification from the query parameters
  const directoryPath = `./uploads/recommend/${faceClassification}/`; // Construct the directory path

    // Create a client
    const storage = new Storage({
        keyFilename: './config/cloud-storage.json'
    });
    const bucket = storage.bucket(bucketName);
    bucket.getFiles({ prefix: directoryPath })
    .then(([files]) => {
      if (files.length === 0) {
        res.status(404).json({ error: true, message: 'No files found' });
      } else {
        // Shuffle the array and take the first 10 items
        const shuffledFiles = files.sort(() => 0.5 - Math.random());
        const selectedFiles = shuffledFiles.slice(0, 10);
    
        // Construct the public URLs
        const publicUrls = selectedFiles.map(file => `https://storage.googleapis.com/${bucketName}/${file.name}`);
    
        // Send the URLs in a JSON response
        res.json({ error: false, imageUrls: publicUrls });
      }
    })
    .catch(err => {
      res.status(500).json({ error: true, message: err });
    });
};

module.exports = {
    recommendModel
}