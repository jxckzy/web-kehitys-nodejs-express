import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {findUserByUsername} from '../models/user-model.js';
import 'dotenv/config';
import process from 'node:process';

const postLogin = async (req, res) => {
  const {username, password} = req.body;
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({message: 'Username and password are required'});
  }

  const user = await findUserByUsername(username);
  if (!user) {
    return res.status(401).json({message: 'Invalid username or password'});
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({message: 'Invalid username or password'});
  }

  const userWithNoPassword = {
    user_id: user.user_id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
  };

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({message: 'Authentication is not configured'});
  }

  const token = jwt.sign(userWithNoPassword, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
  res.json({user: userWithNoPassword, token});
};

const getMe = async (req, res) => {
  console.log('getMe', res.locals.user);
  if (res.locals.user) {
    res.json({message: 'token ok', user: res.locals.user});
  } else {
    res.sendStatus(401);
  }
};

export {postLogin, getMe};
