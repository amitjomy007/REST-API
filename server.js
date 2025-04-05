const express = require('express');
const passport = require('passport');
const session = require('express-session');
require('./auth/passport');
require('dotenv').config();

const app = express();

app.use(session( {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/google',
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })
  );

   
app.get('/auth/google/callback', 
    passport.authenticate('google', {failureRedirect: '/login'}), 
    (req,res)=> {
        res.send('you are logged in as ' + req.user.displayName);
    }
);

app.get('/profile', (req,res)=> {
    if(!req.user) return res.send('Not logged in');
    res.send(`Welcome ${req.user.displayName}`);
});

app.listen(3000, ()=> console.log('server running 3000'));