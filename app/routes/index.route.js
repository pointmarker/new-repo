const express = require('express')
const router = express.Router()

const todoRoute = require('./todo.route')
const apiRoute = require('./api.route')
const todosRoute = require('./todos.route')

const { serveHTML } = require('../services/static.service')

router.get("/",serveHTML("index"))

router.use('/api',apiRoute)
router.use('/todo',todoRoute)
router.use('/todos',todosRoute)

module.exports = router;