import rollupPluginCommonjs from '@rollup/plugin-commonjs';
import rollupPluginResolve from '@rollup/plugin-node-resolve';
import rollupPluginReplace from '@rollup/plugin-replace';
import rollupPluginTerser from '@rollup/plugin-terser';
import { rollup } from 'rollup';

import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

// Set root be root folder of the Hubro module because
// we want to bundle up files in the Hubro module (not
// in the project using the Hubro module).
const root = join(import.meta.dirname, '../../');

export default async (logger, config) => {
  /** @type {import('rollup').RollupOptions} */
  const inputOptions = {
    input: ['@lit-labs/ssr-client/lit-element-hydrate-support.js'],
    plugins: [
      // @ts-expect-error
      rollupPluginResolve({
        preferBuiltins: true,
        rootDir: root,
        browser: true,
      }),
      // @ts-expect-error
      rollupPluginCommonjs({ include: /node_modules/ }),
      // @ts-expect-error
      rollupPluginReplace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        preventAssignment: true,
      }),
      // @ts-expect-error
      rollupPluginTerser({ format: { comments: false } }),
    ],
  };

  /** @type {import('rollup').OutputOptions[]} */
  const outputOptionsList = [
    {
      // preserveModules: true,
      // dir: join(config.dirBuild, 'lit'),
      file: fileURLToPath(new URL('./lit/hydration.js', config.dirJs)),
      format: 'es',
      sourcemap: true,
    },
  ];

  let bundle;
  bundle = await rollup(inputOptions);

  for (const outputOptions of outputOptionsList) {
    await bundle.write(outputOptions);
  }

  if (bundle) {
    await bundle.close();
  }
};
