const express = require('express');
require('dotenv').config();
const { connection } = require('./config/db');
const { postRouter } = require('./router/postRouter');
const { userRouter } = require('./router/userRouter');
const { followRouter } = require('./router/followRouter');
const { commentRouter } = require('./router/commentRouter');
const cors = require('cors')
const cookieParser = require('cookie-parser');
const cloudinary = require("cloudinary");


const PORT = process.env.PORT;

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
})


const app = express();

app.use(cors({
    origin:"*"
}))

app.use(express.json({limit: '5mb'}));
app.use(cookieParser())
app.use(express.urlencoded({limit: '5mb', extended: true}));

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