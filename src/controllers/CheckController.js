export const check = async (tableName, columnName, columnInfo, connection) => {
    try {
        const query = `SELECT * FROM ?? WHERE ?? = ?`;
        const values = [tableName, columnName, columnInfo];

        return new Promise((resolve, reject) => {
            connection.execute(query, values, function (err, result) {
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
