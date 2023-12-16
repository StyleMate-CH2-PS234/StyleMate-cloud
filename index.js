const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const tf = require('@tensorflow/tfjs-node');
const { Storage } = require('@google-cloud/storage');
require('dotenv').config();

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

const uploadStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/images')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: uploadStorage });
const modelName = process.env.MODEL_FILE_NAME;

app.post('/uploadImage', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No image uploaded!' });
    }

    try {
        const imageFile = req.file;

        // Validate the file
        if (!imageFile.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return res.status(400).json({ message: 'Only image files are allowed!' });
        }

        // Read the image data
        const imageBuffer = await fs.promises.readFile(imageFile.path);
        if (fs.existsSync(imageFile.path)) {
            console.log(`File ${imageFile.path} exists!`);
        } else {
            console.error(`File ${imageFile.path} does not exist!`);
        }

        const files = fs.readdirSync('uploads/');

        console.log('Files in photos:');
        files.forEach(file => console.log(file));

        // Process the image
        const imageTensor = tf.node.decodeImage(imageBuffer, 3);
        const processedImage = await tf.image.resizeBilinear(imageTensor, [224, 224]); // Adjust dimensions as needed
        const imageBatch = tf.expandDims(processedImage, 0);

        // Load the model
        const model = await loadModelFromGCS(modelName);
        console.log('Model loaded successfully!');

        // predict the class
        const predictedClass = tf.tidy(() => {
            const predictions = model.predict(imageBatch);
            return predictions.as1D().argMax();
        });

        const classId = (await predictedClass.data())[0];

        switch (classId) {
            case 0:
                predictionText = "Heart";
                break;
            case 1:
                predictionText = "Round";
                break;
            case 2:
                predictionText = "Square";
                break;
        }

        res.json({ classId, predictionText });

        // // Delete the temporary file
        // await fs.promises.unlink(imageFile.path);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while processing the image.' });
    }
});

const storage = new Storage({
    keyFilename: "./config/config.json",
});

// Func to load model from Google Cloud Storage
async function loadModelFromGCS(modelName) {
    const bucket = storage.bucket(process.env.GCS_BUCKET_MODEL_NAME);

    // Create the photos directory if it doesn't exist
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }

    // Download the model.json file
    const modelFile = bucket.file(modelName);
    const modelJsonPath = path.join(uploadDir, 'model.json');
    if (!fs.existsSync(modelJsonPath)) {
        const [modelJson] = await modelFile.download();
        fs.writeFileSync(modelJsonPath, modelJson);
    }

    // Download the weights files
    const [files] = await bucket.getFiles();
    const weightsFiles = files.filter(file => file.name.startsWith('group') && file.name.endsWith('.bin'));
    await Promise.all(weightsFiles.map(async (file) => {
        if (file.name.endsWith('.bin')) {
            const weightsFilePath = path.join(uploadDir, path.basename(file.name));
            if (!fs.existsSync(weightsFilePath)) {
                const [weights] = await file.download();
                fs.writeFileSync(weightsFilePath, weights);
                console.log(`Downloaded ${file.name} to ${weightsFilePath}`);
            }
        }
    }));

    // Load the model from the local files
    const model = await tf.loadLayersModel('file://' + modelJsonPath);
    // console.log(model.summary());
    // console.log(model.getWeights());
    // console.log(modelJsonPath);

    return model;
}

app.get('/load-model', async (req, res) => {
    try {
        const model = await loadModelFromGCS(process.env.MODEL_FILE_NAME);
        console.log('Model loaded successfully!');
        res.status(200).json({ message: 'Model loaded successfully!' });
    } catch (error) {
        console.error('Error loading model:', error);
        res.status(500).json({ message: 'Error loading model' });
    }
});

app.get('/model', async (req, res) => {
    const modelJsonPath = path.join(__dirname, 'uploads', 'model.json');
    res.sendFile(modelJsonPath);
});

app.get('/', (req, res) => {
    res.status(200).json({ message: 'API Server Alive!' });
});

app.listen(PORT, () => console.log('Server listening on port 3000'));