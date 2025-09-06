/**
 * this module for connecting our database
 * creating a mongo client to connect a database
 * and making connection settings
 * it will export its mongoRun & getDb functions to other pages
 * using in server.js
 */

const {MongoClient, ServerApiVersion} = require('mongodb');
const { DatabaseError } = require('../services/error.service');
const { MONGO_CLUSTER, MONGO_URI } = require('../environment/environment');
let client; 

async function mongoStart(){
    //create a client
    client = new MongoClient(MONGO_URI,{
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true
        }
    })
    //try to connect client to server
    try {
        console.log('try connecting to mongo server')
        await client.connect()
        const res = await client.db('admin').command({ping:1})

        if(!res) throw new DatabaseError('local server cant connected to mongo server');

        console.log('server connected to mongo')
        return client 
    } catch (err) {
        throw new DatabaseError('local server cant connected to mongo server');
    }
}

async function mongoClose(){
    if(client){
        try {
            await client.close()    
            console.log('mongo connection ended')
        } catch (error) {
            throw new DatabaseError('local server cant connected to mongo server');
        }
    }
}

let db;
async function connectDb(client) {
    db = client.db(MONGO_CLUSTER)
}

function getDb(){
    if(!db) throw new DatabaseError('database cant find');;
    return db;
}

// connect mongo client
const mongoConnect = async() => {
    const client = await mongoStart()
    connectDb(client);
}

module.exports = { getDb, mongoConnect,mongoClose }