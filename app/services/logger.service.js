const {createLogger, transports} = require('winston')
const winston = require('winston')
const { source_path } = require('../environment/environment')
const {combine, timestamp,errors, printf} = winston.format

const customFormat = printf(({ level, message, timestamp, stack, ...meta}) => {
    return JSON.stringify({
        timestamp,
        level,
        message, 
        stack: stack || null,
        user: meta.user ||null,
        component: meta.component || null
    })
})

const logger = createLogger({
    level: "info",
    format: combine(
        errors({stack: true}),
        timestamp(),
        customFormat
    ),
    transports: [
        new transports.File({filename:`${source_path}logs/combined.log`, level: "info"}),
        new transports.File({filename:`${source_path}logs/error.log`, level: "error"}),
        new transports.Console({level: "info"})
    ],
    exceptionHandlers: [
        new transports.File({filename: "logs/exception.log"})
    ],
    rejectionHandlers: [
        new transports.File({filename: "logs/rejection.log"})
    ]
})


function errorLog(message,stack, user, component){
    logger.error(message,{
        stack: stack ||null,
        user: user,
        component: component
    })
}

function infoLog(message,stack, user, component){
    logger.info(message,{
        stack: stack ||null,
        user: user,
        component: component
    })
}

module.exports = {errorLog, infoLog};