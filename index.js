const express = require('express');
const models = require('./models'); 
const app = express();

const dotenv = require("dotenv");
dotenv.config();

const MY_PORT = process.env.PORT || 4000;

const userRouter = require('./routes/userRouter');
const searchRouter = require('./routes/searchRouter');
const demandRouter = require('./routes/demandRouter')
const conversationRouter = require ('./routes/conversationRouter')

const cors = require('cors');

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));


app.get('/', (req, res) => {
  res.send('home')
})

// Utilisation des différents routers selon les routes définies ci-dessous :
app.use('/api/users', userRouter)
app.use('/api/search', searchRouter)
app.use('/api/demands', demandRouter)
app.use('/api/conversations', conversationRouter)



models
.sequelize
.sync()
.then(() => app.listen(MY_PORT, () => console.log(`App listening on port ${MY_PORT}`)))

