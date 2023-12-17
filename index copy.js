// Langkah 2: Setup Express.js Server

const express = require('express');
const multer = require('multer'); // Paket untuk meng-handle upload file
const tf = require('@tensorflow/tfjs-node');
const path = require('path');
const process = require('process');
// config service account google cloud
const serviceAccountPath = path.join(__dirname, 'config/config.json');

process.env.GOOGLE_APPLICATION_CREDENTIALS = serviceAccountPath;

const { Storage } = require('@google-cloud/storage');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware untuk menangani form-data (foto dari mobile)
const upload = multer({ dest: 'uploads/' });

// Route untuk menerima foto
app.post('/upload-photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Ambil path foto yang di-upload
    const photoPath = req.file.path;

    // Memuat model TensorFlow.js dari Google Cloud Storage
    const model = await loadModelFromGCS('nama_model.h5');

    // Proses foto menggunakan TensorFlow.js
    const result = await processPhotoWithTF(photoPath, model);

    // Panggil API rekomendasi dengan hasil dari TensorFlow.js
    // Code untuk API rekomendasi akan diletakkan di sini

    // Kirimkan respons berupa hasil proses foto
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fungsi untuk memuat model dari Google Cloud Storage
async function loadModelFromGCS(modelName) {
  const storage = new Storage();
  const bucket = storage.bucket('nama_bucket');

  const file = bucket.file(modelName);
  const modelBuffer = await file.download();

  return tf.loadLayersModel(tf.node.decodeWeights(modelBuffer[0]));
}

// Fungsi untuk memproses foto dengan TensorFlow.js
async function processPhotoWithTF(photoPath, model) {
  // Code untuk memproses foto dengan TensorFlow.js akan diletakkan di sini
  // Anda akan memuat foto, melakukan pre-processing, dan menggunakan model
  // untuk mendapatkan hasil prediksi/gambar yang diproses
  // Contoh: 
  const image = await loadImage(photoPath);
  const processedImage = model.predict(image);
  return processedImage;
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Langkah 3: Penanganan Gambar

// Langkah 4: Koneksi ke API Rekomendasi
