import {
  addUser,
  findUserById,
  listAllUsers,
  modifyUser,
  removeUser,
} from '../models/user-model.js';

const getAllUsers = async (req, res) => {
  const users = await listAllUsers();
  res.json(users);
};

const getUserById = async (req, res) => {
  const user = await findUserById(req.params.id);
  if (!user) {
    return res.status(404).json({message: 'User not found'});
  }
  res.json(user);
};

const postUser = async (req, res) => {
  const {name, username, email, password} = req.body;
  if (!name || !username || !email || !password) {
    return res.status(400).json({
      message: 'name, username, email and password are required',
    });
  }

  const result = await addUser(req.body);
  res.status(201).json({message: 'User added!', result});
};

const putUser = async (req, res) => {
  const allowedFields = ['name', 'username', 'email', 'password', 'role'];
  const hasValidFields = Object.keys(req.body).some((field) =>
    allowedFields.includes(field)
  );
  if (!hasValidFields) {
    return res.status(400).json({message: 'No valid user fields provided'});
  }

  const result = await modifyUser(req.params.id, req.body);
  if (!result) {
    return res.status(404).json({message: 'User not found'});
  }
  res.json({message: 'User updated!'});
};

const deleteUser = async (req, res) => {
  const result = await removeUser(req.params.id);
  if (!result) {
    return res.status(404).json({message: 'User not found'});
  }
  res.json({message: 'User and their cats deleted'});
};

export {getAllUsers, getUserById, postUser, putUser, deleteUser};
