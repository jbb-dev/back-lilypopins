const express = require('express');
const conversationRouter = express.Router();
const cors = require('cors');
const conversationManager = require('../controller/conversationManager');

conversationRouter.use(cors())

conversationRouter.get('/:idConversation', conversationManager.getOneConversation, conversationManager.makeMessageIsRead)
conversationRouter.post('/user/:userId/newMessage', conversationManager.postMessage)
conversationRouter.get('/find/:userId', conversationManager.getConversationId)
conversationRouter.get('/:userId/unreadMsg', conversationManager.countUnreadMessages)
    


module.exports = conversationRouter;