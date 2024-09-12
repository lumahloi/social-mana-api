import createConnection from '../database/connection.js';
export const BdUserController = {
    async create(response) {
        let connection;
        try {
            connection = await createConnection();

            // Inserir novo usuário
            await connection.query(
                'ALTER TABLE users MODIFY COLUMN id VARCHAR(9) PRIMARY KEY, MODIFY COLUMN name VARCHAR(45) NOT NULL, MODIFY COLUMN email VARCHAR(45) NOT NULL, MODIFY COLUMN password VARCHAR(60) NOT NULL, MODIFY COLUMN picture VARCHAR(10); ALTER TABLE posts MODIFY COLUMN id INT AUTO_INCREMENT PRIMARY KEY, MODIFY COLUMN description VARCHAR(300) NOT NULL, MODIFY COLUMN userid VARCHAR(10) NOT NULL, ADD CONSTRAINT fk_posts_users FOREIGN KEY(userid) REFERENCES users(id); ALTER TABLE likes MODIFY COLUMN id INT AUTO_INCREMENT PRIMARY KEY, MODIFY COLUMN userid VARCHAR(10) NOT NULL, MODIFY COLUMN postid INT NOT NULL, ADD CONSTRAINT fk_likes_users FOREIGN KEY(userid) REFERENCES users(id), ADD CONSTRAINT fk_likes_posts FOREIGN KEY(postid) REFERENCES posts(id); ALTER TABLE dislikes MODIFY COLUMN id INT AUTO_INCREMENT PRIMARY KEY, MODIFY COLUMN userid VARCHAR(10) NOT NULL, MODIFY COLUMN postid INT NOT NULL, ADD CONSTRAINT fk_dislikes_users FOREIGN KEY(userid) REFERENCES users(id), ADD CONSTRAINT fk_dislikes_posts FOREIGN KEY(postid) REFERENCES posts(id);'
            );
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
