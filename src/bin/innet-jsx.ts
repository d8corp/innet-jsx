#!/usr/bin/env node
import transform from '..'
import fs from 'fs'
import { program } from 'commander'

program
  .version(process.env.INNETJS_JSX_PACKAGE_VERSION, '-v, --version')

program
  .arguments('<jsx-file> [js-file]')
  .description('Converts <jsx-file> to <js-file>', {
    'jsx-file': 'Target file path, you want convert',
    'js-file': 'A path of the converted file',
  })
  .option('-m, --map', 'Create map file')
  .option('-w, --watch', 'Watching of changes')
  .action((jsxFile, jsFile = jsxFile.replace(/\.jsx$/, '.js'), {map, watch}) => {
    function convert () {
      const data = transform(fs.readFileSync(jsxFile, 'utf8'), {jsFile, jsxFile})
      if (map) {
        fs.writeFileSync(jsFile, data.code + `\n//# sourceMappingURL=${jsFile.replace(/^(.*\/)?([^\/]+)$/, '$2') + '.map'}`)
        fs.writeFileSync(jsFile + '.map', JSON.stringify(data.map))
      } else {
        fs.writeFileSync(jsFile, data.code)
      }
      console.log('Successful build')
    }

    convert()

    if (watch) {
      fs.watchFile(jsxFile, convert)
    }
  })

program
  .parse(process.argv)
