const connection = require('../database/connection')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const check = require('./CheckController')
require('dotenv').config()

module.exports = {
    async index(request, response) {
        const authorization = request.headers.authorization;

        if (authorization === process.env.AUTHORIZATION) {
            connection.query('SELECT * FROM users', function (err, result) {
                if (err) {
                    return response.status(500).json({ message: 'Erro no servidor, tente novamente mais tarde.' });
                }
                return response.json(result);
            });
        } else {
            return response.status(401).json({ message: 'Operação não permitida.' });
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

                    const existingEmail = await check.check('users', 'email', email)
                    if (existingEmail.length == 0) {
                        const id = crypto.randomBytes(4).toString('HEX');

                        // Criptografar senha em paralelo
                        const salt = await bcrypt.genSalt(10);
                        const hashedPassword = await bcrypt.hash(password, salt);

                        const insertPromise = connection.query('INSERT INTO users (id, name, email, password, picture) VALUES (?, ?, ?, ?, ?)', [id, name, email, hashedPassword, picture], (err) => {
                            if (err) throw err
                        });

                        const timeoutPromise = new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('Timeout reached')), 10000) // Timeout de 10 segundos
                        );

                        await Promise.race([insertPromise, timeoutPromise]);

                        return response.status(200).json({ message: 'Usuário criado com sucesso' });
                    } else {
                        return response.status(400).json({ message: 'Email já cadastrado.' });
                    }
                } else {
                    return response.status(400).json({ message: 'Insira nome sem caracteres especiais e email válido.' });
                }
            } else {
                return response.status(400).json({ message: 'Insira informações dentro do limite de caracteres.' });
            }
        } else {
            return response.status(400).json({ message: 'Insira nome, email e senha.' });
        }
    },

    async delete(request, response) {
        const authorization = request.headers.authorization;

        if (authorization === process.env.AUTHORIZATION) {
            const { id } = request.params;

            const deletePromise = connection.query("DELETE FROM users WHERE id = ? ", [id])

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout reached')), 5000) // Timeout de 5 segundos
            );

            await Promise.race([deletePromise, timeoutPromise]);

            return response.status(200).json({ message: 'Usuário deletado com sucesso.' });
        }
        return response.status(400).json({ message: 'Operação não permitida.' });

    }
}