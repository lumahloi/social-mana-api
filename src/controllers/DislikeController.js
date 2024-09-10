import connection from '../database/connection.js';
import check from './CheckController.js'

module.exports = {
    async index(request, response) {
        const userid = request.headers.authorization;
        const { postid } = request.params;

        if (userid && postid) {
            // Ver se ambas informações existem
            const userCheck = await check.check('users', 'id', userid);
            const postCheck = await check.check('posts', 'id', postid);

            if (userCheck && postCheck) {
                function getDisLikeQt() {
                    return new Promise((resolve, reject) => {
                        connection.query("SELECT COUNT(id) AS count FROM dislikes WHERE postid = ?", [postid], function (err, result) {
                            if (err) {
                                return reject(err);
                            }
                            resolve(result[0]['count']);
                        });
                    });
                }

                const count = await getDisLikeQt();

                function getIfDisliked() {
                    return new Promise((resolve, reject) => {
                        connection.query("SELECT id FROM dislikes WHERE userid = ? AND postid = ?", [userid, postid], function (err, result) {
                            if (err) {
                                return reject(err);
                            }
                            resolve(result);
                        });
                    });
                }

                const disliked = await getIfDisliked();

                let jsonFinal;

                // Adiciona a informação de se o usuário deu like ou não
                if (disliked.length > 0) {
                    jsonFinal = { count, disliked: true };
                } else {
                    jsonFinal = { count, disliked: false };
                }
                return response.status(200).json(jsonFinal);
            }
        }
        return response.status(400).json("Operação não permitida.");
    },

    async create(request, response) {
        const { postid } = request.params;
        const userid = request.headers.authorization;

        function checkIfAlreadyInteracted(tableName) {
            return new Promise((resolve, reject) => {
                const query = "SELECT * FROM ?? WHERE postid = ? AND userid = ?";
                const values = [tableName, postid, userid];
                connection.query(query, values, function (err, result) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(result);
                });
            });
        }

        if (postid && userid) {
            try {
                // Ver se ambas informações existem
                const userCheck = await check.check('users', 'id', userid);
                const postCheck = await check.check('posts', 'id', postid);

                if (postCheck && userCheck) {
                    const likeCheck = await checkIfAlreadyInteracted('dislikes');

                    if (!likeCheck.length) {
                        const dislikeCheck = await checkIfAlreadyInteracted('likes');

                        if (!dislikeCheck.length) {
                            connection.query("INSERT INTO dislikes (postid, userid) VALUES (?, ?)", [postid, userid], function (err) {
                                if (err) {
                                    console.log(err);
                                    return response.status(500).json({ message: 'Erro ao dar dislike no post.' });
                                }
                                return response.status(200).json({ message: 'Dado dislike no post com sucesso.' });
                            });
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
            }
        } else {
            return response.status(400).json({ error: 'Operação não permitida.' });
        }
    },

    async delete(request, response) {
        const userid = request.headers.authorization;
        const { postid } = request.params;
    
        // Não ser nulo
        if (postid && userid) {
            // Ver se ambas informações existem
            const userCheck = await check.check('users', 'id', userid);
            const postCheck = await check.check('posts', 'id', postid);
    
            if (userCheck && postCheck) {
                // Ver se o like existe
                function getIfDisliked() {
                    return new Promise((resolve, reject) => {
                        connection.query("SELECT * FROM dislikes WHERE userid = ? AND postid = ?", [userid, postid], function (err, result) {
                            if (err) {
                                return reject(err);
                            }
                            resolve(result);
                        });
                    });
                }
    
                const undislike = await getIfDisliked();
    
                if (undislike.length > 0 && undislike[0].userid == userid) {
                    const deletePromise = new Promise((resolve, reject) => {
                        connection.query("DELETE FROM dislikes WHERE postid = ? AND userid = ?", [postid, userid], function (err, result) {
                            if (err) {
                                return reject(err);
                            }
                            resolve(result);
                        });
                    });
    
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Timeout reached')), 5000) // Timeout de 5 segundos
                    );
    
                    await Promise.race([deletePromise, timeoutPromise]);
    
                    return response.status(200).json({ message: 'Dislike deletado com sucesso' });
                }
            }
        }
        return response.status(400).json({ error: 'Operação não permitida.' });
    }
    
}