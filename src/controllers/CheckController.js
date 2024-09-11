export const check = async (tableName, columnName, columnInfo, connection) => {
    try {
        // Corrigido para usar placeholders corretos
        const query = `SELECT * FROM ?? WHERE ?? = ?`;
        const values = [tableName, columnName, columnInfo];

        // Executar a consulta com placeholders corretos
        const [rows] = await connection.execute(query, values);

        return rows;
    } catch (error) {
        console.error('Erro ao executar a consulta:', error.message);
        throw new Error('Erro ao executar a consulta: ' + error.message);
    }
};
