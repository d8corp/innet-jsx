'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var MagicString = require('magic-string');
var acorn = require('acorn');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var MagicString__default = /*#__PURE__*/_interopDefaultLegacy(MagicString);

var extend = require('acorn-jsx-walk').extend;
var _a = require('acorn-walk'), base = _a.base, simple = _a.simple;
var jsxParser = require('acorn-jsx');
var JSXParser = acorn.Parser.extend(jsxParser());
extend(base);
function parse(code) {
    return JSXParser.parse(code, { ecmaVersion: 'latest' });
}
function transform(code, filePath, parser) {
    if (filePath === void 0) { filePath = 'inline'; }
    if (parser === void 0) { parser = parse; }
    if (filePath === 'inline' || filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
        var ast = void 0;
        try {
            ast = parser(code);
        }
        catch (err) {
            err.message += " in " + filePath;
            throw err;
        }
        var magicString_1 = new MagicString__default['default'](code);
        simple(ast, {
            JSXNamespacedName: function (_a) {
                var start = _a.start;
                throw Error("innet does not support JSXNamespacedName " + filePath + ":" + start);
            },
            JSXText: function (_a) {
                var start = _a.start, end = _a.end, raw = _a.raw;
                var value = raw.trim();
                if (value) {
                    var spaceStart = raw.length - raw.trimLeft().length;
                    var spaceEnd = raw.length - value.length - spaceStart;
                    var targetValue = value.replace(/('|\\)/g, "\\$1").replace(/\n(\s*)/g, "'+\n$1'");
                    magicString_1.overwrite(start + spaceStart, end - spaceEnd, "'" + targetValue + "'");
                }
            },
            JSXExpressionContainer: function (_a) {
                var start = _a.start, end = _a.end;
                magicString_1.remove(start, start + 1);
                magicString_1.remove(end - 1, end);
            },
            JSXFragment: function (_a) {
                var children = _a.children;
                var started = false;
                for (var i = 1; i < children.length; i++) {
                    var _b = children[i], type = _b.type, start = _b.start, raw = _b.raw;
                    if (type !== 'JSXText' || raw.trim()) {
                        if (started) {
                            magicString_1.appendLeft(start, ',');
                        }
                        else {
                            started = true;
                        }
                    }
                }
            },
            JSXOpeningFragment: function (_a) {
                var start = _a.start, end = _a.end;
                magicString_1.overwrite(start, end, '[');
            },
            JSXClosingFragment: function (_a) {
                var start = _a.start, end = _a.end;
                magicString_1.overwrite(start, end, ']');
            },
            JSXElement: function (_a) {
                var children = _a.children, openingElement = _a.openingElement;
                var childrenStarted = false;
                for (var i = 0; i < children.length; i++) {
                    var _b = children[i], type = _b.type, start = _b.start, end = _b.end, raw = _b.raw;
                    if (i + 1 === children.length) ;
                    if (type !== 'JSXText' || raw.trim()) {
                        if (!childrenStarted) {
                            magicString_1.appendLeft(openingElement.end, ', children: [');
                            childrenStarted = true;
                        }
                        else {
                            magicString_1.appendLeft(start, ',');
                        }
                    }
                    if (childrenStarted && i + 1 === children.length) {
                        magicString_1.appendRight(end, ']');
                    }
                }
            },
            JSXOpeningElement: function (_a) {
                var start = _a.start, end = _a.end, name = _a.name, selfClosing = _a.selfClosing, attributes = _a.attributes;
                var fullName = name.type === 'JSXMemberExpression'
                    ? name.object.name + "." + name.property.name
                    : name.name || '';
                var stringSym = /[a-z]/.test(fullName[0]) ? "'" : '';
                magicString_1.overwrite(start, start + 1, '{type: ');
                if (stringSym) {
                    magicString_1.appendLeft(name.start, stringSym);
                    magicString_1.appendLeft(name.end, stringSym);
                }
                if (attributes) {
                    for (var i = 0; i < attributes.length; i++) {
                        var attribute = attributes[i];
                        if (!i) {
                            if (!code.slice(name.end, attribute.start).includes('\n')) {
                                magicString_1.remove(attribute.start - 1, attribute.start);
                            }
                            magicString_1.appendLeft(name.end, ', props: {');
                        }
                        else {
                            magicString_1.appendLeft(attribute.start - 1, ',');
                        }
                        if (i + 1 === attributes.length) {
                            magicString_1.appendLeft(attribute.end, '}');
                        }
                    }
                }
                if (selfClosing) {
                    magicString_1.overwrite(end - 2, end, "}");
                }
                else {
                    magicString_1.remove(end - 1, end);
                }
            },
            JSXClosingElement: function (_a) {
                var start = _a.start, end = _a.end;
                magicString_1.overwrite(start, end, "}");
            },
            JSXAttribute: function (_a) {
                var name = _a.name, value = _a.value;
                if (value) {
                    magicString_1.overwrite(name.end, value.start, ": ");
                    if (value.type === 'Literal') {
                        magicString_1.overwrite(value.start + 1, value.end - 1, value.value.replace(/\\/g, '\\\\'));
                    }
                }
                else {
                    magicString_1.appendLeft(name.end, ': true');
                }
            },
            JSXSpreadAttribute: function (_a) {
                var start = _a.start, end = _a.end;
                magicString_1.remove(start, start + 1);
                magicString_1.remove(end - 1, end);
            },
        });
        return {
            code: magicString_1.toString(),
            map: magicString_1.generateMap()
        };
    }
}

exports.JSXParser = JSXParser;
exports.default = transform;
exports.parse = parse;
exports.transform = transform;
