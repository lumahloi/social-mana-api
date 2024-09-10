import connection from '../database/connection.js';

const check = async (tableName, columnName, columnInfo) => {
    try {
        const query = `SELECT * FROM ?? WHERE ?? = ?`;
        const values = [tableName, columnName, columnInfo];

        return new Promise((resolve, reject) => {
            connection.query(query, values, function (err, result) {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    } catch (error) {
        throw new Error('Erro ao executar a consulta: ' + error.message);
    }
};

export default { check };
