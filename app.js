const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const session = require('express-session');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();
app.use(cors());
dotenv.config();

const {GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET} = process.env;

// Configuração do Passport
passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "https://git-node.vercel.app/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    console.log('accessToken:', accessToken);
    return done(null, profile);
  }
));

app.get('/', (req, res) => {
  res.send('Hello World');
})

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Configuração do Express
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Rotas de Login
app.get('/auth/github', (req, res, next) => {
    const login = passport.authenticate('github', { scope: ['user:email'] })(req, res, next);


    return {message: 'Login realizado com sucesso', response: login};

});
  
  app.get('/auth/github/callback', 

        passport.authenticate('github', { failureRedirect: '/' }),
    function(req, res) {
    
      res.redirect('/');
    });

// Inicie o servidor
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
