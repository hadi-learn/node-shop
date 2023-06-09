const express = require('express')
const notFoundController = require('../controllers/notFound')

const router = express.Router()

router.route('*')
  .get(notFoundController.get404)

module.exports = router