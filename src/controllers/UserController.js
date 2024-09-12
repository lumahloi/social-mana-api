import createConnection from '../database/connection.js'
import { check } from './CheckController.js'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import dotenv from 'dotenv'
dotenv.config()

export const UserController = {
    async index(request, response) {
        let connection
        try {
            connection = await createConnection()
            const authorization = request.headers.authorization;

            if (authorization === process.env.AUTHORIZATION) {
                const [rows] = await connection.execute('SELECT * FROM users')
                return response.status(200).json(rows)
            } else {
                return response.status(401).json({ message: 'Operação não permitida.' })
            }
        } catch (error) {
            console.error('Erro ao listar usuários:', error)
            return response.status(500).json({ error: 'Erro no servidor, tente novamente mais tarde.' })
        } finally {
            if (connection) {
                await connection.end()
            }
        }
    },

    async create(request, response) {
        let connection
        try {
            connection = await createConnection()

            const { name, email, password, picture } = request.body

            if (name && email && password) {
                const nameCheck = name.length
                const emailCheck = email.length
                const passwordCheck = password.length

                if ((nameCheck >= 5 && nameCheck <= 18) && (emailCheck <= 30) && (passwordCheck >= 8 && passwordCheck <= 20)) {
                    const regexName = /^[a-zA-Z0-9]+$/
                    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    const regexSpace = /\s/

                    if (regexName.test(name) && regexEmail.test(email) && !regexSpace.test(name)) {

                        // Verificar se o email já está cadastrado
                        const existingEmail = await check('users', 'email', email)
                        if (existingEmail.length === 0) {
                            const id = crypto.randomBytes(4).toString('hex')  // Use 'hex' para o ID corretamente

                            // Criptografar senha
                            const salt = await bcrypt.genSalt(10)
                            const hashedPassword = await bcrypt.hash(password, salt)

                            // Inserir novo usuário
                            await connection.query(
                                'INSERT INTO users (id, name, email, password, picture) VALUES (?, ?, ?, ?, ?)', 
                                [id, name, email, hashedPassword, picture]
                            )

                            return response.status(201).json({ message: 'Usuário criado com sucesso' })
                        } else {
                            return response.status(400).json({ message: 'Email já cadastrado.' })
                        }
                    } else {
                        return response.status(400).json({ message: 'Insira nome sem caracteres especiais e email válido.' })
                    }
                } else {
                    return response.status(400).json({ message: 'Insira informações dentro do limite de caracteres.' })
                }
            } else {
                return response.status(400).json({ message: 'Insira nome, email e senha.' })
            }
        } catch (error) {
            console.error('Erro ao criar usuário:', error)
            return response.status(500).json({ error: 'Erro no servidor, tente novamente mais tarde.' })
        } finally {
            if (connection) {
                await connection.end()
            }
        }
    },

    async delete(request, response) {
        let connection
        try {
            connection = await createConnection()
            const authorization = request.headers.authorization;

            if (authorization === process.env.AUTHORIZATION) {
                const { id } = request.params

                const deletePromise = connection.query("DELETE FROM users WHERE id = ?", [id])

                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout reached')), 5000) // Timeout de 5 segundos
                )

                await Promise.race([deletePromise, timeoutPromise])

                return response.status(200).json({ message: 'Usuário deletado com sucesso.' })
            } else {
                return response.status(401).json({ message: 'Operação não permitida.' })
            }
        } catch (error) {
            console.error('Erro ao deletar usuário:', error)
            return response.status(500).json({ error: 'Erro no servidor, tente novamente mais tarde.' })
        } finally {
            if (connection) {
                await connection.end()
            }
        }
    }
}
