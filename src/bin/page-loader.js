#!/usr/bin/env node

import program from 'commander';
import pageLoader from '..';

program
  .version('0.0.1')
  .arguments('<address>')
  .option('-o, --output [type]', 'Output path', process.cwd())
  .description('Downloads page to your local machine with provided path')
  .action(address => pageLoader(address, program.output));

program.parse(process.argv);
