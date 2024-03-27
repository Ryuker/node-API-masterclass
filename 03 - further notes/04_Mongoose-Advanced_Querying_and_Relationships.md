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
- 