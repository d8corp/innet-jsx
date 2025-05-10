import MagicString, { SourceMap as MSSourceMap } from 'magic-string'
import { Node, Parser, Options } from 'acorn'

const { extend } = require('acorn-jsx-walk')
const { base, simple } = require('acorn-walk')
const jsxParser = require('acorn-jsx')
const merge = require('merge-source-map')

export const JSXParser = Parser.extend(jsxParser())

extend(base)

export interface TransformResult {
  code: string
  map?: MSSourceMap
}

export function parse (code: string, options?: Options): Node {
  return JSXParser.parse(code, Object.assign({ ecmaVersion: 'latest' }, options))
}

export interface SourceMap {
  version: number;
  file: string;
  sources: string[];
  sourcesContent: string[];
  names: string[];
  mappings: string;
}

export interface TransformOption {
  jsxFile?: string
  jsFile?: string
  parser?: typeof parse
  map?: SourceMap
}

const BASE64_SOURCEMAP_STARTS_WITH = '//# sourceMappingURL=data:application/json;charset=utf-8;base64,'

const base64ToMap = typeof Buffer === 'undefined'
  ? value => btoa(value)
  : value => Buffer.from(value, 'base64').toString()

function normaliseInput (code: string, map?: SourceMap): { code: string, map: SourceMap } {
  const inlineSourceMapIndex = code.lastIndexOf('\n') + 1
  const lastString = code.slice(inlineSourceMapIndex)

  if (lastString.startsWith(BASE64_SOURCEMAP_STARTS_WITH)) {
    code = code.slice(0, inlineSourceMapIndex)

    if (!map) {
      map = JSON.parse(base64ToMap(lastString.slice(BASE64_SOURCEMAP_STARTS_WITH.length)))
    }
  }

  return {
    code,
    map
  }
}

