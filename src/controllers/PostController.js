import connection from '../database/connection'
import check from './CheckController'

module.exports = {
    async index(request, response) {
        const userid = request.headers.authorization

        if (userid) {
            //ver se informaçao existe
            const userCheck = await check.check('users', 'id', userid)

            if (userCheck) {
                const { page = 1 } = request.query

                function getCount() {
                    return new Promise((resolve, reject) => {
                        connection.query("SELECT COUNT(id) FROM posts", function (err, result) {
                            if (err) {
                                return reject(err)
                            }
                            resolve(result[0]['COUNT(id)']);
                        });
                    });
                }

                const count = await getCount()

                function getPosts() {
                    return new Promise((resolve, reject) => {
                        connection.query("SELECT P.id, P.description, U.name, U.picture FROM posts as P INNER JOIN users as U ON P.userid = U.id ORDER BY P.id DESC LIMIT 15 OFFSET ?", [(page - 1) * 15], function (err, result) {
                            if (err) {
                                console.error(err);
                                return;
                            }
                            resolve(result)
                        });
                    })
                }

                const posts = await getPosts()

                response.header('X-Total-Count', count)
                return response.json(posts)
            }
        }
        return response.status(400).json({ error: 'Operação não permitida.' })
    },

    async create(request, response) {
        const { description } = request.body
        const userid = request.headers.authorization

        if (userid && description) {
            if (description.trim().length > 0) {
                //ver se informaçao existe
                const userCheck = await check.check('users', 'id', userid)

                if (userCheck) {
                    connection.query("INSERT INTO posts (description, userid) VALUES (?, ?)", [description, userid], function (err) {
                        if (err) {
                            console.log(err)
                            return
                        }
                    })

                    return response.status(200).json({ message: 'Post criado com sucesso.' });
                }
            } else {
                return response.status(400).json({ message: 'Insira caracteres válidos.' })
            }
        }
        return response.status(400).json({ message: 'Operação não permitida.' })
    },

    async delete(request, response) {
        const { id } = request.params
        const userid = request.headers.authorization

        if (id && userid) {
            //ver se ambas informações existem
            const userCheck = await check.check('users', 'id', userid)
            const postCheck = await check.check('posts', 'id', id)

            if (userCheck && postCheck) {
                if(postCheck[0].userid == userid){
                    const deletePromise = connection.query("DELETE FROM posts where id = ?", [id])
    
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Timeout reached')), 5000) // Timeout de 5 segundos
                    );
        
                    await Promise.race([deletePromise, timeoutPromise]);
    
                    return response.status(200).json({ message: 'Post deletado com sucesso' });
                }
            }
        }
        return response.status(400).json({ error: 'Operação não permitida.' })
    }
}