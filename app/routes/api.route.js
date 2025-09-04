const express = require('express')
const { getTodosController, postTodoController, getTodoController, patchTodoController, deleteTodoController } = require('../controllers/api.controller')
const { validateRequest, idSchema, newTaskSchema, updateTaskSchema } = require('../middleware/validate')
const router = express.Router()

router.post('/todo',validateRequest(newTaskSchema),postTodoController)
router.get('/todo/:id',validateRequest(idSchema,"req.query"),getTodoController)
router.patch('/todo/:id',validateRequest(idSchema,"req.query"),validateRequest(updateTaskSchema),patchTodoController)
router.delete('/todo/:id',validateRequest(idSchema,"req.query"),deleteTodoController)

router.get('/todos',getTodosController)

module.exports = router;