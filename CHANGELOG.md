# Changelog

## v1.3

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
