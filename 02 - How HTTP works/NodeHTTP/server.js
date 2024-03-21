const http = require('http');

const todos = [
  { id: 1, text: 'Todo 1' },
  { id: 2, text: 'Todo 2' },
  { id: 3, text: 'Todo 3' },
]

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
      data: null,
      error: null
    };

    // Handling a GET request to /todos
    if (method === 'GET' && url === '/todos') {
      status = 200;
      response.succes = true;
      response.data = todos;
    } 
    // Handling a POST request
    else if(method == 'POST' && url == '/todos') {
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

const PORT = 5000;

// Run the server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
