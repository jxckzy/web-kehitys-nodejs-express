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
import {validationErrors} from '../middlewares/error-handlers.js';
import {body, param} from 'express-validator';

const userRouter = express.Router();

userRouter.route('/').post(
  body('name')
    .isString()
    .trim()
    .isLength({min: 3, max: 200})
    .withMessage('must be between 3 and 200 characters'),
  body('username')
    .isString()
    .trim()
    .isLength({min: 3, max: 50})
    .withMessage('must be between 3 and 50 characters'),
  body('email')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('required')
    .isEmail()
    .withMessage('must be valid email address'),
  body('password')
    .isString()
    .isLength({min: 8, max: 72})
    .withMessage('must be between 8 and 72 characters'),
  validationErrors,
  postUser
);
userRouter.use(authenticateToken);
userRouter.get('/', getAllUsers);
userRouter.get(
  '/:id/cats',
  param('id').isNumeric().withMessage('must be a numeric user ID'),
  validationErrors,
  getCatsByUserId
);
userRouter
  .route('/:id')
  .get(
    param('id').isNumeric().withMessage('must be a numeric user ID'),
    validationErrors,
    getUserById
  )
  .put(
    param('id').isNumeric().withMessage('must be a numeric user ID'),
    body('name')
      .optional()
      .isString()
      .trim()
      .isLength({min: 3, max: 200})
      .withMessage('must be between 3 and 200 characters'),
    body('username')
      .optional()
      .isString()
      .trim()
      .isLength({min: 3, max: 50})
      .withMessage('must be between 3 and 50 characters'),
    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('must be a valid email address'),
    body('password')
      .optional()
      .isString()
      .isLength({min: 8, max: 72})
      .withMessage('must be between 8 and 72 characters'),
    body('role')
      .optional()
      .isIn(['admin', 'user'])
      .withMessage('must be admin or user'),
    validationErrors,
    putUser
  )
  .delete(
    param('id').isNumeric().withMessage('must be a numeric user ID'),
    validationErrors,
    deleteUser
  );

export default userRouter;
