const express = require('express');
const session = require('express-session');
const path = require('path');
const jsforce = require('jsforce');
const dotenv = require('dotenv').config();
const app = express();
let oauth2 = new jsforce.OAuth2({
    loginUrl : process.env.URL || 'https://login.salesforce.com',
    clientId : process.env.CLIENTID,
    clientSecret : process.env.CLIENTSECRET,
    redirectUri : process.env.REDIRECTURL || 'http://localhost:5000/oauth2/callback'
});
let authorizedOperation = function(req, res, returnTo, callback) {
    if (req.session.accessToken) {
        var conn = new jsforce.Connection({
            oauth2 : oauth2,
            accessToken : req.session.accessToken,
            refreshToken : req.session.refreshToken,
            instanceUrl : req.session.instanceUrl,
        });
        conn.on('refresh', function(accessToken, res){
            req.session.accessToken = accessToken;
        });
        callback(conn);
    }
    else {
        req.session.returnto = returnTo;
        res.set({ 'X-Redirect': oauth2.getAuthorizationUrl({ scope : 'full refresh_token offline_access' }) });
        res.sendStatus(200);
    }
}



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

app.get('/oauth2/callback', function(req, res) {
    let code = req.query.code;
    let conn = new jsforce.Connection({ oauth2 : oauth2});
    conn.authorize(code, function(err, userInfo) {
        if (err) { return console.error(err); }
        req.session.accessToken = conn.accessToken;
        req.session.refreshToken = conn.refreshToken;
        req.session.instanceUrl = conn.instanceUrl;
        res.redirect(req.session.returnto || '/');
    });
});

app.get('/cases', (req, res) => {
    authorizedOperation(req, res, req.headers.referer, function(conn) {
        conn.query('SELECT Id, CaseNumber FROM Case', function(err, result) {
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