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
      </>`).code).toBe(`[
      ]`)

      expect(transform(`<>
      
      </>`).code).toBe(`[
      
      ]`)

      expect(transform(`<>
      
      
      </>`).code).toBe(`[
      
      
      ]`)
    })
    test('inline children', () => {
      expect(transform(`(<>test</>)`).code).toBe("(['test'])")

      expect(transform(`(<>
      
      test
      
      </>)`).code).toBe(`([
      
      'test'
      
      ])`)

      expect(transform(`(<>
      
      test1
      
      test2
      
      </>)`).code).toBe(`([
      
      'test1'+
      
      'test2'
      
      ])`)

      expect(transform('<>\\</>').code).toBe("['\\\\']")
      expect(transform("<>'</>").code).toBe("['\\'']")

      expect(transform(`(<>
      
      test1\\
      
      test2'
      
      test3"
      
      </>)`).code).toBe(`([
      
      'test1\\\\'+
      
      'test2\\''+
      
      'test3"'
      
      ])`)
    })
  })
  describe('element', () => {
    test('empty', () => {
      expect(transform(`<test/>`).code).toBe("{type: 'test'}")
      expect(transform(`<test />`).code).toBe("{type: 'test' }")
      expect(transform(`<test   />`).code).toBe("{type: 'test'   }")
      expect(transform(`<test></test>`).code).toBe("{type: 'test'}")
      expect(transform(`<test>
</test>`).code).toBe(`{type: 'test'
}`)
      expect(transform(`<test>

</test>`).code).toBe(`{type: 'test'

}`)
    })
    test('inline children', () => {
      expect(transform('<test>foo</test>').code).toBe("{type: 'test', children: ['foo']}")
      expect(transform(`<test>
  foo
</test>`).code).toBe(`{type: 'test', children: [
  'foo'
]}`)
      expect(transform(`<test>

  foo
  
</test>`).code).toBe(`{type: 'test', children: [

  'foo'
  
]}`)
      expect(transform(`<test>

  foo
  
  bar
  
</test>`).code).toBe(`{type: 'test', children: [

  'foo'+
  
  'bar'
  
]}`)
    })
    test('element children', () => {
      expect(transform('<foo><bar /></foo>').code).toBe("{type: 'foo', children: [{type: 'bar' }]}")
      expect(transform(`<foo
test>
<bar />
</foo>`).code).toBe(`{type: 'foo', props: {
test: true}, children: [
{type: 'bar' }
]}`)
    })
    test('props', () => {
      expect(transform(`<test test/>`).code).toBe(`{type: 'test', props: {test: true}}`)
      expect(transform(`<test
test/>`).code).toBe(`{type: 'test', props: {
test: true}}`)
      expect(transform(`<test test />`).code).toBe(`{type: 'test', props: {test: true} }`)
      expect(transform(`<test test='foo' />`).code).toBe(`{type: 'test', props: {test: 'foo'} }`)
      expect(transform(`<test test="foo" />`).code).toBe(`{type: 'test', props: {test: "foo"} }`)
      expect(transform(`<test test="foo\\" />`).code).toBe(`{type: 'test', props: {test: "foo\\\\"} }`)
      expect(transform(`<test test={'foo'} />`).code).toBe(`{type: 'test', props: {test: 'foo'} }`)
      expect(transform(`<test test={123} />`).code).toBe(`{type: 'test', props: {test: 123} }`)
      expect(transform(`<test foo bar="test" />`).code).toBe(`{type: 'test', props: {foo: true, bar: "test"} }`)
      expect(transform(`<test
foo
bar="test"
/>`).code).toBe(`{type: 'test', props: {
foo: true,
bar: "test"}
}`)
      expect(transform(`<test
 foo
bar="test"
/>`).code).toBe(`{type: 'test', props: {
 foo: true,
bar: "test"}
}`)
      expect(transform(`<test {...{}} />`).code).toBe(`{type: 'test', props: {...{}} }`)
      expect(transform(`<test {...{}} test />`).code).toBe(`{type: 'test', props: {...{}, test: true} }`)
      expect(transform(`<test
{...{}}
test />`).code).toBe(`{type: 'test', props: {
...{},
test: true} }`)
    })
  })
})
