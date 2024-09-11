import createConnection from '../database/connection.js';

export const check = async (tableName, columnName, columnInfo) => {
    let connection;
    try {
        connection = await createConnection();
        const query = `SELECT * FROM ${tableName} WHERE ${columnName} = ?`;
        const [rows] = await connection.execute(query, [columnInfo]);
        return rows;
    } catch (error) {
        throw new Error('Erro ao executar a consulta: ' + error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};
