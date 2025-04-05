const express = require('express');
const router = express.Router();
const querystring = require('querystring');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/auth/google/callback';

router.get('/google/callback', async(req,res) => {
    const code = req.query.code;
    if(!code) {
        return res.status(400).send('No code found in query params');
    }

    try {
        const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
            code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code'

        }, {
            headers: {
                'Content-Type' : 'application/json'
            }
        });

        const {access_token, id_token} = tokenRes.data;

        const userRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                Authorization : `Bearer ${access_token}`
            }
        });

        const user = userRes.data;
        console.log('User Info:', user);

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name:user.name,
                picture: user.picture
            }, JWT_SECRET , { expiresIn : '1h'}
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            maxAge: 3600000
        });
        console.log(CLIENT_ID); //debug
        res.redirect('/profile');

        // res.send(`<h2>Hello, ${user.name}!</h2><pre>${JSON.stringify(user, null, 2)}</pre>`);
    } catch(err) {
        console.error('Error exchanging code for tokn:', err.response?.data || err.message);
        res.status(500).send('Failed to log in with Google');
    }
    }
);



router.get('/google', (req,res)=> {
    const scope = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
    ].join(' ');

    const params = querystring.stringify({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        scope,
        access_type: 'offline',
        prompt: 'consent' 
    });
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    res.redirect(authUrl);
});

module.exports = router;

