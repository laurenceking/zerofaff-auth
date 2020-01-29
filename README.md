# zerofaff-auth
NodeJS JWT Authorization service with React frontend. User information is held in a mysql compatible database, with passwords encrypted. The service can be accessed through it's frontend react app or via a rest API.

---


## Configure
Configuration is held in `config/config.dev.js` and `config/config.prod.js`. These files are not commited into the repo. Copy `config/config.sample.js`, rename the copy for development or production and change the settings as necessary.

## Keys
Encryption keys should be stored in `server/keys/private.key` and `server/keys/public.key`.

---
## Npm commands
```javascript
npm install // standard installation

npm start // start development server so frontend is rebuilt when changed

npm run start:server //start server

npm run clean // delete the bundled js
npm run build // Remove the old bundles and Webpack bundle the frontend 
npm run build:run  // bundle the frontend and run the server 
npm run build:webpack  // webpack bundle the frontend

npm test // run jest watchAll

npm run prefLint // run prettier and eslint across front and backend

npm run lint // run eslint
npm run lint:app // run eslint on the frontend
npm run lint:server // run eslint on the backend

npm run prettier // run prettier on the frontend and backend
npm run prettier:app // run prettier on the frontend
npm run prettier:server // run prettier on the backend
```
---
## API Paths
All requests are `post` requests
```javascript
/activate // activate token
/activate/resend // resend activation email
/change/password // change password
/check/email // validate email & check already in the system
/check/token // validate token
/check/username // validate username & check already in the system
/login // validate login details, retrieve token
/recover // reset password
/recover/send // send recovery email
/signup // signup
```