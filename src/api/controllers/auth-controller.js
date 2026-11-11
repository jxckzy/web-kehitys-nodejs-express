import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {findUserByUsername} from '../models/user-model.js';
import 'dotenv/config';
import process from 'node:process';
import {createHttpError} from '../middlewares/error-handlers.js';

const postLogin = async (req, res, next) => {
  const {username, password} = req.body;
  if (typeof username !== 'string' || typeof password !== 'string') {
    return next(createHttpError(400, 'Username and password are required'));
  }

  const user = await findUserByUsername(username);
  if (!user) {
    return next(createHttpError(401, 'Invalid username or password'));
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return next(createHttpError(401, 'Invalid username or password'));
  }

  const userWithNoPassword = {
    user_id: user.user_id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
  };

  if (!process.env.JWT_SECRET) {
    return next(createHttpError(500, 'Authentication is not configured'));
  }

  const token = jwt.sign(userWithNoPassword, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
  res.json({user: userWithNoPassword, token});
};

const getMe = async (req, res, next) => {
  console.log('getMe', res.locals.user);
  if (res.locals.user) {
    return res.json({message: 'token ok', user: res.locals.user});
  }
  return next(createHttpError(401, 'Authentication required'));
};

export {postLogin, getMe};
