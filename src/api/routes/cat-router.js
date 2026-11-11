import express from 'express';
import {
  deleteCat,
  getAllCats,
  getCatById,
  postCat,
  putCat,
} from '../controllers/cat-controller.js';

import {createThumbnail, upload} from '../middlewares/upload.js';
import {authenticateToken} from '../middlewares/authentication.js';
import {body, param} from 'express-validator';
import {validationErrors} from '../middlewares/error-handlers.js';

const catRouter = express.Router();
catRouter.use(authenticateToken);

// Kaikki /api/v1/cats reitit
catRouter
  .route('/')
  .get(getAllCats)
  .post(
    upload.single('image'),
    body('cat_name')
      .trim()
      .isLength({min: 2, max: 90})
      .withMessage('must be between 2 and 90 characters'),
    body('weight')
      .isFloat({gt: 0})
      .withMessage('must be a number greater than zero'),
    body('birthdate')
      .optional({values: 'falsy'})
      .isISO8601()
      .withMessage('must be a valid date'),
    body('image')
      .custom((value, {req}) => Boolean(req.file))
      .withMessage('an image file is required'),
    validationErrors,
    createThumbnail,
    postCat
  );

// Kaikki /api/v1/cats/:id reitit
catRouter
  .route('/:id')
  .get(param('id').isNumeric(), validationErrors, getCatById)
  .delete(param('id').isNumeric(), validationErrors, deleteCat)
  .put(
    param('id').isNumeric().withMessage('must be a numeric cat ID'),
    body('cat_name')
      .optional()
      .trim()
      .isLength({min: 2, max: 90})
      .withMessage('must be between 2 and 90 characters'),
    body('weight')
      .optional()
      .isFloat({gt: 0})
      .withMessage('must be a number greater than zero'),
    body('birthdate')
      .optional({values: 'falsy'})
      .isISO8601()
      .withMessage('must be a valid date'),
    body('owner')
      .optional()
      .isInt({min: 1})
      .withMessage('must be a valid user ID'),
    validationErrors,
    putCat
  );

export default catRouter;

// Expressin middleware on kerros, joka käsittelee pyyntöä
// ennen kuin se pääsee reitille tai komtrolleriin

// 1. lisätään ensin oma tyhmä logger middleware
// reittikohtainen esimerkki

// 2. kaikille reiteillle on määritelty request time middleware joka saa muuttaa req objektia

// 3. Varsinainen tehtävänanto on käyttää Multeria
//  Multer on yksi tällainen middleware, joka osaa lukea multipart/form-data -pyynnöt ja tallentaa tiedostot serverille

// Myöhemmin lisätään esim. autentikointi, virheenkäsittely.

// upload.single('file'):
// tallentaa tiedoston esim. uploads/-kansioon ja
// lisää req.file-olion, jossa on esim.:

// {
//   fieldname: 'file',           // formin "name"
//   originalname: 'image.jpg',   // alkuperäinen nimi
//   encoding: '7bit',
//   mimetype: 'image/jpeg',
//   destination: 'uploads/',     // mihin tallennettiin
//   filename: 'a8f9234bd12.jpg', // generoitu nimi levyllä
//   path: 'uploads/a8f9234bd12.jpg',
//   size: 12345
// }

// Kaikki muut kentät (cat_name, weight, …) menevät  req.body-olioon.
