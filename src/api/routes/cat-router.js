import express from 'express';
import {
  deleteCat,
  getAllCats,
  getCatById,
  postCat,
  putCat,
} from '../controllers/cat-controller.js';
import logger from '../middlewares/logger.js';

// Multer and sharp middleware for handling file uploads
import multer from 'multer';
import {createThumbnail} from '../middlewares/upload.js';
const upload = multer({dest: 'uploads/'});

const catRouter = express.Router();

// Kaikki /api/v1/cats reitit
catRouter
  .route('/')
  .get(logger, getAllCats)
  .post(upload.single('image'), createThumbnail, postCat);

// Kaikki /api/v1/cats/:id reitit
catRouter.route('/:id').get(getCatById).delete(deleteCat).put(putCat);

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
