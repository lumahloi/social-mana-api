import express from 'express'

import UserController from './controllers/UserController'
import PostController from './controllers/PostController'
import SessionController from './controllers/SessionController'
import LikeController from './controllers/LikeController'
import DislikeController from './controllers/DislikeController'

const routes = express.Router()

routes.post('/users', UserController.create)

routes.get('/posts', PostController.index)
routes.post('/posts', PostController.create)
routes.delete('/posts/:id', PostController.delete)

routes.post('/sessions', SessionController.create)

routes.get('/likes/:postid', LikeController.index)     
routes.post('/likes/:postid', LikeController.create)       
routes.delete('/likes/:postid', LikeController.delete)         

routes.get('/dislikes/:postid', DislikeController.index)   
routes.post('/dislikes/:postid', DislikeController.create)        
routes.delete('/dislikes/:postid', DislikeController.delete)

module.exports = routes;