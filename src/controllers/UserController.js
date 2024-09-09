const connection = require('../database/connection')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')

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
        try {
            const { name, email, password, picture } = request.body;

            if(name && email && password){
                const nameCheck = name.length
                const emailCheck = email.length
                const passwordCheck = password.length

                if((nameCheck >= 5 && nameCheck <= 18)&&(emailCheck <= 30)&&(passwordCheck >= 8 && passwordCheck <= 20)){
                    const regexName = /^[a-zA-Z0-9]+$/
                    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    const regexSpace = /\s/

                    if(regexName.test(name) && regexEmail.test(email) && !regexSpace.test(name)){
                        const existingEmail = await connection('users').where('email', email).first()

                        if(!existingEmail){
                            const id = crypto.randomBytes(4).toString('HEX');
                    
                            // Criptografar email e senha em paralelo
                            const salt = await bcrypt.genSalt(10);
                            const [hashedPassword] = await Promise.all([
                                bcrypt.hash(password, salt),
                            ]);
                    
                            // Adicionar timeout para a operação de inserção
                            const insertPromise = connection('users').insert({
                                id,
                                name,
                                email,
                                password: hashedPassword,
                                picture
                            });
                    
                            const timeoutPromise = new Promise((_, reject) =>
                                setTimeout(() => reject(new Error('Timeout reached')), 10000) // Timeout de 10 segundos
                            );
                    
                            await Promise.race([insertPromise, timeoutPromise]);
                    
                            return response.status(200).json({ message: 'Usuário criado com sucesso' });
                        }
                    }
                }
            }
            return response.status(400).json({ error: 'Operação não permitida.' });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ error: 'Erro interno do servidor.' });
        }
    },

    async delete(request, response) {
        try {
            const authorization = request.headers.authorization;
    
            if (authorization === "Kuromi") {
                const { id } = request.params;
    
                // Adicionar timeout para a operação de exclusão
                const deletePromise = connection('users').where('id', id).delete();
    
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout reached')), 5000) // Timeout de 5 segundos
                );
    
                await Promise.race([deletePromise, timeoutPromise]);
    
                return response.status(200).json({ message: 'Usuário deletado com sucesso.' });
            }
            return response.status(400).json({ error: 'Operação não permitida.' });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ error: 'Erro interno do servidor.' });
        }
    }
}