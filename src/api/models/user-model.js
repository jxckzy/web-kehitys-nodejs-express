import promisepool from '../../utils/database.js';

const listAllUsers = async () => {
  const [rows] = await promisepool.execute(
    'SELECT user_id, name, username, role FROM wsk_users'
  );
  return rows;
};

const findUserById = async (id) => {
  const [rows] = await promisepool.execute(
    'SELECT user_id, name, username, role FROM wsk_users WHERE user_id = ?',
    [id]
  );
  return rows[0] ?? false;
};

const findUserByUsername = async (username) => {
  const [rows] = await promisepool.execute(
    'SELECT * FROM wsk_users WHERE username = ?',
    [username]
  );
  return rows[0];
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

const modifyUser = async (id, user, actingUser) => {
  const allowedFields =
    actingUser.role === 'admin'
      ? ['name', 'username', 'email', 'password', 'role']
      : ['name', 'username', 'email', 'password'];
  const fields = Object.keys(user).filter((field) =>
    allowedFields.includes(field)
  );
  if (fields.length === 0) {
    return false;
  }

  const assignments = fields.map((field) => `\`${field}\` = ?`).join(', ');
  const values = fields.map((field) => user[field]);
  const isAdmin = actingUser.role === 'admin';
  const sql = isAdmin
    ? `UPDATE wsk_users SET ${assignments} WHERE user_id = ?`
    : `UPDATE wsk_users SET ${assignments} WHERE user_id = ? AND user_id = ?`;
  const params = isAdmin
    ? [...values, id]
    : [...values, id, actingUser.user_id];
  const [result] = await promisepool.execute(sql, params);
  if (result.affectedRows > 0) {
    return true;
  }

  const [rows] = isAdmin
    ? await promisepool.execute(
        'SELECT user_id FROM wsk_users WHERE user_id = ?',
        [id]
      )
    : await promisepool.execute(
        'SELECT user_id FROM wsk_users WHERE user_id = ? AND user_id = ?',
        [id, actingUser.user_id]
      );
  return rows.length > 0;
};

const removeUser = async (id, actingUser) => {
  const isAdmin = actingUser.role === 'admin';
  const connection = await promisepool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute('DELETE FROM wsk_cats WHERE owner = ?', [id]);
    const sql = isAdmin
      ? 'DELETE FROM wsk_users WHERE user_id = ?'
      : 'DELETE FROM wsk_users WHERE user_id = ? AND user_id = ?';
    const params = isAdmin ? [id] : [id, actingUser.user_id];
    const [result] = await connection.execute(sql, params);

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

export {
  listAllUsers,
  findUserById,
  findUserByUsername,
  addUser,
  modifyUser,
  removeUser,
};
