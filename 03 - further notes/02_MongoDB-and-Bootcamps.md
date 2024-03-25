# Getting started with Mongo DB and Bootcamps

# 1. MongoDB Atlas & Compass Setup
- logged in with my account
- added a new project to my org
- deployed a new database cluster, named it `Dev Camper API`
- connected Compass app on desktop to the database.

# 2. Connecting To The Database With Mongoose
[Mongoose Documentation](https://mongoosejs.com/docs/guide.html)

- Mongoose is an abstraction layer to interact with a mongodb database.
  - it's a node package.
- to install:
``` JS Terminal
npm i mongoose
```
- we moved config.env into a `env` folder so it's only stored locally. 
- in `.gitignore` we specified that the `env` folder should be ignored

- in `config/db.js` we hooked up mongoose to the database
``` JS db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  const conn = mongoose.connect(process.env.MONGO_URI);
};

console.log(`MongoDB connected: ${conn.connection.host}`);

module.exports = connectDB;
```

## Refactor server.js to handle unhandled rejections
- put app.listen into a `server` constant
  - this allows us to close it if we need to.

- code to handle unhandled rejections
``` JS server.js
// Handle unhandled rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  
  // Close server & exit process
  server.close(() => process.exit(1));
});
```

# 3. Adding colors in the console for readability
- we're using a package, `colors` for this | [github repo](https://github.com/Marak/colors.js)
- to install:
``` JS Terminal
npm i colors
```
- we need to import it into server.js
- we can then use `..yellow.bold` (for example) behind the string for a console output

# 4. Create the Bootcamp model
- Added a models folder with 
- Added `Bootcamp.js` to hold the Bootcamp schema
  - It's customary to capitalize the first letters of model files
``` JS models/Bootcamp.js
const mongoose = require('mongoose');

const BootcampSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name can not be more than 50 characters']
  },
  // Additional schema objects go here

});

// exporting the schema
module.exports = mongoose.model('Bootcamp', BootcampSchema);
```

# 5. Creating Bootcamps - POST
- imported the `Bootcamp` model into bootcamp controller
- in Postman we configured a header preset to ensure we pass in application/json as content-type
  - this is just usefull for sending consistent request headers

## Middleware to use req.body
- In `server.js` we add body parser middleware, this is included in express.
  - this allows us to access the request body in controllers.
``` JS server.js
// Body parser
app.use(express.json());
```

## Creating the database entry
- in `createBootcamp` we changed the callback to and async function
- we then await `Bootcamp.create` with the req.body passed as parameters.

## Error handling
- this is temporary as we'll be writing a custom error handler.
- but for avoiding to add duplicates we used a `try catch` block in createBootcamp 
``` JS controllers/bootcamps.js
exports.createBootcamp = async (req, res, next ) => {
  try {
    const bootcamp = await Bootcamp.create(req.body);
    
    res.status(201)
      .json( { success: true, data: bootcamp });
  } catch (err) {
    res.status(400)
      .json( { success: false, error: err });
  }
};
```

# 6. Fetching Bootcamps - GET
## Fetching all Bootcamps - GET
- simple stuff, modified `getBootcamps` to an async function and used `Bootcamp.find()` to get all entries.
``` JS controllers/bootcamps.js
exports.getBootcamps = async(req, res, next ) => {
  try {
    const bootcamps = await Bootcamp.find();
    res.status(200)
      .json( { success: true, data: bootcamps });
  } catch (err) {
    res.status(404)
      .json( { success: false, error: err });
  }
};
```
## Fetching single bootcamp - GET:id
- very similar to get all bootcamps but we use `findById(req.params.id)` as request method to the database
``` JS controllers.bootcamps.js
exports.getBootcamp = async (req, res, next ) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);

    // Send 400 if the ID didn't return a result from the database
    if (!bootcamp) {
      return res.status(400).json({ success: false});
    }

    res.status(200)
      .json( { success: true, data: bootcamp });

  } catch (err) {
    res.status(400)
      .json( { success: false, error: err });
  }
};
```

# 7. Updating Bootcamps - PUT
- Very similar but we use the following to submit the update to the database
  - we need to pass the `params.id` and the `req.body`
  - we need to specify it's new and run the mongoose validators
``` JS controllers/bootcamps.js | updateBootcamp()
findByIdAndUpdate(req.params.id, req.body, {
  new: true,
  runValidators: true
});
```

# 8. Removing single bootcamp - DELETE
- very similar, but we use the following to delete an entry from the database
  - we call `Bootcamp.findByIdAndDelete()` instead
``` JS controllers/bootcamps.js | deleteBootcamp()
exports.deleteBootcamp = async (req, res, next ) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

    // Send 400 if the ID didn't return a result from the database
    if (!bootcamp) {
      return res.status(400).json({ success: false });
    }

    res.status(200)
      .json( { success: true, msg: `Deleted bootcamp ${req.params.id}` , data: {} });

  } catch(err) {
    res.status(400)
      .json( { success: false });
  }
};
```













