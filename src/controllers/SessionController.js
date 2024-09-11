import createConnection from '../database/connection.js';
import { check } from './CheckController.js';
import bcrypt from 'bcryptjs';

export const SessionController = {
    async create(request, response) {
        let connection;
        try {
            const { email, password } = request.body;

            connection = await createConnection();
            
            // Usa a conexão para o check
            const userInfo = await check('users', 'email', email, connection);

            if (userInfo.length === 0) {
                return response.status(400).json({ error: 'Não foi encontrado e-mail com esta conta' });
            } else {
                const isPasswordValid = await bcrypt.compare(password, userInfo[0].password);
                if (!isPasswordValid) {
                    return response.status(400).json({ error: 'Senha inválida, tente novamente.' });
                }
            }
            const { id, name, picture } = userInfo[0];
            return response.json({ id, name, picture });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ error: 'Erro interno do servidor.' });
        } finally {
            if (connection) {
                await connection.end();
            }
        }
    },
};
