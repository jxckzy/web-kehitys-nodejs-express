import {
  addCat,
  findCatById,
  findCatByUserId,
  listAllCats,
  modifyCat,
  removeCat,
} from '../models/cat-model.js';

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

const getCatById = async (req, res) => {
  // 1. Haetaan kissa modelilta ID:n perusteella
  const cat = await findCatById(req.params.id);

  // 2. Jos kissaa ei löydy, palautetaan 404
  if (!cat) {
    return res.status(404).json({message: 'Kissaa ei löytynyt'});
  }

  // 3. Jos kissa löytyy, palautetaan sen tiedot
  res.json(cat);
};

const getCatsByUserId = async (req, res) => {
  const user = res.locals.user;
  if (user.role !== 'admin' && Number(req.params.id) !== Number(user.user_id)) {
    return res.status(403).json({message: 'You can only view your own cats'});
  }
  const cats = await findCatByUserId(req.params.id);
  res.json(cats);
};

const postCat = async (req, res) => {
  console.log('request', req.body);
  // const id = addCat(req.body);
  // res.status(201).json({cat_id: id});
  console.log(req.file);
  console.log(req.file.filename);
  req.body.filename = req.file.filename;
  req.body.owner = res.locals.user.user_id;

  const result = await addCat(req.body);
  if (result) {
    res.status(201);
    res.json({message: 'Cat added!', result});
  } else {
    res.sendStatus(400);
  }
};

const deleteCat = async (req, res) => {
  const id = Number(req.params.id);
  const user = res.locals.user;
  const result = await removeCat(id, user);
  if (result) {
    return res.json({message: 'Cat removed!'});
  }
  const cat = await findCatById(id);
  if (cat && user.role !== 'admin' && Number(cat.owner) !== Number(user.user_id)) {
    return res.status(403).json({message: 'You can only delete your own cats'});
  }
  res.status(404).json({error: 404, message: 'Not found.'});
};

const putCat = async (req, res) => {
  const user = res.locals.user;
  const allowedFields =
    user.role === 'admin'
      ? ['cat_name', 'weight', 'owner', 'filename', 'birthdate']
      : ['cat_name', 'weight', 'filename', 'birthdate'];
  if (!Object.keys(req.body).some((field) => allowedFields.includes(field))) {
    return res.status(400).json({message: 'No valid cat fields provided'});
  }

  const id = Number(req.params.id);
  const result = await modifyCat(req.body, id, user);
  if (result) {
    return res.json({message: 'Cat updated!'});
  }
  const cat = await findCatById(id);
  if (cat && user.role !== 'admin' && Number(cat.owner) !== Number(user.user_id)) {
    return res.status(403).json({message: 'You can only update your own cats'});
  }
  res.status(404).json({message: 'Cat not found'});
};

export {getAllCats, getCatById, getCatsByUserId, postCat, deleteCat, putCat};
