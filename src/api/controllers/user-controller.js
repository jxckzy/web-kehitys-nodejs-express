import {
  addUser,
  findUserById,
  listAllUsers,
  modifyUser,
  removeUser,
} from '../models/user-model.js';
import bcrypt from 'bcrypt';
import {createHttpError} from '../middlewares/error-handlers.js';

const getAllUsers = async (req, res) => {
  const users = await listAllUsers();
  res.json(users);
};

const getUserById = async (req, res, next) => {
  const currentUser = res.locals.user;
  if (
    currentUser.role !== 'admin' &&
    Number(req.params.id) !== Number(currentUser.user_id)
  ) {
    return next(createHttpError(403, 'You can only view your own user info'));
  }
  const user = await findUserById(req.params.id);
  if (!user) {
    return next(createHttpError(404, 'User not found'));
  }
  res.json(user);
};

const postUser = async (req, res, next) => {
  const {name, username, email, password} = req.body;
  if (!name || !username || !email || !password) {
    return next(
      createHttpError(400, 'name, username, email and password are required')
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await addUser({
    ...req.body,
    password: hashedPassword,
    role: 'user',
  });
  res.status(201).json({message: 'User added!', result});
};

const putUser = async (req, res, next) => {
  const currentUser = res.locals.user;
  if (
    currentUser.role !== 'admin' &&
    Number(req.params.id) !== Number(currentUser.user_id)
  ) {
    return next(createHttpError(403, 'You can only update your own user info'));
  }

  const allowedFields =
    currentUser.role === 'admin'
      ? ['name', 'username', 'email', 'password', 'role']
      : ['name', 'username', 'email', 'password'];
  const hasValidFields = Object.keys(req.body).some((field) =>
    allowedFields.includes(field)
  );
  if (!hasValidFields) {
    return next(createHttpError(400, 'No valid user fields provided'));
  }

  const updates = {...req.body};
  if (updates.password) {
    updates.password = await bcrypt.hash(updates.password, 10);
  }
  const result = await modifyUser(req.params.id, updates, currentUser);
  if (!result) {
    return next(createHttpError(404, 'User not found'));
  }
  res.json({message: 'User updated!'});
};

const deleteUser = async (req, res, next) => {
  const currentUser = res.locals.user;
  if (
    currentUser.role !== 'admin' &&
    Number(req.params.id) !== Number(currentUser.user_id)
  ) {
    return next(createHttpError(403, 'You can only delete your own user'));
  }

  const result = await removeUser(req.params.id, currentUser);
  if (!result) {
    return next(createHttpError(404, 'User not found'));
  }
  res.json({message: 'User and their cats deleted'});
};

export {getAllUsers, getUserById, postUser, putUser, deleteUser};
