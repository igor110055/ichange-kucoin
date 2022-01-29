module.exports = (err, req, res, next) => {
  let { message, status } = err;
  res.statusCode = status
  return res.json({
    error: {
      message,
      status: status || 500,
    },
  });
};
