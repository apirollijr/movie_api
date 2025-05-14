const http = require('http');
const fs = require('fs');
const url = require('url');

const port = 8080;

const server = http.createServer((request, response) => {
  const parsedUrl = url.parse(request.url, true);
  const path = parsedUrl.pathname.toLowerCase();

  const logEntry = `${new Date().toISOString()} - URL: ${request.url}\n`;
  fs.appendFile('log.txt', logEntry, (err) => {
    if (err) console.error('Error writing to log file.');
  });
  if (path === '/documentation') {

    fs.readFile('documentation.html', (err, data) => {
      if (err) {
        response.writeHead(500);
        response.end('Error loading documentation.html');
      } else {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(data);
      }
    });
  } else {
    fs.readFile('index.html', (err, data) => {
      if (err) {
        response.writeHead(500);
        response.end('Error loading index.html');
      } else {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(data);
      }
    });
  }
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
