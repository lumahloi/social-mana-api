const connection = require('../database/connection')
const crypto = require('crypto')

module.exports = {
    async create (request, response) {
        const { email, password } = request.body

        const userInfo = await connection('users')
            .where('email', crypto.hash('sha512', email))
            .select('id', 'name', 'password', 'picture')
            .first()

        if(!userInfo){
            return response.status(400).json({error: 'Não foi encontrado e-mail esta conta'})
        } else {
            if(crypto.hash('sha512', password) != userInfo.password){
                return response.status(400).json({error: 'Senha inválida, tente novamente.'})
            }
        }

        const { id, name, picture } = userInfo

        return response.json({id, name, picture})
    }
}