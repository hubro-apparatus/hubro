import fs from 'node:fs';
import path from 'node:path';

// Prepend the generated types/main.d.ts with the types that get decorated on
// the Hubro Fastify server.

let hubro = path.join(process.cwd(), 'types', 'hubro.d.ts');
let module = path.join(process.cwd(), 'types', 'main.d.ts');

fs.writeFileSync(
  module,
  `${fs.readFileSync(hubro, 'utf-8')}
${fs.readFileSync(module, 'utf-8')}`,
  'utf-8',
);
