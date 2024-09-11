import createConnection from '../database/connection.js';
import { check } from './CheckController.js';

export const PostController = {
    async index(request, response) {
        const userid = request.headers.authorization;

        if (userid) {
            let connection;
            try {
                const userCheck = await check('users', 'id', userid, connection);

                if (userCheck) {
                    const { page = 1 } = request.query;

                    connection = await createConnection();

                    const getCount = async () => {
                        const [rows] = await connection.execute("SELECT COUNT(id) FROM posts");
                        return rows[0]['COUNT(id)'];
                    };

                    const count = await getCount();

                    const getPosts = async () => {
                        const [rows] = await connection.execute("SELECT P.id, P.description, U.name, U.picture FROM posts as P INNER JOIN users as U ON P.userid = U.id ORDER BY P.id DESC LIMIT 15 OFFSET ?", [(page - 1) * 15]);
                        return rows;
                    };

                    const posts = await getPosts();

                    response.header('X-Total-Count', count);
                    return response.json(posts);
                }
            } catch (error) {
                console.error(error);
                return response.status(500).json({ error: 'Erro no servidor, tente novamente mais tarde.' });
            } finally {
                if (connection) {
                    await connection.end();
                }
            }
        }
        return response.status(400).json({ error: 'Operação não permitida.' });
    },

    async create(request, response) {
        const { description } = request.body;
        const userid = request.headers.authorization;

        if (userid && description) {
            if (description.trim().length > 0) {
                let connection;
                try {
                    const userCheck = await check('users', 'id', userid, connection);

                    if (userCheck) {
                        connection = await createConnection();
                        await connection.execute("INSERT INTO posts (description, userid) VALUES (?, ?)", [description, userid]);
                        return response.status(200).json({ message: 'Post criado com sucesso.' });
                    }
                } catch (error) {
                    console.error(error);
                    return response.status(500).json({ error: 'Erro no servidor, tente novamente mais tarde.' });
                } finally {
                    if (connection) {
                        await connection.end();
                    }
                }
            } else {
                return response.status(400).json({ message: 'Insira caracteres válidos.' });
            }
        }
        return response.status(400).json({ message: 'Operação não permitida.' });
    },

    async delete(request, response) {
        const { id } = request.params;
        const userid = request.headers.authorization;

        if (id && userid) {
            let connection;
            try {
                const userCheck = await check('users', 'id', userid, connection);
                const postCheck = await check('posts', 'id', id, connection);

                if (userCheck && postCheck) {
                    if (postCheck[0].userid === userid) {
                        connection = await createConnection();

                        const deletePromise = connection.execute("DELETE FROM posts WHERE id = ?", [id]);

                        const timeoutPromise = new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('Timeout reached')), 5000) // Timeout de 5 segundos
                        );

                        await Promise.race([deletePromise, timeoutPromise]);

                        return response.status(200).json({ message: 'Post deletado com sucesso' });
                    }
                }
            } catch (error) {
                console.error(error);
                return response.status(500).json({ error: 'Erro no servidor, tente novamente mais tarde.' });
            } finally {
                if (connection) {
                    await connection.end();
                }
            }
        }
        return response.status(400).json({ error: 'Operação não permitida.' });
    }
};
