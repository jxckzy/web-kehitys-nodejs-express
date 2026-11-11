import express from 'express';
import {
  deleteUser,
  getAllUsers,
  getUserById,
  postUser,
  putUser,
} from '../controllers/user-controller.js';
import {getCatsByUserId} from '../controllers/cat-controller.js';

const userRouter = express.Router();

userRouter.route('/').get(getAllUsers).post(postUser);
userRouter.get('/:id/cats', getCatsByUserId);
userRouter.route('/:id').get(getUserById).put(putUser).delete(deleteUser);

export default userRouter;
