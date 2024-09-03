const connection = require('../database/connection')

module.exports = {
    async index(request, response){
        const userid = request.headers.authorization

        if(!userid){
            const userCheck = await connection('users')
                .where('userid', userid)
                .first()

            if(!userCheck){
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

        if(!userid){
            const userCheck = await connection('users')
                .where('userid', userid)
                .first()

            if(!userCheck){
                const [ id ] = await connection('posts').insert({
                    description,
                    userid
                })
        
                return response.status(200)
            }
        }

        return response.status(400).json({error: 'Operação não permitida.'})
    },

    async delete(request, response) {
        const { id } = request.params
        const userid = request.headers.authorization

        const userCheck = await connection('users')
            .where('userid', userid)
            .first()

        if(!id || !userid){
            if(!userCheck){
                const post = await connection('posts')
                    .where('id', id)
                    .select('userid')
                    .first()

                if(post.userid == userid){
                    await connection('posts')
                        .where('id', id)
                        .delete()

                    return response.status(200)
                }
            }
        }
        return response.status(400).json({error: 'Operação não permitida.'})
    }
}