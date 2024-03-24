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
  
  // Close server & exut process
  server.close(() => process.exit(1));
});
```


