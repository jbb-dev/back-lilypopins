const express = require('express');
const searchRouter = express.Router();
const cors = require('cors');
const searchController = require('../controller/searchController');

searchRouter.use(cors())

searchRouter.get('/', searchController.getResults)
searchRouter.get('/:id', searchController.getParentProfil)


module.exports = searchRouter;