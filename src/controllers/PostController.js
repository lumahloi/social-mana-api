import { connection } from '../database/connection.js';
import { check } from './CheckController.js'; // Assegure-se de que CheckController.js exporta uma função ou objeto chamado 'check'

export const PostController = {
    async index(request, response) {
        const userid = request.headers.authorization;

        if (userid) {
            try {
                // Verifica se a informação existe
                const userCheck = await check('users', 'id', userid);

                if (userCheck) {
                    const { page = 1 } = request.query;

                    const getCount = () => {
                        return new Promise((resolve, reject) => {
                            connection.query("SELECT COUNT(id) FROM posts", (err, result) => {
                                if (err) {
                                    return reject(err);
                                }
                                resolve(result[0]['COUNT(id)']);
                            });
                        });
                    };

                    const count = await getCount();

                    const getPosts = () => {
                        return new Promise((resolve, reject) => {
                            connection.query("SELECT P.id, P.description, U.name, U.picture FROM posts as P INNER JOIN users as U ON P.userid = U.id ORDER BY P.id DESC LIMIT 15 OFFSET ?", [(page - 1) * 15], (err, result) => {
                                if (err) {
                                    console.error(err);
                                    return reject(err);
                                }
                                resolve(result);
                            });
                        });
                    };

                    const posts = await getPosts();

                    response.header('X-Total-Count', count);
                    return response.json(posts);
                }
            } catch (error) {
                console.error(error);
                return response.status(500).json({ error: 'Erro no servidor, tente novamente mais tarde.' });
            }
        }
        return response.status(400).json({ error: 'Operação não permitida.' });
    },

    async create(request, response) {
        const { description } = request.body;
        const userid = request.headers.authorization;

        if (userid && description) {
            if (description.trim().length > 0) {
                try {
                    // Verifica se a informação existe
                    const userCheck = await check('users', 'id', userid);

                    if (userCheck) {
                        connection.query("INSERT INTO posts (description, userid) VALUES (?, ?)", [description, userid], (err) => {
                            if (err) {
                                console.log(err);
                                return response.status(500).json({ message: 'Erro ao criar o post.' });
                            }
                        });

                        return response.status(200).json({ message: 'Post criado com sucesso.' });
                    }
                } catch (error) {
                    console.error(error);
                    return response.status(500).json({ error: 'Erro no servidor, tente novamente mais tarde.' });
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
            try {
                // Verifica se ambas informações existem
                const userCheck = await check('users', 'id', userid);
                const postCheck = await check('posts', 'id', id);

                if (userCheck && postCheck) {
                    if (postCheck[0].userid === userid) {
                        const deletePromise = new Promise((resolve, reject) => {
                            connection.query("DELETE FROM posts WHERE id = ?", [id], (err) => {
                                if (err) {
                                    return reject(err);
                                }
                                resolve();
                            });
                        });

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
            }
        }
        return response.status(400).json({ error: 'Operação não permitida.' });
    }
};
