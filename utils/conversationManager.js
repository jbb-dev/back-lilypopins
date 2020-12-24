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
        let otherUserId = req.params.userId

        // Search conversationId
        models.Conversation
        .findOne({
            where : {
                [Op.or] : [{user1 : userId, user2 : otherUserId}, {user1 : otherUserId, user2 : userId}]
                },
            attributes : ['id']
            })
        .then(conversationFound => {
            if (!conversationFound) {
                res.status(400).json({'error' : `Aucune conversation n'existe`})
                }
            else {
                res.status(200).json(conversationFound.id)}
            })
        .catch(err => res.status(500).json({'error': `Impossible d'accéder à l'information => ${err}`}))       

    },

    getOneConversation : function (req, res, next) {
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
                next()
                }
            else {
                res.status(400).json({ 'error': 'Aucune conversation trouvée' })
                }
        })
        .catch(err => res.status(500).json({'error': `Impossible d'accéder à la conversation => ${err}`}))       
    },


// UPDATE MESSAGES FROM "UNREAD" TO STATUS "READ"
    makeMessageIsRead : function  (req, res) {

        // Getting auth header
        let headerAuth = req.headers['authorization'];
        let user_ID = jwtUtils.getUserId(headerAuth)
        let contactedParentId = req.params.idConversation
        
        if (user_ID < 0)
            return res.status(400).json({ 'error': 'wrong token' });
    
        models
        .Message
        .update(
            {isRead : 1}, 
            { where : {
                [Op.and] : [{recipientId : user_ID}, {senderId : contactedParentId} ]
            },
        })
        .catch((err) => res.status(500).json({ 'error': `Impossible de mettre à jour les messages comme lus` }));
    },

    postMessage : function (req, res) {
        // Getting auth header
        let headerAuth  = req.headers['authorization'];
        let userId      = jwtUtils.getUserId(headerAuth);
    
        if (userId < 0)
            return res.status(400).json({ 'error': 'wrong token' });

        // Get informations from front-end
        let contactedParentId = req.params.userId
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
    },

    countUnreadMessages : function (req, res) {

        // Getting auth header
        let headerAuth  = req.headers['authorization'];
        let userId      = jwtUtils.getUserId(headerAuth);
        
        // Get informations from front-end
        let contactedParentId = req.params.userId
    
        if (userId < 0)
            return res.status(400).json({ 'error': 'wrong token' });

            models.Conversation
            .findOne({
                where : {
                    [Op.or] : [{user1 : userId, user2 : contactedParentId}, {user1 : contactedParentId, user2 : userId}]
                },
                attributes : ['id'],
                include : [{
                    model : models.Message,
                    attributes : ['id']
                    }]
                })
            .then(conversationFound => {
                if (conversationFound) {
                    models.Message
                        .count({
                            where : {
                                ConversationId : conversationFound.id,
                                isRead : false,
                                senderId : contactedParentId
                                }
                            })
                        .then(count => res.status(200).json(count))
                        .catch(err => res.status(500).json({'error': `Impossible de compter le nombre de messages non lus => ${err}`})) 
                }
                else {
                    res.status(400).json({ 'error': 'Aucune conversation trouvée' })  
                    }
                })
            .catch(err => res.status(500).json({'error': `Impossible d'accéder à la conversation => ${err}`}))           
    },

}