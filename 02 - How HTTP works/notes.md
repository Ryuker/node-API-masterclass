# How HTTP Works Notes

# 1. Intro to HTTP & The Node HTTP Module

## What is HTTP
- **H**yper **T**ext **T**ransfer **P**rotocol
- Communication between web servers & clients
- HTTP Requests / Responses
- Includes header & body

## Exploration
- **http**: This a core node module, so there's not need to install it

## Basic server
- setup the basic server
``` JS server.js
const http = require('http');

const server = http.createServer((req, res) => {
  console.log(req);
  
  // Ends the response so the request isn't hanging untill a response
  res.end();
});

const PORT = 5000;

// Run the server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```
- cd into the correct folder

**to run:**
```JS server.js
$node server.js
```

# 2. Installing Nodemon
- package to watch the server files so we don't have to restart the server everytime
