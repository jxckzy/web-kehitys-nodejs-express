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

  const result = await addCat(req.body);
  if (result) {
    res.status(201);
    res.json({message: 'Cat added!', result});
  } else {
    res.sendStatus(400);
  }
};

const deleteCat = async (req, res) => {
  const result = await removeCat(Number(req.params.id));
  if (result) {
    res.json({message: 'Cat removed!'});
  } else {
    res.status(404).json({error: 404, message: 'Not found.'});
  }
};

const putCat = async (req, res) => {
  // in real life, all input data (req.body) should be validated before using it
  const result = await modifyCat(req.body, Number(req.params.id));
  if (result) {
    res.json({message: 'Cat updated!'});
  } else {
    res.status(404).json({error: 404, message: 'Not found.'});
  }
};

export {
  getAllCats,
  getCatById,
  getCatsByUserId,
  postCat,
  deleteCat,
  putCat,
};
