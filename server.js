const express = require('express');
const userRoutes = require('./users/routes');

const app = express();
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use('/users', userRoutes);

app.listen(3000, () => {
    console.log(`Listening on port 3000`);
})
