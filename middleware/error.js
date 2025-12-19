const notFound = (req, res, next) => {
  if (req.accepts('html')) {
    return res.status(404).render('errors/404', { title: 'Not Found' });
  }
  res.status(404).json({ message: 'Route Not Found' });
};

const errorHandler = (err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  if (req.accepts('html')) {
    return res.status(status).render('errors/500', { title: 'Error', error: err.message || 'Server Error' });
  }
  res.status(status).json({ message: err.message || 'Server Error' });
};

module.exports = { notFound, errorHandler };
