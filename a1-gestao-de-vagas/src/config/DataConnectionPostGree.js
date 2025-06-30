const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

class DataConnectionPostGree {
  async findOneByEmail(email) {
    try {
      const res = await pool.query('SELECT * FROM usuarios_usuario WHERE email = $1', [email]);
      return res.rows[0];
    } catch (err) {
      console.error('Erro no findOneByEmail:', err);
      throw err;
    }
  }

  async updatePassword(email, newPassword) {
    try {
      const res = await pool.query(
        'UPDATE usuarios_usuario SET password = $1 WHERE email = $2 RETURNING *',
        [newPassword, email]
      );
      return res.rows[0];
    } catch (err) {
      console.error('Erro no updatePassword:', err);
      throw err;
    }
  }

  async findApprovallRH(delegado) {
    try {
      let query = `select usr.id, usr.nome, usr.email, usr.tipo, usr.is_active, usr.cargo_id, cg.nome as nome_cargo, usr.setor_id, st.nome as nome_setor
    from usuarios_usuario usr inner join setor st on usr.setor_id = st.id inner join cargo cg on usr.cargo_id = cg.id
    where usr.is_active = true and usr.setor_id = 12`;

      // Adiciona a condição de cargo apenas se não houver delegação
      if (!delegado) {
        query += ` and usr.cargo_id in (16, 17)`;
      }
      const res = await pool.query(query);
      return res.rows;
    } catch (err) {
      console.error('Erro no findApprovallRH:', err);
      throw err;
    }
  }

  async findSuperByUser(idUser) {
    try {
      const query = `
      SELECT
        usrSuper.id,
        usrSuper.nome,
        usrSuper.email,
        usrSuper.tipo,
        usrSuper.is_active,
        usrSuper.cargo_id,
        cg.nome AS nome_cargo,
        usrSuper.setor_id,
        st.nome AS nome_setor,
        usr_filtrado.nome AS nome_direto,
        usr_filtrado.email AS email_direto,
        usr_filtrado.tipo AS tipo_direto,
        usr_filtrado.is_active AS is_active_direto,
        usr_filtrado.cargo_id AS cargo_id_direto,
        usr_filtrado.setor_id AS setor_id_direto
      FROM
        usuarios_usuario AS usrSuper
      INNER JOIN
        (
          SELECT
            nome,
            email,
            tipo,
            is_active,
            cargo_id,
            setor_id
          FROM
            usuarios_usuario
          WHERE
            id = $1
            AND is_active = TRUE
        ) AS usr_filtrado ON usrSuper.setor_id = usr_filtrado.setor_id
         inner join setor st on usrSuper.setor_id = st.id 
         inner join cargo cg on usrSuper.cargo_id = cg.id
      WHERE
        usrSuper.cargo_id IN (16, 17)
        AND usrSuper.is_active = TRUE
    `;
      const res = await pool.query(query, [idUser]);
      return res.rows;
    } catch (err) {
      console.error('Erro no findSuperByUser:', err);
      throw err;
    }
  }
}

module.exports = new DataConnectionPostGree();