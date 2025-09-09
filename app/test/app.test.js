const request = require('supertest')
const app = require('../app')
const { MongoMemoryServer } = require('mongodb-memory-server')

const { mongoConnect, mongoClose, getDb } = require('../config/db')
const { MONGO_COLLECTION } = require('../environment/environment')
const { deleteKeyOnRedis } = require('../services/redis.service')
const { getRedisClient } = require('../config/redis')
const { randomizeTask } = require('../utils/utils')

let mongoServer;

beforeAll(async() => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri();
    await mongoConnect(uri)

    const db = getDb()
    await db.collection(MONGO_COLLECTION).deleteMany({})

})



// describe.only('local',() => {
//     test('this',async() => {
//         const redis = getRedisClient()
//         const keys = await redis.keys("*")
//         console.log(keys)
//     })
// })



describe.only('POST /api/todo',() => {

    test('posting a task, should return 201',async() => {
        const payload = {
            title: "hasn",
            description: "sdfksg",
            completed: true
        }
        
        const res = await request(app).post('/api/todo').send(payload)

        console.log(res.statusCode)
    })
})

describe('GET /api/todos',() => {
    test("should return 200, page,limit .. and all the tasks page wants", async() => {

        
    })
})

describe('GET /todos with queries',() => {
    test('get  /todos?page=1&limit=10&sortBy=z-a',async() => {
        const redis = getRedisClient()

        const res = await request(app).get("/api/todos").query({page:"2",limit:"50",sortBy: "z-a"})

        const keys = await redis.keys('*')
        const cachedTasks = await redis.get('todos?page=1&limit=10&sortBy=z-a')

        console.log(keys)
        console.log(cachedTasks)
    })

    test('get  /api/todos?page=2&limit=50&sortBy=z-a',async() => {

    })
})

afterAll(async() => {
    const redis = getRedisClient()
    const db = getDb()
    
    const taskCount = await redis.get('taskCount')
    const dbTaskCount = await db.collection(MONGO_COLLECTION).countDocuments({})
    const queriedUrl = await redis.get('lastQueriedUrl')
    const keys = await redis.keys("*")
    console.log("lastQueriedUrl= ",queriedUrl,"\ntaskCount: ",taskCount, "\nkeys: ",keys, "dbTaskCount: ", dbTaskCount)

    await mongoClose()
    await mongoServer.stop()

})