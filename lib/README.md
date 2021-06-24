# innet-jsx
[![NPM](https://img.shields.io/npm/v/innet-jsx.svg)](https://github.com/d8corp/innet-jsx/blob/main/CHANGELOG.md)
[![downloads](https://img.shields.io/npm/dm/innet-jsx.svg)](https://www.npmjs.com/package/innet-jsx)
[![license](https://img.shields.io/npm/l/innet-jsx)](https://github.com/d8corp/innet-jsx/blob/main/LICENSE)

This utils help to convert `jsx` into `js` with [innet](https://www.npmjs.com/package/innet) rules.

[![stars](https://img.shields.io/github/stars/d8corp/innet-jsx?style=social)](https://github.com/d8corp/innet-jsx/stargazers)
[![watchers](https://img.shields.io/github/watchers/d8corp/innet-jsx?style=social)](https://github.com/d8corp/innet-jsx/watchers)

## Install

npm
```bash
npm i -g innet-jsx
```

yarn
```bash
yarn add -g innet-jsx
```

You can use `npx innet-jsx` instead of `innet-jsx` without installation.

## Usage
You can use `Node.js` exports or `CLI` to convert `jsx` to `js`.

### CLI
Run `innet-jsx` with `-v` option to see `innet-jsx` version you have.
```shell
innet-jsx -v
```

Run `innet-jsx` with `-h` option to see help information.
```shell
innet-jsx -h
```

#### Arguments
Run the CLI with input file path you want to convert.
```shell
innet-jsx test.jsx
```
*You will get `js` file with the same name, around it*

If you want to set another output file path, add the path after the input one.
```shell
innet-jsx test.jsx custom.js
```

#### Options
Use `-m` option to add map file.
```shell
innet-jsx test.jsx -m
```
*You will get test.js.map*

Use `-w` option to watch the input file
```shell
innet-jsx test.jsx -w
```

### Node.js
You can install it local to the project
```shell
npm i -D innet-jsx
# or
yarn add -D innet-jsx
```

#### Transform
Use `transform` to convert `jsx` string code to `js`.
```typescript jsx
import transform from 'innet-jsx'

console.log(transform('<></>'))
```
*You will get an object with 2 fields: code (contains result of transformation) and map (contains map data)*

If you want to get **Abstract Syntax Tree (AST)**, use `parse` function.
```typescript jsx
import {parse} from 'innet-jsx'

console.log(parse('<></>'))
```

## Issues
If you find a bug or have a suggestion, please file an issue on [GitHub](https://github.com/d8corp/innet-jsx/issues).  
[![issues](https://img.shields.io/github/issues-raw/d8corp/innet-jsx)](https://github.com/d8corp/innet-jsx/issues)
