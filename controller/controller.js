const express = require('express');
// const firebaseApp = require('../config/firebase');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require("firebase/auth");
const multerMiddleware = require('./multerMiddleware');

const modelName = process.env.MODEL_FILE_NAME;
const storage = new Storage({
    keyFilename: "./config/cloud-storage.json",
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

    return model;
}

const login = (req, res) => {
    const auth = getAuth();
    signInWithEmailAndPassword(auth, req.body.email, req.body.password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            // ...
            res.status(200);
            res.json({
                'success': true,
                'data': user,
                'errors': null
            });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            res.status(200);
            res.json({
                'success': false,
                'errors': errorMessage,
            });
        });
}

const register = (req, res) => {
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, req.body.email, req.body.password)
        .then((userCredential) => {
            // Signed up 
            const user = userCredential.user;
            // ...
            res.status(201);
            res.json({
                'success': true,
                'data': user,
                'errors': null,
            });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            // ..
            res.status(400);
            res.json({
                'success': false,
                'errors': errorMessage,
            });
        });

}

const uploadImage = async (req, res) => {
    multerMiddleware(req, res, async function (err) {
    if (err) {
        return res.status(500).json({ message: err.message });
    }

    if (!req.file) {
        return res.status(400).json({ message: 'No image uploaded!' });
    }

    try {
        const imageFile = req.file;

        // Validate the file
        if (!imageFile.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return res.status(400).json({ message: 'Only image files are allowed!' });
        }

        // Create the photos directory if it doesn't exist
        const files = fs.readdirSync('uploads/');
        console.log('Files in photos:');
        files.forEach(file => console.log(file));

        // Read the image data
        if (fs.existsSync(imageFile.path)) {
            console.log(`File ${imageFile.path} exists!`);
        } else {
            console.error(`File ${imageFile.path} does not exist!`);
        }
        const imageBuffer = await fs.promises.readFile(imageFile.path);

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
        await fs.promises.unlink(imageFile.path);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while processing the image.' });
    }
});
};

const loadModel = async (req, res) => {
    try {
        const model = await loadModelFromGCS(process.env.MODEL_FILE_NAME);
        console.log('Model loaded successfully!');
        res.status(200).json({ message: 'Model loaded successfully!' });
    } catch (error) {
        console.error('Error loading model:', error);
        res.status(500).json({ message: 'Error loading model' });
    }
}

const listModel = (req, res) => {
    const modelJsonPath = path.join(__dirname, 'uploads', 'model.json');
    res.sendFile(modelJsonPath);
}

module.exports = {
    login,
    register,
    loadModel,
    listModel,
    uploadImage
}