const express = require('express')
const notFoundController = require('../controllers/notFound')

const router = express.Router()

router.route('*')
  .get(notFoundController)

module.exports = router