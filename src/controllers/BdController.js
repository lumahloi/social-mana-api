import createConnection from '../database/connection.js';

export const BdController = {
    async index(request, response) {
        let connection;
        try {
            connection = await createConnection();

            // Inserir novo usuário
            await connection.query(
                'ALTER TABLE users MODIFY COLUMN id VARCHAR(9) PRIMARY KEY'
            );
            await connection.query(
                'ALTER TABLE users MODIFY COLUMN name VARCHAR(45) NOT NULL'
            );
            await connection.query(
                'ALTER TABLE users MODIFY COLUMN email VARCHAR(45) NOT NULL'
            );
            await connection.query(
                'ALTER TABLE users MODIFY COLUMN password VARCHAR(60) NOT NULL'
            );
            await connection.query(
                'ALTER TABLE users MODIFY COLUMN picture VARCHAR(10)'
            );
            await connection.query(
                'ALTER TABLE posts MODIFY COLUMN id INT AUTO_INCREMENT PRIMARY KEY'
            );
            await connection.query(
                'ALTER TABLE posts MODIFY COLUMN description VARCHAR(300) NOT NULL'
            );
            await connection.query(
                'ALTER TABLE posts MODIFY COLUMN userid VARCHAR(10) NOT NULL'
            );
            await connection.query(
                'ALTER TABLE posts ADD CONSTRAINT fk_posts_users FOREIGN KEY(userid) REFERENCES users(id)'
            );
            await connection.query(
                'ALTER TABLE likes MODIFY COLUMN id INT AUTO_INCREMENT PRIMARY KEY'
            );
            await connection.query(
                'ALTER TABLE likes MODIFY COLUMN userid VARCHAR(10) NOT NULL'
            );
            await connection.query(
                'ALTER TABLE likes MODIFY COLUMN postid INT NOT NULL'
            );
            await connection.query(
                'ALTER TABLE likes ADD CONSTRAINT fk_likes_users FOREIGN KEY(userid) REFERENCES users(id)'
            );
            await connection.query(
                'ALTER TABLE likes ADD CONSTRAINT fk_likes_posts FOREIGN KEY(postid) REFERENCES posts(id)'
            );
            await connection.query(
                'ALTER TABLE dislikes MODIFY COLUMN id INT AUTO_INCREMENT PRIMARY KEY'
            );
            await connection.query(
                'ALTER TABLE dislikes MODIFY COLUMN userid VARCHAR(10) NOT NULL'
            );
            await connection.query(
                'ALTER TABLE dislikes MODIFY COLUMN postid INT NOT NULL'
            );
            await connection.query(
                'ALTER TABLE dislikes ADD CONSTRAINT fk_dislikes_users FOREIGN KEY(userid) REFERENCES users(id)'
            );
            await connection.query(
                'ALTER TABLE dislikes ADD CONSTRAINT fk_dislikes_posts FOREIGN KEY(postid) REFERENCES posts(id)'
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
