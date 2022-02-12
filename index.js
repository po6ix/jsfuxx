#!/usr/bin/env node
const { cpus } = require('os');
const { Fuzzer } =  require('./src/fuzzer.js');
const { Tags, Attributes, Chars } = require('./config.js');

const fuzzer = new Fuzzer({
  parser: 'node-html-parser',
  traverser: 'list',
  mutators: [
    'marked',
    'sanitize-html'
  ],
  generator: {
    type: 'dom',
    tags: Tags.FULL,
    attributes: Attributes.FULL,
    chars: Chars.PICO
  },
  size: 32,
  num_of_workers: cpus().length
});

fuzzer.run();
