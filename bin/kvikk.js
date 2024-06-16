#!/usr/bin/env node

import { Command } from 'commander';
import path from 'node:path';
import fs from 'node:fs';

import ServerDevelopment from '../lib/server/server-dev.js';
import ServerProduction from '../lib/server/server-prod.js';
import Config from '../lib/common/config.js';
import build from '../lib/build/build.js';

// @ts-ignore
const pkgJson = fs.readFileSync(path.join(import.meta.dirname, '../package.json'), 'utf-8');
const pkg = JSON.parse(pkgJson);

const program = new Command();

program.name('Kvikk.js').description('Kvikk.js application').version(pkg.version);

program
  .command('start')
  .description('Starts a Kvikk.js application in production mode')
  .option('-p, --path <path>', 'Path to the root of the application')
  .action(async function () {
    const config = new Config({
      development: false,
      cwd: this.opts().path,
    });
    await config.load();

    const server = new ServerProduction(config);
    await server.start();
  });

program
  .command('dev')
  .description('Starts a Kvikk.js application in development mode')
  .option('-p, --path <path>', 'Path to the root of the application')
  .action(async function () {
    const config = new Config({
      development: true,
      cwd: this.opts().path,
    });
    await config.load();

    const server = new ServerDevelopment(config);
    await server.start();
  });

program
  .command('build')
  .description('Build and prepare a Kvikk.js application for production')
  .action(async function () {
    const config = new Config({
      development: false,
      cwd: this.opts().path,
    });
    await config.load();

    await build(config);
  });

program.parse(process.argv);
