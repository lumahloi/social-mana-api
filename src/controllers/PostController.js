const connection = require('../database/connection')
const check = require('./CheckController')

module.exports = {
    async index(request, response){
        const userid = request.headers.authorization
        const postid = request.headers.postid

        //quando quiser post: postid vai ser nulo
        //quando quiser comentário: postid vai ter o id do post

        if(userid){
            //ver se informaçao existe
            const userCheck = await check.check('users', userid)
            let count
            let posts
            
            if(userCheck){
                const { page = 1 } = request.query
                if(postid){
                    //o post existe?
                    const postCheck = await check.check('posts', postid)
        
                    if(postCheck){
                        //retornar qt de comms
                        [ count ] = await connection('posts')
                        .where('posts.id', '!=', postid)
                        .andWhere('posts.postid', postid)
                        .count()

                        //comms pra exibir
                        posts = await connection('posts')
                            .join('users', 'users.id', '=', 'posts.userid')
                            .limit(15)
                            .offset((page - 1) * 15)
                            .where('posts.id', '!=', postid)
                            .andWhere('posts.postid', postid)
                            .select(['posts.id', 'posts.description', 'posts.userid', 'users.name', 'users.picture'])
                            .orderBy('posts.id', 'desc')
                    }
                } else {
                    //retornar qt de posts
                    [ count ] = await connection('posts')
                        .whereRaw('posts.id = posts.postid')
                        .count()
            
                    //retornar posts para exibir
                    posts = await connection('posts as p1')
                        .join('users', 'users.id', '=', 'p1.userid')
                        .leftJoin(
                            connection('posts as p2')
                                .select('p2.postid')
                                .count('p2.id as comment_count')
                                .groupBy('p2.postid')
                                .as('comments'),
                            'comments.postid',
                            '=',
                            'p1.id'
                        )
                        .limit(15)
                        .offset((page - 1) * 15)
                        .whereRaw('p1.id = p1.postid')
                        .select([
                            'p1.id',
                            'p1.description',
                            'p1.userid',
                            'users.name',
                            'users.picture',
                            connection.raw('COALESCE(comments.comment_count, 0) - 1 as comment_count')
                        ])
                        .orderBy('p1.id', 'desc');
                }
                response.header('X-Total-Count', count['count(*)'])
                return response.json(posts)
            }
        }
        return response.status(400).json({error: 'Operação não permitida.'})
    },

    async create(request, response) {
        const { description } = request.body
        const userid = request.headers.authorization
        const postid = request.headers.postid

        if(userid && description){
            //ver se informaçao existe
            const userCheck = await check.check('users', userid)

            if(userCheck){
                const [ id ] = await connection('posts').insert({
                    description,
                    userid,
                }).returning('id')

                if(postid){
                    const postCheck = await check.check('posts', postid)
                    if(postCheck){
                        //se for um comentario
                        await connection('posts')
                        .where('id', id.id)
                        .update({
                            postid: postid 
                        })
                    }
                } else {
                    //se for um post
                    await connection('posts')
                    .where('id', id.id)
                    .update({
                        postid: id.id  
                    })
                }

                return response.status(200).json({message: 'Post criado com sucesso.'});
            }
        }
        return response.status(400).json({error: 'Operação não permitida.'})
    },

    async delete(request, response) {
        const { id } = request.params
        const userid = request.headers.authorization

        if(id && userid){
            //ver se ambas informações existem
            const userCheck = await check.check('users', userid)
            const postCheck = await check.check('posts', id)

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