const nodeHtmlParser = require('node-html-parser');
const { JSDOM } = require('jsdom');
const parse5 = require('parse5');
const htmlparser2 = require('htmlparser2');

const Parser = {
  'node-html-parser': (s) => {
    return nodeHtmlParser.parse(s);
  },
  'jsdom': (s) => {
    return new JSDOM(s).window.document; // this leaks memory :(
  },
  'parse5': (s) => {
    return parse5.parse(s);
  },
  'htmlparser2': (s) => {
    return htmlparser2.parseDocument(s);
  }
};

module.exports = {
  Parser
};
