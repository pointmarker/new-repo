const { getDb } = require("../config/db")
const { MONGO_COLLECTION } = require("../environment/environment")
const {ObjectId} = require('mongodb')
const { DatabaseError, ClientError } = require("../services/error.service");
const { getRedisClient } = require("../config/redis");


async function haveTaskCount(redis){
    const db = getDb();

    let taskCount = await redis.get('taskCount')
    if(!taskCount){
        taskCount = await db.collection(MONGO_COLLECTION).countDocuments({})
        await redis.set('taskCount',taskCount, "EX",300)
    }

    return JSON.parse(taskCount)
}
async function haveAllTasks(sortBy, cacheSkip,limitVal, cacheLimitCount, page){
    let sortDirective;

    const sortOptions = {
        "a-z": {title: 1},
        "z-a": {title: -1},
        "uncompleted-first": {completed: -1},
        "completed-first": {completed: 1},
        "news-first": {createdAt: -1},
        "olds-first": {createdAt: 1}
    }

    sortDirective = sortOptions[sortBy] || {createdAt: -1}

    const redis = getRedisClient()
    const db = getDb()

    const cachedTasks = await db.collection(MONGO_COLLECTION)
                                .find({})
                                .sort(sortDirective)
                                .skip(cacheSkip)
                                .limit(limitVal * cacheLimitCount)
                                .toArray();

    await redis.set(`cachedTasks:${page}&${limitVal}&${sortBy}`,JSON.stringify(cachedTasks), "EX", 200)

    let tasks = cachedTasks.slice((page - 1) * limitVal,(page) * limitVal )
    let taskCount = await haveTaskCount(redis)

    const tasksDetails = {
        tasks: tasks,
        taskCount: taskCount
    }

    return tasksDetails
}

async function addTask(title, description, completed){
    
    try {
        const db = getDb();
        const res = await db.collection(MONGO_COLLECTION)
        .insertOne({
            title,
            description,
            completed,
            createdAt: new Date() // mongodb bunu otomatik ISODate formatında saklıyor
        })

        return res
    } catch (error) {
        next(error)
    }
    
}
async function updateTask(id,title,description, completed){
    try {
        const db = getDb();
        const objectId = new ObjectId(id)

        const updatedField = {
            title,
            description,
            completed
        }

        const res = await db.collection(MONGO_COLLECTION).updateOne({_id: objectId},{
            $set:  updatedField
        })

        if(!res.modifiedCount > 0){
            return new DatabaseError('task could not be updated')
        }

    } catch (error) {
        throw new DatabaseError(error.message)
    }
    
    
}
async function deleteTask(id){
    try {
        const db = getDb();
        const objectId = new ObjectId(id)

        const res = await db.collection(MONGO_COLLECTION).deleteOne({_id: objectId})
        if(res.deletedCount !== 1) throw new DatabaseError("task not found")
        
    } catch (error) {
        throw new DatabaseError(error.message)
    }
}

async function haveTaskById(id){
    const objectId = new ObjectId(id)
    const task = await db.collection(MONGO_COLLECTION).findOne({_id: objectId})

    if(!task) return new DatabaseError('there is no task')
    return task
}

module.exports = {addTask,updateTask,deleteTask, haveAllTasks, haveTaskById, haveTaskCount}
