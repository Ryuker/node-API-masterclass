const http = require('http');

const todos = [
  { id: 1, text: 'Todo 1' },
  { id: 2, text: 'Todo 2' },
  { id: 3, text: 'Todo 3' },
]

const server = http.createServer((req, res) => {
  res.statusCode = 404;

  res.writeHead(404, {
    'Content-Type': 'application/json',
    'X-Powered-By': 'Node.js'
  });

  // Accessing request headers
  // console.log(req.headers.authorization);

  // Parsing the request body - JSON data is being received from the client
  let body = [];
  req.on('data', chunk => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();
    console.log(body);
  })

  res.end( 
    JSON.stringify({
      success: false,
      error: 'Not Found',
      data: null
    })
  );
});

const PORT = 5000;

// Run the server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
