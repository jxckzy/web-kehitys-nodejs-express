import {
  addCat,
  findCatById,
  listAllCats,
  modifyCat,
  removeCat,
} from '../models/cat-model.js';

const getAllCats = (req, res) => {
  // res.json(listAllCats());
  const cats = listAllCats();
  // esimerkki siitä että middleware on muokannut req-objektia
  res.json({
    message: 'Kissat haettu onnistuneesti ja aikaleima on lisätty',
    time: req.requestTime,
    data: cats,
  });
};

const getCatById = (req, res) => {
  // 1. Haetaan ID URL-parametrista ja muunnetaan numeroksi
  const id = Number(req.params.id);

  // 2. Haetaan kissa modelilta
  const cat = findCatById(id);

  // 3. Jos kissaa ei löydy, palautetaan 404
  if (!cat) {
    return res.status(404).json({message: 'Kissaa ei löytynyt'});
  }

  // 4. Jos kissa löytyy, palautetaan sen tiedot
  res.json(cat);
};

const postCat = (req, res) => {
  console.log('request', req.body);
  // const id = addCat(req.body);
  // res.status(201).json({cat_id: id});
  console.log(req.file);
  console.log(req.file.filename);
  req.body.filename = req.file.filename;

  const result = addCat(req.body);
  if (result) {
    res.status(201);
    res.json({message: 'Cat added!', result});
  } else {
    res.sendStatus(400);
  }
};

const deleteCat = (req, res) => {
  const result = removeCat(Number(req.params.id));
  if (result) {
    res.json({message: 'Cat removed!'});
  } else {
    res.status(404).json({error: 404, message: 'Not found.'});
  }
};

const putCat = (req, res) => {
  // in real life, all input data (req.body) should be validated before using it
  const result = modifyCat(Number(req.params.id), req.body);
  if (result) {
    res.json({message: 'Cat updated!'});
  } else {
    res.status(404).json({error: 404, message: 'Not found.'});
  }
};

export {getAllCats, getCatById, postCat, deleteCat, putCat};
