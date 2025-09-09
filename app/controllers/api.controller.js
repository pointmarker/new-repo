const { getRedisClient } = require("../config/redis");
const { addTask, updateTask, deleteTask, haveTaskById, haveSpecificTasks } = require("../services/database.service");
const { AppError, ClientError } = require("../services/error.service");
const { haveTaskCountOnCaches, updateTaskCountOnCache } = require("../services/redis.service");

async function postTodoController(req,res,next){
    try {
        const {title, description, completed} = req.body
        await addTask(title,description, completed)

        res.status(201).json({
            success:true,
            message: "posting task action successfully done"
        })

    } catch (error) {
        new AppError(error)
        next(error)
    }
    
}
async function patchTodoController(req,res,next){
    try {
        const id = req.params.id
        const {title, description, completed} = req.body

        if(!title || !completed || !description) return next(new ClientError)
        await updateTask(id, title, description, completed)

        res.status(200).json({
            success:true,
            message: "update task action successfully done"
        })

    } catch (error) {
        next(error)
    }
}
async function deleteTodoController(req,res,next){
    try {
        const id = req.params.id
        await deleteTask(id)
        
        res.status(200).json({
            success:true,
            message: "task delete action successfully done"
        })

    } catch (error) {
        next(error)
    }
}

async function getTodoController(req,res,next){
    try {
        const task = await haveTaskById(req.params.id)
        const redis = getRedisClient()

        const lastQueriedUrl = await redis.get('lastQueriedUrl')

        res.status(200).json({
            success: true,
            message: "getting a task is successfully done",
            data: {
                task,
                lastQueriedUrl
            }
        })
    } catch (error) {
        next(error)
    }

}

async function getTodosController(req,res,next){
    try {
        /**
         * 
         * PAGINATION LOGIC
         */
        // call redis client
        const redis = getRedisClient()
        
        // specify properties
        const page = Math.max(1, parseInt(req.query.page) || 1)

        const requestedLimit = parseInt(req.query.limit)  || 10
        const limit = [10,20,50].includes(requestedLimit) ? requestedLimit : 10

        // this is for how many page will be cached according to which page do you want to see
        const cacheLimitCount = page > 3 ? 5 :3

        const sortBy = req.query.sortBy || "a-z"
        const skip = (page - 1) * limit
        // this is for defining how caching will skip
        const cacheSkip = Math.max(0,(page -3 ) * limit)
        // this is for client to read the url after he update/delete task redirection 
        await redis.set('lastQueriedUrl',`/todos?page=${page}&limit=${limit}&sortBy=${sortBy}`, "EX", 400)
        // the control for same pages are cached before ?
        let cachedPages = await redis.get(`cachedPages`)
        
        cachedPages = cachedPages ? JSON.parse(cachedPages) : []
        // if the page's +- 1 range is not in the array, let's update it, if it is in, just keep it

        const pageRange = Array.from({length: 3}, (_,i) => (page -1) + i)

        const shouldUpdate = !pageRange.every(p => cachedPages.includes(p))

        if(!shouldUpdate){
            // the pagination of the page already cached
            let tasks = await redis.get(`cachedTasks:/todos?page=${page}&limit=${limit}&sortBy=${sortBy}`)
            if(tasks) {
                tasks = JSON.parse(tasks)
                tasks = tasks.slice(skip,(page) * limit )
    
                const taskCount = await haveTaskCountOnCaches()
    
                return res.status(200).json({
                    page,
                    limit,
                    sortBy,
                    totalTaskCount: taskCount,
                    totalPageCount: Math.ceil(taskCount / limit),
                    data: tasks
                })
            }  
        }
        cachedPages = cacheLimitCount == 5 ? Array.from({length: 5},(_,i) => (page - 2) + i) : [1,2,3]
        await redis.set('cachedPages', JSON.stringify(cachedPages), "EX", 300)
        
        // get specific data from database
        const tasksDetails = await haveSpecificTasks(sortBy, cacheSkip,limit,cacheLimitCount, page);

        // sent response
        const {tasks, taskCount} = tasksDetails

        res.status(200).json({
            page,
            limit, 
            sortBy,
            totalTaskCount: taskCount,
            totalPageCount: Math.ceil(taskCount / limit),
            data: tasks
        })

    } catch (error) {
        next(error)
    }
}

module.exports = {
    postTodoController,
    patchTodoController,
    deleteTodoController,
    getTodosController,
    getTodoController
}