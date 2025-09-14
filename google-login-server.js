// Import the express library
const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const { getToken } = require('./jwt-creator');
const app = express();
const port = 3001;

// Middleware to parse JSON bodies
app.use(express.json());

// A simple GET route to test the server
app.get('/', (req, res) => {
  res.send('Welcome to the simple Express backend!');
});


// JWT verification middleware
const jwt = require('jsonwebtoken');
const jwtSecret = 'your_jwt_secret'; // Use the same secret as in jwt-creator.js

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, jwtSecret, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }
      req.user = user; // user contains the payload (userId, email)
      next();
    });
  } else {
    res.status(401).json({ error: 'Authorization header missing or malformed' });
  }
}

// Protected route example
app.get('/api/data', authenticateJWT, (req, res) => {
  res.json({
    message: 'Hello from the protected backend!',
    user: req.user,
    timestamp: new Date().toISOString(),
    data: [1, 2, 3]
  });
});

app.post('/auth/google', (req, res) => {
  const { token } = req.body;
  const client = new OAuth2Client('YOUR_GOOGLE_CLIENT_ID');

  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: 'YOUR_GOOGLE_CLIENT_ID',
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    const email = payload['email'];
    const jwtToken = getToken(userid, email);
    console.log('Generated JWT:', jwtToken);
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
    return { jwtToken, email }
  }
  verify()
    .then(({ jwtToken, email }) => {
      res.json({
        message: 'Google authentication successful!',
        jwtToken,
        email
      });
    })
    .catch(console.error);

  // Here you would verify the token with Google and return user info
  // For now, we'll just return a success message
  res.json({
    message: 'Google authentication successful!',
    token
  });
});

// Start the server and listen for requests
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
