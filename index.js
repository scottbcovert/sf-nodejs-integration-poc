const express = require('express');
const session = require('express-session');
const base64url = require('base64-url');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const path = require('path');
const jsforce = require('jsforce');
const dotenv = require('dotenv').config();
const app = express();
const scope = 'api id refresh_token';
let oauth2;
let oauth2Creds = {
    clientId : process.env.CLIENT_ID,
    clientSecret : process.env.CLIENT_SECRET,
    redirectUri : process.env.REDIRECT_URL || 'http://localhost:5000/oauth2/callback'
}

let authenticateWithSalesforce = async function(req, res, returnTo, callback) {
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
        let sfCustomRestUrl = req.query.source + '/services/apexrest';
        sfCustomRestUrl += process.env.NAMESPACE
            ? '/' + process.env.NAMESPACE
            : '';
        sfCustomRestUrl += '/v1.0/oauth';
        const response = await fetch(sfCustomRestUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + req.session.accessToken
            },
            body: JSON.stringify({
                access_token: req.session.accessToken,
                domain: req.query.target,
                user_id: req.session.userInfo.id,
                instance_url: req.session.instanceUrl,
                organization_id: req.session.userInfo.organizationId,
                refresh_token: req.session.refreshToken,
                scope,
                url: req.session.userInfo.url
            })
        });
        const sfResponse = await response.json();
        if (sfResponse.error || sfResponse.errorCode) {
            return console.error(sfResponse.error || sfResponse.errorCode + ': ' + sfResponse.message);
        }
        // Clear out stateful req.session params to force authorization each time
        req.session.accessToken = null;
        req.session.refreshToken = null;
        req.session.instanceUrl = null;
        req.session.returnto = null;
        req.session.code_verifier = null;
        req.session.state = null;
        req.session.userInfo = null;
        callback();
    }
    else {
        req.session.returnto = returnTo;
        const code_verifier = base64url.encode(crypto.randomBytes(32));
        req.session.code_verifier = code_verifier;
        const code_challenge = base64url.encode(crypto.createHash('sha256').update(code_verifier).digest());
        const state = base64url.encode(crypto.randomBytes(32));
        req.session.state = state;
        const authUrl = oauth2.getAuthorizationUrl({ code_challenge, scope, state });
        res.set({ 'X-Redirect': authUrl });
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

app.get('/oauth2/callback', function(req, res) {
    const code = req.query.code;
    const state = req.query.state;
    if (state !== req.session.state) {
        return console.error('Invalid state parameter returned.');
    }
    const conn = new jsforce.Connection({ oauth2 : oauth2});
    const code_verifier = req.session.code_verifier;
    conn.authorize(code, {code_verifier}, function(err, userInfo) {
        if (err) { return console.error(err); }
        req.session.accessToken = conn.accessToken;
        req.session.refreshToken = conn.refreshToken;
        req.session.instanceUrl = conn.instanceUrl;
        req.session.userInfo = userInfo;
        res.redirect(req.session.returnto || '/');
    });
});

app.get('/tokens', (req, res) => {
    oauth2 = new jsforce.OAuth2({
        loginUrl : req.query.target,
        clientId : oauth2Creds.clientId,
        clientSecret : oauth2Creds.clientSecret,
        redirectUri : oauth2Creds.redirectUri
    });
    authenticateWithSalesforce(req, res, req.headers.referer, () => {
        res.send({
            authenticated: true,
            target: req.query.target
        });
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`Listening on ${port}`);