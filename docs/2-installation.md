# Installation

These are the steps needed to get you going:

## System Requirements:

Node.js 22.0 or later.
macOS, Windows, and Linux are supported.

## Automatic Installation

TODO: Have a pre setup github template repo
TODO: Create a @hubro/create tool to scaffold new apps

## Manual Installation

If you're just starting out, create a new directory with a `package.json`.
To make a `package.json` in the current directory, run:

```sh
npm init -y
```

Hubro projects must be written using ES modules.
Since `commonjs` is the default, add `"type": "module"` to `package.json`.

Install Hubro and Lit as dependencies to your project.

```sh
npm install hubro lit
```

Then add the following commands to the `scripts` field in the package.json in your project:

```json
{
  "build": "hubro build",
  "start": "hubro start",
  "dev": "hubro dev"
}
```

## Advanced

Hubro differs between running in development mode and production mode.
In development mode a set of additional tools are used to handle dynamic bundling and improve DX.
In production mode all frontend assets are expected to have been bundled and served as static assets.
This means that in development mode we require several dependencies (such as Rollup etc) which we do not need in production.

When installing dependencies in a Hubro app for a production environment we can omit the dependencies used by Hubro in development.
This will yield a smaller dependency tree when running in production.
You do so by adding the `--omit=optional` option when installing the dependencies for your Hubro app:

```sh
npm install --omit=optional
```
