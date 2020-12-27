const models = require('../models');
const jwtUtils = require('../utils/jwt-utils');

module.exports = {

    // GET RESULTS FROM USER RESEARCH 
    getResults : function (req, res) {
        
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
    
    },

    // GET A PARENT PROFILE FROM ITS ID
    getParentProfil : function (req, res) {

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
    }
}
