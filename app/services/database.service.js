const { getDb } = require("../config/db")
const { MONGO_COLLECTION } = require("../environment/environment")
const {ObjectId} = require('mongodb')
const { DatabaseError, AppError } = require("../services/error.service");
const { getRedisClient } = require("../config/redis");
const { updateTaskCountOnCache, haveTaskCountOnCaches, updateCachedTasks } = require("./redis.service");
const { randomizeTask } = require("../utils/utils");
const { setCache, getTasksToCache, haveTaskCountOnFakeCache, addTaskToDb, updateTaskCount, updateCachedTasksV2, updateTaskV2, findFromDb } = require("../utils/createMock");

async function haveSpecificTasks(sortBy, cacheSkip,limitVal, cacheLimitCount, page){

    try {
        console.log("sortBy: ",sortBy, "cacheskip: ",cacheSkip,"limitVal: ",limitVal,"cacheLimitCount: ", cacheLimitCount,"page: ", page)

        const redis = getRedisClient()
        const db = getDb()

        const sortOptions = {
            "a-z": {title: 1},
            "z-a": {title: -1},
            "uncompleted-first": {completed: -1},
            "completed-first": {completed: 1},
            "news-first": {createdAt: -1},
            "olds-first": {createdAt: 1}
        }
        
        //await redis.set("sortOptions", JSON.stringify(sortOptions), "EX", 2000, "NX")
        setCache("sortOptions",sortOptions)

        const sortDirective = sortOptions[sortBy] || {createdAt: -1}

        //let taskCount = await haveTaskCountOnCaches()
        let taskCount = haveTaskCountOnFakeCache()

        const realLimit = taskCount < (limitVal * cacheLimitCount) ? taskCount : (limitVal * cacheLimitCount)

        // const cachedTasks = await db.collection(MONGO_COLLECTION)
        //                             .find({})
        //                             .sort(sortDirective)
        //                             .skip(cacheSkip)
        //                             .limit(parseInt(realLimit))
        //                             .toArray();
        const cachedTasks = getTasksToCache(cacheSkip,parseInt(realLimit),sortDirective)

        if(!cachedTasks) throw new DatabaseError('cant have desired tasks')

        if(taskCount == limitVal * cacheLimitCount){
            // await redis.set(`cachedTasks:/todos?page=${page}&limit=${limitVal}&sortBy=${sortBy}`,JSON.stringify(cachedTasks), "EX", 300)
            setCache(`cachedTasks:/todos?page=${page}&limit=${limitVal}&sortBy=${sortBy}`,cachedTasks)
        }
        
        const currentPageTasks = cachedTasks.slice((page - 1) * limitVal,(page) * limitVal )
      

        const tasksDetails = {
            tasks: currentPageTasks,
            taskCount: taskCount
        }

        return tasksDetails

    } catch (error) {
        throw new AppError(error)
    }

    
}
async function addTask(title, description, completed){
    try {
        const db = getDb();

        const insertedTask = {
            title: title,
            description: description,
            completed: completed,
            createdAt: new Date()
        }



        // const res = await db.collection(MONGO_COLLECTION)
        // .insertOne({
        //     title: insertedTask.title,
        //     description: insertedTask.description,
        //     completed: insertedTask.completed,
        //     createdAt: insertedTask.createdAt // mongodb bunu otomatik ISODate formatında saklıyor
        // })
        
        // if(!res) throw new DatabaseError('Insertion Error')

        addTaskToDb(insertedTask)

        // await updateTaskCountOnCache()
        updateTaskCount("add")
        // await updateCachedTasks("add",insertedTask)
        updateCachedTasksV2("add",insertedTask)

        
    } catch (error) {
        throw new AppError(error)
    }
    
}
async function updateTask(id,title,description, completed){
    try {
        const db = getDb();
        const objectId = new ObjectId(id)

        // const updatedField = {
        //     title,
        //     description,
        //     completed
        // }

        const newTask = {
            title, 
            description,
            completed,
            createdAt: new Date(),
            _id: objectId
        }

        const task = findFromDb(objectId)

        const updatedTask = updateTaskV2(task,newTask)
        //  await db.collection(MONGO_COLLECTION).findAndUpdateOne({_id: objectId},{
        //     $set:  updatedField
        // })

        // await updateCachedTasks("update",updatedTask)
        updateCachedTasksV2("update",updatedTask)

    } catch (error) {
        throw new DatabaseError(error.message)
    }
    
    
}
async function deleteTask(id){
    try {
        const db = getDb();
        const objectId = new ObjectId(id)

        const deletedTask = await db.collection(MONGO_COLLECTION).findOneAndDelete({_id: objectId})
        if(!res) throw new DatabaseError("task not found")

        await updateTaskCountOnCache("delete")
        await updateCachedTasks("delete",deletedTask)

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

async function haveTaskByLocationOnDb(skip,sortBy){

    const db = getDb()
    const targetTask = await db.collection(MONGO_COLLECTION)
                                .find({})
                                .sort(sortBy)
                                .skip(skip)
                                .limit(1)
                                .toArray();

    return targetTask
}

module.exports = {addTask,updateTask,deleteTask, haveSpecificTasks, haveTaskById, haveTaskByLocationOnDb}
