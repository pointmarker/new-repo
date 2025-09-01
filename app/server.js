
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')
const router = require('./routes/index.route')
const {errorHandler} = require('./middleware/errorHandler')

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(errorHandler)
app.use(express.static(path.join(__dirname,'public')))
app.use('/',router)


//getting static homepagae
app.get('/', [(req,res,next) =>{
    console.log('LOGGED INTO LANDING PAGE');next();
} ,(req,res) => {
    res.status(200).sendFile(path.join(__dirname,'public','pages','index.html'))
}])

// what to do when try to close server
process.on('SIGINT',async() => {
    console.log('server closing')
    await mongoClose()
    process.exit(0)
})

module.exports = app;

