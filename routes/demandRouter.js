const express = require('express');
const demandRouter = express.Router();
const models = require('../models'); 
const cors = require('cors')
const jwtUtils = require('../utils/jwt-utils')


demandRouter.use(cors())

demandRouter.post('/create-new-demand', (req, res) => {

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

    if (beginAt === null || endAt === null || contactedParentId === null) 
        return res.status(400).json({ 'error': 'Des paramètres sont manquants.' });
   
    // Verify if demand exists and if not, create it
    models.Demand
    .findOne({
      where: { 
        userId : userId,
        contactedParentId : contactedParentId,
        beginAt : beginAt,
        endAt : endAt,
      }
    })
    .then(demand => {
        if (!demand) {
              let newDemand = models.Demand.create({
                status : status,
                beginAt : beginAt,
                endAt : endAt,
                contactedParentId : contactedParentId,
                userId : userId
                })
            .then(newDemand => res.status(201).json(newDemand))
            .catch(err => res.status(500).json({'error': `Impossible de créer la demande.`}))
        } else {
            res.status(409).json({'error' : `Une demande similaire a déjà enregistrée.` })
        }
    })
    .catch(err => res.status(500).json({'error' : `Impossible de vérifier si la demande a déjà été enregistrée.` }))
    
  })
  

module.exports = demandRouter;