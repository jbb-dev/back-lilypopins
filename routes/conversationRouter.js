const express = require('express');
const conversationRouter = express.Router();
const cors = require('cors');
const conversationController = require('../controller/conversationController');

conversationRouter.use(cors())

conversationRouter.get('/:idConversation', conversationController.getOneConversation, conversationController.makeMessageIsRead)
conversationRouter.post('/user/:userId/newMessage', conversationController.postMessage)
conversationRouter.get('/find/:userId', conversationController.getConversationId)
conversationRouter.get('/:userId/unreadMsg', conversationController.countUnreadMessages)
    


module.exports = conversationRouter;