const {describe, it, before, after, beforeEach, afterEach} = require('node:test');
const assert = require('node:assert/strict');

const {
  cloneDeep,
  flatMapObject,
  hasPath,
  isEmpty,
  isPlainObject,
  sortBy,
  without,
  mapByProperty,
  uniqBy
} = require('../lib/validation/native-utils');

describe('Native utility replacements for lodash', () => {
  it('cloneDeep should deeply clone nested objects and arrays', () => {
    const original = {
      a: 1,
      nested: {b: 2},
      list: [{c: 3}]
    };

    const cloned = cloneDeep(original);
    cloned.nested.b = 20;
    cloned.list[0].c = 30;

    assert.notStrictEqual(cloned, original);
    assert.notStrictEqual(cloned.nested, original.nested);
    assert.notStrictEqual(cloned.list, original.list);
    assert.strictEqual(original.nested.b, 2);
    assert.strictEqual(original.list[0].c, 3);
  });

  it('flatMapObject should flatten one level from object entries', () => {
    const source = {first: 1, second: 2};
    const result = flatMapObject(source, (value, key) => [key, value * 10]);
    assert.deepStrictEqual(result, ['first', 10, 'second', 20]);
  });

  it('hasPath should support direct and nested paths', () => {
    const source = {a: {b: [{c: true}]}, top: 1};
    assert.strictEqual(hasPath(source, 'top'), true);
    assert.strictEqual(hasPath(source, 'a.b[0].c'), true);
    assert.strictEqual(hasPath(source, 'a.missing'), false);
  });

  it('isEmpty should match lodash semantics for common values', () => {
    assert.strictEqual(isEmpty({}), true);
    assert.strictEqual(isEmpty([]), true);
    assert.strictEqual(isEmpty(''), true);
    assert.strictEqual(isEmpty(null), true);
    assert.strictEqual(isEmpty(undefined), true);
    assert.strictEqual(isEmpty(0), true);
    assert.strictEqual(isEmpty({a: 1}), false);
    assert.strictEqual(isEmpty([1]), false);
    assert.strictEqual(isEmpty('x'), false);
  });

  it('isPlainObject should only return true for plain objects', () => {
    assert.strictEqual(isPlainObject({}), true);
    assert.strictEqual(isPlainObject(Object.create(null)), true);
    assert.strictEqual(isPlainObject([]), false);
    assert.strictEqual(isPlainObject(new Date()), false);
    assert.strictEqual(isPlainObject(null), false);
  });

  it('sortBy should order values by iteratee output', () => {
    const values = [{name: 'b'}, {name: 'a'}];
    assert.deepStrictEqual(sortBy(values, value => value.name), [{name: 'a'}, {name: 'b'}]);
  });

  it('without should return values that are not excluded', () => {
    assert.deepStrictEqual(without(['a', 'b', 'c'], 'b'), ['a', 'c']);
    assert.deepStrictEqual(without(['a', 'b', 'c'], 'a', 'c'), ['b']);
  });

  it('mapByProperty should pluck a property from object items', () => {
    const values = [{value: 1}, {value: 2}];
    assert.deepStrictEqual(mapByProperty(values, 'value'), [1, 2]);
  });

  it('uniqBy should preserve order and remove duplicate iteratee results', () => {
    const values = [{a: 1}, {a: 1}, {a: 2}];
    const result = uniqBy(values, JSON.stringify);
    assert.deepStrictEqual(result, [{a: 1}, {a: 2}]);
  });
});
