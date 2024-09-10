const connection = require('../database/connection')

module.exports = {
    async check(tableName, id){
        connection.query('SELECT * FROM ? WHERE id = ?'), [tableName, id], (err, rows) => {
            if (err) throw err
            return rows
        }
    },
}