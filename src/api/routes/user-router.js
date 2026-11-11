import express from 'express';
import {
  deleteUser,
  getAllUsers,
  getUserById,
  postUser,
  putUser,
} from '../controllers/user-controller.js';
import {getCatsByUserId} from '../controllers/cat-controller.js';
import {authenticateToken} from '../middlewares/authentication.js';

const userRouter = express.Router();

userRouter.post('/', postUser);
userRouter.use(authenticateToken);
userRouter.get('/', getAllUsers);
userRouter.get('/:id/cats', getCatsByUserId);
userRouter.route('/:id').get(getUserById).put(putUser).delete(deleteUser);

export default userRouter;
