#!/usr/bin/env node

import program from 'commander';
import pageLoader from '..';

program
  .version('0.1.2', '-v, --version')
  .arguments('<address>')
  .option('-o, --output [path]', 'Output path', process.cwd())
  .description('Downloads page to your local machine with provided path')
  .action(address => pageLoader(address, program.output));

program.parse(process.argv);
