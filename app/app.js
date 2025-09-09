const app = require('./server')

app.listen(3000, () =>{
    console.log('server running on port 3000')
} )

module.exports = app

