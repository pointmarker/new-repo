const { source_path } = require('../environment/environment')
const {AppError, ValidationError, NotFoundError, DatabaseError}= require('../services/error.service')

function errorHandler(err,req,res,next){

    const statusCode = err.statusCode || 500
    const errorCode = err.errorCode || "INTERNAL_SERVER_ERROR"
    const message = err.message || "Something went wrong.."

    // buraya logger ile logla
    if(err instanceof AppError){
        
    }else if (err instanceof NotFoundError){

    }else if(err instanceof ValidationError){

    }else if(err instanceof DatabaseError){

    }else{

    }

    const response = {
        success: false,
        errorCode,
        message
    }

    if(err.details) response.details = err.details
    
    res.status(statusCode).json(response)
}

function fourOFourHandler(req,res,next){
 if(req.accepts('json')){
    return res.status(404).json({
        success:false,
        message: "route not found"
    })
 }else{
    return res.status(404).sendFile(source_path,"services/error.html")
 }
}


module.exports = {errorHandler, fourOFourHandler}