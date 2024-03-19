const http = require('http');

const server = http.createServer((req, res) => {
  const {headers, url, method } = req;
  
  console.log(headers, url, method);
  
  // Ends the response so the request isn't hanging untill a response
  res.end();
});

const PORT = 5000;

// Run the server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
