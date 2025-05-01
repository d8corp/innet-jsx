<a href="https://www.npmjs.com/package/innet"><img src="https://raw.githubusercontent.com/d8corp/innet/main/logo.svg" align="left" width="90" height="90" alt="InnetJs logo by Mikhail Lysikov"></a>

# &nbsp; innet-jsx

&nbsp;

[![NPM](https://img.shields.io/npm/v/innet-jsx.svg)](https://www.npmjs.com/package/innet-jsx)
[![downloads](https://img.shields.io/npm/dm/innet-jsx.svg)](https://www.npmtrends.com/innet-jsx)
[![license](https://img.shields.io/npm/l/innet-jsx)](https://github.com/d8corp/innet-jsx/blob/main/LICENSE)
[![license](https://img.shields.io/badge/Changelog-⋮-brightgreen)](https://changelogs.xyz/innet-jsx)

This utils help to convert `jsx` into `js` with [innet](https://www.npmjs.com/package/innet) rules.

[![stars](https://img.shields.io/github/stars/d8corp/innet-jsx?style=social)](https://github.com/d8corp/innet-jsx/stargazers)
[![watchers](https://img.shields.io/github/watchers/d8corp/innet-jsx?style=social)](https://github.com/d8corp/innet-jsx/watchers)

## Install

npm
```bash
npm i -g innet-jsx
```

You can use `npx innet-jsx` without installation.

## Usage
You can use `Node.js` exports or `CLI` for conversion of `jsx` into `js`.

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
You can use it in a Node.js project
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

You can pass to `transform` an object with the next fields: `code`, `map` (optional).

```typescript jsx
import transform from 'innet-jsx'

console.log(transform({
  code: '<></>',
  map: '...',
}))
```

If you want to get **Abstract Syntax Tree (AST)**, use `parse` function.
```typescript jsx
import { parse } from 'innet-jsx'

console.log(parse('<></>'))
```

## Rules

A fragment converts to an array
```typescript jsx
<></> // []
<>1</> // ['1']
<>{1}</> // [1]
<>{1}{2}</> // [1,2]
<>{1} {2}</> // [1,' ',2]
<> {1} {2} </> // [1,' ',2]
<>
  {1}
  {2}
</> // [1,' ',2]
```

An element converts to an object with `type` field, that equals a component or a string.
```typescript jsx
<div /> // {type:'div'}
<div></div> // {type:'div'}
```

The `props` field of a JSX element contains attributes of the element.
```typescript jsx
<div id='test' /> // {type:'div',props:{id:'test'}}

<div id="test1" class={"test2"} />
// {type:'div',props:{id:"test1",class:"test2"}}

const test = 1;
<div children={<>test: {test}</>} />
// {type:'div',props:{children:['test: ',test]}}
```

The `children` prop contains body of the element
```typescript jsx
<div>1</div> // {type:'div',props:{children:'1'}}
<div>{2}</div> // {type:'div',props:{children:2}}
<div>1{2}</div> // {type:'div',props:{children:['1',2]}}
<div><span /></div>
// {type:'div',props:{children:{type:'span'}}}
```

## Issues
If you find a bug or have a suggestion, please file an issue on [GitHub](https://github.com/d8corp/innet-jsx/issues).

[![issues](https://img.shields.io/github/issues-raw/d8corp/innet-jsx)](https://github.com/d8corp/innet-jsx/issues)
