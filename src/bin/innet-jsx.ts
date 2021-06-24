#!/usr/bin/env node
import transform from '..'
import fs from 'fs'
import {version} from '../../package.json'
import {program} from 'commander'

program
  .version(version, '-v, --version')

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
      const data = transform(fs.readFileSync(jsxFile, 'utf8'), jsxFile)
      fs.writeFileSync(jsFile, data.code)
      if (map) {
        fs.writeFileSync(jsFile + '.map', JSON.stringify(data.map))
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
