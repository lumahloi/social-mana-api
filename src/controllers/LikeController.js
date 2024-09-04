const connection = require('../database/connection')
const check = require('./CheckController')

module.exports = {
    async index(request, response) {
        const userid = request.headers.authorization;
        const { postid } = request.params;

        if(userid && postid){
            //ver se ambas informações existem
            const userCheck = check.check('users', userid)
            const postCheck = check.check('posts', postid)

            if(userCheck && postCheck){
                // Obtém a contagem de likes para o post
                const likeResult = await connection('likes')
                    .where('postid', postid)
                    .count()
                    .first();
            
                // Ajusta o nome da chave de 'count(*)' para 'count'
                const like = {
                    count: parseInt(likeResult['count(*)'], 10)
                };
            
                // Verifica se o usuário deu like no post
                const liked = await connection('likes')
                    .where('userid', userid)
                    .where('postid', postid)
                    .first();
            
                let jsonFinal;
            
                // Adiciona a informação de se o usuário deu like ou não
                if (liked) {
                    jsonFinal = { ...like, liked: true };
                } else {
                    jsonFinal = { ...like, liked: false };
                }
                return response.status(200).json(jsonFinal);
            }
        }
        return response.status(400).json("Operação não permitida.")
    },

    async create(request, response){
        const { postid } = request.params
        const userid = request.headers.authorization

        if(postid && userid){
            //ver se ambas informações existem
            const userCheck = check.check('users', userid)
            const postCheck = check.check('posts', postid)

            if(postCheck && userCheck){
                //ver se ja nao existe like no post
                const likeCheck = await connection('likes')
                    .where('postid', postid)
                    .where('userid', userid)
                    .first()

                if(!likeCheck){
                    //ver se o usuario nao deu dislike previamente
                    const checkDislike = await connection('dislikes')
                        .where('postid', postid)
                        .where('userid', userid)
                        .first()
                        
                    if(!checkDislike){
                        await connection('likes').insert({
                            userid,
                            postid
                        })
                        return response.status(200).json({ message: 'Dado like no post com sucesso.' });
                    }
                }
            }
        }
        return response.status(400).json({error: 'Operação não permitida.'})
    },

    async delete(request, response){
        const userid = request.headers.authorization
        const { postid } = request.params

        //não ser nulo
        if(postid && userid){ 
            //ver se ambas informações existem
            const userCheck = check.check('users', userid)
            const postCheck = check.check('posts', postid)

            if(userCheck && postCheck){
                //ver se o like existe
                const unlike = await connection('likes')
                    .where('userid', userid)
                    .where('postid', postid)
                    .first()

                if(unlike){
                    await connection('likes')
                        .where('userid', userid)
                        .where('postid', postid)
                        .first()
                        .delete()

                    return response.status(200).json({ message: 'Like deletado com sucesso.' });
                }
            }
        }
        return response.status(400).json({error: 'Operação não permitida.'})
    },
}