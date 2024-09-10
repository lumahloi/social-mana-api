const express = require('express')

const UserController = require('./controllers/UserController')
const PostController = require('./controllers/PostController')
const SessionController = require('./controllers/SessionController')
const LikeController = require('./controllers/LikeController')
const DislikeController = require('./controllers/DislikeController')

const routes = express.Router()

routes.get('/users', UserController.index)
routes.post('/users', UserController.create)
routes.delete('/users/:id', UserController.delete)

routes.get('/posts', PostController.index)
routes.post('/posts', PostController.create)
routes.delete('/posts/:id', PostController.delete)

routes.post('/sessions', SessionController.create)
routes.delete('/sessions', SessionController.delete)

routes.get('/likes/:postid', LikeController.index)     
routes.post('/likes/:postid', LikeController.create)       
routes.delete('/likes/:postid', LikeController.delete)         

routes.get('/dislikes/:postid', DislikeController.index)   
routes.post('/dislikes/:postid', DislikeController.create)        
routes.delete('/dislikes/:postid', DislikeController.delete)

module.exports = routes;