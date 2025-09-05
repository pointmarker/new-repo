const express = require('express');
const router = express.Router()
const { serveHTML } = require('../services/static.service');

router.get('/:id', serveHTML('todo'))

module.exports = router;