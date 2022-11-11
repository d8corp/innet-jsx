'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var MagicString = require('magic-string');
var acorn = require('acorn');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var MagicString__default = /*#__PURE__*/_interopDefaultLegacy(MagicString);

var extend = require('acorn-jsx-walk').extend;
var _a = require('acorn-walk'), base = _a.base, simple = _a.simple;
var jsxParser = require('acorn-jsx');
var merge = require('merge-source-map');
var JSXParser = acorn.Parser.extend(jsxParser());
extend(base);
function parse(code, options) {
    return JSXParser.parse(code, Object.assign({ ecmaVersion: 'latest' }, options));
}
var BASE64_SOURCEMAP_STARTS_WITH = '//# sourceMappingURL=data:application/json;charset=utf-8;base64,';
var base64ToMap = typeof Buffer === 'undefined'
    ? function (value) { return btoa(value); }
    : function (value) { return Buffer.from(value, 'base64').toString(); };
function normaliseInput(code, map) {
    var inlineSourceMapIndex = code.lastIndexOf('\n') + 1;
    var lastString = code.slice(inlineSourceMapIndex);
    if (lastString.startsWith(BASE64_SOURCEMAP_STARTS_WITH)) {
        code = code.slice(0, inlineSourceMapIndex);
        if (!map) {
            map = JSON.parse(base64ToMap(lastString.slice(BASE64_SOURCEMAP_STARTS_WITH.length)));
        }
    }
    return {
        code: code,
        map: map
    };
}
function transform(code, _a) {
    var _b = _a === void 0 ? {} : _a, map = _b.map, jsxFile = _b.jsxFile, jsFile = _b.jsFile, _c = _b.parser, parser = _c === void 0 ? parse : _c;
    if (typeof code === 'object') {
        map = map || code.map;
        code = code.code;
    }
    var jsxData = normaliseInput(code, map);
    var magicString = new MagicString__default["default"](jsxData.code);
    var ast;
    try {
        ast = parser(code);
    }
    catch (err) {
        err.message += " in file://".concat(jsxFile);
        throw err;
    }
    simple(ast, {
        JSXText: function (data) {
            var start = data.start, end = data.end, raw = data.raw;
            if (raw) {
                var keepRightSpace = jsxData.code[end] === '{';
                var keepLeftSpace = jsxData.code[start - 1] === '}';
                var targetValue = raw
                    .replace(/('|\\)/g, "\\$1")
                    .replace(/\n/g, '')
                    .replace(/(\s)+/g, ' ');
                if (!keepLeftSpace) {
                    targetValue = targetValue.replace(/^(\s)+/g, '');
                }
                if (!keepRightSpace) {
                    targetValue = targetValue.replace(/(\s)+$/g, '');
                }
                data.result = targetValue;
                magicString.overwrite(start, end, targetValue ? "'".concat(targetValue, "'") : '');
            }
        },
        JSXExpressionContainer: function (_a) {
            var start = _a.start, end = _a.end;
            magicString.remove(start, start + 1);
            magicString.remove(end - 1, end);
        },
        JSXFragment: function (_a) {
            var children = _a.children;
            var started = false;
            for (var i = 0; i < children.length; i++) {
                var _b = children[i], type = _b.type, start = _b.start, result = _b.result;
                if (type !== 'JSXText' || result) {
                    if (started) {
                        magicString.appendLeft(start, ',');
                    }
                    else {
                        started = true;
                    }
                }
            }
        },
        JSXOpeningFragment: function (_a) {
            var start = _a.start, end = _a.end;
            magicString.overwrite(start, end, '[');
        },
        JSXClosingFragment: function (_a) {
            var start = _a.start, end = _a.end;
            magicString.overwrite(start, end, ']');
        },
        JSXElement: function (_a) {
            var children = _a.children, openingElement = _a.openingElement;
            var childrenStarted = false;
            var lastEnd;
            for (var i = 0; i < children.length; i++) {
                var _b = children[i], type = _b.type, start = _b.start, end = _b.end, result = _b.result;
                lastEnd = end;
                if (type !== 'JSXText' || result) {
                    if (!childrenStarted) {
                        magicString.appendLeft(openingElement.end, ',children:[');
                        childrenStarted = true;
                    }
                    else {
                        magicString.appendLeft(start, ',');
                    }
                }
            }
            if (childrenStarted) {
                magicString.appendRight(lastEnd, ']');
            }
        },
        JSXOpeningElement: function (_a) {
            var start = _a.start, end = _a.end, name = _a.name, selfClosing = _a.selfClosing, attributes = _a.attributes;
            var fullName = name.type === 'JSXMemberExpression'
                ? "".concat(name.object.name, ".").concat(name.property.name)
                : name.name || '';
            var stringSym = /[a-z]/.test(fullName[0]) ? "'" : '';
            magicString.overwrite(start, start + 1, '{type:');
            if (stringSym) {
                magicString.appendLeft(name.start, stringSym);
                magicString.appendLeft(name.end, stringSym);
            }
            var lastEnd = name.end;
            if (attributes) {
                for (var i = 0; i < attributes.length; i++) {
                    var attribute = attributes[i];
                    magicString.remove(lastEnd, attribute.start);
                    lastEnd = attribute.end;
                    if (!i) {
                        magicString.appendLeft(name.end, ',props:{');
                    }
                    else {
                        magicString.appendLeft(attribute.start - 1, ',');
                    }
                    if (i + 1 === attributes.length) {
                        magicString.appendLeft(attribute.end, '}');
                    }
                }
            }
            if (selfClosing) {
                magicString.overwrite(lastEnd, end, "}");
            }
            else {
                magicString.remove(lastEnd, end);
            }
        },
        JSXClosingElement: function (_a) {
            var start = _a.start, end = _a.end;
            magicString.overwrite(start, end, "}");
        },
        JSXAttribute: function (_a) {
            var name = _a.name, value = _a.value;
            var isNamespacedName = name.type === 'JSXNamespacedName';
            var namespacedNameType;
            if (isNamespacedName) {
                var namespace = name.namespace;
                name = name.name;
                namespacedNameType = namespace.name;
                magicString.overwrite(namespace.start, namespace.end + 1, '');
            }
            if (name.name.includes('-')) {
                magicString.overwrite(name.start, name.end, "'".concat(name.name, "'"));
            }
            if (value) {
                if (value.type !== 'Literal' && namespacedNameType === 'get') {
                    magicString.overwrite(name.end, value.start, "(){return ");
                    magicString.appendLeft(name.start, 'get ');
                    magicString.appendLeft(value.end, '}');
                }
                else {
                    magicString.overwrite(name.end, value.start, ":");
                }
                if (value.type === 'Literal' && value.value) {
                    magicString.overwrite(value.start + 1, value.end - 1, value.value.replace(/\\/g, '\\\\'));
                }
            }
            else {
                magicString.appendLeft(name.end, ':true');
            }
        },
        JSXSpreadAttribute: function (_a) {
            var start = _a.start, end = _a.end;
            magicString.remove(start, start + 1);
            magicString.remove(end - 1, end);
        },
    });
    return {
        code: magicString.toString(),
        map: merge(jsxData.map, magicString.generateMap({
            file: jsFile,
            source: jsxFile,
            includeContent: true,
            hires: true
        }))
    };
}

exports.JSXParser = JSXParser;
exports["default"] = transform;
exports.parse = parse;
exports.transform = transform;
