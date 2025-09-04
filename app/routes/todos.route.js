const express = require('express');
const router = express.Router()
const { serveHTML } = require('../services/static.service');

router.get('/', serveHTML('todos'))

module.exports = router;