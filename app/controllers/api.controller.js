const { getRedisClient } = require("../config/redis");
const { haveAllTasks,addTask, updateTask, deleteTask, haveTaskById  } = require("../services/database.service");
const { DatabaseError, AppError, ClientError, RedisError } = require("../services/error.service");

async function postTodoController(req,res,next){
    try {

        const {title, description, completed = false} = req.body
        const response = await addTask(title,description, completed)

        if(!response) return next(new DatabaseError("cant add task to database"))

        res.status(200).json({
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
        const {title, completed} = req.body

        if(!title || !completed) return next(new ClientError)
        await updateTask(id, title, completed)

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
        if(!task) next(new DatabaseError)

        res.status(200).json({
            success: true,
            message: "getting a task is successfully done",
            data: task
        })
    } catch (error) {
        next(error)
    }

}

async function getTodosController(req,res,next){
    try {
        // call redis client
        const redis = getRedisClient()
        
        // specify properties
        const page = Math.max(1, parseInt(req.query.page) || 1)
        const limit = () => {
            let requestedLimit = parseInt(req.query.limit) || 10
            if([10,20,50].includes(requestedLimit)){
                return requestedLimit
            }else{
                return 10
            }
        }
        const limitVal = limit()
        const sortBy = req.query.sortBy || "a-z"
        const skip = (page - 1) * limitVal
        const cacheSkip = Math.max(0,(page -3 ) * limitVal)

        let cachedPages = await redis.get('cachedPages')
        cachedPages = cachedPages ? JSON.parse(cachedPages) : []

        const shouldUpdate = !cachedPages.includes(page + 1) && !cachedPages.includes(page -1)

        if(shouldUpdate){
            if(page > 2 ){
                cachedPages = Array.from({length: 5},(_,i) =>(page - 2) + i)
            }else{
                cachedPages = Array.from({length: 3}, (_,i) => i +1)
            }

            // set pages to cache
            await redis.set("cachedPages",JSON.stringify(cachedPages))
        }


        // get specific data from database
        const tasksDetails = await haveAllTasks(sortBy,skip, cacheSkip,limitVal);

        if(!tasksDetails) next(new DatabaseError('cant reach to task collection'));

        // sent response
        const {allTasks, taskCount} = tasksDetails

        res.status(200).json({
            page,
            limit, 
            sortBy,
            totalTaskCount: taskCount,
            totalPageCount: Math.ceil(taskCount / limit),
            data: allTasks
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