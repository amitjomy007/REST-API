const express = require('express');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const jwt = require('jsonwebtoken');
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;


const app = express();
const PORT = 3000;

app.use(cookieParser());

//this file has
    //route /
    //button to go to /auth/google
    //initialization of server

const authRoutes = require('./auth/oauth');

app.use('/auth',authRoutes);

app.get('/profile', (req,res) => {
    const token = req.cookies.token;

    if(!token) {
        return res.status(401).send('Unauthrized NO TOKEN providEd');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.send(`
            <h1>Welcome, ${decoded.name}</h1>
            <img src="${decoded.picture}" alt="Profile Picture" width="100"/>
            <p>Email: ${decoded.email}</p>
            <a href="/logout">Logout</a>
        `);
    } catch(err) {
        console.log(err.message);
        console.log(JWT_SECRET);
        
        return res.status(401).send('Unauthorized : Invalid token');
    }
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