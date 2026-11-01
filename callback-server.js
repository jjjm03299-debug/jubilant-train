const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 5900;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // Check if the request matches the /auth/callback path
  if (parsedUrl.pathname === '/auth/callback') {
    const queryParams = parsedUrl.query;
    const authCode = queryParams.code;
    const state = queryParams.state;
    const error = queryParams.error;

    if (error) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`<h2>Authorization Failed</h2><p>Error: ${error}</p>`);
      console.error(`Authorization error received: ${error}`);
      return;
    }

    if (authCode) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding-top: 50px;">
            <h2 style="color: #28a745;">Authorization Successful!</h2>
            <p>You can now close this browser tab and return to your terminal.</p>
          </body>
        </html>
      `);

      console.log('\n--- Authorization Received ---');
      console.log(`Authorization Code: ${authCode}`);
      if (state) console.log(`State: ${state}`);
      console.log('------------------------------\n');

      // Optional: Gracefully shut down server after successful capture
      setTimeout(() => {
        server.close(() => {
          console.log('Callback server shut down.');
          process.exit(0);
        });
      }, 1000);
    } else {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end('<h2>Bad Request</h2><p>No authorization code found in callback query parameters.</p>');
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h2>404 Not Found</h2><p>This server only listens on /auth/callback</p>');
  }
});

server.listen(PORT, () => {
  console.log(`OAuth callback server running at http://localhost:${PORT}/auth/callback`);
});
