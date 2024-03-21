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

- This is a typical `404` response to return
``` JS
{
  success: false,
  error: 'Not Found',
  data: null
}
```

- This is a cleaning way of setting the header
``` JS
res.writeHead(404, {
    'Content-Type': 'application/json',
    'X-Powered-By': 'Node.js'
  });
```

## Sending Data To The Server
- Usually when sending data to the server you'd send a `JSON web token` in the request header
- It's also good practise so send a `Content-Type`
- example of parsing the body on the server (with JSON data being sent from the client)
``` JS server.js
let body = [];

req.on('data', chunk => {
  body.push(chunk);
}).on('end', () => {
  body = Buffer.concat(body).toString();
  console.log(body);
})
```

## HTTP Methods & RESTful APIs
[All Methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)
| - | - |
| :- | :- |
| GET | Retrieve Resource |
| POST | Submit Resource |
| PUT / PATCH | Update Resource |
| DELETE | Delete/Destroy Resource |

**Resful API Standards**
| - | - |
| :- | :- |
| GET /todos | Get todos |
| GET /todos/1 | Get todo with ID of 1 |
| POST /todos | Add a todo |
| PUT /todos/1 | Update todo with ID of 1 |
| DELETE /todos/1 | Delete todo with ID of 1 |

## Handling a GET request with the HTTP module
- Below modifies the response when request uses the `/todos` route
  - status is set to `404` by default, this is modified when the request is of the correct route
``` JS server.js
const server = http.createServer((req, res) => {
  const { method, url } = req;
  
  // Parsing the request body - JSON data is being received from the client
  let body = [];

  req.on('data', chunk => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();

    let status = 404;

    const response = {
      succes: false,
      data: null
    };

    // Handling a GET request to /todos
    if (method === 'GET' && url === '/todos') {
      status = 200;
      response.succes = true;
      response.data = todos;
    }
    
    res.writeHead(status, {
      'Content-Type': 'application/json',
      'X-Powered-By': 'Node.js'
    });

    res.end( 
      JSON.stringify(response)
    );

    console.log(body);
  })

});
```

## Handling a POST request with the HTTP module
- this is fairly simple
  - we destructure the body after we JSON parse it, taking out the `id` and the `text`
  - we validate if neither of these items are null, else we send a `400` (bad request) with an error
  - if validation is passes we updates the todos array with a new object using the keys we destructured earlier
    - we then send a `201` (created) with response data set to the current todos array
``` JS server.js
 // Handling a POST request
if(method == 'POST' && url == '/todos') {
  const { id, text} = JSON.parse(body);
  
  // validation to make sure we have received all required object keys 
  if (!id || !text) {
    status = 400;
    response.error = `Please ensure there's an 'id' and 'text' in the request`;
  } else {// validation passed, updated the todos and modify the response and status
    todos.push( { id: id, text: text} );
    status = 201;
    response.succes = true;
    console.log(todos);
    response.data = todos;
  }
}
```

