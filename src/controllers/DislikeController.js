import createConnection from '../database/connection.js';
import { check } from './CheckController.js';

export const DislikeController = {
    async index(request, response) {
        const userid = request.headers.authorization;
        const { postid } = request.params;

        if (userid && postid) {
            let connection;
            try {
                connection = await createConnection();

                // Verificar usuário e post
                const userCheck = await check('users', 'id', userid, connection);
                const postCheck = await check('posts', 'id', postid, connection);

                if (userCheck && postCheck) {
                    // Contar dislikes
                    const getDisLikeQt = async () => {
                        const [rows] = await connection.execute("SELECT COUNT(id) AS count FROM dislikes WHERE postid = ?", [postid]);
                        return rows[0]['count'];
                    };

                    const count = await getDisLikeQt();

                    // Verificar se o usuário já deu dislike
                    const getIfDisliked = async () => {
                        const [rows] = await connection.execute("SELECT id FROM dislikes WHERE userid = ? AND postid = ?", [userid, postid]);
                        return rows;
                    };

                    const disliked = await getIfDisliked();

                    let jsonFinal;
                    if (disliked.length > 0) {
                        jsonFinal = { count, disliked: true };
                    } else {
                        jsonFinal = { count, disliked: false };
                    }

                    return response.status(200).json(jsonFinal);
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
        return response.status(400).json("Operação não permitida.");
    },

    async create(request, response) {
        const { postid } = request.params;
        const userid = request.headers.authorization;

        if (postid && userid) {
            let connection;
            try {
                connection = await createConnection();

                // Verificar usuário e post
                const userCheck = await check('users', 'id', userid, connection);
                const postCheck = await check('posts', 'id', postid, connection);

                if (postCheck && userCheck) {
                    // Verificar se o usuário já interagiu com o post
                    const checkIfAlreadyInteracted = async (tableName) => {
                        const [rows] = await connection.execute("SELECT * FROM " + tableName + " WHERE postid = ? AND userid = ?", [postid, userid]);
                        return rows;
                    };

                    const likeCheck = await checkIfAlreadyInteracted('dislikes');

                    if (!likeCheck.length) {
                        const dislikeCheck = await checkIfAlreadyInteracted('likes');

                        if (!dislikeCheck.length) {
                            await connection.execute("INSERT INTO dislikes (postid, userid) VALUES (?, ?)", [postid, userid]);
                            return response.status(200).json({ message: 'Dado dislike no post com sucesso.' });
                        } else {
                            return response.status(400).json({ error: 'Operação não permitida. Já existe um like.' });
                        }
                    } else {
                        return response.status(400).json({ error: 'Operação não permitida. Já existe um dislike.' });
                    }
                } else {
                    return response.status(400).json({ error: 'Usuário ou post não encontrado.' });
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
            return response.status(400).json({ error: 'Operação não permitida.' });
        }
    },

    async delete(request, response) {
        const userid = request.headers.authorization;
        const { postid } = request.params;

        if (postid && userid) {
            let connection;
            try {
                connection = await createConnection();

                // Verificar usuário e post
                const userCheck = await check('users', 'id', userid, connection);
                const postCheck = await check('posts', 'id', postid, connection);

                if (userCheck && postCheck) {
                    // Verificar se o usuário deu dislike
                    const getIfDisliked = async () => {
                        const [rows] = await connection.execute("SELECT * FROM dislikes WHERE userid = ? AND postid = ?", [userid, postid]);
                        return rows;
                    };

                    const undislike = await getIfDisliked();

                    if (undislike.length > 0 && undislike[0].userid === userid) {
                        const deletePromise = connection.execute("DELETE FROM dislikes WHERE postid = ? AND userid = ?", [postid, userid]);

                        const timeoutPromise = new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('Timeout reached')), 5000)
                        );

                        await Promise.race([deletePromise, timeoutPromise]);

                        return response.status(200).json({ message: 'Dislike deletado com sucesso' });
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
