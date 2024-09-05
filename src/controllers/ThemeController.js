const connection = require('../database/connection')

module.exports = {
    async index(request, response){
        return response = await connection('themes').select('*')
    },
}