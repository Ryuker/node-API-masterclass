# Starting Our Project Notes

# 1. Project Specification & Resources
# 2. Basic Express Server, Dotenv & Git
1. Setup a package.json file using `npm init`
2. dependencies:
``` JS Terminal
npm i express dotenv 
```
  - express is for the server
  - dotenv is to access environment variables

3. dev dependencies: `npm i -D nodemon`
4. modify scripts of `package.json`
``` JS
"scripts": {
  "start": "NODE_ENV=production node server",
  "dev": "nodemon server"
},
```
5. added `server.js` file with imports of express and dotenv
``` JS server.js
const express = require('express');
const dotenv = require('dotenv');
``` 

6. added config folder with `config.env` file
  - config.env - contains the port and enviroment for now

7. loaded the .env vars into dotenv configs
``` JS server.js
// Load env vars
dotenv.config({path: './config/config.env'});
```

8. Basic code to declare the app, set the port and run it
``` JS server.js
// declaring the app
const app = express();

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on PORT ${PORT}`));
```

# 3. Creating Routes & Responses
## Get request handler
``` JS server.js
app.get('/', (req, res) => {
  res.send('Hello from express');
});
```
- By default `res.send()` sends a response as html
  - but when we send JSON data the header is updated to the proper content-type automatically

- We can use `res.status()` to specify the status
  - it's good practise to specify the status manually and send an object as a response
  example:
  ``` JS
  res.status(200).json( { success: true, data: { id: 1 } });
  ```

## Route Structure
- We version the API in the route so we can deprecate routes over time when update the API to a new version.
| GET / POST / PUT / Delete | 
| :- |
| /api/v1/bootcamps |
| /api/v1/courses |
| /api/v1/reviews |
| /api/v1/auth |
| /api/v1/users |


**All the typical routes**
``` JS server.js
// Routes
app.get('/api/v1/bootcamps', (req, res) => {
  res.status(200)
  .json( { success: true, msg: 'Show all bootcamps' });
});

app.get('/api/v1/bootcamps/:id', (req, res) => {
  res.status(200)
  .json( { success: true, msg: `Show bootcamp ${req.params.id}` });
});

app.post('/api/v1/bootcamps', (req, res) => {
  res.status(201)
  .json( { success: true, msg: 'Create new bootcamp' });
});

app.put('/api/v1/bootcamps/:id', (req, res) => {
  res.status(200)
  .json( { success: true, msg: `Display updated bootcamp ${req.params.id}` });
});

app.delete('/api/v1/bootcamps/:id', (req, res) => {
  res.status(200).json( { success: true, msg: `Deleted bootcamp ${req.params.id}` });
});
```


# 4. Reorganizing routes into a seperate module
- This allows us to handle route requests in seperate modules, better for organization.

- Created `routes/bootcamps.js` in the folder
``` JS bootcamps.js
const express = require('express');
const router = express.Router();

// All routes go here
router.get();
//etc

// export the router
module.exports = router.
```

- imported the router into `server.js`
``` JS server.js
// Route files
const bootcamps = require('./routes/bootcamps');
```
- specified the route base url
``` JS server.js
// Mount routers
app.use('/api/v1/bootcamps', bootcamps);
```

# 5. Reorganizing routes to use controller methods
- Controller methods will handle the tasks per each route.
- Created `controllers/bootcamps.js` in the project folder
- Basic exported method
``` JS controllers/bootcamps.js
// @desc    Get all bootcamps
// @route   GET/api/v1/bootcamps
// @access  Public
exports.getBootcamps = (req, res, next ) => {
  res.status(200)
  .json( { success: true, msg: 'Show all bootcamps' });
};
```
- For each method we're providing some info regarding what the method does, the route and access rights

- in `routes/bootcamps.js` we destructure the controller methods and then specify them on the route.
``` JS routes/bootcamps.js
router
  .route('/')
  .get(getBootcamps)
  .post(createBootcamp);

// Single item
router
  .route('/:id')
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);
```
- This makes it much neather to work with.

# 6. Intro to Middleware













