const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const tf = require('@tensorflow/tfjs-node');
// const firebaseApp = require('../config/firebase');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require("firebase/auth");
// const multerMiddleware = require('../middleware/multerMiddleware');
const { Storage } = require('@google-cloud/storage');
const mapsApiKey = process.env.MAPS_API_KEY;

const storage = new Storage({
    keyFilename: "./config/cloud-storage.json",
});

// Func to load model from Google Cloud Storage
async function loadModelFromGCS(modelName) {
    const bucket = storage.bucket(process.env.GCS_BUCKET_MODEL_NAME);

    // Create the photos directory if it doesn't exist
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
        console.log("Directory ", uploadDir, " has been created")
    }

    // Create the images directory if it doesn't exist
    const imageDir = path.join(__dirname, '..', 'uploads/images');
    if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir, { recursive: true });
        console.log("Directory ", imageDir, " has been created")
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
        const modelName = process.env.MODEL_FILE_NAME;
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
    // });
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
    const modelJsonPath = path.join(__dirname, '..', 'uploads', 'model.json');
    res.sendFile(modelJsonPath);
}

const getNearby = (req, res) => {
    const mapsApiKey = process.env.MAPS_API_KEY;
    const keyword = req.params.keyword;
    const location = req.params.location;
    const radius = 5000; // search within 5000 meters
    let photo_reference = null;

    // Get nearby places of the specified type
    fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&keyword=${keyword}&key=${mapsApiKey}`)
        .then(response => response.json())
        .then(data => {
            const places = data.results;
            const detailsPromises = places.map(place => {
                // Get details for each place
                return fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=url,name,formatted_phone_number,rating,photos&key=${mapsApiKey}`)
                    .then(response => response.json())
                    .then(data => data.result);
            });

            Promise.all(detailsPromises)
                .then(details => {
                    const imagePromises = details.map(detail => {
                        const { photos, ...otherDetails } = detail;

                        if (photos && photos.length > 0) {
                            const photoPromises = photos.slice(0, 3).map(photo => {
                                return fetch(`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${mapsApiKey}`)
                                    .then(response => response.url);
                            });

                            return Promise.all(photoPromises)
                                .then(imageUrls => {
                                    return { ...otherDetails, imageUrls };
                                });
                        } else {
                            return Promise.resolve(otherDetails);
                        }
                    });

                    Promise.all(imagePromises)
                        .then(detailsWithImages => {
                            res.json({
                                error: false,
                                message: `Nearby ${keyword} fetched successfully`,
                                [`list ${keyword}`]: detailsWithImages
                            });
                        });
                });
        })
        .catch(err => res.status(500).json({ message: 'An error occurred while fetching nearby places.' }));
}

module.exports = {
    login,
    register,
    loadModel,
    listModel,
    uploadImage,
    getNearby
}