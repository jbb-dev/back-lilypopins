const express = require('express');
const demandRouter = express.Router();
const cors = require('cors')
const demandManager = require('../controller/demandController')
const testController = require('../controller/testController')

demandRouter.use(cors())


demandRouter.get('/', testController.test)
demandRouter.post('/create-new-demand', demandManager.createDemand, demandManager.sendEmailToParent)
demandRouter.get('/my-demands', demandManager.getMyDemands)
demandRouter.get('/kidsitting/all', demandManager.getMyGards)
demandRouter.delete('/delete/:id', demandManager.deleteGard, demandManager.sendEmailToParent)
demandRouter.get('/accept/:id', demandManager.acceptGard)


     
module.exports = demandRouter;
