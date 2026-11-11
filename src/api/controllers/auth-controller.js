import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {findUserByUsername} from '../models/user-model.js';
import 'dotenv/config';
import process from 'node:process';

const postLogin = async (req, res) => {
  const user = await findUserByUsername(req.body.username);
  if (!user) {
    res.sendStatus(401);
    return;
  }

  const passwordMatch = await bcrypt.compare(req.body.password, user.password);
  if (!passwordMatch) {
    res.sendStatus(401);
    return;
  }

  const userWithNoPassword = {
    user_id: user.user_id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
  };

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
