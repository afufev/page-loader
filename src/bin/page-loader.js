#!/usr/bin/env node

import program from 'commander';
import pageLoader from '..';
import { version } from '../../package.json';

program
  .version(version, '-v, --version')
  .arguments('<address>')
  .option('-o, --output [path]', 'Output path', process.cwd())
  .description('Downloads page to your local machine with provided path')
  .action(address => pageLoader(address, program.output));
// .catch((e) => {
//   console.error(getLoaderError(e));
//   process.exit(1);
// }));

program.parse(process.argv);
