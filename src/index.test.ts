import transform from '.'

describe('innet-jsx', () => {
  describe('without jsx', () => {
    test('empty', () => {
      expect(transform('').code).toEqual('')
    })
    test('var', () => {
      expect(transform('var x').code).toEqual('var x')
    })
    test('value', () => {
      expect(transform('var x = 1;').code).toEqual('var x = 1;')
    })
  })
  describe('fragment', () => {
    test('empty', () => {
      expect(transform('<></>').code).toBe('[]')

      expect(transform(`<>
      </>`).code).toBe(`[]`)

      expect(transform(`<>

      </>`).code).toBe(`[]`)

      expect(transform(`<>


      </>`).code).toBe(`[]`)
    })
    test('inline children', () => {
      expect(transform(`(<>test</>)`).code).toBe("(['test'])")

      expect(transform(`(<>

      test

      </>)`).code).toBe("(['test'])")

      expect(transform(`(<>

      test1

      test2

      </>)`).code).toBe(`(['test1 test2'])`)

      expect(transform('<>\\</>').code).toBe("['\\\\']")
      expect(transform("<>'</>").code).toBe("['\\'']")

      expect(transform(`(<>

      test1\\

      test2'

      test3"

      </>)`).code).toBe(`(['test1\\\\ test2\\' test3"'])`)
    })
    test('inline children and expression', () => {
      expect(transform('<>test: {1}</>').code).toBe("['test: ',1]")
      expect(transform('<> test: {1}</>').code).toBe("['test: ',1]")
      expect(transform('<>test: {1} %</>').code).toBe("['test: ',1,' %']")
    })
  })
  describe('element', () => {
    test('empty', () => {
      expect(transform(`<test/>`).code).toBe("{type:'test'}")
      expect(transform(`<test />`).code).toBe("{type:'test'}")
      expect(transform(`<test   />`).code).toBe("{type:'test'}")
      expect(transform(`<test></test>`).code).toBe("{type:'test'}")
      expect(transform(`<test>
</test>`).code).toBe(`{type:'test'}`)
      expect(transform(`<test>

</test>`).code).toBe(`{type:'test'}`)
    })
    test('inline children', () => {
      expect(transform('<test>foo</test>').code).toBe("{type:'test',props:{children:'foo'}}")
      expect(transform(`<test>
  foo
</test>`).code).toBe(`{type:'test',props:{children:'foo'}}`)
      expect(transform(`<test>

  foo

</test>`).code).toBe(`{type:'test',props:{children:'foo'}}`)
      expect(transform(`<test>

  foo

  bar

</test>`).code).toBe(`{type:'test',props:{children:'foo bar'}}`)
    })
    test('element children', () => {
      expect(transform('<foo><bar /></foo>').code).toBe("{type:'foo',props:{children:{type:'bar'}}}")
      expect(transform(`<foo
test>
<bar />
</foo>`).code).toBe(`{type:'foo',props:{test:true,children:[{type:'bar'}]}}`)
    })
    it('should render space', () => {
      expect(transform("<>Hello {'world'} !</>").code).toBe("['Hello ','world',' !']")
      expect(transform("<>Hello    {'world'} !</>").code).toBe("['Hello ','world',' !']")
      expect(transform("<>{1} {2}</>").code).toBe("[1,' ',2]")
      expect(transform("<div>Hello {'world'} !</div>").code).toBe("{type:'div',props:{children:['Hello ','world',' !']}}")
      expect(transform("<div>Hello {'world'}   ! </div>").code).toBe("{type:'div',props:{children:['Hello ','world',' !']}}")
      expect(transform("<div>{1} {2}</div>").code).toBe("{type:'div',props:{children:[1,' ',2]}}")
      expect(transform(`<>
  Hello {'World'}!
</>`).code).toBe("['Hello ','World','!']")
    });
    describe('props', () => {
      test('usual', () => {
        expect(transform(`<test    test/>`).code).toBe(`{type:'test',props:{test:true}}`)
        expect(transform(`<test


test/>`).code).toBe(`{type:'test',props:{test:true}}`)
        expect(transform(`<test test />`).code).toBe(`{type:'test',props:{test:true}}`)
        expect(transform(`<test test='foo' />`).code).toBe(`{type:'test',props:{test:'foo'}}`)
        expect(transform(`<test test="foo" />`).code).toBe(`{type:'test',props:{test:"foo"}}`)
        expect(transform(`<test test="foo\\" />`).code).toBe(`{type:'test',props:{test:"foo\\\\"}}`)
        expect(transform(`<test test={'foo'} />`).code).toBe(`{type:'test',props:{test:'foo'}}`)
        expect(transform(`<test test={123} />`).code).toBe(`{type:'test',props:{test:123}}`)
        expect(transform(`<test foo bar="test" />`).code).toBe(`{type:'test',props:{foo:true,bar:"test"}}`)
        expect(transform(`<test
foo
bar="test"
/>`).code).toBe(`{type:'test',props:{foo:true,bar:"test"}}`)
        expect(transform(`<test
 foo
bar="test"
/>`).code).toBe(`{type:'test',props:{foo:true,bar:"test"}}`)
        expect(transform(`<test {...{}} />`).code).toBe(`{type:'test',props:{...{}}}`)
        expect(transform(`<test {...{}} test />`).code).toBe(`{type:'test',props:{...{},test:true}}`)
        expect(transform(`<test
{...{}}
test />`).code).toBe(`{type:'test',props:{...{},test:true}}`)
        expect(transform(`<test foo='' />`).code).toBe(`{type:'test',props:{foo:''}}`)
      })
      test('dash', () => {
        expect(transform(`<test foo-bar />`).code).toBe(`{type:'test',props:{'foo-bar':true}}`)
        expect(transform(`<test foo-bar='' />`).code).toBe(`{type:'test',props:{'foo-bar':''}}`)
      })
      test('getter', () => {
        expect(transform(`<test get:foo />`).code).toBe(`{type:'test',props:{foo:true}}`)
        expect(transform(`<test get:foo="test" />`).code).toBe(`{type:'test',props:{foo:"test"}}`)
        expect(transform(`<test get:foo='test' />`).code).toBe(`{type:'test',props:{foo:'test'}}`)
        expect(transform(`<test get:foo={1 + 1} />`).code).toBe(`{type:'test',props:{get foo(){return 1 + 1}}}`)
        expect(transform(`<test get:foo={1 + 1} bar />`).code).toBe(`{type:'test',props:{get foo(){return 1 + 1},bar:true}}`)
        expect(transform(`<test get:foo-bar={1 + 1} />`).code).toBe(`{type:'test',props:{get 'foo-bar'(){return 1 + 1}}}`)

        expect(transform(`<test set:foo />`).code).toBe(`{type:'test',props:{foo:true}}`)
        expect(transform(`<test set:foo="test" />`).code).toBe(`{type:'test',props:{foo:"test"}}`)
        expect(transform(`<test set:foo={1 + 1} />`).code).toBe(`{type:'test',props:{foo:1 + 1}}`)
      })
      test('with children', () => {
        expect(transform(`<test foo>bar</test>`).code).toBe(`{type:'test',props:{foo:true,children:'bar'}}`)
        expect(transform(`<test children="foo">bar</test>`).code).toBe(`{type:'test',props:{children:'bar'}}`)
        expect(transform(`<test children="foo">{1}{2}</test>`).code).toBe(`{type:'test',props:{children:[1,2]}}`)
        expect(transform(`<test foo children="foo" bar>bar</test>`).code).toBe(`{type:'test',props:{foo:true,bar:true,children:'bar'}}`)
      })
    })
    it('should add parentheses', () => {
      expect(transform('() => <div />').code).toBe("() => ({type:'div'})")
      expect(transform('() => (<div />)').code).toBe("() => ({type:'div'})")
      expect(transform('() => ( <div /> )').code).toBe("() => ( {type:'div'} )")
      expect(transform('() => <>123</>').code).toBe("() => ['123']")
    });
  })
  describe('deep type', () => {
    it('should render deep', () => {
      expect(transform("const foo = { bar: 'test' };const test = <foo.bar />").code)
        .toBe("const foo = { bar: 'test' };const test = {type:foo.bar}")
      expect(transform("const foo = { bar: { baz: 'test' } };const test = <foo.bar.baz />").code)
        .toBe("const foo = { bar: { baz: 'test' } };const test = {type:foo.bar.baz}")
    });
  })
  describe('source map', () => {
    test('simple', () => {
      const data = transform(`<div />`, { jsFile: 'index.js', jsxFile: 'index.jsx' })
      expect(data.code).toEqual("{type:'div'}")
      expect(data.map).toEqual({
        file: 'index.js',
        mappings: "AAAA,OAAC,CAAC,CAAC,EAAC",
        names: [],
        sources: ["index.jsx"],
        sourcesContent: [`<div />`],
        version: 3
      })
    })
  })
})
