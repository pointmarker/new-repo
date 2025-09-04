class AppError extends Error{
    constructor(message, statusCode = 500, errorCode = "GENERAL_ERROR", details = null){
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;
        this.isOperational = true;
        Error.captureStackTrace(this,this.constructor)
    }
}

class ValidationError extends AppError{
    constructor(message = "Validation Failed", details = []){
        super(message, 400, "VALIDATION_ERROR", details )
    }
}

class DatabaseError extends AppError{
    constructor(message = "Database Operation Failed", details = []){
        super(message, 500, "DATABASE_ERROR", details );
        this.isOperational = false
    }

}

class NotFoundError extends AppError{
    constructor(message = "Resource not found", details = []){
        super(message, 404, "NOT_FOUND", details)
    }
}
class ClientError extends AppError{
    constructor(message = "Client did wrong", details = []){
        super(message, 400,"CLIENT_ERROR",details)
    }
}

class RedisError extends AppError{
    constructor(message = "Redis client errors", details = []){
        super(message, 500,"REDIS_ERROR",details)
    }
}
module.exports = {AppError, ValidationError, DatabaseError, NotFoundError,ClientError, RedisError}