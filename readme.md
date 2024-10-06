# Climbing Card Checker

Web portal to check for climbing card certification and payment management for climbing examination.

## Requirements

* Node >= v20.x
* Postgres database

## Database

* Deploy `db/schema.sql` to Postgres instance

## Running

Create `.env` from `.env.example` and update variables with correct values.

Once your environment is set up you can run it locally or deploy to Vercel. There's abundance of documentation online for latter. Following has some simplifying steps specific to this app.

### Local environment

* Start local postgres database and update `.env` with correct connection values. If not `PG*` vars are not provided, default values will be used.
  Check `_db.js` for connection methods.
* Start application with `npm start`.

### Deploying to Vercel

* Add the environment vars to Vercel via the UI.
* Make use Postgres environment variables are correct and accessible via Internet.
* Deploy the app with `npx vercel`
