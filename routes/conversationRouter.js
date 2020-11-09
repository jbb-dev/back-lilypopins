const express = require('express');
const conversationRouter = express.Router();
const cors = require('cors');
const conversationManager = require('../utils/conversationManager');

conversationRouter.use(cors())

conversationRouter.get('/:idConversation', conversationManager.getOneConversation)
conversationRouter.post('/:idConversation/newMessage', conversationManager.postMessage)
    


module.exports = conversationRouter;