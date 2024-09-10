import check from './CheckController.js';
import bcrypt from 'bcryptjs';

export const SessionController = {
    async create(request, response) {
        try {
            const { email, password } = request.body;
            const userInfo = await check.check('users', 'email', email);

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
        }
    },
};
