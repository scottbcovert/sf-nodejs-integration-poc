# Salesforce & NodeJS Integration Proof of Concept

This serves as a PoC to demonstrate how a NodeJS app can be setup to integrate with the Salesforce REST API via the [OAuth2 JWT flow](https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_jwt_flow.htm&type=5)

## Getting Started

1. Clone repo (along with submodule) by running `git clone --recursive https://github.com/scottbcovert/sf-nodejs-integration-poc`
2. Run `npm install`
3. [Create a connected app](https://help.salesforce.com/articleView?id=connected_app_create.htm&type=5) in your Salesforce org
4. Select `Enable OAuth Settings` and set the OAuth scope for your connected app to include `full`, `refresh_token`, & `offline_access`
5. The callback URL is not used during the OAuth2 JWT flow, but it's required so you can just set it to `http://localhost:8080/callback`
6. [Create a private key and self-signed digital certificate](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_auth_key_and_cert.htm) - take note that this guide creates a cert that will expire in one year, you may wish to change the `-days` parameter for a longer or shorter lived certificate
7. On your connected app settings, select `Use digital signatures` and then upload the `server.crt` file created previously
8. Copy the contents of the `.env.sample` file into a local `.env` file, replacing the `CLIENT_ID` value with your connected app's consumer key
9. To integrate with a Salesforce sandbox change the `LOGIN_URL` value to `https://test.salesforce.com`
10. Set `USERNAME` to that of the user you want to authenticate as. This user will need to first run through the OAuth2 web flow a *single* time by visiting LOGIN_URL/services/oauth2/authorize?response_type=token&client_id=CLIENT_ID&redirect_uri=LOGIN_URL/services/oauth2/success - note you'll need to replace `LOGIN_URL` and `CLIENT_ID` in that URL
11. Set `PRIVATE_KEY` to that of the private key matching the self-generated SSL cert associated with your connnected app. Note you will need to wrap the key in `"` and use `\n` characters as opposed to literal line breaks similar to the example in `.env.sample`
12. Run `npm start` from the root directory to start up the server
13. In a new terminal window run `cd client && npm install && npm run build && npm start` from the root directory to start up the client
14. The app should start running in `localhost:3000`

## Deployment

1. [Setup Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Run `heroku create`
3. Run `git push heroku master`
4. Run `heroku config:set CLIENT_ID=*YOUR_CONSUMER_KEY* USERNAME=*YOUR_DESIRED_USERNAME* PRIVATE_KEY=*YOUR_PRIVATE_KEY*` Keep in mind that the user will need to first run through the OAuth2 web flow a *single* time by visiting LOGIN_URL/services/oauth2/authorize?response_type=token&client_id=CLIENT_ID&redirect_uri=LOGIN_URL/services/oauth2/success - note you'll need to replace `LOGIN_URL` and `CLIENT_ID` in that URL
5. To integrate with a Salesforce sandbox run `heroku config:set LOGIN_URL=htps://test.salesforce.com`

## Resources

* [Guided walkthrough](https://www.youtube.com/watch?v=c5OZZsVkOKY)

## Built With

* [React](https://github.com/facebook/create-react-app#readme) - Client
* [Express](https://expressjs.com/) - Server
* [JSForce](https://jsforce.github.io/) - Javascript library for interacting with Salesforce APIs

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details