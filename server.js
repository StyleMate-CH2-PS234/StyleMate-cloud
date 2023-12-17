const express = require('express');
const userRoutes = require('./users/routes');
const upImgRoutes = require('./users/upImg');
const modelRoutes = require('./users/model');

const app = express();
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