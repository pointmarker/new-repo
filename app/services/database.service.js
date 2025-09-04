const { getDb } = require("../config/db")
const { MONGO_COLLECTION } = require("../environment/environment")
const {ObjectId} = require('mongodb')
const { DatabaseError, ClientError } = require("../services/error.service");
const { getRedisClient } = require("../config/redis");

async function haveAllTasks(sortBy,skip, cacheSkip,limit){

    const redis = getRedisClient()
    const pages = await redis.get('cachedPages')

    const cachedPages = JSON.parse(pages)

    let sortDirective;
    switch (sortBy) {
        case "a-z":
        sortDirective = {title: 1}
        break;
        case "z-a":
        sortDirective = {title: -1}
        break;
        case "uncompleted-first":
        sortDirective = {completed : -1}
        break;
        case "completed-first":
        sortDirective = {completed: 1}
        break;
        case "news-first":
        sortDirective = {createdAt: -1}
        break;
        case "olds-first":
        sortDirective = {createdAt: 1}
        break;
    default:
        sortDirective = {createdAt: -1}
        break;
}

    const db = getDb()

    const tasks = await db.collection(MONGO_COLLECTION)
                            .find({})
                            .sort(sortDirective)
                            .skip(skip)
                            .limit(limit)
                            .toArray();

    const cachedTasks = await db.collection(MONGO_COLLECTION)
                                .find({})
                                .sort(sortDirective)
                                .skip(cacheSkip)
                                .limit(limit * 5)
                                .toArray();

    await redis.set('cachedTasks',cachedTasks, "EX", 200)

   
    if(await redis.exists('taskCount')){
        taskCount = await db.collection(MONGO_COLLECTION)
                                .countDocuments({})
        await redis.set('taskCount',taskCount, "EX",300)
    }

    

    const tasksDetails = {
        allTasks: tasks,
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
async function updateTask(id,title, completed){
    try {
        const db = getDb();
        const objectId = new ObjectId(id)

        const updatedField = {}
        if(title) updatedField.title = title
        if(completed !== "") updatedField.completed = completed

        if(Object.keys(updatedField).length == 0){
            throw new ClientError('nothing to update')
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
module.exports = {addTask,updateTask,deleteTask, haveAllTasks, haveTaskById}
