// Middleware, joka lisää request-objektiin aikaleiman

const requestTime = (req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
};

export default requestTime;
