import promisepool from '../../utils/database.js';

const listAllUsers = async () => {
  const [rows] = await promisepool.execute(
    'SELECT user_id, name, username, email, role FROM wsk_users'
  );
  return rows;
};

const findUserById = async (id) => {
  const [rows] = await promisepool.execute(
    'SELECT user_id, name, username, email, role FROM wsk_users WHERE user_id = ?',
    [id]
  );
  return rows[0] ?? false;
};

const addUser = async (user) => {
  const {name, username, email, password, role = 'user'} = user;
  const [result] = await promisepool.execute(
    `INSERT INTO wsk_users (name, username, email, password, role)
     VALUES (?, ?, ?, ?, ?)`,
    [name, username, email, password, role]
  );
  return result.affectedRows === 0 ? false : {user_id: result.insertId};
};

const modifyUser = async (id, user) => {
  const allowedFields = ['name', 'username', 'email', 'password', 'role'];
  const fields = Object.keys(user).filter((field) => allowedFields.includes(field));
  if (fields.length === 0) {
    return false;
  }

  const assignments = fields.map((field) => `\`${field}\` = ?`).join(', ');
  const values = fields.map((field) => user[field]);
  const [result] = await promisepool.execute(
    `UPDATE wsk_users SET ${assignments} WHERE user_id = ?`,
    [...values, id]
  );
  if (result.affectedRows > 0) {
    return true;
  }

  const existingUser = await findUserById(id);
  return Boolean(existingUser);
};

const removeUser = async (id) => {
  const connection = await promisepool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute('DELETE FROM wsk_cats WHERE owner = ?', [id]);
    const [result] = await connection.execute(
      'DELETE FROM wsk_users WHERE user_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return false;
    }

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export {listAllUsers, findUserById, addUser, modifyUser, removeUser};
