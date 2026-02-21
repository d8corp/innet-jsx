# Changelog

## v2.0

### v2.0.8 [![21.02.2026](https://img.shields.io/date/1771699094)](https://github.com/d8corp/innet-jsx/tree/v2.0.8)

- Fix `INNETJS_JSX_PACKAGE_VERSION` bug

### v2.0.7 [![11.05.2025](https://img.shields.io/date/1746916539)](https://github.com/d8corp/innet-jsx/tree/v2.0.7)

- fixed spread attributes bug

### v2.0.6 [![11.05.2025](https://img.shields.io/date/1746916079)](https://github.com/d8corp/innet-jsx/tree/v2.0.6)

- fixed children array when children with new line

### v2.0.5 [![11.05.2025](https://img.shields.io/date/1746914343)](https://github.com/d8corp/innet-jsx/tree/v2.0.5)

- fixed children array when children with new line

### v2.0.4 [![11.05.2025](https://img.shields.io/date/1746912453)](https://github.com/d8corp/innet-jsx/tree/v2.0.4)

- fixed empty children with comment

### v2.0.3 [![10.05.2025](https://img.shields.io/date/1746880659)](https://github.com/d8corp/innet-jsx/tree/v2.0.3)

- fixed deep JSXElement type

### v2.0.2 [![10.05.2025](https://img.shields.io/date/1746877700)](https://github.com/d8corp/innet-jsx/tree/v2.0.2)

- fixed deep JSXElement type

### v2.0.1 [![01.05.2025](https://img.shields.io/date/1746125392)](https://github.com/d8corp/innet-jsx/tree/v2.0.1)

- `children` equals value if element has 1 child instead of an array

### v2.0.0 [![01.05.2025](https://img.shields.io/date/1746120186)](https://github.com/d8corp/innet-jsx/tree/v2.0.0)

- add `children` into `props`

## v1.4

### v1.4.0 [![03.04.2025](https://img.shields.io/date/1743628601)](https://github.com/d8corp/innet-jsx/tree/v1.4.0)

- fix an error when you use arrow function with `JSX` body

## v1.3

### v1.3.3 [![11.11.2022](https://img.shields.io/date/1668166492)](https://github.com/d8corp/innet-jsx/tree/v1.3.3)

- fix jest map error

### v1.3.2 [![19.08.2022](https://img.shields.io/date/1660896288)](https://github.com/d8corp/innet-jsx/tree/v1.3.2)

- add object handling of `transform`

### v1.3.1 [![18.08.2022](https://img.shields.io/date/1660840746)](https://github.com/d8corp/innet-jsx/tree/v1.3.1)

- temp fix jest map error

### v1.3.0 [![10.04.2022](https://img.shields.io/date/1649587842)](https://github.com/d8corp/innet-jsx/tree/v1.3.0)

- changed space handling algorithm
  ```typescript jsx
  <>
    Hello {'World'}!
  </>
  ```
  converts to
  ```typescript jsx
  ['Hello ','World','!']
  ```

## v1.2

### v1.2.0 [![22.03.2022](https://img.shields.io/date/1647978691)](https://github.com/d8corp/innet-jsx/tree/v1.2.0)
- add getter feature
  ```typescript jsx
  <test get:foo={1 + 2} />
  //----^-^
  ```

## v1.1

### v1.1.3 [![02.03.2022](https://img.shields.io/date/1646170118)](https://github.com/d8corp/innet-jsx/tree/v1.1.3)
- fixed dash props
  ```typescript jsx
  <test foo-bar='' />
  //-------^
  ```

### v1.1.2 [![10.01.2022](https://img.shields.io/date/1641846763)](https://github.com/d8corp/innet-jsx/tree/v1.1.2)
- fixed empty literal bug
  ```typescript jsx
  <test foo='' />
  //--------^^
  ```

### v1.1.1 [![25.06.2021](https://img.shields.io/date/1624793291)](https://github.com/d8corp/innet-jsx/tree/v1.1.1)
- now you can open a file with failed parsing from terminal

### v1.1.0 [![25.06.2021](https://img.shields.io/date/1624632591)](https://github.com/d8corp/innet-jsx/tree/v1.1.0)
- fixed source map bugs

## v1.0

### v1.0.0 [![24.06.2021](https://img.shields.io/date/1624547959)](https://github.com/d8corp/innet-jsx/tree/v1.0.0)
- the first implementation
