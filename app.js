import express from 'express';
import axios from 'axios';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({ origin: 'https://vue-node-git.vercel.app', credentials: true }));

app.use(session({
  secret: 'YOUR_SECRET_KEY',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true , httpOnly: false } // Secure should be true in production with HTTPS
}));

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URL;

app.get('/auth/github', (req, res) => {
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_url=${REDIRECT_URL}&scope=user`;
  res.redirect(redirectUrl);
});

app.get('/auth/github/callback', async (req, res) => {
  const code = req.query.code;
  const tokenResponse = await axios.post(
    'https://github.com/login/oauth/access_token',
    {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: code,
      redirect_url: REDIRECT_URL,
    },
    { headers: { accept: 'application/json' } }
  );
  const accessToken = tokenResponse.data.access_token;

  const userResponse = await axios.get('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  // Save user data in session
  req.session.user = userResponse.data;
  res.redirect('https://vue-node-git.vercel.app/'); // Redirect back to the frontend
});

app.get('/api/user', (req, res) => {
  console.log("passo aqui tio")
  console.log(req.session);
  console.log(req.session.user);
  try {
    if (req.session.user) {
      res.json({ user: req.session.user });
    } else {
      res.status(401).json({ error: 'User not authenticated', data: req.session });
    }
  } catch (error) {
    console.log(error);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});