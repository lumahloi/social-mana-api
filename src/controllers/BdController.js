import createConnection from '../database/connection.js';

export const BdController = {
    async index(request, response) {
        let connection;
        try {
            connection = await createConnection();

            // Remover chave primária existente
            await connection.query('ALTER TABLE users DROP PRIMARY KEY');
            await connection.query('ALTER TABLE posts DROP PRIMARY KEY');
            await connection.query('ALTER TABLE likes DROP PRIMARY KEY');
            await connection.query('ALTER TABLE dislikes DROP PRIMARY KEY');

            // Atualizar colunas e adicionar chaves primárias
            await connection.query(
                'ALTER TABLE users MODIFY COLUMN id VARCHAR(9), MODIFY COLUMN name VARCHAR(45) NOT NULL, MODIFY COLUMN email VARCHAR(45) NOT NULL, MODIFY COLUMN password VARCHAR(60) NOT NULL, MODIFY COLUMN picture VARCHAR(10), ADD PRIMARY KEY (id)'
            );
            await connection.query(
                'ALTER TABLE posts MODIFY COLUMN id INT AUTO_INCREMENT, MODIFY COLUMN description VARCHAR(300) NOT NULL, MODIFY COLUMN userid VARCHAR(10) NOT NULL, ADD PRIMARY KEY (id), ADD CONSTRAINT fk_posts_users FOREIGN KEY(userid) REFERENCES users(id)'
            );
            await connection.query(
                'ALTER TABLE likes MODIFY COLUMN id INT AUTO_INCREMENT, MODIFY COLUMN userid VARCHAR(10) NOT NULL, MODIFY COLUMN postid INT NOT NULL, ADD PRIMARY KEY (id), ADD CONSTRAINT fk_likes_users FOREIGN KEY(userid) REFERENCES users(id), ADD CONSTRAINT fk_likes_posts FOREIGN KEY(postid) REFERENCES posts(id)'
            );
            await connection.query(
                'ALTER TABLE dislikes MODIFY COLUMN id INT AUTO_INCREMENT, MODIFY COLUMN userid VARCHAR(10) NOT NULL, MODIFY COLUMN postid INT NOT NULL, ADD PRIMARY KEY (id), ADD CONSTRAINT fk_dislikes_users FOREIGN KEY(userid) REFERENCES users(id), ADD CONSTRAINT fk_dislikes_posts FOREIGN KEY(postid) REFERENCES posts(id)'
            );

            return response.status(200).json({ message: 'Alterações no banco de dados concluídas com sucesso.' });
        } catch (error) {
            console.error('Erro ao mudar coisas:', error);
            return response.status(500).json({ error: 'Erro no servidor, tente novamente mais tarde.' });
        } finally {
            if (connection) {
                await connection.end();
            }
        }
    },
};
