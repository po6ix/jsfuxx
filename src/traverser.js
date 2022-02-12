const sanitizer = require('sanitizer');
const marked = require('marked');
const sanitizeHtml = require('sanitize-html');
const xss = require('xss');
const markdownIt = require('markdown-it');

const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const Traverser = {
  'list': (dom, callback) => {
    const elements = dom.getElementsByTagName('*');

    for (let element of elements) {
      const tagname = element.tagName;
      const attrs = element.attributes || element.attrs;

      callback(tagname, Object.keys(attrs));
    }
  },
  'tree': (dom, callback, port /* debug purpose */) => {
    let tagName = 'P';
    let attrs = [];
    let children = [];

    if (dom.tagName) {
      tagName = dom.tagName.toUpperCase();
    } else if (dom.name) {
      tagName = dom.name;
    }

    if (dom.attrs) {
      attrs = dom.attrs.map(attr => attr.name);
    } else if (dom.attribs) {
      attrs = Object.keys(dom.attribs)
    }

    if (dom.childNodes) {
      children = dom.childNodes;
    } else if (dom.children) {
      children = dom.children
    };

    for (let child of children) {
      Traverser['tree'](child, callback);
    }

    callback(tagName, attrs);
  }
};

module.exports = {
  Traverser
};
