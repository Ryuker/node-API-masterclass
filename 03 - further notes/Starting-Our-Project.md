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




