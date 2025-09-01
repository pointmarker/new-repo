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


exports.module = {errorHandler}