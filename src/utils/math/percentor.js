module.exports = (price, percent) => {
  const onePercent = price / 100;
  const percentCahnge = 100 - percent;
  return onePercent * percentCahnge;
};
