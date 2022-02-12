const sanitizer = require('sanitizer');
const sanitizeHtml = require('sanitize-html');
const xss = require('xss');
const insane = require('insane');
const marked = require('marked');
const MarkdownIt = require('markdown-it');
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');
const AU = require('ansi_up');
const striptags = require('striptags');
const serializeJavascript = require('serialize-javascript');
const jsYaml = require('js-yaml');
const xml2js = require('xml2js')
const highlightJs = require('highlight.js');
const cheerio = require('cheerio');
const uglifyJs = require('uglify-js');
const htmlMinifier = require('html-minifier');
const handlebars = require('handlebars');
const { XMLParser, XMLBuilder, XMLValidator} = require('fast-xml-parser');
const nodeHtmlParser = require('node-html-parser');

const MD = new MarkdownIt();
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);
const ansi_up = new AU.default;

const Mutator = {
  /* markdown to html */
  'marked': (s) => {
    return marked.parse(s);
  },
  'markdown-it': (s) => {
    return MD.render(s);
  },
  /* sanitizers */
  'sanitizer': (s) => {
    return sanitizer.sanitize(s);
  },
  'insane': (s, options = {}) => {
    return insane(s, options);
  },
  'DOMPurify': (s) => {
    return DOMPurify.sanitize(s);
  },
  'sanitize-html': (s) => {
    return sanitizeHtml(s);
  },
  'xss': (s, options = {}) => {
    return xss(s, options);
  },
  'ansi_up': (s) => {
    return ansi_up.ansi_to_html(s);
  },
  'striptags': (s) => {
    return striptags(s, ['a']);
  },
  'serialize-javascript': (s) => {
    return serializeJavascript(s);
  },
  'js-yaml': (s) => {
    return jsYaml.load(s);
  },
  'xml2js': (s) => {
    return xml2js.parseString(s);
  },
  'highlight.js': (s) => {
    return highlightJs.highlightAuto(s).value;
  },
  'cheerio': (s) => {
    return cheerio.load(s).html();
  },
  'uglify-js': (s) => {
    const result = uglifyJs.minify(s);

    return result.code ?? '';
  },
  'html-minifier': (s) => {
    return htmlMinifier.minify(s, { 
      caseSensitive: false,
      collapseBooleanAttributes: true,
      collapseInlineTagWhitespace: true,
      collapseWhitespace: true,
      conservativeCollapse: true,
      continueOnParseError: true,
      keepClosingSlash: true,
      preserveLineBreaks: true,
      preventAttributesEscaping: true,
      processConditionalComments: true,
      removeAttributeQuotes: true,
      removeComments: false,
      removeEmptyAttributes: true
    });
  },
  'handlebars': (s) => {
    return handlebars.compile(s)();
  },
  'rehype-sanitize': async (s) => {
    const unified  = (await import('unified'));
    const rehypeParse = (await import('rehype-parse')).default;
    const rehypeSanitize = (await import('rehype-sanitize')).default;
    const rehypeHighlight = (await import('rehype-highlight')).default;
    const rehypeStringify = (await import('rehype-stringify')).default;

    const file = await (unified.unified())
      .use(rehypeParse, {fragment: true})
      .use(rehypeSanitize)
      //.use(rehypeHighlight, {subset: false})
      .use(rehypeStringify)
      .process(s)

    return String(file);
  },
  'fast-xml-parser': (s) => {
    const parser = new XMLParser();
    let jObj = parser.parse(s);

    const builder = new XMLBuilder();
    const xmlContent = builder.build(jObj);

    return xmlContent;
  },
  'node-html-parser': (s) => {
     return nodeHtmlParser.parse(s).outerHTML;
  }
};

module.exports = {
  Mutator
};
