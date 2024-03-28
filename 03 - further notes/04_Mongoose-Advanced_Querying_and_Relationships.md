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

# 4. Select & Sorting
- supporting select (filters so we only gets the params specified in the request and the id)
  `?select=name,description,housing`
- to support this we copy the req.query object using `...` and then remove the value from the select field
  - we do this using a remove fields array, in this we specify what fields to exclude
    - we then `.forEach` over this array and remove each param `param => delete reqQuery[param]` 
  - we use this array to check 
  - we then get use an if check to see if the select is inside the original request.
    - if it is we copy the field value into a new variable 
    - with  `,` replaced by ` `, this is to mongoDB requirements
    - we then set the select key to the new field value

``` JS controllers/bootcamps.js
// Copy req.query
const reqQuery = {...req.query};

// Fields to exclude
const removeFields = ['select'];

// Loop over removeFields and delete them from reqQuery
removeFields.forEach(param => delete reqQuery[param]);

// Create query string
let queryStr = JSON.stringify(reqQuery);

// Create operators ($gt, $gte, etc) 
queryStr = queryStr.replace(/\b(gt|gte|lte|in)\b/g, match => `$${match}`);

// Finding resource
query = Bootcamp.find(JSON.parse(queryStr));

// Select fields
if(req.query.select) {
  const fields = req.query.select.split(',').join(' ');
  query = query.select(fields);
}
```

## Adding Sorting
- Very similar
  - example of a query `?select=name,description,housing&sort=-name`
    - `-name` sorts in descending order, positive sorts in ascending order
- We add `sort` as field to exclude
``` JS controller/bootcamps.js
// Fields to exclude
const removeFields = ['select', 'sort'];
```
- then we add a similar if check below the `select fields` check
``` JS controller/bootcamps.js
~~~ Select Fields Condition ~~~

// Sort
if (req.query.sort) {
  const sortBy = req.query.sort.split(',').join(' ');
  query = query.sort(sortBy);
} else {
  // Default
  query = query.sort('-createdAt');
}
```

# 5. Adding Pagination
query params: `?page=4&limit=1&select=name`
- added `page` and `limit` as fields to exclude
- used `parseInt()` to convert the page value from string to integer and set a default value
- added a startIndex variable in which we subtract one from the page and multpli the result by the limit
- we then add the `skip(startIndex)`  and `limit(limit)` fields to the query
``` JS controllers/bootcamps.js
~~~~ Sort Check ~~~~
// Pagination
const page = parseInt(req.query.page, 10) || 1;
const limit = parseInt(req.query.limit, 10) || 100;
const startIndex = (page - 1) * limit;

query = query.skip(startIndex).limit(limit); 
```

## Adding Pagination field
- this is to display in the client
- we the following constants 
``` JS controllers/bootcamps.js
const endIndex = page * limit;
const total = await Bootcamp.countDocuments();
```
- then we create an empty pagination object and populate it with a `next` and `prev` field
``` JS controllers/bootcamps.js
// Pagination result
const pagination = {};

if(endIndex < total) {
  pagination.next = {
    page: page + 1,
    limit
  }
}

if (startIndex > 0) {
  pagination.prev = {
    page: page -1,
    limit
  }
}
```
- we then return `pagination` as a field in our status object.
`{ success: true, count: bootcamps.length, pagination, data: bootcamps }`

# 6. Course Model & Seeding




