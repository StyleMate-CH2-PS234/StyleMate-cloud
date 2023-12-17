const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user');
const upImgRoutes = require('./routes/upImg');
const modelRoutes = require('./routes/model');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use('/users', userRoutes);
app.use('/upload', upImgRoutes);
app.use('/model', modelRoutes);

app.get('/', (req, res) => {
    res.status(200).json({ message: 'API Server Alive!' });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});