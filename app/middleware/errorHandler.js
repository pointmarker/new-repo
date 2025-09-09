const { source_path } = require('../environment/environment')
const {AppError, ValidationError, NotFoundError, DatabaseError, RedisError, ClientError}= require('../services/error.service')
const { errorLog } = require('../services/logger.service')

function errorHandler(err,req,res,next){

    const statusCode = err.statusCode || 500
    const errorCode = err.errorCode || "INTERNAL_SERVER_ERROR"
    const message = err.message || "Something went wrong.."

    // buraya logger ile logla
    if (err instanceof NotFoundError){
        errorLog(
            err.message,
            err.stack,
            req.ip,
            "NotFoundError"
        )
    }else if(err instanceof ValidationError){
        errorLog(
            err.message,
            err.stack,
            req.ip,
            "ValidationError"
        )

    }else if(err instanceof DatabaseError){
        errorLog(
            err.message,
            err.stack,
            req.ip,
            "DatabaseError"
        )

    }else if(err instanceof RedisError){
        errorLog(
            err.message,
            err.stack,
            req.ip,
            "RedisError"
        )

    }else if(err instanceof ClientError){
        errorLog(
            err.message,
            err.stack,
            req.ip,
            "ClientError"
        )

    }else{
        errorLog(
            err.message,
            err.stack,
            req.ip,
            "AppError"
        )
    }

    const response = {
        success: false,
        errorCode,
        message,
        details: err.details || "no extra detail"
    }
    
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