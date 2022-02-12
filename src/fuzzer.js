const { Worker } = require('worker_threads');
const colors = require('colors/safe');

const {
  Tags,
  Attributes
} = require('../config');

class Fuzzer {
  workers = new Array();
  initialized = false;

  constructor(config) {
    if (!config.parser || !config.traverser || !config.sanitizers && !config.mutators || !config.generator) {
      throw new Error('insuffcient argument');
    }
    if (!config.size) {
      console.warn('The payload size are not specified!');
    }
    if (!config.num_of_workers) {
      console.warn('The number of workers are not specified!');
    }
    if (!['dom', 'text'].includes(config.generator.type)) {
      console.warn('Invalid generator type');
      process.exit(-1);
    }
    this.parser = config.parser;
    this.traverser = config.traverser;
    this.mutators = config.mutators;
    this.sanitizers = config.sanitizers;
    this.generator = config.generator;
    this.size = config.size ?? 32;
    this.num_of_workers = config.num_of_workers ?? 8;
  }

  run() {
    if (this.initialized) {
      throw new Error('already running');
    }
    this.initialized = true;

    for (let i = 0; i < this.num_of_workers; ++i) {
      const worker = new Worker('./src/worker');
      worker.index = i;
      worker.iterations = 0;

      worker.postMessage({
        type: 'intialize',
        config: {
          parser: this.parser,
          traverser: this.traverser,
          mutators: this.mutators,
          generator: this.generator,
          size: this.size,
          num_of_workers: this.num_of_workers
        }
      });

      worker.on('message', (e) => {
        if (e.type === 'pong') {
          if (e.iterations <= 0 || e.iterations < worker.iterations) {
            throw new Error('unreachable');
          }
          worker.iterations = e.iterations;
          worker.lastPong = Date.now();
        } else if (e.type === 'error') {
          console.error(e);
        } else if (e.type === 'finding') {
          if (e.data.raw_input.indexOf('<iframe') != -1) {
            return;
          }
          console.log(e.data);
        } else {
          throw new Error('unreachable');
        }
      });

      this.workers.push(worker);
    }
    const loadingIcon = ['|', '/', '-', '\\'];
    let count = 0;
    const begin = Date.now();

    setInterval(() => {
      let sum = 0;
      ++count;

      for (let worker of this.workers) {
        sum += worker.iterations;
      }

      const elapsed = Date.now() - begin;

      process.stdout.write(`\r[${loadingIcon[count % 4]}] ${sum / 1000}k (${parseInt(sum / elapsed * 1000)}/s)`);
    }, 150);
  }
}

module.exports = {
  Fuzzer
};

