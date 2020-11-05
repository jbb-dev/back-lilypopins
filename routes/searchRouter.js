const express = require('express');
const searchRouter = express.Router();
const models = require('../models'); 
const cors = require('cors')
const jwtUtils = require('../utils/jwt-utils')

searchRouter.use(cors())

// GET RESULTS FROM USER RESEARCH 

searchRouter.get('/', (req, res) => {

    // Getting auth header
    let headerAuth  = req.headers['authorization'];
    let userId      = jwtUtils.getUserId(headerAuth);
    
    if (userId < 0)
        return res.status(400).json({ 'error': 'wrong token' });


    models
    .User
    .findAll({
        attributes: [ 'id', 'firstname', 'lastname', 'biography', 'postalCode', 'city', 'age', 'avatar', 'availabilities' ],
        include: [{
            model : models.Children,
            attributes: [ 'id', 'sex', 'firstname', 'age', 'section', 'biography', 'avatar'],
        }] })
    .then(x => res.json(x))
    .catch(error => res.send(error))

})

// GET A PARENT PROFILE FROM ITS ID

searchRouter.get('/:id', (req, res) => {

    // Getting auth header
    let headerAuth  = req.headers['authorization'];
    let userId      = jwtUtils.getUserId(headerAuth);
    
    if (userId < 0)
        return res.status(400).json({ 'error': 'wrong token' });


    let parentId = req.params.id

    models
    .User
    .findOne({
        where : { id : parentId },
        attributes: [ 'id', 'firstname', 'lastname', 'biography', 'postalCode', 'city', 'age', 'avatar', 'availabilities' ],
        include: [{
            model : models.Children,
            attributes: [ 'id', 'sex', 'firstname', 'age', 'section', 'biography', 'avatar'],
        }] })
    .then(x => res.json(x))
    .catch(error => res.send(error))

})


module.exports = searchRouter;