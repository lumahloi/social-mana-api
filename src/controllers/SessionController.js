const connection = require('../database/connection')
const bcrypt = require('bcryptjs')
const check = require('./CheckController')

module.exports = {
    async create (request, response) {
        try {
            const { email, password } = request.body
            const userInfo = await check.check('users', 'email', email)

            if(userInfo.length == 0){
                return response.status(400).json({error: 'Não foi encontrado e-mail com esta conta'})
            } else {
                const isPasswordValid = await bcrypt.compare(password, userInfo[0].password);
                if (!isPasswordValid) {
                    return response.status(400).json({ error: 'Senha inválida, tente novamente.' });
                }
            }
            const { id, name, picture } = userInfo[0]
            return response.json({id, name, picture})
        } catch (e) {
            console.error(error);
            return response.status(500).json({ error: 'Erro interno do servidor.' })
        }
    },

    async delete(response){
        connection.query("DELETE * FROM users", function (err) {
            if (err)
                return err
        })

        connection.query("DELETE * FROM posts", function (err) {
            if (err)
                return err
        })

        connection.query("DELETE * FROM likes", function (err) {
            if (err)
                return err
        })

        connection.query("DELETE * FROM dislikes", function (err) {
            if (err)
                return err
        })

        connection.query("DELETE * FROM comments", function (err) {
            if (err)
                return err
        })

        return response.status(200).json({ message: 'Tudo deletado com sucesso' });
    }
}