const express = require('express');
const userRouter = express.Router();
const models = require('../models'); 
const cors = require('cors')
const jwtUtils = require('../utils/jwt-utils')
const bcrypt = require('bcryptjs')
const asyncLib  = require('async');

userRouter.use(cors())

// // REGISTER 
userRouter.post('/register', (req, res) => {
    
  // Params
  let firstname = req.body.firstname
  let lastname = req.body.lastname
  let email = req.body.email
  let password = req.body.password
  let age = req.body.age
  let city = req.body.city
  let postalCode = req.body.postalCode
  let biography = req.body.biography
  let availabilities = req.body.availabilities

    
  if (email === null || lastname === null || password === null || firstname === null || city === null || postalCode === null || availabilities ===null ){
    return res.status(400).json(`erreur : des paramètres sont manquants`)
  }

  // TODO verify pseudo length, mail regex, password :

    models.User
        .findOne({
          attributes : ['email'],
          where: { email: email}
        })
        .then(user => {
            if (!user) {
                bcrypt.hash(password, 10, (err, hash) => {
                  let newUser = models.User.create({
                    firstname : firstname,
                    lastname : lastname,
                    email : email,
                    password : hash,
                    age : age,
                    biography : biography,
                    postalCode : postalCode, 
                    city : city,
                    availabilities : availabilities ,
                  })
                .then(newUser => res.status(201).json({newUser}))
                .catch(err => res.status(500).json(`erreur : Impossible de créer l'utilisateur`))
              })  
            } else {
                res.status(409).json(`erreur : L'utilisateur avec l'adresse mail ${email} existe déjà` )
            }
        })
        .catch(err => res.status(500).json(`erreur : Impossible de vérifier l'utilisateur => ${err}` ))
})

// LOGIN
userRouter.post('/login', (req, res) => {

  // Params
  let email = req.body.email
  let password = req.body.password

  if (email === '' ||  password === '') {
    return res.status(400).json({ 'error': 'Des paramètres sont manquants' });
  }

  // TODO verify pseudo length, mail regex, password :

  models.User
  .findOne({
    where: { email: email}
  })
  .then(userFound => {
      if (userFound) {
        bcrypt.compare(password, userFound.password, (errHash, resHash) => {
          if (resHash) {
            res.status(200).json({
              'ID' : userFound.id,
              'token' : jwtUtils.generateTokenForUser(userFound)
            })
          } else {
            res.status(403).json({"error" : "Mot de passe incorrect"})
          }
        }) 
      } else {
        res.status(404).json({'error' : `L'utilisateur ${email} saisi n'existe pas`})
      }
  }) 
  .catch(err => {
      res.status(500).json({ 'error' : `Impossible de vérifier l'utilisateur => ${err}` })
  })
})
// MY PROFILE 

userRouter.get('/my-profile', (req, res) => {

  // Getting auth header
  let headerAuth  = req.headers['authorization'];
  let id         = jwtUtils.getUserId(headerAuth);

  if (id < 0)
    return res.status(400).json({ 'error': 'wrong token' });

  models.User
  .findOne({
    attributes: [ 'id', 'email', 'firstname', 'lastname', 'biography', 'postalCode', 'city', 'age', 'avatar', 'availabilities' ],
    where: { id : id }
  })
  .then(function(user) {
    if (user) {
      res.status(201).json(user);
    } else {
      res.status(404).json({ 'error': `Utilisateur non trouvé` });
    }
  })
  .catch(function(err) {
    res.status(500).json({ 'error': `Impossible de récupérer les données de l'utilisateur => ${err}` });
  });
})


 
// Updating MY PROFILE 

userRouter.put('/my-profile', (req, res) => {
 // Getting auth header
 let headerAuth  = req.headers['authorization'];
 let ID = jwtUtils.getUserId(headerAuth)

 let firstname = req.body.firstname
 let lastname = req.body.lastname
 let password = req.body.password
 let age = req.body.age
 let avatar = req.body.avatar
 let city = req.body.city
 let postalCode = req.body.postalCode
 let biography = req.body.biography
 let availabilities = req.body.availabilities


    asyncLib.waterfall([
      function(done) {
        models.User.findOne({
          attributes: ['id','email', 'firstname', 'lastname', 'age', 'avatar', 'city', 'postalCode', 'availabilities', 'biography' ],
          where: { id: ID }
        }).then(function (userFound) {
          done(null, userFound);
        })
        .catch(function(err) {
          return res.status(500).json({ 'error': `Impossible de vérifier l'utilisateur` });
        });
      },
      function(userFound, done) {
        if(userFound) {
          userFound.update({
            firstname: (firstname ? firstname : userFound.firstname), 
            lastname: (lastname ? lastname : userFound.lastname),
            avatar: (avatar ? avatar : userFound.avatar),
            age : (age ? age : userFound.age),
            city : (city ? city : userFound.city),
            postalCode : (postalCode ? postalCode : userFound.postalCode),
            biography : (biography ? biography : userFound.biography),
            availabilities : (availabilities ? availabilities : userFound.availabilities)
          }).then(function() {
            done(userFound);
          }).catch(function(err) {
            res.status(500).json({ 'error': `Impossible de mettre à jour l'utilisateur => ${err}` });
          });
        } else {
          res.status(404).json({ 'error': 'Utilisateur non trouvé' });
        }
      },
    ], function(userFound) {
      if (userFound) {
        return res.status(201).json(userFound);
      } else {
        return res.status(500).json({ 'error': `Impossible de mettre à jour les données de l'utilisateur` });
      }
    })
})

