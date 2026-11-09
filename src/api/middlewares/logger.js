// Oma tyhmä middleware
// next() kutsutaan, kun halutaan siirtyä seuraavaan middlewareen
// tai reitin käsittelijään

const logger = (req, res, next) => {
  console.log('Middleware on suoritettu');
  next();
};

export default logger;
