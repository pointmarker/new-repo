#!/bin/bash
# to making file management for creating this app file needs
echo "node_modules" > .gitignore
echo app/environment >> .gitignore
mkdir app
cd app
mkdir public environment models routes controllers services middleware config
touch server.js app.js
echo "
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')
const router = require('./routes/index.route')

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
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
" >> server.js
echo "
const app = require('.')

app.listen(3000, () => console.log('server running on port 3000'))
" >> app.js
cd public 
mkdir pages js css assets
touch pages/index.html
touch js/index.js
touch css/index.css
cd ..
touch environment/environment.js
touch config/db.js
touch models/.model.js
touch routes/index.route.js
touch middleware/errorHandler.js