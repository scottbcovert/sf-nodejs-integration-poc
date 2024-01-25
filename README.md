# Salesforce & NodeJS Integration Proof of Concept

This serves as a PoC to demonstrate how a NodeJS app can be setup to integrate with the Salesforce REST API

This app specifically acts as a mirror with Salesforce's OAuth2 web server flow by forwarding refresh/access tokens retrieved by the flow back to a custom Apex REST endpoint.

## Getting Started

1. Clone repo (along with submodule) by running `git clone --recursive https://github.com/scottbcovert/sf-nodejs-integration-poc`
2. Run `npm install`
3. [Create a connected app](https://help.salesforce.com/articleView?id=connected_app_create.htm&type=5) in your Salesforce org
4. Set the OAuth scope for your connected app to include `api`, `id`, & `refresh_token`
5. Set your Callback URL to be `http://localhost:5000/oauth2/callback`
6. Copy the contents of the `.env.sample` file into a local `.env` file, replacing the `CLIENT_ID` & `CLIENT_SECRET` values with your connected app's consumer key and secret
7. If your Apex RestResource class is namespace-prefixed then set the `NAMESPACE` value in the `.env` file
8. Run `npm start` from the root directory to start up the server
9. In a new terminal window run `cd client && npm install && npm run build && npm start` from the root directory to start up the client
10. The app should start running in `localhost:3000`
11. Test the app using the source and target URL params e.g. `http://localhost:3000?source=https%3A%2F%2Fyour-scratch-org-domain-dev-ed.scratch.my.salesforce.com&target=https%3A%2F%2Fyour-scratch-org-domain-dev-ed.scratch.my.salesforce.com`

## Deployment

1. [Setup an account on Render](https://render.com/)
2. Choose `New > Web Service` from the dashboard
3. Select `Build and deploy from a Git repository`
4. Connect to your fork of this repository
5. Set your runtime to `Node`
6. Set your build command to `npm install && npm run heroku-postbuild`
7. Set your start command to `npm start`
8. Set the `CLIENT_ID` & `CLIENT_SECRET` (& `NAMESPACE` if the Apex RestResource class is namespace-prefixed) environment variables
9. Click `Create Web Service`
10. Update your Salesforce connected app's Callback URL list to include `https://your-render-instance.onrender.com/oauth2/callback`
11. Add a new environment variable `REDIRECT_URL` set to `https://your-render-instance.onrender.com/oauth2/callback`

## Built With

* [React](https://github.com/facebook/create-react-app#readme) - Client
* [Express](https://expressjs.com/) - Server
* [JSForce](https://jsforce.github.io/) - Javascript library for interacting with Salesforce APIs

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details