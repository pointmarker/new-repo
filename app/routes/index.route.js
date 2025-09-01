const express = require('express')
const router = express.Router()

const apiRoute = require('./api.route')
const todoRoute = require('./todo.route')
const { serveHTML } = require('../services/static.service')

router.get("/",serveHTML("index"))

router.use('/api',apiRoute)
router.use('/todo',todoRoute)

module.exports = router;