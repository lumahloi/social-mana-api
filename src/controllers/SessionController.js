const connection = require('../database/connection')
const bcrypt = require('bcryptjs')

module.exports = {
    async create (request, response) {
        try {
            const { email, password } = request.body
    
            // Buscar o usuário pelo email
            const userInfo = await connection('users')
                .where('email', email)
                .select('id', 'name', 'password', 'picture')
                .first();

            if(!userInfo){
                return response.status(400).json({error: 'Não foi encontrado e-mail esta conta'})
            } else {
                const isPasswordValid = await bcrypt.compare(password, userInfo.password);
                if (!isPasswordValid) {
                    return response.status(400).json({ error: 'Senha inválida, tente novamente.' });
                }
            }
            const { id, name, picture } = userInfo
            return response.json({id, name, picture})
        } catch (e) {
            console.error(error);
            return response.status(500).json({ error: 'Erro interno do servidor.' })
        }
    },

    async delete(request, response){
        await connection('users')
            .select('*')
            .delete()

        await connection('posts')
            .select('*')
            .delete()

        await connection('likes')
            .select('*')
            .delete()

        await connection('dislikes')
            .select('*')
            .delete()

        return response.status(200).json({ message: 'Tudo deletado com sucesso' });
    }
}