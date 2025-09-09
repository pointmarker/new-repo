const fs = require('fs')
const { randomizeTask, randomId } = require('./utils')
const path = require('path')
const { source_path } = require('../environment/environment')
const { haveTaskByLocationOnDb } = require('../services/database.service')

let database = []

function createMock(){
    const destinationDir = source_path+"/app/mock"
    const destinationFile = destinationDir+"/mock.data.js"

    // fs.truncate()
    fs.truncate()
    fs.unlink(destinationFile,(err) => console.log(err))
    const stream = fs.createWriteStream(destinationFile)

    const page = 1;
    const limit = 10;
    const sort = "a-z"

    for(let i = 0; i<15; i++){
        for(let j = 0; j<10;j++){
            const randomTask = randomizeTask()
            database.push(randomTask)
        }
       page++
    }

    cacheRedis[taskCount] = database.length

    stream.write(JSON.stringify(arr,null,2))
}

const cacheRedis = {

    taskCount: database.length,
    lastQueriedUrl: "",
    cachedPages: [],
    sortOptions: {
        "a-z": {title: 1},
        "z-a": {title: -1},
        "uncompleted-first": {completed: -1},
        "completed-first": {completed: 1},
        "news-first": {createdAt: -1},
        "olds-first": {createdAt: 1}
    },

}

function addTaskToDb(task){
    database.push(task)
    cacheRedis[taskCount] = database.length
}

function updateTaskV2(task,newTask){
    let {is,it} = false

    database.forEach(t => {
        if(t._id == task._id){
            t.title = newTask.title,
            t.description = newTask.description,
            t.completed = newTask.completed,
            t.createdAt = newTask.createdAt,
            t._id = newTask._id
            is = true
        }
        
    })

    cacheRedis[url].forEach(t => {
        if(t._id == task._id){
            t.title = newTask.title,
            t.description = newTask.description,
            t.completed = newTask.completed,
            t.createdAt = newTask.createdAt,
            t._id = newTask._id
            it = true
        }
        
    })

    if(is && it) return newTask
}


function deleteTaskFromDbAndRedis(task,url){
    database = database.filter(t => t._id != task._id)
    cacheRedis[url] = cacheRedis[url].filter(t => t._id == task._id)
}

function findFromDb(id){
    return database.find(t => t._id === id)
}


function setCache(key, value){
    if(!cacheRedis[key]) cacheRedis[key] = value
}

function deleteCache(key){
    if(cacheRedis[key]) delete cacheRedis.key
}

function addTaskToCache(key,task){
    if(!cacheRedis[key]) cacheRedis[key] = []

    task[_id] = randomId()
    task[createdAt] = new Date()

    cacheRedis[key].push(task)
}

function updateCachedPages(pages){
    cacheRedis[cachedPages] = pages
}

function getTasksToCache(skip,limit,sort){
    let tasks = [...database]
    switch (sort) {
        case "a-z":
            tasks.sort((a,b) => a.title.localeCompare(b.title))
            break;
        case "z-a":
            tasks.sort((a,b) => b.title.localeCompare(a.title))
            break;
        case "uncompleted-first":
            tasks.sort((a,b) => a.completed - b.completed)
        break;
        case "completed-first":
            tasks.sort((a,b) => b.completed - a.completed)
        break;
        case "news-first":
            tasks.sort((a,b) => b.createdAt - a.createdAt)
        break;
        case "olds-first":
            tasks.sort((a,b) => a.createdAt - b.createdAt)
        break;
        default:
            break;
    }

    return tasks.slice(skip, skip+limit)
}

function haveTaskCountOnFakeCache(){
    return redisCache[taskCount]
}

function updateTaskCount(method = null){
    let taskCount = redisCache[taskCount]

    if(method) method == "add" ? taskCount ++ : taskCount --;

    else{
        taskCount = database.length
    }
    
    cacheRedis[taskCount] = taskCount

    return taskCount
}

function updateCachedTasksV2(method, editedTask){
    let queriedUrl = cacheRedis['lastQueriedUrl']

    queriedUrl = queriedUrl || `/todos?page=1&limit=10&sortBy=a-z`

    if(!queriedUrl) throw new RedisError('there was no queries before')

    // find queries
    const parsedUrl = url.parse(queriedUrl,true)
    if(!parsedUrl) throw new AppError("parsedUrl problem")

    const {page, limit, sortBy} = parsedUrl.query

    // define cache info
    let cachedPages = cacheRedis['cachedPages']
    let cachedTasks = cacheRedis[`cachedTasks:${queriedUrl}`]
        
    // if editedTask is not in cachedTasks, then return this function, else keep going 
    if(!cachedTasks || !cachedTasks.some(t => t._id == editedTask._id)) return

    const limitCount = page > 3 ? 5 : 3
    const skip = Math.max(0,(page-3)) * limit
    const skipForFirstTask =skip - 1
    const skipForLastTask = skip * limitCount

    switch (method) {
        case "update":
            // if method is update, find the target task on cachedTasks, update it there and cache again
            let targetTask = cachedTasks.find(t => t._id == editedTask._id)
            Object.assign(targetTask, editedTask)

            setCache(queriedUrl,cachedTasks)
            break;
        case "delete":
            // if method is delete, check the right task first, if there, pick it up and add to the bottom of array, if not
            // pick the most close to edge of cachedtasks and put it to the edge

            const unCachedTaskOnRightBorderOfCachedTasks = haveTaskByLocationOnDbV2(skipForLastTask,sortBy)
            const unCachedTaskOnLeftBorderOfCachedTasks =  haveTaskByLocationOnDbV2(skipForFirstTask,sortBy)

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
            setCache(queriedUrl,cachedTasks)
        break;
        case "add":
            // eğer ekleme işlemiyse cachelenen tasktaki son eleman pop, editedTask in
            cachedPages.pop()
            addTaskToCachedArrayV2(cachedTasks, targetTask, sortBy)
        break;
        default:
            break;
    }
}

function haveTaskByLocationOnDbV2(skip,sortBy){
    const targetTask = getTasksToCache(skip,1,sortBy)

    return targetTask
}

function addTaskToCachedArrayV2(cachedTasks,targetTask,sortBy){
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

module.exports ={
    addTaskToDb,
    updateTaskV2,
    deleteTaskFromDbAndRedis,
    setCache,
    deleteCache,
    addTaskToCache,
    updateCachedPages,
    getTasksToCache,
    haveTaskCountOnFakeCache,
    updateTaskCount,
    updateCachedTasksV2,
    findFromDb
}
