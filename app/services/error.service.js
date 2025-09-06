class AppError extends Error{
    constructor(message, statusCode = 500, errorCode = "GENERAL_ERROR", component = null, details = null){
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        if(component){
            const stackLine = (new Error()).stack.split("\n")[2]
            const match = stackLine.match(/\((.*):\d+:\d+\)$/)
            this.component = match ? match[1] : "Unknown"
        }else{
            this.component = component
        }
        this.details = details;
        this.isOperational = true;
        Error.captureStackTrace(this,this.constructor)
    }
}

class ValidationError extends AppError{
    constructor(message = "Validation Failed", component, details = []){
        super(message, 400, "VALIDATION_ERROR", component, details )
    }
}

class DatabaseError extends AppError{
    constructor(message = "Database Operation Failed", component,  details = []){
        super(message, 500, "DATABASE_ERROR", component,details )
        this.isOperational = false
    }

}

class NotFoundError extends AppError{
    constructor(message = "Resource not found", component,details = []){
        super(message, 404, "NOT_FOUND", component, details )
    }
}
class ClientError extends AppError{
    constructor(message = "Client did wrong", component, details = []){
        super(message, 400,"CLIENT_ERROR", component, details )
    }
}

class RedisError extends AppError{
    constructor(message = "Redis client errors", component, details = []){
        super(message, 500,"REDIS_ERROR", component, details )
    }
}
module.exports = {AppError, ValidationError, DatabaseError, NotFoundError,ClientError, RedisError}