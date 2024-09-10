const connection = require('../database/connection')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
require('dotenv').config()

module.exports = {
    async index(request, response) {
        const authorization = request.headers.authorization

        if (authorization == process.env.AUTHORIZATION) {
            connection.query('SELECT * FROM users', (err, rows) => {
                if (err) {
                    return response.status(500).json({ error: 'Erro no servidor.' })
                }
                return response.json(rows)
            })
        } else {
            return response.status(400).json({ error: 'Operação não permitida.' })
        }
    },

    async create(request, response) {
        const { name, email, password, picture } = request.body;

        if (name && email && password) {
            const nameCheck = name.length;
            const emailCheck = email.length;
            const passwordCheck = password.length;

            if ((nameCheck >= 5 && nameCheck <= 18) && (emailCheck <= 30) && (passwordCheck >= 8 && passwordCheck <= 20)) {
                const regexName = /^[a-zA-Z0-9]+$/;
                const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const regexSpace = /\s/;

                if (regexName.test(name) && regexEmail.test(email) && !regexSpace.test(name)) {
                    try {
                        let existingEmail
                        connection.query('SELECT * FROM users WHERE email = ?', [email], function (err, result) {
                            if (err) throw err;
                            existingEmail = result
                        });

                        if (!existingEmail.length) {
                            const id = crypto.randomBytes(4).toString('HEX');

                            // Criptografar email e senha em paralelo
                            const salt = await bcrypt.genSalt(10);
                            const hashedPassword = await bcrypt.hash(password, salt);

                            const insertPromise = connection.promise().query('INSERT INTO users (name, email, password, picture) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, picture]);

                            const timeoutPromise = new Promise((_, reject) =>
                                setTimeout(() => reject(new Error('Timeout reached')), 10000) // Timeout de 10 segundos
                            );

                            await Promise.race([insertPromise, timeoutPromise]);

                            return response.status(200).json({ message: 'Usuário criado com sucesso' });
                        } else {
                            return response.status(400).json({ error: 'Email já cadastrado.' });
                        }
                    } catch (err) {
                        return response.status(500).json({ error: 'Erro no servidor.' });
                    }
                } else {
                    return response.status(400).json({ error: 'Insira informações sem caracteres especiais.' });
                }
            } else {
                return response.status(400).json({ error: 'Insira informações dentro do limite de caracteres.' });
            }
        } else {
            return response.status(400).json({ error: 'Insira nome e emails válidos.' });
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