const connection = require('../database/connection')

module.exports = {
    async index(request, response) {
        const userid = request.headers.authorization;
        const { postid } = request.params;
    
        // Obtém a contagem de dislikes para o post
        const dislikeResult = await connection('dislikes')
            .where('postid', postid)
            .count()
            .first();
    
        // Verifica se o resultado foi encontrado
        if (dislikeResult) {
            // Ajusta o nome da chave de 'count(*)' para 'count'
            const dislike = {
                count: parseInt(dislikeResult['count(*)'], 10)
            };
    
            // Verifica se o usuário deu like no post
            const disliked = await connection('dislikes')
                .where('userid', userid)
                .where('postid', postid)
                .first();
    
            let jsonFinal;
    
            // Adiciona a informação de se o usuário deu like ou não
            if (disliked) {
                jsonFinal = { ...dislike, disliked: true };
            } else {
                jsonFinal = { ...dislike, disliked: false };
            }
            return response.status(200).json(jsonFinal);
        } else {
            return response.status(400).json("Operação não permitida.");
        }
    },

    async create(request, response){
        const { postid } = request.params
        const userid = request.headers.authorization

        if(postid && userid){
            //verificar se postid e userid são validos
            const postCheck = await connection('posts')
                .where('postid', postid)
                .first()
            
            const userCheck = await connection('users')
                .where('userid', userid)
                .first()

            if(postCheck && userCheck){
                await connection('dislikes').insert({
                    userid,
                    postid
                })
                return response.status(200)
            }
        }
        return response.status(400).json({error: 'Operação não permitida.'})
    },

    async delete(request, response){
        const userid = request.headers.authorization
        const { postid } = request.params

        //não ser nulo
        if(postid && userid){ 
            //verificar se postid e userid são válidos
            const postCheck = await connection('posts')
                .where('postid', postid)
                .first()
            
            const userCheck = await connection('users')
                .where('userid', userid)
                .first()

            if(postCheck && userCheck){
                //ver se o dislike existe
                const undislike = await connection('dislikes')
                    .where('userid', userid)
                    .where('postid', postid)
                    .first()

                if(undislike){
                    await connection('dislikes')
                        .where('userid', userid)
                        .where('postid', postid)
                        .first()
                        .delete()

                    return response.status(200)
                }
            }
        }
        return response.status(400).json({error: 'Operação não permitida.'})
    },
}