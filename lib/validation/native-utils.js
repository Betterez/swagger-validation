function cloneDeep(value) {
  if (Array.isArray(value)) {
    return value.map(cloneDeep);
  }

  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  if (isPlainObject(value)) {
    return Object.entries(value).reduce((acc, [key, nestedValue]) => {
      acc[key] = cloneDeep(nestedValue);
      return acc;
    }, {});
  }

  return value;
}

function flatMapObject(object, mapper) {
  return Object.entries(object ?? {}).reduce((acc, [key, value]) => {
    const mappedValue = mapper(value, key);
    if (Array.isArray(mappedValue)) {
      acc.push(...mappedValue);
    } else {
      acc.push(mappedValue);
    }
    return acc;
  }, []);
}

function hasPath(object, path) {
  if (typeof path !== 'string' || path.length === 0) {
    return false;
  }

  const normalizedPath = path.replace(/\[(\d+)\]/g, '.$1');
  const pathParts = normalizedPath.split('.').filter(Boolean);
  let currentValue = object;

  for (const pathPart of pathParts) {
    if (currentValue === null || currentValue === undefined || !Object.hasOwn(currentValue, pathPart)) {
      return false;
    }
    currentValue = currentValue[pathPart];
  }

  return true;
}

function isEmpty(value) {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === 'string' || Array.isArray(value)) {
    return value.length === 0;
  }

  if (value instanceof Map || value instanceof Set) {
    return value.size === 0;
  }

  if (isPlainObject(value)) {
    return Object.keys(value).length === 0;
  }

  return true;
}

function isPlainObject(value) {
  if (Object.prototype.toString.call(value) !== '[object Object]') {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
}

function sortBy(array, iteratee) {
  return [...array].sort((left, right) => {
    const leftValue = iteratee(left);
    const rightValue = iteratee(right);
    if (leftValue < rightValue) return -1;
    if (leftValue > rightValue) return 1;
    return 0;
  });
}

function without(array, ...valuesToExclude) {
  const excludedValues = new Set(valuesToExclude);
  return array.filter((value) => !excludedValues.has(value));
}

function mapByProperty(array, propertyName) {
  return array.map((item) => item?.[propertyName]);
}

function uniqBy(array, iteratee) {
  const seen = new Set();
  const uniqueValues = [];

  for (const item of array) {
    const computedValue = iteratee(item);
    if (seen.has(computedValue)) {
      continue;
    }

    seen.add(computedValue);
    uniqueValues.push(item);
  }

  return uniqueValues;
}

module.exports = {
  cloneDeep,
  flatMapObject,
  hasPath,
  isEmpty,
  isPlainObject,
  sortBy,
  without,
  mapByProperty,
  uniqBy
};
