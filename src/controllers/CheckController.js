const connection = require('../database/connection')

module.exports = {
    async check(tableName, id){
        return await connection(tableName).where('id', id).first()
    },
}