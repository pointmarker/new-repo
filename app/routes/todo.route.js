const express = require('express');
const router = express.Router()
const { serveHTML } = require('../services/static.service');
const {validateRequest, idSchema} = require('../middleware/validate')

router.get('/',getTodoController, serveHTML('todo'))
router.get('/:id',validateRequest(idSchema,"params"))

module.exports = router;