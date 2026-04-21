const {isPlainObject} = require('./native-utils');

// A tag function to be used with string templates.  Example: pluralize`${count} item`
function pluralize(strings, count) {
  return strings.join(count) + (count === 1 ? '' : 's');
}

function describeDataType(value) {
  if (value === null) {
    return 'null'
  } else if (value === undefined) {
    return 'undefined';
  } else if (Array.isArray(value)) {
    return 'an array';
  } else if (isPlainObject(value)) {
    return 'an object';
  } else if (Number.isNaN(value)) {
    return 'NaN';
  } else if (value === Infinity || value === -Infinity) {
    return `${value}`;
  }
  else {
    const dataType = typeof value;

    switch(dataType.charAt(0).toLowerCase()) {
      case 'a':
      case 'e':
      case 'i':
      case 'o':
      case 'u':
        return `an ${dataType}`;
      default:
        return `a ${dataType}`;
    }
  }
}

function describeRepeatedItemsInArray(array) {
  const counts = array.reduce((acc, itemInArray) => {
    const key = String(itemInArray);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .filter(([itemInArray, count]) => count > 1)
    .map(([itemInArray]) => itemInArray)
    .join(', ');
}

module.exports = {
  pluralize,
  describeDataType,
  describeRepeatedItemsInArray,
};
