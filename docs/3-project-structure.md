# Project Structure

Hubro is designed to use convention over configuration.
It uses file-based routing for both web pages and APIs.

A minimal Hubro app directory looks like this.

- `package.json`
- `pages/`
  - `page.js`

If a Hubro app is created by the Hubro Launch tool the required project structure is created for you.

If you set up your Hubro app manually you must adhere to the same structure.

## Top-level Files

The top level is the root of the application and is used to configure the application, manage dependencies and define environment variables.

The following files are what we call top-level files:

 - `package.json` - **Required** - Node.js configuration file holding project dependencies and scripts
 - `hubro.config.js` - Optional - Configuration file for Hubro
 - `.env` - Optional - Environment variables
 - `.env.local` - Optional - Local environment variables
 - `.env.production` - Optional - Production environment variables
 - `.env.development` - Optional - Development environment variables
 - `tsconfig.json` - Optional - Configuration file for TypeScript

The root of the application can contain other files than these top-level files. Hubro only care about the files listed here.

## Top-level Folders

Top-level folders are used to organize the application code.

 - `/pages` - **Required** - Page router where the folder structure and what files they contain defines the HTTP routes.
 - `/system` - Optional - Hold application specific system wide templates and pages such as http error pages etc.
 - `/layouts` - Optional - Holds application specific page layouts.
 - `/components` - Optional - Hold application specific components.
 - `/public` - Optional - Holds static assets.
 - `/adapters` - Optional - Holds adapter classes used for connecting to databases etc.
 - `/build` - Auto created - Where production ready assets will be placed by the build process.


The root of the application can contain other folders than these top-level folders. Hubro only cares about the folders listed here.
