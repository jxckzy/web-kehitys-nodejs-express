import express from 'express';
import catRouter from './routes/cat-router.js';

const router = express.Router();

// bind base url for all cat routes to catRouter
router.use('/cats', catRouter);

// TODO: use use userRouter for all /user endpoints
//router.use('/user', userRouter);

export default router;
