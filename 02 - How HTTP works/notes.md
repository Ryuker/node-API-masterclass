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
- created a package.json file using `npm init` with some configuration
- installed nodemon using
``` JS Terminal
$npm i -D nodemon
```
- Setup a script in package.json to run server.js with nodemon

# 3. Responding with Data
- `res.write('Hello')` is an easy way to return an response
- It's common to set a header as as well so the browser knows what it's receiving
  - `text/plain` for plain text
  - `text/html` for HTML (self explanatory)
- example: `res.setHeader('Content-Type', 'text/plain');` before writing the response.
- `X-Powered-By` is used to specify what technology is running the server.
  - in this case NodeJS
  - this is also returned with the header

## returning JSON data
- we can send this as a single response right in `res.send()`
  - but we have to use `JSON.Stringify()` on the object we send
    - todos is a mock object we declared in a constant 
  - It's usefull to send the data down in an object with a success key for error handling
``` JS
res.end( 
    JSON.stringify({
      success: true,
      data: todos
    })
  );
```

## HTTP Status Codes
all codes: [link](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) 
important HTTP status codes
| - | - |
| :- | :- |
| 1.xx | Informational |
| 2.xx | Success |
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 3.xx | Redirection |
| 304 | Not Modified |
| 4.xx | Client Error |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 5.xx | Server Error |
| 500 | Internal Server Error |


