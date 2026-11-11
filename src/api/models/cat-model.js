import promisepool from '../../utils/database.js';

const listAllCats = async () => {
  const [rows] = await promisepool.query(`
    SELECT wsk_cats.*, wsk_users.name AS owner_name
    FROM wsk_cats
    JOIN wsk_users ON wsk_cats.owner = wsk_users.user_id
  `);
  console.log('rows', rows);
  return rows;
};

const findCatById = async (id) => {
  const [rows] = await promisepool.query(
    `SELECT wsk_cats.*, wsk_users.name AS owner_name
     FROM wsk_cats
     JOIN wsk_users ON wsk_cats.owner = wsk_users.user_id
     WHERE wsk_cats.cat_id = ?`,
    [id]
  );
  console.log('rows', rows);
  if (rows.length === 0) {
    return false;
  }
  return rows[0];
};

const findCatByUserId = async (userId) => {
  const [rows] = await promisepool.execute(
    `SELECT wsk_cats.*, wsk_users.name AS owner_name
     FROM wsk_cats
     JOIN wsk_users ON wsk_cats.owner = wsk_users.user_id
     WHERE wsk_cats.owner = ?`,
    [userId]
  );
  return rows;
};

const addCat = async (cat) => {
  const {cat_name, weight, owner, filename, birthdate} = cat;
  const sql = `INSERT INTO wsk_cats (cat_name, weight, owner, filename, birthdate) VALUES (?, ?, ?, ?, ?)`;
  const params = [cat_name, weight, owner, filename, birthdate];
  const [result] = await promisepool.execute(sql, params);
  console.log('insert query result', result);
  if (result.affectedRows === 0) {
    return false;
  }
  return {cat_id: result.insertId};
};

const removeCat = async (id) => {
  const [rows] = await promisepool.execute(
    'DELETE FROM wsk_cats WHERE cat_id = ?',
    [id]
  );
  console.log('rows', rows);
  if (rows.affectedRows === 0) {
    return false;
  }
  return {message: 'success'};
};

const modifyCat = async (cat, id) => {
  const sql = promisepool.format(`UPDATE wsk_cats SET ? WHERE cat_id = ?`, [
    cat,
    id,
  ]);
  const rows = await promisepool.execute(sql);
  console.log('rows', rows);
  if (rows[0].affectedRows === 0) {
    return false;
  }
  return true;
};

export {
  listAllCats,
  findCatById,
  findCatByUserId,
  addCat,
  removeCat,
  modifyCat,
};
