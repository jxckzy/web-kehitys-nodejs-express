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

const removeCat = async (id, user) => {
  const isAdmin = user.role === 'admin';
  const sql = isAdmin
    ? 'DELETE FROM wsk_cats WHERE cat_id = ?'
    : 'DELETE FROM wsk_cats WHERE cat_id = ? AND owner = ?';
  const params = isAdmin ? [id] : [id, user.user_id];
  const [result] = await promisepool.execute(sql, params);
  return result.affectedRows > 0;
};

const modifyCat = async (cat, id, user) => {
  const allowedFields =
    user.role === 'admin'
      ? ['cat_name', 'weight', 'owner', 'filename', 'birthdate']
      : ['cat_name', 'weight', 'filename', 'birthdate'];
  const fields = Object.keys(cat).filter((field) => allowedFields.includes(field));
  if (fields.length === 0) {
    return false;
  }

  const assignments = fields.map((field) => `\`${field}\` = ?`).join(', ');
  const values = fields.map((field) => cat[field]);
  const isAdmin = user.role === 'admin';
  const sql = isAdmin
    ? `UPDATE wsk_cats SET ${assignments} WHERE cat_id = ?`
    : `UPDATE wsk_cats SET ${assignments} WHERE cat_id = ? AND owner = ?`;
  const params = isAdmin
    ? [...values, id]
    : [...values, id, user.user_id];
  const [result] = await promisepool.execute(sql, params);
  if (result.affectedRows > 0) {
    return true;
  }

  const [rows] = isAdmin
    ? await promisepool.execute('SELECT cat_id FROM wsk_cats WHERE cat_id = ?', [id])
    : await promisepool.execute(
        'SELECT cat_id FROM wsk_cats WHERE cat_id = ? AND owner = ?',
        [id, user.user_id]
      );
  return rows.length > 0;
};

export {
  listAllCats,
  findCatById,
  findCatByUserId,
  addCat,
  removeCat,
  modifyCat,
};
