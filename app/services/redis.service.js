const { getDb } = require("../config/db")
const { getRedisClient } = require("../config/redis")
const { haveTaskByLocationOnDb } = require("./database.service")
const { RedisError, DatabaseError } = require("./error.service")
const url = require('url')

async function updateTaskCountOnCache(){
    const redis = getRedisClient()
    const db = getDb()
    let taskCount =  await db.collection(MONGO_COLLECTION).countDocuments({})
    if(!taskCount || db) throw new DatabaseError()
    taskCount = await redis.set('taskCount',taskCount, "EX",300)
    return taskCount
}

async function haveTaskCountOnCaches(redis){
    const db = getDb();
    const redis = getRedisClient()

    let taskCount = await redis.get('taskCount')
    if(!taskCount){
        taskCount = await db.collection(MONGO_COLLECTION).countDocuments({})
        await redis.set('taskCount',taskCount, "EX",300)
    }

    return JSON.parse(taskCount)
}

async function updateCachedPages(method,editedTask){
     // define redis
    const redis = getRedisClient()

    // fetch last queriedUrl to define cache info
    const queriedUrl = JSON.parse(await redis.get('lastQueriedUrl'))

    if(!queriedUrl) throw new RedisError('there was no queries before')

    // define cache info
    const parsedUrl = url.parse(queriedUrl,true)
    const {page, limit, sortBy} = parsedUrl.query

    let cachedPages = JSON.parse(await redis.get('cachedPages'))
    let cachedTasks = JSON.parse(await redis.get(`cachedTasks:${page}&${limit}&${sortBy}`))

    if(!cachedPages || !cachedTasks) throw new RedisError('there is no cached info', "redis.service")

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
            // if method is delete, check the right task first, if there pick it up and add to the bottom of array, if not
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
            else{
                cachedTasks = cachedPages.filter(p => p._id == editedTask._id)
            }
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
    haveTaskCountOnCaches
}