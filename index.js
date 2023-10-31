const express = require('express');
require('dotenv').config();
const { connection } = require('./config/db');
const { postRouter } = require('./router/postRouter');
const { userRouter } = require('./router/userRouter');
const { followRouter } = require('./router/followRouter');
const { commentRouter } = require('./router/commentRouter');
const cors = require('cors')
const cloudinary = require("cloudinary");


const PORT = process.env.PORT;

cloudinary.config({
    cloud_name: 'du1wrpcx1',
    api_key: '386637265454812',
    api_secret: 'oc1HZHwo6ppwSoWbZXgPF6L5ogM',
})


const app = express();

app.use(cors({
    origin:"*"
}))

app.use(express.json({limit: '5mb'}));
app.use(express.urlencoded({limit: '5mb', extended: true}));


app.use('/', (req,res) => {
    res.send("This is Ranjeet's social media api")
})

app.use('/user', userRouter)
app.use('/post',postRouter);
app.use('/follow',followRouter)
app.use('/comment',commentRouter)


app.listen(PORT, async() => {
    try {
        await connection
        console.log(`Server started successfully on port ${PORT}`)
    } catch (error) {
        console.log(error)
    }
})