export function transform (code: TransformResult | string, { map, jsxFile, jsFile, parser = parse }: TransformOption = {}): TransformResult {
  if (typeof code === 'object') {
    map = map || code.map
    code = code.code
  }

  const jsxData = normaliseInput(code, map)
  const magicString = new MagicString(jsxData.code)

  let ast

  try {
    ast = parser(code)
  } catch (err) {
    err.message += ` in file://${jsxFile}`
    throw err
  }

  simple(ast, {
    JSXText (data) {
      const { start, end, raw } = data
      if (raw) {
        const keepRightSpace = jsxData.code[end] === '{'
        const keepLeftSpace = jsxData.code[start - 1] === '}'
        let targetValue = raw
          .replace(/('|\\)/g, "\\$1")
          .replace(/\n/g, '')
          .replace(/(\s)+/g, ' ')

        if (!keepLeftSpace) {
          targetValue = targetValue.replace(/^(\s)+/g, '')
        }
        if (!keepRightSpace) {
          targetValue = targetValue.replace(/(\s)+$/g, '')
        }

        data.result = targetValue

        magicString.overwrite(start, end, targetValue ? `'${targetValue}'` : '')
      }
    },
    JSXExpressionContainer ({start, end}) {
      magicString.remove(start, start + 1)
      magicString.remove(end - 1, end)
    },
    JSXFragment ({ children }) {
      let started = false

      for (let i = 0; i < children.length; i++) {
        const { type, start, result } = children[i]

        if (type !== 'JSXText' || result) {
          if (started) {
            magicString.appendLeft(start, ',')
          } else {
            started = true
          }
        }
      }
    },
    JSXOpeningFragment ({ start, end }) {
      magicString.overwrite(start, end, '[')
    },
    JSXClosingFragment ({ start, end }) {
      magicString.overwrite(start, end, ']')
    },
    JSXElement ({ children, openingElement, end }) {
      const hasAttributes = Boolean(openingElement.attributes.filter(({name}) => name?.name !== 'children').length)

      const addArray = children.filter(node => {
        if (node.type === 'JSXText' && !node.result) return false;
        return true
      }).length > 1 || children.some(node => node.type === 'JSXExpressionContainer' && node.expression.type === 'JSXEmptyExpression')

      const childrenStartSymbol = addArray ? '[' : ''
      const childrenEndSymbol = addArray ? ']' : ''
      let childrenStarted = false
      let lastEnd
      for (let i = 0; i < children.length; i++) {
        const { type, start, end, result } = children[i]
        lastEnd = end
        if (type !== 'JSXText' || result) {
          if (!childrenStarted) {
            if (hasAttributes) {
              const propsEnd = openingElement.attributes[openingElement.attributes.length - 1].end
              magicString.appendLeft(propsEnd, `,children:${childrenStartSymbol}`)
            } else {
              magicString.appendLeft(openingElement.end, `,props:{children:${childrenStartSymbol}`)
            }
            childrenStarted = true
          } else {
            magicString.appendLeft(start, ',')
          }
        }
      }

      if (childrenStarted) {
        magicString.appendRight(lastEnd, `${childrenEndSymbol}}`)
      } else if (hasAttributes && !openingElement.selfClosing) {
        magicString.appendLeft(end, '}')
      }
    },
    JSXOpeningElement ({ start, end, name, selfClosing, attributes }) {
      const stringSym = name.type === 'JSXMemberExpression' || !/[a-z]/.test(name.name?.[0] || '') ? '' : "'"

      magicString.overwrite(start, start + 1, '{type:')

      if (stringSym) {
        magicString.appendLeft(name.start, stringSym)
        magicString.appendLeft(name.end, stringSym)
      }

      const lastEnd = !attributes?.length ? name.end : attributes[attributes.length - 1].end


      if (selfClosing) {
        magicString.overwrite(lastEnd, end, `}`)
      } else {
        magicString.remove(lastEnd, end)
      }

      if (attributes) {
        let lastEnd = name.end
        for (let i = 0; i < attributes.length; i++) {
          const attribute = attributes[i]

          magicString.remove(lastEnd, attribute.start)
          lastEnd = attribute.end

          if (!selfClosing && attribute.name?.name === 'children') {
            magicString.remove(attribute.start, attribute.end)
            continue;
          }

          if (!i) {
            magicString.appendLeft(name.end, ',props:{')
          } else {
            magicString.appendLeft(attribute.start - 1, ',')
          }

          if (i + 1 === attributes.length && selfClosing) {
            magicString.appendRight(attribute.end, '}')
          }
        }
      }
    },
    JSXClosingElement ({ start, end }) {
      magicString.overwrite(start, end, `}`)
    },
    JSXAttribute ({ name, value }) {
      const isNamespacedName = name.type === 'JSXNamespacedName'
      let namespacedNameType

      if (isNamespacedName) {
        const {namespace} = name
        name = name.name

        namespacedNameType = namespace.name
        magicString.overwrite(namespace.start, namespace.end + 1, '')
      }

      if (name.name.includes('-')) {
        magicString.overwrite(name.start, name.end, `'${name.name}'`)
      }

      if (value) {
        if (value.type !== 'Literal' && namespacedNameType === 'get') {
          magicString.overwrite(name.end, value.start, `(){return `)
          magicString.appendLeft(name.start, 'get ')
          magicString.appendLeft(value.end, '}')
        } else {
          magicString.overwrite(name.end, value.start, `:`)
        }

        if (value.type === 'Literal' && value.value) {
          magicString.overwrite(value.start + 1, value.end - 1, value.value.replace(/\\/g, '\\\\'))
        }
      } else {
        magicString.appendLeft(name.end, ':true')
      }
    },
    JSXSpreadAttribute ({ start, end }) {
      magicString.remove(start, start + 1)
      magicString.remove(end - 1, end)
    },
    ArrowFunctionExpression ({ body }) {
      if (body?.type === 'JSXElement') {
        for (let i = body.start; i > 0; i--) {
          if (jsxData.code[i] === '(') return

          if (jsxData.code[i] === '>') {
            magicString.appendLeft(body.start, '(')
            magicString.appendRight(body.end, ')')
            break
          }
        }
      }
    },
  })

  return {
    code: magicString.toString(),
    map: merge(jsxData.map, magicString.generateMap({
      file: jsFile,
      source: jsxFile,
      includeContent: true,
      hires: true
    }))
  }
}

export default transform
