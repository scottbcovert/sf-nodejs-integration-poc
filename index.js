const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const jsforce = require('jsforce');
const dotenv = require('dotenv').config();
const {getToken} = require('sf-jwt-token');
const req = require('express/lib/request');

const app = express();

let getAccessToken = async function(callback) {
    try {
        let jwt = await getToken({
            iss: process.env.CLIENT_ID,
            sub: process.env.USERNAME,
            aud: process.env.LOGIN_URL || 'https://login.salesforce.com',
            privateKey: process.env.PRIVATE_KEY
        });
        callback(null, jwt);
    } catch(err) {
        console.error(err);
        callback(err);
    }
}

let refreshFn = function(conn, callback) {
    getAccessToken(function(err, res) {
        if (err) { return callback(err); }
        conn.initialize({
          accessToken : res.access_token,
          instanceUrl : res.instance_url
        });
        callback(null, res.access_token, res);
    });
}

let authorizedOperation = async function(req, res, returnTo, callback) {
    if (req.session.accessToken) {
        var conn = new jsforce.Connection({
            accessToken : req.session.accessToken,
            instanceUrl : req.session.instanceUrl,
            refreshFn   : refreshFn
        });
        conn.on('refresh', function(accessToken, res){
            req.session.accessToken = accessToken;
        });
        callback(conn);
    }
    else {
        await getAccessToken(function(err, res) {
            if (!err) {
                req.session.accessToken = res.access_token;
                req.session.instanceUrl = res.instance_url;
            }
        });
        res.set({ 'X-Redirect': returnTo });
        res.sendStatus(200);
    }
}

app.use(bodyParser.json())

app.use(session({
    secret: process.env.SECRET || 'secretsarenofun',
    name: 'cookie4sfdc',
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 6000000
    }
}));

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/users', (req, res) => {
    authorizedOperation(req, res, req.headers.referer, function(conn) {
        conn.query('SELECT Id, FirstName, LastName, Email, Profile.Name FROM User', function(err, result) {
            if (err) { return console.error(err); }
            res.send(result.records);
        });
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`Listening on ${port}`);