import jwt from 'jsonwebtoken';
import 'dotenv/config';
import process from 'node:process';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) {
    return res.status(401).json({message: 'Authentication required'});
  }
  try {
    res.locals.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({message: 'Invalid or expired token'});
  }
};

export {authenticateToken};
