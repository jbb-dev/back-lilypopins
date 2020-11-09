const models = require('../models');
const { Op } = require("sequelize");
const jwtUtils = require('../utils/jwt-utils');

module.exports = {

    getConversationId : function (req, res) {
        // Getting auth header
        let headerAuth  = req.headers['authorization'];
        let userId      = jwtUtils.getUserId(headerAuth);
    
        if (userId < 0)
            return res.status(400).json({ 'error': 'wrong token' });

        // Get informations from front-end
        let contactedParentId = req.params.idUser

        // Search conversationId
        models.Conversation
        .findOne({
            where : {
                [Op.or] : [{user1 : userId, user2 : contactedParentId}, {user1 : contactedParentId, user2 : userId}]
                },
            attributes : ['id']
            })
        .then(conversationFound => {
            if (!conversationFound) {
                res.status(400).json({'error' : `Aucune conversation n'existe`})
                }
            else {
                res.status(200).json(conversationFound)}
            })
        .catch(err => res.status(500).json({'error': `Impossible de créer le nouveau message dans la nouvelle conversation => ${err}`}))       

    },

    getOneConversation : function (req, res) {
        // Getting auth header
        let headerAuth  = req.headers['authorization'];
        let userId      = jwtUtils.getUserId(headerAuth);
    
        if (userId < 0)
            return res.status(400).json({ 'error': 'wrong token' });

        // Get informations from front-end
        let contactedParentId = req.params.idConversation

        //Get the conversation
        models.Conversation
        .findOne({
            where : {
                [Op.or] : [{user1 : userId, user2 : contactedParentId}, {user1 : contactedParentId, user2 : userId}]
                },
            include : [{
                model : models.Message
                },{
                model : models.User,
                where  : {
                    [Op.not] : [{id : userId}] 
                },
                attributes : ['id', 'firstname']
                }]
            })
        .then(conversationFound => {
            if (conversationFound) {
                res.status(200).json(conversationFound)
                }
            else {
                res.status(400).json({ 'error': 'Aucune conversation trouvée' })
                }
        })
        .catch(err => res.status(500).json({'error': `Impossible d'accéder à la conversation => ${err}`}))       
    },

    postMessage : function (req, res) {
        // Getting auth header
        let headerAuth  = req.headers['authorization'];
        let userId      = jwtUtils.getUserId(headerAuth);
    
        if (userId < 0)
            return res.status(400).json({ 'error': 'wrong token' });

        // Get informations from front-end
        let contactedParentId = req.params.idConversation
        let text = req.body.message

        //Get the conversation
        models.Conversation
        .findOne({
            where : {
                [Op.or] : [{user1 : userId, user2 : contactedParentId}, {user1 : contactedParentId, user2 : userId}]
                },
            })
        .then(conversationFound => {
            if (conversationFound) {
                let message = models.Message
                .create({
                    text : text,
                    senderId : userId,
                    recipientId : contactedParentId,
                    ConversationId : conversationFound.id
                    })
                .then(res.status(200).send('new message created'))
                .catch(err => res.status(500).json({'error': `Impossible de créer le nouveau message dans la conversation => ${err}`})) }
            else {
                res.status(400).json({ 'error': 'Aucune conversation trouvée' })
                }
        })
        .catch(err => res.status(500).json({'error': `Impossible d'accéder à la conversation => ${err}`}))       
    }

}