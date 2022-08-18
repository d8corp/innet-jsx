import MagicString from 'magic-string';
import { Parser } from 'acorn';

const { extend } = require('acorn-jsx-walk');
const { base, simple } = require('acorn-walk');
const jsxParser = require('acorn-jsx');
const merge = require('merge-source-map');
const JSXParser = Parser.extend(jsxParser());
extend(base);
function parse(code, options) {
    return JSXParser.parse(code, Object.assign({ ecmaVersion: 'latest' }, options));
}
const BASE64_SOURCEMAP_STARTS_WITH = '//# sourceMappingURL=data:application/json;charset=utf-8;base64,';
const base64ToMap = typeof btoa === 'undefined'
    ? value => Buffer.from(value, 'base64').toString()
    : value => btoa(value);
function normaliseInput(code, map) {
    const inlineSourceMapIndex = code.lastIndexOf('\n') + 1;
    const lastString = code.slice(inlineSourceMapIndex);
    if (lastString.startsWith(BASE64_SOURCEMAP_STARTS_WITH)) {
        code = code.slice(0, inlineSourceMapIndex);
        if (!map) {
            try {
                map = JSON.parse(base64ToMap(lastString.slice(BASE64_SOURCEMAP_STARTS_WITH.length)));
            }
            catch (e) {
                console.log(e);
            }
        }
    }
    return {
        code,
        map
    };
}
function transform(code, { map, jsxFile, jsFile, parser = parse } = {}) {
    const jsxData = normaliseInput(code, map);
    const magicString = new MagicString(jsxData.code);
    let ast;
    try {
        ast = parser(code);
    }
    catch (err) {
        err.message += ` in file://${jsxFile}`;
        throw err;
    }
    simple(ast, {
        JSXText(data) {
            const { start, end, raw } = data;
            if (raw) {
                const keepRightSpace = jsxData.code[end] === '{';
                const keepLeftSpace = jsxData.code[start - 1] === '}';
                let targetValue = raw
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
                magicString.overwrite(start, end, targetValue ? `'${targetValue}'` : '');
            }
        },
        JSXExpressionContainer({ start, end }) {
            magicString.remove(start, start + 1);
            magicString.remove(end - 1, end);
        },
        JSXFragment({ children }) {
            let started = false;
            for (let i = 0; i < children.length; i++) {
                const { type, start, result } = children[i];
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
        JSXOpeningFragment({ start, end }) {
            magicString.overwrite(start, end, '[');
        },
        JSXClosingFragment({ start, end }) {
            magicString.overwrite(start, end, ']');
        },
        JSXElement({ children, openingElement }) {
            let childrenStarted = false;
            let lastEnd;
            for (let i = 0; i < children.length; i++) {
                const { type, start, end, result } = children[i];
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
        JSXOpeningElement({ start, end, name, selfClosing, attributes }) {
            const fullName = name.type === 'JSXMemberExpression'
                ? `${name.object.name}.${name.property.name}`
                : name.name || '';
            const stringSym = /[a-z]/.test(fullName[0]) ? "'" : '';
            magicString.overwrite(start, start + 1, '{type:');
            if (stringSym) {
                magicString.appendLeft(name.start, stringSym);
                magicString.appendLeft(name.end, stringSym);
            }
            let lastEnd = name.end;
            if (attributes) {
                for (let i = 0; i < attributes.length; i++) {
                    const attribute = attributes[i];
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
                magicString.overwrite(lastEnd, end, `}`);
            }
            else {
                magicString.remove(lastEnd, end);
            }
        },
        JSXClosingElement({ start, end }) {
            magicString.overwrite(start, end, `}`);
        },
        JSXAttribute({ name, value }) {
            const isNamespacedName = name.type === 'JSXNamespacedName';
            let namespacedNameType;
            if (isNamespacedName) {
                const { namespace } = name;
                name = name.name;
                namespacedNameType = namespace.name;
                magicString.overwrite(namespace.start, namespace.end + 1, '');
            }
            if (name.name.includes('-')) {
                magicString.overwrite(name.start, name.end, `'${name.name}'`);
            }
            if (value) {
                if (value.type !== 'Literal' && namespacedNameType === 'get') {
                    magicString.overwrite(name.end, value.start, `(){return `);
                    magicString.appendLeft(name.start, 'get ');
                    magicString.appendLeft(value.end, '}');
                }
                else {
                    magicString.overwrite(name.end, value.start, `:`);
                }
                if (value.type === 'Literal' && value.value) {
                    magicString.overwrite(value.start + 1, value.end - 1, value.value.replace(/\\/g, '\\\\'));
                }
            }
            else {
                magicString.appendLeft(name.end, ':true');
            }
        },
        JSXSpreadAttribute({ start, end }) {
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

export default transform;
export { JSXParser, parse, transform };
