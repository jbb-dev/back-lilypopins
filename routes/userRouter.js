const express = require('express');
const app = express();
const userRouter = express.Router();
const models = require('../models'); 


app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

// Display one user from its ID: 
userRouter.get('/:id', (req,res) => {
  models
    .User
    .findOne({
      where: {
        user_ID : req.params.id
      }})
    .then(x => res.json(x))
})


// Create a new user
userRouter.post('/', (req,res) => {
    models
      .User
      .create(req.body)
      .then(x => res.json(x))
  });

  // Display one user from its ID: 
userRouter.get('/:id', (req,res) => {
    models
      .User
      .findOne({
        where: {
          user_ID : req.params.id
        }})
      .then(x => res.json(x))
  })

  // Update user information from its ID
userRouter.put('/:id', (req,res) => {
    models
      .User
      .update(req.body ,{
        where: {
          user_ID: req.params.id
        }
      })
      .then(x => res.json(x))
  });

// Display all users :
userRouter.get('/', (req,res) => {
  models
    .User
    .findAll({include:[models.Rider]})
    .then(x => res.json(x))

  }
)





module.exports = userRouter