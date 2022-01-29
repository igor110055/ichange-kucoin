module.exports = (queryNeeds, query) => {
  let result = {};
  queryNeeds.forEach((item) => {
    if (query[item] !== undefined && query[item] !== '') {
      result[item] = query[item];
    }
  });

  return result;
};
