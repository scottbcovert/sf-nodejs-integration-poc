# Salesforce & NodeJS Integration Proof of Concept

This serves as a PoC to demonstrate how a NodeJS app can be setup to integrate with the Salesforce REST API

## Getting Started

1. Clone repo (along with submodule) by running `git clone --recursive https://github.com/scottbcovert/sf-nodejs-integration-poc`
2. Run `npm install`
3. [Create a connected app](https://help.salesforce.com/articleView?id=connected_app_create.htm&type=5) in your Salesforce org
4. Set the OAuth scope for your connected app to include `full`, `refresh_token`, & `offline_access`
5. Set your Callback URL to be `http://localhost:5000/oauth2/callback`
6. Copy the contents of the `.env.sample` file into a local `.env` file, replacing the `CLIENTID` & `CLIENTSECRET` values with your connected app's consumer key and secret
7. To integrate with a Salesforce sandbox change the `URL` value to `https://test.salesforce.com`
8. Run `npm start` from the root directory to start up the server
9. In a new terminal window run `cd client && npm install && npm run build && npm start` from the root directory to start up the client
10. The app should start running in `localhost:3000`

## Deployment

1. [Setup Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Run `heroku create`
3. Run `git push heroku master`
4. Run `heroku config:set CLIENTID=*YOUR_CONSUMER_KEY* CLIENTSECRET=*YOUR_CONSUMER_SECRET* REDIRECTURL=https://*your-heroku-instance*.herokuapp.com/oauth2/callback SECRET=*YOUR_COOKIE_SECRET*`
5. Update your Salesforce connected app's Callback URL list to include `https://your-heroku-instance.herokuapp.com/oauth2/callback`
6. To integrate with a Salesforce sandbox run `heroku config:set URL=htps://test.salesforce.com`

## Built With

* [React]() - Client
* [Express]() - Server
* [JSForce](https://jsforce.github.io/) - Javascript library for interacting with Salesforce APIs

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details