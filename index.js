const express = require('express');
const models = require('./models'); 
const app = express();
const port = 4000;
const userRouter = require('./routes/userRouter');

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


models
.sequelize
.sync()
.then(() => app.listen(port, () => console.log(`App listening on port ${port}`)))

