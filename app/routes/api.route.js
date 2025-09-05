const express = require('express')
const { getTodosController, postTodoController, getTodoController, patchTodoController, deleteTodoController } = require('../controllers/api.controller')
const { validateRequest, idSchema, newTaskSchema, updateTaskSchema } = require('../middleware/validate')
const router = express.Router()

router.post('/todo',validateRequest(newTaskSchema),postTodoController)
router.get('/todo/:id',validateRequest(idSchema,"req.params"),getTodoController)
router.patch('/todo/:id',validateRequest(idSchema,"req.params"),validateRequest(updateTaskSchema),patchTodoController)
router.delete('/todo/:id',validateRequest(idSchema,"req.params"),deleteTodoController)

router.get('/todos',getTodosController)

module.exports = router;