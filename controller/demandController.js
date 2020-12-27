const models = require('../models');
const { Op } = require("sequelize");
const jwtUtils = require('../utils/jwt-utils')
const nodemailer = require('nodemailer')
const smtpTransport = require('nodemailer/lib/smtp-transport');

const FRONT_URL = process.env.FRONT_URL

const TRANSPORTER_NAME = process.env.TRANSPORTER_NAME
const TRANSPORTER_HOST = process.env.TRANSPORTER_HOST
const TRANSPORTER_PORT =  process.env.TRANSPORTER_PORT
const TRANSPORTER_SECURE =  process.env.TRANSPORTER_SECURE
const TRANSPORTER_AUTH_USER =  process.env.TRANSPORTER_AUTH_USER
const TRANSPORTER_AUTH_PASS =  process.env.TRANSPORTER_AUTH_PASS


module.exports = {

    createDemand : function (req, res, next) {

        // Getting auth header
        let headerAuth  = req.headers['authorization'];
        let userId      = jwtUtils.getUserId(headerAuth);
    
        if (userId < 0)
            return res.status(400).json({ 'error': 'wrong token' });
        
        // Prepare information concerning the new demand :
        let status = 'opened' // by default, a new demand is in opened status
        let contactedParentId = req.body[0] 
        let beginAt = req.body[1] 
        let endAt = req.body[2]
        let text = req.body[3]

        if (beginAt === null || endAt === null || contactedParentId === null) 
            return res.status(400).json({ 'error': 'Des paramètres sont manquants.' });
    
        // Verify if demand exists and if not, create it
        models.Demand
        .findOne({
            where: { 
                senderId : userId,
                contactedParentId : contactedParentId,
                beginAt : beginAt,
                endAt : endAt,
            }
            })
        .then(demand => {
            if (!demand) {
                let newDemand = models.Demand
                    .create({
                        status : status,
                        beginAt : beginAt,
                        endAt : endAt,
                        senderId : userId,
                        contactedParentId : contactedParentId,
                        })
                    .then(newDemand => {
                        newDemand.addUser(userId)
                        newDemand.addUser(contactedParentId)

                        // Check if a conversation already exists between the 2 users and if not, create it
                        models
                        .Conversation
                        .findOne({
                            where : {
                                [Op.or] : [{user1 : userId, user2 : contactedParentId}, {user1 : contactedParentId, user2 : userId}]
                                }
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
                                    .catch(err => res.status(500).json({'error': `Impossible de créer le nouveau message dans la conversation => ${err}`})) 
                                }
                            else {
                               // First creation of the conversation
                                let newConversation = models.Conversation
                                    .create ({
                                        user1 : userId,
                                        user2 : contactedParentId 
                                        })
                                    .then(newConversation => {
                                        newConversation.addUser(userId)
                                        newConversation.addUser(contactedParentId)
                                        // Creation of the new message within de new conversation
                                        let message = models.Message
                                            .create({
                                                text : text,
                                                senderId : userId,
                                                recipientId : contactedParentId,
                                                ConversationId : newConversation.id
                                                })
                                            .catch(err => res.status(500).json({'error': `Impossible de créer le nouveau message dans la nouvelle conversation => ${err}`})) 
                                        })
                                    .catch(err => res.status(500).json({'error': `Impossible de créer la nouvelle conversation => ${err}`})) 
                             }
                            })
                        .catch(err => res.status(500).json({'error': `Impossible de trouver la conversation => ${err}`})) 
                        next()      
                    })
                .catch(err => res.status(500).json({'error': `Impossible de créer la demande. => ${err}`})) 
                } 
            else {
                res.status(409).json({'error' : `Une demande similaire a déjà enregistrée.` })
                }
            })
        .catch(err => res.status(500).json({'error' : `Impossible de vérifier si la demande a déjà été enregistrée. => ${err} ` }))
    },


    // SEND EMAIL TO PARENT WHEN BOOKING 
    sendEmailToParent : function (req, res) {

        let contactedParentId = req.body[0] 

        // Find the email from the parentId
        models.User
        .findOne({
            attributes : ['firstname', 'email'],
            where: { id : contactedParentId }
        })
        .then(user => {
            if (user) {

                //get the user email
                let userEmail = user.dataValues.email
                let userFirstname = user.dataValues.firstname
            
                // prepare message to send
                let message = {
                    from: "lilypopins@test.com",
                    to: userEmail,
                    subject: "Vous avez reçu une demande de garde",
                    text: "Plaintext version of the message",
                    html:`  
                    <head>
                        <meta charset="UTF-8">
                        <title>Vous avez reçu une demande de garde</title>
                        <header style="background-color: violet; height: 200px">
                        <p style="color : blue">Lilypopins - Vous avez reçu une demande de garde</p>
                        </header>
                    </head>
              
                    <body>
                        <p>Vous avez reçu une nouvelle demande de garde. Pour la consulter, connectez-vous dès à présent sur votre compte</p>  
                        <a href=${FRONT_URL}>Se connecter</a>
                    </body>`
                }
            
                // SMTP configuration for message to send
                let transporter = nodemailer.createTransport(new smtpTransport({
                    name: TRANSPORTER_NAME,
                    host: TRANSPORTER_HOST,
                    port: TRANSPORTER_PORT,
                    secure: TRANSPORTER_SECURE, // use TLS
                    auth: {
                        user: TRANSPORTER_AUTH_USER,
                        pass: TRANSPORTER_AUTH_PASS
                    }
                }))
            
                // Verify connection configuration
                transporter.verify(function(error, success) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log(`Server is ready to take our messages to ${userEmail}`);
                    }
                });
            
                // Send message
                var mailOptions = message 
                transporter.sendMail(mailOptions, function (err) {
                    if (err) { 
                        return res.status(500).send({ msg: err.message }) }
                    res.status(200).send('A verification email has been sent to ' + userFirstname + '.')
                }) 
            } 
            else {
                res.status(400).send('aucun utilisateur trouvé sur cette adresse mail')
            }
        })
        .catch(err => res.status(500).json(`erreur : Impossible de récupérer l'email de l'utilisateur ID : ${contactedParentId} => ${err}`))
    },

    getMyDemands : function (req, res) {

        // Getting auth header
        let headerAuth  = req.headers['authorization'];
        let userId      = jwtUtils.getUserId(headerAuth);

        if (userId < 0)
            return res.status(400).json({ 'error': 'wrong token' });

        models
        .Demand
        .findAll({
            where : {
                senderId : userId,
                },
            order: [['id', 'DESC']],
            include : {
                model : models.User,
                where : {
                    [Op.not] : [{id : userId}]
                    },
            attributes : ['firstname', 'avatar', 'id'],

            },

        })
        .then(demandsFound => res.status(200).json(demandsFound))
        .catch(err => res.status(500).json(`erreur : Impossible d'accéder aux demandes de l'utilisateur : ${userId} => ${err}`))
        
    },

    getMyGards : function (req, res) {

        // Getting auth header
        let headerAuth  = req.headers['authorization'];
        let userId      = jwtUtils.getUserId(headerAuth);

        if (userId < 0)
            return res.status(400).json({ 'error': 'wrong token' });

        models
        .Demand
        .findAll({
            where : {
                contactedParentId : userId
            },
            order: [['id', 'DESC']],
            include : {
                model : models.User,
                where : {
                    [Op.not] : [{id : userId}]
                    },
                attributes : ['firstname', 'avatar', 'id'],
            }
        })
        .then(demandsFound => res.status(200).json(demandsFound))
        .catch(err => res.status(500).json(`erreur : Impossible d'accéder aux demandes de l'utilisateur : ${userId} => ${err}`))
        
    },
    
    deleteGard : function (req, res) {

        // Getting auth header
        let headerAuth  = req.headers['authorization'];
        let userId      = jwtUtils.getUserId(headerAuth);

        if (userId < 0)
            return res.status(400).json({ 'error': 'wrong token' });

        // Get params :
        let demandId = req.params.id

        // Delete demand in bdd :
        models
        .Demand
        .destroy({ where : { id : demandId } })
        .then(res.status(200).send(`La demande de garde a bien été supprimée`))
        .catch(err => res.status(500).json(`erreur : Impossible de supprimer la demande de garde : => ${err}`))
        
    },

    acceptGard : function (req, res) {
        // Getting auth header
        let headerAuth  = req.headers['authorization'];
        let userId      = jwtUtils.getUserId(headerAuth);

        if (userId < 0)
            return res.status(400).json({ 'error': 'wrong token' });

        // Get params :
        let demandId = req.params.id
        console.log(demandId)

        models
        .Demand
        .update(
            { status : 'confirmed'},
            { where : { id : demandId } 
        })
        .then(res.status(200).send(`La demande de garde a bien été confirmée, merci !`))
        .catch(err => res.status(500).json(`erreur : Impossible d'accéder à la demande de garde : => ${err}`))

    }

}


