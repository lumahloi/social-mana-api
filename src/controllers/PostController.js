const connection = require('../database/connection')
const check = require('./CheckController')

module.exports = {
    async index(request, response){
        const userid = request.headers.authorization

        if(userid){
            //ver se informaçao existe
            const userCheck = check.check('users', userid)

            if(userCheck){
                const { page = 1 } = request.query

                const [ count ] = await connection('posts').count()

                const posts = await connection('posts')
                    .join('users', 'users.id', '=', 'posts.userid')
                    .limit(9)
                    .offset((page - 1) * 9)
                    .select(['posts.id', 'posts.description', 'users.name', 'users.picture'])
                    .orderBy('posts.id', 'desc')
                
                response.header('X-Total-Count', count['count(*)'])

                return response.json(posts)
            }
        }
        return response.status(400).json({error: 'Operação não permitida.'})
    },

    async create(request, response) {
        const { description } = request.body
        const userid = request.headers.authorization

        if(userid && description){
            //ver se informaçao existe
            const userCheck = check.check('users', userid)

            if(userCheck){
                await connection('posts').insert({
                    description,
                    userid
                })
                return response.status(200).json({ message: 'Post criado com sucesso.' });
            }
        }
        return response.status(400).json({error: 'Operação não permitida.'})
    },

    async delete(request, response) {
        const { id } = request.params
        const userid = request.headers.authorization

        if(id && userid){
            //ver se ambas informações existem
            const userCheck = check.check('users', userid)
            const postCheck = check.check('posts', postid)

            if(userCheck && postCheck){
                const post = await connection('posts')
                    .where('id', id)
                    .select('userid')
                    .first()

                if(post.userid == userid){
                    await connection('posts')
                        .where('id', id)
                        .delete()

                    return response.status(200).json({ message: 'Post deletado com sucesso' });
                }
            }
        }
        return response.status(400).json({error: 'Operação não permitida.'})
    }
}