// MANAGE CHILDREN

  // CREATE A CHILD

userRouter.post('/add-a-child', (req, res) => {


  // Getting auth header
  let headerAuth  = req.headers['authorization'];
  let userId      = jwtUtils.getUserId(headerAuth);

  if (userId < 0)
    return res.status(400).json({ 'error': 'wrong token' });
  
// Params
  let sex = req.body.sex
  let firstname = req.body.firstname
  let age = req.body.age
  let section = req.body.section
  let biography = req.body.biography
  let avatar = req.body.avatar

  if (firstname === '' ||  sex === '' || age === '' || section === '' || biography === '') {
    return res.status(400).json({ 'error': 'Des paramètres sont manquants' });
  }

  models.Children
  .findOne({
    attributes : ['firstname'],
    where: { 
      userId : userId,
      firstname : firstname
    }
  })
  .then(child => {
      if (!child) {
            let newChild = models.Children.create({
              sex : sex,
              firstname : firstname,
              age : age,
              section : section,
              biography : biography,
              avatar : avatar,
              userId : userId
            })
          .then(newChild => res.status(201).json({newChild}))
          .catch(err => res.status(500).json(`erreur : Impossible de créer l'enfant => ${err}`))
      } else {
          res.status(409).json(`erreur : ${firstname} existe déjà` )
      }
  })
  .catch(err => res.status(500).json(`erreur : Impossible de vérifier si l'enfant a déjà été renseigné => ${err}` ))


})


// GET ALL MY CHILDREN


userRouter.get('/my-children', (req, res) => {

  // Getting auth header
  let headerAuth  = req.headers['authorization'];
  let id         = jwtUtils.getUserId(headerAuth);

  if (id < 0)
    return res.status(400).json({ 'error': 'wrong token' });

  models.Children
  .findAll({
    attributes: [ 'id', 'sex', 'firstname', 'age', 'section', 'biography', 'avatar', 'userId'],
    where: { userId : id }
  })
  .then(function(child) {
    if (child) {
      res.status(201).json(child);
    } else {
      res.status(404).json({ 'error': `enfant(s) non trouvé(s)` });
    }
  })
  .catch(function(err) {
    res.status(500).json({ 'error': `Impossible de récupérer les données de l'utilisateur => ${err}` });
  });
})


// GET ONE OF MY CHILDREN

userRouter.get('/my-children/:childId', (req, res) => {
  // Getting auth header
  let headerAuth  = req.headers['authorization'];
  let id         = jwtUtils.getUserId(headerAuth);

  if (id < 0)
    return res.status(400).json({ 'error': 'wrong token' });
  
  // Getting childId 
  let childId = Number(req.params.childId)

  models.Children
  .findOne({
    attributes: [ 'id', 'sex', 'firstname', 'age', 'section', 'biography', 'avatar'],
    where: { 
      userId : id,
      id : childId }
  })
  .then(function(child) {
    if (child) {
      res.status(201).json(child);
    } else {
      res.status(404).json({ 'error': `enfant non trouvé` });
    }
  })
  .catch(function(err) {
    res.status(500).json({ 'error': `Impossible de récupérer les données de l'utilisateur => ${err}` });
  });
})


// UPDATE MY CHILD PROFILE :

userRouter.put('/my-children/:childId', (req, res) => {

  // Getting auth header
  let headerAuth  = req.headers['authorization'];
  let ID         = jwtUtils.getUserId(headerAuth);

  if (ID < 0)
    return res.status(400).json({ 'error': 'wrong token' });
  
  // Getting params 
  let childId = Number(req.params.childId)
  let firstname = req.body.firstname
  let sex = req.body.sex
  let age = req.body.age
  let section = req.body.section
  let avatar = req.body.avatar
  let biography = req.body.biography
  let userId = ID
 
  asyncLib.waterfall([
    function(done) {
      models.Children.findOne({
        attributes: [ 'id', 'sex', 'firstname', 'age', 'section', 'biography', 'avatar', 'userId'],
        where: { 
          id: childId,
          userId : userId
         }
      }).then(function (userFound) {
        done(null, userFound);
      })
      .catch(function(err) {
        return res.status(500).json({ 'error': `Impossible de vérifier l'utilisateur => ${err}` });
      });
    },
    function(childFound, done) {
      if(childFound) {
        childFound.update({
          firstname: (firstname ? firstname : childFound.firstname),
          sex : (sex ? sex : childFound.sex),
          section : (section ? section : childFound.section), 
          avatar: (avatar ? avatar : childFound.avatar),
          age : (age ? age : childFound.age),
          biography : (biography ? biography : childFound.biography),
        }).then(function() {
          done(childFound);
        }).catch(function(err) {
          res.status(500).json({ 'error': `Impossible de mettre à jour l'enfant => ${err}` });
        });
      } else {
        res.status(404).json({ 'error': 'Enfant non trouvé' });
      }
    },
  ], function(childFound) {
    if (childFound) {
      return res.status(201).json(childFound);
    } else {
      return res.status(500).json({ 'error': `Impossible de mettre à jour les données de l'enfant` });
    }
  })





})

module.exports = userRouter;