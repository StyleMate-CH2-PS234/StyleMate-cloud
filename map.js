const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const apiKey = process.env.MAPS_API_KEY; // replace with your API key
const location = '-7.250445,112.768845'; // replace with your latitude,longitude
const radius = 5000; // search within 5000 meters

app.get('/maps/:type', (req, res) => {
  const type = req.params.type;

  // Get nearby places of the specified type
  fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=${type}&key=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      const places = data.results;
      const detailsPromises = places.map(place => {
        // Get details for each place
        return fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,photos,opening_hours,formatted_phone_number,url&key=${apiKey}`)
          .then(response => response.json())
          .then(data => data.result);
      });

      Promise.all(detailsPromises)
        .then(details => res.json(details))
        .catch(err => res.status(500).json({ message: 'An error occurred while fetching place details.' }));
    })
    .catch(err => res.status(500).json({ message: 'An error occurred while fetching nearby places.' }));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));