const express = require('express');
const cors = require('cors');
const fs = require('fs');
const userRoutes = require('./routes/user');
const upImgRoutes = require('./routes/upImg');
const modelRoutes = require('./routes/model');
const placeRoute = require('./routes/place');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use('/auth', userRoutes);
app.use('/upload', upImgRoutes);
app.use('/model', modelRoutes);
app.use('/place', placeRoute);

app.get('/', (req, res) => {
    res.status(200).json({ message: 'API Server Alive!' });
});

app.get('/ls', (req, res) => {
    const lsdir = fs.readdirSync('./');
    res.json(lsdir);
});

app.get('/ls/:dir', (req, res) => {
    const dirPath = './' + req.params.dir;
    try {
        const lsdir = fs.readdirSync(dirPath);
        res.json(lsdir);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/ls/:dir/:dirr', (req, res) => {
    const dirPath = './' + req.params.dir + '/' + req.params.dirr;
    try {
        const lsdir = fs.readdirSync(dirPath);
        res.json(lsdir);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});