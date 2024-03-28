# Mongoose Advanced Querying & Relationships notes

# 1. Database Seeder for Bootcamps
- added `seeder.js` to the root
- this is used to load data from the data folder and send it to the database
  - we use this to quickly add and delete the data
  - it uses mongoose and the Bootcamp model so the Slugify and Geocoder run in the model middleware. 
    - So the database entries match what we would have if we submitted a request from Postmand/any client.
- We call this file in the Terminal with 
**to add all the database entries**
``` JS Terminal
node seeder -i
```
**to delete all the database entries**
``` JS Terminal
node seeder -d
```


``` JS seeder.js
const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load env var
dotenv.config({ path: './config/env/config.env'});

// Load models
const Bootcamp = require('./models/Bootcamp');

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

// Read JSON files
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
);

// Import into DB
const importData = async() => {
  try {
    await Bootcamp.create(bootcamps);
    console.log('Data Imported...'.green.inverse);
    process.exit();
  } catch(err) {
    console.log(err);
  }
};

// Delete data
const deleteData = async() => {
  try {
    await Bootcamp.deleteMany();
    console.log('Data Destroyed'.red.inverse);
    process.exit();
  } catch (error) {
    console.log(err);
  }
}

// '-i' or '-d' is the 3rd argument in the Terminal call, this why we specify argv[2]
// example: node seeder -i
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
```

# 2. Get Bootcamps Within Radius Loading...
[GEOJSON Explanation](https://geojson.org/)
- Added new controller method to getBootcamps within a radius
  - it's pretty easy to follow along with.
``` JS controllers/bootcamps.js
// @desc    Get bootcamps within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next ) => {
  const { zipcode, distance } = req.params;

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Divide distance by radius of Earth
  // Eart Radius = 3,963 miles / 6,378 km
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [ [ lng, lat], radius ] } }
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  });

});
```

- Added the new route to `routes/bootcamps.js` 
  - imported getBootCampsInRadius at the top.
``` JS routes/bootcamps.js
// All items within radius
router 
  .route('/radius/:zipcode/:distance')
  .get(getBootcampsInRadius);
```

# 3. Advanced Filtering
- in the client we can send the following query parameters in the url for example
  `?averageCost[lte]=10000` - returns everything that has an average cost of 10000 or lower
  `?averageCost[gte]=10000&location.city=Boston` - returns everything that has cost greater than 1000 and is in Boston
  `?careers[in]=Business` - returns everything that has Business in the careers array

- `req.query` gives us the query we receive from the client as an object
  - so we `JSON.stringify` this to edit it as a string
- We can modify the query string using `.replace` with Regular Expressions
  - regular expressions are specified within `//g`
    `/\b(gt|gte|lte|in)\b/g`
  - `gt:` greater than | `gte:` greater than or equal to | `lte:` less then or equal to | `in:` equals value inside the array
  - we need to put a `$` at the front of the key name
  - we then parse the query string with JSON.parse to an object and then await the query.

``` JS controllers/bootcamps.js
~~~ inside the getBootcamps handler ~~~
let query;
let queryStr = JSON.stringify(req.query);

queryStr = queryStr.replace(/\b(gt|gte|lte|in)\b/g, match => `$${match}`);

query = Bootcamp.find(JSON.parse(queryStr));

const bootcamps = await query;
```
