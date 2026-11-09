// mock data
const cats = [
  {
    cat_id: 8,
    name: 'Miukuuuuuu',
    birthdate: '2026-10-10',
    weight: 78,
    owner: 'Matti',
    image: 'https://placecats.com/310/240',
  },
  {
    cat_id: 3,
    name: 'Kisu',
    birthdate: '2023-10-08',
    weight: 6,
    owner: 'Ulla',
    image: 'https://placecats.com/320/240',
  },
  {
    cat_id: 1,
    name: 'Misu',
    birthdate: '2021-11-18',
    weight: 7,
    owner: 'Ulla',
    image: 'https://placecats.com320/240',
  },
];

const listAllCats = () => {
  return cats;
};

const findCatById = (id) => {
  // Etsitään kissa taulukosta
  // find palauttaa ensimmäisen löytyneen olion tai undefined
  return cats.find((item) => item.cat_id == id);
};

const addCat = (cat) => {
  const {cat_name, weight, owner, filename, birthdate} = cat;
  const newId = cats[0].cat_id + 1;
  cats.unshift({
    cat_id: newId,
    cat_name,
    weight,
    owner,
    filename,
    birthdate,
  });
  return newId;
};

const removeCat = (id) => {
  const index = cats.findIndex((cat) => id === cat.cat_id);
  cats.splice(index, 1);
  // palauttaa true, jos poisto onnistui
  return index !== -1;
};

const modifyCat = (id, newDetails) => {
  const index = cats.findIndex((cat) => id === cat.cat_id);
  // create new object and combine properties/values of two objects inside it
  cats[index] = {...cats[index], ...newDetails};
  // palauttaa true, jos muokkaus onnistui
  return index !== -1;
};

export {listAllCats, findCatById, addCat, removeCat, modifyCat};
