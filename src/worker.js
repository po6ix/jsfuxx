const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

const { Parser } = require('./parser');
const { Mutator } = require('./mutator');
const { Traverser } = require('./traverser');
const { InputGenerator, DOMGenerator } = require('./generator');

const { Tags, Attributes, Chars } = require('../config');

if (isMainThread || !parentPort) {
  throw new Error('unreachable');
}

const report = (info) => {
  parentPort.postMessage({ type: 'finding', data: info});
};

let iterations = 0;

parentPort.on('message', async ({type, config}) => {
  if (type === 'intialize') {
    const parser = Parser[config.parser],
          traverser = Traverser[config.traverser];
          mutators = [].concat(config.mutators.map(name => Mutator[name])),
          generator = config.generator.type === 'dom' ?
              new DOMGenerator(config.generator) :
              new InputGenerator(config.generator),
          size = config.size;

    if (!Array.isArray(mutators) || mutators.length == 0) {
      console.warn('[!] mutators not specified!'.red);
    }

    for (;;) {
      const raw_input = generator.generate(size);

      let html = raw_input;
      let check = true;

      for (let mutator of mutators) {
        try {
          html = await mutator(html);
        } catch(e) {
          check = false;
          parentPort.postMessage({ type: 'error', message: e, data: html });
        }
      }

      if (!html || !check) {
        continue;
      }

      ++iterations;

      if ((iterations & 0x3f) == 0) { // in every 64
        parentPort.postMessage({ type: 'pong', iterations });
      }

      const dom = parser(html);

      traverser(dom, (tagName, attrNames) => {
        if (!Tags.SAFE.includes(tagName)) {
          report({
            raw_input,
            html,
            message: `unexpected tag name: ${tagName}`
          });
        }

        for (let attrName of attrNames) {
          if (!Attributes.SAFE.includes(attrName)) {
            report({
              raw_input,
              html,
              message: `unexpected attrib name: ${attrName} in the ${tagName} tag`
            });
          }
        }
      }, parentPort);
    }
  } else {
    parentPort.postMessage({ type: 'error', message: 'unreachable' });
  }
});
