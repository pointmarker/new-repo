const { getDb } = require("../config/db")
const { getRedisClient } = require("../config/redis")
const { MONGO_COLLECTION } = require("../environment/environment")
const { haveTaskByLocationOnDb } = require("./database.service")
const { RedisError, DatabaseError, AppError } = require("./error.service")
const url = require('url')

async function updateTaskCountOnCache(method = null){

    try {
        const redis = getRedisClient()
        const db = getDb()

        let taskCount = await redis.get('taskCount')
        if(method) method == "add" ? taskCount ++ : taskCount --;

        else{
            taskCount = await db.collection(MONGO_COLLECTION).countDocuments({});
            if(!taskCount) throw new DatabaseError;
        }
       
        await redis.set('taskCount',taskCount, "EX",300)

        return taskCount

    } catch (error) {
        new AppError(error)
    }
    
}

async function haveTaskCountOnCaches(){

    try {
        const db = getDb();
        const redis = getRedisClient()

        let taskCount = await redis.get('taskCount')

        if(!taskCount){
            taskCount = await db.collection(MONGO_COLLECTION).countDocuments({})
            await redis.set('taskCount',taskCount, "EX",300)
        }

        return taskCount
    } catch (error) {
        new RedisError(error)
    }

    
}

async function updateCachedTasks(method,editedTask){

    try {
        console.log("girdi")
        // define redis
        const redis = getRedisClient()
        // fetch last queriedUrl from redis to define cache info 
        let queriedUrl = await redis.get('lastQueriedUrl')

        queriedUrl = queriedUrl || `/todos?page=1&limit=10&sortBy=a-z`

        if(!queriedUrl) throw new RedisError('there was no queries before')

        // find queries
        const parsedUrl = url.parse(queriedUrl,true)
        if(!parsedUrl) throw new AppError("parsedUrl problem")

        const {page, limit, sortBy} = parsedUrl.query

        // define cache info
        let cachedPages = JSON.parse(await redis.get('cachedPages'))
        let cachedTasks = JSON.parse(await redis.get(`cachedTasks:${queriedUrl}`))

        if(!cachedPages ||!cachedTasks) return
            
        // if editedTask is not in cachedTasks, then return this function, else keep going 
        if(!cachedTasks.some(t => t._id == editedTask._id)) return

        const limitCount = page > 3 ? 5 : 3
        const skip = Math.max(0,(page-3)) * limit
        const skipForFirstTask =skip - 1
        const skipForLastTask = skip * limitCount

        switch (method) {
            case "update":
                // if method is update, find the target task on cachedTasks, update it there and cache again
                let targetTask = cachedTasks.find(t => t._id == editedTask._id)
                Object.assign(targetTask, editedTask)

                await redis.set(queriedUrl,JSON.stringify(cachedTasks), "EX",300)
                break;
            case "delete":
                // if method is delete, check the right task first, if there, pick it up and add to the bottom of array, if not
                // pick the most close to edge of cachedtasks and put it to the edge

                const unCachedTaskOnRightBorderOfCachedTasks = await haveTaskByLocationOnDb(skipForLastTask,sortBy)
                const unCachedTaskOnLeftBorderOfCachedTasks = await haveTaskByLocationOnDb(skipForFirstTask,sortBy)

                // is there (on db) a task on the right side
                if(unCachedTaskOnRightBorderOfCachedTasks){
                    // there is, so take the right task and add to the ground of the cachedpages array and cache
                    let task = unCachedTaskOnRightBorderOfCachedTasks[0]
                    cachedTasks.push(task)
                }
                    // is there (on db) a task on the left side or 
                else if(unCachedTaskOnLeftBorderOfCachedTasks){
                    // there is, so take the left task and add to the edge of the cachedpages array and cache
                    let task = unCachedTaskOnLeftBorderOfCachedTasks[0]
                    cachedTasks.unshift(task)
                }
                // the cachedTasks are same with all tasks on db so find the deleted task, delete from cachedPages and cache 
                cachedTasks = cachedTasks.filter(p => p._id == editedTask._id)
                await redis.set(queriedUrl, JSON.stringify(cachedTasks), "EX", 300)
            break;
            case "add":
                // eğer ekleme işlemiyse cachelenen tasktaki son eleman pop, editedTask in
                cachedPages.pop()
                addTaskToCachedArray(cachedTasks, targetTask, sortBy)
            break;
            default:
                break;
        }
    } catch (error) {
        throw new AppError(error)
    }
    
}

function addTaskToCachedArray(cachedTasks,targetTask,sortBy){
    let targetIndex;
    const {title, completed, createdAt} = targetTask
    switch (sortBy) {
        case "a-z":
            targetIndex = cachedTasks.findIndex(p => p.title.toLowerCase() > title.toLowerCase())
            break;
        case "z-a":
            targetIndex = cachedTasks.findIndex(p => p.title.toLowerCase() < title.toLowerCase())
            break;
        case "uncompleted-first":
            targetIndex = !completed ? 0 : cachedTasks.findIndex(p => p.completed == true)
            break;
        case "completed-first":
            targetIndex = completed ? 0 : cachedTasks.findIndex(p => p.completed == false)
            break;
        case "news-first":
            targetIndex = cachedTasks.findIndex(p => p.createdAt < createdAt)
            break;
        case "olds-first":
            targetIndex = cachedTasks.findIndex(p => p.createdAt > createdAt)
            break;

        default:
            break;
    }
    cachedTasks.splice(targetIndex, 0, targetTask)
}

/****
 * lastQueriedUrl = 
 * cachedPages = 
 * cachedTasks = 
 * taskCount = 
 * sortOptions = 
 * 
 */
module.exports = {
    updateTaskCountOnCache,
    haveTaskCountOnCaches,
    updateCachedTasks,
    deleteKeyOnRedis
}