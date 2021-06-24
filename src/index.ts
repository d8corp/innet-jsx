import MagicString, {SourceMap} from 'magic-string'
import {Node, Parser} from 'acorn'

const { extend } = require('acorn-jsx-walk')
const {base, simple} = require('acorn-walk')
const jsxParser = require('acorn-jsx')

export const JSXParser = Parser.extend(jsxParser())

extend(base)

export interface TransformResult {
  code: string
  map: SourceMap
}

export function parse (code: string): Node {
  return JSXParser.parse(code, {ecmaVersion: 'latest'})
}

export function transform (code: string, filePath = 'inline', parser = parse): TransformResult {
    if (filePath === 'inline' || filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
      let ast

      try {
        ast = parser(code)
      } catch (err) {
        err.message += ` in ${filePath}`
        throw err
      }

      const magicString = new MagicString(code)

      simple(ast, {
        JSXNamespacedName ({start}) {
          throw Error(`innet does not support JSXNamespacedName ${filePath}:${start}`)
        },
        JSXText ({start, end, raw}) {
          let value = raw.trim()

          if (value) {
            const spaceStart = raw.length - raw.trimLeft().length
            const spaceEnd = raw.length - value.length - spaceStart
            const targetValue = value.replace(/('|\\)/g, "\\$1").replace(/\n(\s*)/g, "'+\n$1'")

            magicString.overwrite(start + spaceStart, end - spaceEnd, `'${targetValue}'`)
          }
        },
        JSXExpressionContainer ({start, end}) {
          magicString.remove(start, start + 1)
          magicString.remove(end - 1, end)
        },
        JSXFragment ({children}) {
          let started = false
          for (let i = 1; i < children.length; i++) {
            const {type, start, raw} = children[i]
            if (type !== 'JSXText' || raw.trim()) {
              if (started) {
                magicString.appendLeft(start, ',')
              } else {
                started = true
              }
            }
          }
        },
        JSXOpeningFragment ({start, end}) {
          magicString.overwrite(start, end, '[')
        },
        JSXClosingFragment ({start, end}) {
          magicString.overwrite(start, end, ']')
        },
        JSXElement ({children, openingElement}) {
          let childrenStarted = false
          let childrenStart
          let childrenEnd
          for (let i = 0; i < children.length; i++) {
            const {type, start, end, raw} = children[i]

            if (!i) {
              childrenStart = start
            }
            if (i + 1 === children.length) {
              childrenEnd = end
            }

            if (type !== 'JSXText' || raw.trim()) {
              if (!childrenStarted) {
                magicString.appendLeft(openingElement.end, ', children: [')
                childrenStarted = true
              } else {
                magicString.appendLeft(start, ',')
              }
            }

            if (childrenStarted && i + 1 === children.length) {
              magicString.appendRight(end, ']')
            }
          }
        },
        JSXOpeningElement ({start, end, name, selfClosing, attributes}) {
          const fullName = name.type === 'JSXMemberExpression'
            ? `${name.object.name}.${name.property.name}`
            : name.name || ''
          const stringSym = /[a-z]/.test(fullName[0]) ? "'" : ''

          magicString.overwrite(start, start + 1, '{type: ')
          if (stringSym) {
            magicString.appendLeft(name.start, stringSym)
            magicString.appendLeft(name.end, stringSym)
          }

          if (attributes) {
            for (let i = 0; i < attributes.length; i++) {
              const attribute = attributes[i]
              if (!i) {
                if (!code.slice(name.end, attribute.start).includes('\n')) {
                  magicString.remove(attribute.start - 1, attribute.start)
                }

                magicString.appendLeft(name.end, ', props: {')
              } else {
                magicString.appendLeft(attribute.start - 1, ',')
              }

              if (i + 1 === attributes.length) {
                magicString.appendLeft(attribute.end, '}')
              }
            }
          }

          if (selfClosing) {
            magicString.overwrite(end - 2, end, `}`)
          } else {
            magicString.remove(end - 1, end)
          }
        },
        JSXClosingElement ({start, end}) {
          magicString.overwrite(start, end, `}`)
        },
        JSXAttribute ({name, value}) {
          if (value) {
            magicString.overwrite(name.end, value.start, `: `)
            if (value.type === 'Literal') {
              magicString.overwrite(value.start + 1, value.end - 1, value.value.replace(/\\/g, '\\\\'))
            }
          } else {
            magicString.appendLeft(name.end, ': true')
          }
        },
        JSXSpreadAttribute ({start, end}) {
          magicString.remove(start, start + 1)
          magicString.remove(end - 1, end)
        },
      })

      return {
        code: magicString.toString(),
        map: magicString.generateMap()
      }
    }
}

export default transform
