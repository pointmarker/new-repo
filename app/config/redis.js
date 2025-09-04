const {createClient} = require('redis')
const { REDIS_USERNAME, REDIS_PASSWORD, REDIS_HOST, REDIS_PORT } = require('../environment/environment');
const { RedisError } = require('../services/error.service');

let client; 

async function startRedis(){

    if(client) return client
     client = createClient({
        username: REDIS_USERNAME,
        password: REDIS_PASSWORD,
        socket: {
            host: REDIS_HOST,
            port: REDIS_PORT,
            connectTimeout: 5000
        }
    })
    client.on('error',(err) => console.log("redis client error",err))
    
    await client.connect()
    console.log('redise bağlandı')
}

function getRedisClient(){
    if(!client || !client.isOpen){
        throw new RedisError('redis client is not ready')
    }
    return client
}


async function closeRedis(){
    if(client){
        await client.quit();
        console.log('redis kapandı')
    }else{
        throw new RedisError("client couldnt close..")
    }
}

module.exports = {startRedis, closeRedis, getRedisClient}

