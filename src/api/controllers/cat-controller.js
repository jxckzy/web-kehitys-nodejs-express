import {
  addCat,
  findCatById,
  findCatByUserId,
  listAllCats,
  modifyCat,
  removeCat,
} from '../models/cat-model.js';
import {createHttpError} from '../middlewares/error-handlers.js';

const getAllCats = async (req, res) => {
  // res.json(listAllCats());
  const cats = await listAllCats();
  // esimerkki siitä että middleware on muokannut req-objektia
  res.json({
    message: 'Kissat haettu onnistuneesti ja aikaleima on lisätty',
    time: req.requestTime,
    data: cats,
  });
};

const getCatById = async (req, res, next) => {
  // 1. Haetaan kissa modelilta ID:n perusteella
  const cat = await findCatById(req.params.id);

  // 2. Jos kissaa ei löydy, palautetaan 404
  if (!cat) {
    return next(createHttpError(404, 'Kissaa ei löytynyt'));
  }

  // 3. Jos kissa löytyy, palautetaan sen tiedot
  res.json(cat);
};

const getCatsByUserId = async (req, res, next) => {
  const user = res.locals.user;
  if (user.role !== 'admin' && Number(req.params.id) !== Number(user.user_id)) {
    return next(createHttpError(403, 'You can only view your own cats'));
  }
  const cats = await findCatByUserId(req.params.id);
  res.json(cats);
};

const postCat = async (req, res, next) => {
  // check if file is rejected by multer
  if (!req.file) {
    return next(createHttpError(400, 'Invalid or missing file'));
  }

  console.log('request', req.body);
  // const id = addCat(req.body);
  // res.status(201).json({cat_id: id});
  console.log(req.file);
  console.log(req.file.filename);
  req.body.filename = req.file.filename;
  req.body.owner = res.locals.user.user_id;

  const result = await addCat(req.body);
  if (!result) {
    return next(createHttpError(500, 'Could not save cat'));
  }
  res.status(201).json({message: 'New media item added', ...result});
};

const deleteCat = async (req, res, next) => {
  const id = Number(req.params.id);
  const user = res.locals.user;
  const result = await removeCat(id, user);
  if (result) {
    return res.json({message: 'Cat removed!'});
  }
  const cat = await findCatById(id);
  if (
    cat &&
    user.role !== 'admin' &&
    Number(cat.owner) !== Number(user.user_id)
  ) {
    return next(createHttpError(403, 'You can only delete your own cats'));
  }
  return next(createHttpError(404, 'Cat not found'));
};

const putCat = async (req, res, next) => {
  const user = res.locals.user;
  const allowedFields =
    user.role === 'admin'
      ? ['cat_name', 'weight', 'owner', 'filename', 'birthdate']
      : ['cat_name', 'weight', 'filename', 'birthdate'];
  if (!Object.keys(req.body).some((field) => allowedFields.includes(field))) {
    return next(createHttpError(400, 'No valid cat fields provided'));
  }

  const id = Number(req.params.id);
  const result = await modifyCat(req.body, id, user);
  if (result) {
    return res.json({message: 'Cat updated!'});
  }
  const cat = await findCatById(id);
  if (
    cat &&
    user.role !== 'admin' &&
    Number(cat.owner) !== Number(user.user_id)
  ) {
    return next(createHttpError(403, 'You can only update your own cats'));
  }
  return next(createHttpError(404, 'Cat not found'));
};

export {getAllCats, getCatById, getCatsByUserId, postCat, deleteCat, putCat};
