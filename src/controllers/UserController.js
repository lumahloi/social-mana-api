const connection = require('../database/connection')
const crypto = require('crypto')

module.exports = {
    async index (request, response) {
        const authorization = request.headers.authorization

        if(authorization == "Kuromi"){
            const users = await connection('users')
                //.select(['users.id', 'users.name'])
                .select('*')
    
            return response.json(users)
        }
        return response.status(400).json({error: 'Operação não permitida.'})
    },
    
    async create(request, response) {
        const {name, email, password, picture} = request.body
        const id = crypto.randomBytes(4).toString('HEX')
        const newPass = crypto.hash('sha512', password)
        const newEmail = crypto.hash('sha512', email)

        await connection('users').insert({
            id,
            name,
            newEmail,
            newPass,
            picture
        })
        return response.status(200)
    },

    async delete(request, response) {
        const authorization = request.headers.authorization

        if(authorization == "Kuromi"){
            const { id } = request.params
    
            await connection('users')
                .where('id', id)
                .select('id')
                .first()
    
            await connection('users').where('id', id).delete()
    
            return response.status(200)
        }
        return response.status(400).json({error: 'Operação não permitida.'})
    }
}