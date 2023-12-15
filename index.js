const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const tf = require('@tensorflow/tfjs-node');
const { Storage } = require('@google-cloud/storage');
require('dotenv').config();

// const serviceAccountPath = path.join(__dirname, process.env.GCP_SERVICE_ACCOUNT_FILE_PATH);

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

const upload = multer({ dest: 'uploads/' });
const modelName = process.env.MODEL_FILE_NAME;

app.post('/uploadImage', upload.single('image'), async (req, res) => {
  const imageFile = req.file;
  // Read the image data
  const imageBuffer = await fs.promises.readFile(imageFile.path);
  // Get name of image
  const fileName = req.file.originalname;
  console.log(`Extension: ${fileName}`);
  // Get extension
  const extension = path.extname(req.file.originalname);
  console.log(`Extension: ${extension}`);
  // Generate a UUID and change photo name to UUID.extension
  const uuid = uuidv4();
  const uniqueFileName = `${uuid}${extension}`;

  // Get a bucket and file reference
  const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);
  const file = bucket.file(uniqueFileName);

  // Upload the image to GCS
  await file.save(imageBuffer);

  // Delete the temporary file
  await fs.promises.unlink(imageFile.path);

  // Return a response with the image URL in GCS
  const imageUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
  // res.json({ imageUrl });

  const model = await loadModelFromGCS(modelName);
  console.log('Model loaded successfully!');
});

const storage = new Storage({
  keyFilename: process.env.GCP_SERVICE_ACCOUNT_FILE_PATH,
});

// Func to load model from Google Cloud Storage
async function loadModelFromGCS(modelName) {
  const bucket = storage.bucket(process.env.GCS_BUCKET_MODEL_NAME);

  const file = bucket.file(modelName);
  const modelBuffer = await file.download();

  // Prepare the model.json file for tf.loadLayersModel
  const modelJson = JSON.parse(modelBuffer.toString());

  // Use a Blob or File object for the weightsManifest
  const weightsManifest = modelJson.weightsManifest;
  const weightsBlob = new Blob([new Uint8Array(weightsManifest)], {type: 'application/octet-stream'});

  // Use tf.io.browserHTTPRequest to load the model from the buffer
  const model = await tf.loadLayersModel(tf.io.browserHTTPRequest(
    modelJson.modelTopology,
    {
      weightsManifest: weightsBlob,
      fetchFunc: () => Promise.resolve(new Response(modelBuffer))
    }
  ));

  return model;
}
// async function loadModelFromGCS(modelName) {
//   const bucket = storage.bucket(process.env.GCS_BUCKET_MODEL_NAME);

//   const file = bucket.file(modelName);
//   const modelBuffer = await file.download();

//   // return tf.loadLayersModel(tf.node.decodeWeights(modelBuffer[0]));
//   // Decode and load model weights
//   const modelBufferArray = await tf.node.decodeWeights(modelBuffer);
//   model = await tf.loadLayersModel(modelBufferArray[0]);
// }

// // Load the model
// const model = await tf.loadLayersModel('model.json');

// // Pre-process the image
// const imageTensor = tf.browser.decodeImage(imageBuffer, 3);
// const processedImage = await tf.image.resizeBilinear(imageTensor, [224, 224]); // Adjust dimensions as needed

// // Feed the image to the model and obtain predictions
// const predictions = await model.predict(tf.expandDims(processedImage, 0));

// res.json({ predictions });

app.get('/test-model-load', async (req, res) => {
  try {
    const model = await loadModelFromGCS(process.env.MODEL_FILE_NAME);
    console.log('Model loaded successfully!');
    res.status(200).send('Model loaded successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading model!');
  }
});

app.listen(PORT, () => console.log('Server listening on port 3000'));