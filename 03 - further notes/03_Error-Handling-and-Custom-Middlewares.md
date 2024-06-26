# Error Handing & Custom Middlewares notes
[Express Error Handling Page](https://expressjs.com/en/guide/error-handling.html)

for reference:
- free maps: [leaflet](https://leafletjs.com/)
- free location data: [openstreetmap](https://wiki.openstreetmap.org/wiki/API_v0.6#URL_+_authentication)

# 1. Error Handler Middleware
- bit a tricky explanation on the above page but
  - to have Express handle errors in a non default way we have to call `next()` with the error
    - this ensures Express will handle the error we passed in.

- We're writing our own. Not sure how this will work yet.

## Basic Error Handler
- we create a `error.js` in the middleware folder
``` JS error.js
const errorHandler = (err, req, res, next) => {
  // Log to console for dev
  console.log(err.stack.red);
  
  res.status(500).json({
    success: false,
    error: err.message
  });
};

module.exports = errorHandler;
```

## Using the Error Handler Middleware
- we need to import it into `server.js`
- we then have to use it after the routs middleware is specified
  - else it won't catch the error
``` JS server.js
~~~ Route Middleware ~~~
// - Error Handler
app.use(errorHandler);
```

# 2. Custom ErrorResponse Class
- We added a `utils` folder in the project root
- Added `errorResponse.js`
- Added a custom class that extends Error.
  - code below is basic
``` JS errorResponse.js
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse;
```

- Modified `error.js` response
``` JS error.js
res.status(err.statusCode || 500).json({
  success: false,
  error: err.message || 'Server Error'
});
```

## Use errorHandler in Bootcamps controller
- imported `errorResponse` into `bootcamps` controller
- used in getSingleID request handler's next parameter
  - this is temporary
``` JS controllers/bootcamps.js
next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
```

# 3. Mongoose Error Handling

## Cast Error Handling by Name
- modified `error.js` to handle `CastErrors`
  - for this we make a copy of the error, and set it's message to the original err message.
  ``` JS
  let error = { ...err };
  error.message = err.message;
  ```

  - we then check it's name, if it's a `Cast Error` we pass a custom `ErrorResponse`
  ``` JS 
  // Mongoose bad ObjectId
    if (err.name === 'CastError') {
      const message = `Bootcamp id is not formatted properly - id: ${err.value}`;
      error = new ErrorResponse(message, 404);
    }
  ```
- modified `controllers/bootcamps.js` 
  - to just pass in err into the next parameter in the try catch block 
    - since we're now handling it in the error middleware.

- did this for all the routeHandlers
  - Also made sure to send a custom response where the ID format does match but isn't in the database. 

## Duplicate Key Error handling by Code
- this returns a `MongoError` but this is used for multiple error
  - instead we need to check for the error code key - `11000`
``` JS 
// Mongoose duplicate key
if (err.code === 11000) {
  console.log(err);
  const message = `Duplicate field value entered - ${err.keyValue.name}`;
  error = new ErrorResponse(message, 400);
}
```

## Validation Error Handling
- For this we check for a `ValidationError` in `error.js`
- We then create an array which maps through the errors and get the validation message of each one
- we then send a response with the array and status
``` JS erros.js
// Mongoose validation error
if (err.name === 'ValidationError') {
  const message = Object.values(err.errors).map(val => val.message);
  error = new ErrorResponse(message, 400);
}
```

# 4. Async Await Middleware
- We added an `async.js` piece of middleware
  - This handles catch automatically
``` JS
const asyncHandler = fn => (req, res, next) => 
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
```
- in `controllers/bootcamps` we then import this async handler and wrap the handler in it like below
  - this way we don't need to use try catch in the async function passed into the asyncHandler

``` JS controllers/bootcamps.js
exports.getBootcamps = asyncHandler( async(req, res, next ) => {
  const bootcamps = await Bootcamp.find();
  res.status(200)
    .json( { success: true, count: bootcamps.length, data: bootcamps });
});
```

# 5. Mongoose Middleware & Slugify
[documentation](https://mongoosejs.com/docs/middleware.html#types-of-middleware)
- moongoose has 4 types of middleware
  - document middleware: manipulates the document 
  - model middleware:
  - aggregate middleware:
  - query middleware:

- You also have `Post` and `Pre` middleware, pre runs before and post runs after. 

## Adding Slugify package
- generates SEO friendly URLS - [website](https://slugify.online/)
- to install:
``` JS Terminal
npm i slugify
```

## Using Slugify in Pre middleware to generate slug
- import into the controller (or any other place we want to use the middleware)
- add `pre` middleware below the schema
  - we want to run before `save` so we specify that.
  - but we use a regular function as callback because arrow functions handle the scope of `this` differently.
``` JS controllers/bootcamps
~~~ Schema ~~~~
// Create bootcamp slug from the name
BootcampSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
```

# 6. GeoJSON Location & Geocoder Hook
[package website](https://nchaulet.github.io/node-geocoder/)
- the course uses a website called mapquest but this is payed.
  - I'm not using it for now. Might be able to get it from a different free service instead.
    - this is a free alternative to get the - [github package](https://github.com/thundermiracle/geocoder-free)
    - using [openstreetmap](https://wiki.openstreetmap.org/wiki/API_v0.6#URL_+_authentication) doesn't require any account
- to install node-geocoder
``` JS Terminal
npm i node-geocoder
```

- In the `Bootcamp.js` model added
``` JS 
~~~ schema ~~~
// Geocode & create location field
```

- added `geocoder.js` to the utils folder
``` JS geocoder.js
const nodeGeocoder = require('node-geocoder');

const options = {
  provider: process.env.GEOCODER_PROVIDER,
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
}

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
```

- in the Bootcamp model 
  - added the code to get the location with node-geocoder 
  - and then set location using the longitude and latitude
    - this is the only thing we would be using the Mapquest api access for, 
      - I think we can replace this with gettingt the data from googlemaps using geocoder free
      - for now I'm having it use `openstreetmap` instead since that doesn't require an account not a package
``` JS
// Geocode & create location field
BootcampSchema.pre('save', async function(next){
  const loc = await geocoder.geocode(this.address);
  
  this.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode,
  }

  // Do not save adress
  this.adress = undefined;
  next();
});
```













