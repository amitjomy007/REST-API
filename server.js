const express = require('express');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/authMiddleware');
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const rateLimiter = require('./middleware/rateLimiter');


const app = express();
const PORT = 3000;

app.use(cookieParser());

//this file has
    //route /
    //button to go to /auth/google
    //initialization of server

const authRoutes = require('./auth/oauth');

app.use('/auth',authRoutes);
app.use('/profile',rateLimiter);

//below authMiddleware will set req.user if user exists or else won't allow this route
app.get('/profile', authMiddleware, (req,res) => {
    res.send( `   
            <h1>Welcome, ${req.user.name}</h1>
            <img src="${req.user.picture}" alt="Profile Picture" width="100"/>
            <p>Email: ${req.user.email}</p>
            <a href="/logout">Logout</a>
        `);
});

app.get('/logout', (req,res)=> {
    res.clearCookie('token');
    res.send('<h2>You have been logged out by clearCookie() </h2><a href="/">Login again</a>')
})

app.get('/', (req,res) => {
    res.send('<a href="/auth/google">Login with Google</a>');
});

app.listen(PORT, () => {
    console.log("Started running dw");
});